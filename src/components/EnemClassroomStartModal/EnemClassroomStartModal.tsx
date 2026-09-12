import { useCallback, useEffect, useMemo, useState, ChangeEvent } from 'react';
import Modal from '../Modal/Modal';
import Stepper from '../Stepper/Stepper';
import Button from '../Button/Button';
import Input from '../Input/Input';
import Text from '../Text/Text';
import VideoPlayer from '../VideoPlayer/VideoPlayer';
import { RadioGroup, RadioGroupItem } from '../Radio/Radio';
import { ChalkboardTeacherIcon } from '@phosphor-icons/react/dist/csr/ChalkboardTeacher';
import { TimerIcon } from '@phosphor-icons/react/dist/csr/Timer';
import { ProhibitIcon } from '@phosphor-icons/react/dist/csr/Prohibit';
import { CheckCircleIcon } from '@phosphor-icons/react/dist/csr/CheckCircle';
import {
  ENEM_CLASSROOM_LANGUAGE,
  ENEM_CLASSROOM_LANGUAGE_LABELS,
  type EnemClassroomExam,
  type EnemClassroomLanguage,
  type EnemClassroomStartPayload,
  type EnemClassroomSurveyQuestion,
} from '../../types/enemClassroom';

/** Title shared by every step, as in the design. */
export const ENEM_CLASSROOM_MODAL_TITLE = 'Simulação do ENEM em sala de aula!';

/**
 * The three warnings of the introduction step. The exam only counts when
 * taken in class, so they are shown before anything else.
 */
const INTRO_WARNINGS = [
  {
    icon: ChalkboardTeacherIcon,
    title: 'Só vale em sala de aula',
    description:
      'Essa simulação precisa ser feita com seu professor presente. Não vale fazer em casa!',
  },
  {
    icon: TimerIcon,
    title: 'O cronômetro liga na hora',
    description:
      'Assim que clicar em começar, o tempo já corre e não para, mesmo se fechar o navegador.',
  },
  {
    icon: ProhibitIcon,
    title: 'Não tem como desfazer',
    description:
      'Iniciar fora do horário estabelecido pelo seu professor em sala de aula pode atrapalhar seu resultado!',
  },
] as const;

/** How a survey question was answered: with text, or skipped. */
const SURVEY_ANSWER_MODE = {
  TEXT: 'TEXT',
  SKIP: 'SKIP',
} as const;

type SurveyAnswerMode =
  (typeof SURVEY_ANSWER_MODE)[keyof typeof SURVEY_ANSWER_MODE];

interface SurveyAnswerDraft {
  mode: SurveyAnswerMode | null;
  text: string;
}

/** Index of the two fixed steps; survey questions follow from index 2. */
const INTRO_STEP = 0;
const LANGUAGE_STEP = 1;
const FIRST_SURVEY_STEP = 2;

export interface EnemClassroomStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: EnemClassroomExam;
  /** Called with everything the start endpoint needs. */
  onStart: (payload: EnemClassroomStartPayload) => void;
  /** Disables the final button while the start request is in flight. */
  isStarting?: boolean;
}

/**
 * Whether a survey draft is complete: skipped, or answered with some text.
 */
const isSurveyAnswerComplete = (draft: SurveyAnswerDraft | undefined) =>
  draft?.mode === SURVEY_ANSWER_MODE.SKIP ||
  (draft?.mode === SURVEY_ANSWER_MODE.TEXT && draft.text.trim().length > 0);

/**
 * The text shown for a survey answer on the summary screen.
 */
const describeSurveyAnswer = (
  question: EnemClassroomSurveyQuestion,
  draft: SurveyAnswerDraft | undefined
) =>
  draft?.mode === SURVEY_ANSWER_MODE.TEXT
    ? draft.text.trim()
    : question.skipLabel;

/**
 * Start flow of the in-classroom ENEM simulation.
 *
 * Steps, in order: introduction (video + warnings), foreign language, one
 * step per survey question, and a summary the student confirms before the
 * exam opens. The stepper only lists the steps that carry a choice; the
 * summary is a screen of its own, as in the design.
 *
 * Presentational: it collects the choices and hands them to `onStart`; the
 * caller talks to the API.
 *
 * @example
 * ```tsx
 * <EnemClassroomStartModal
 *   isOpen={open}
 *   onClose={() => setOpen(false)}
 *   exam={exam}
 *   onStart={(payload) => start(exam.id, payload)}
 * />
 * ```
 */
const EnemClassroomStartModal = ({
  isOpen,
  onClose,
  exam,
  onStart,
  isStarting = false,
}: EnemClassroomStartModalProps) => {
  const surveyQuestions = useMemo(
    () => [...exam.surveyQuestions].sort((a, b) => a.position - b.position),
    [exam.surveyQuestions]
  );
  const summaryStep = FIRST_SURVEY_STEP + surveyQuestions.length;

  const [step, setStep] = useState(INTRO_STEP);
  const [language, setLanguage] = useState<EnemClassroomLanguage | null>(null);
  const [answers, setAnswers] = useState<Record<string, SurveyAnswerDraft>>({});

  // Every opening starts from the introduction with nothing filled in.
  useEffect(() => {
    if (isOpen) {
      setStep(INTRO_STEP);
      setLanguage(null);
      setAnswers({});
    }
  }, [isOpen]);

  const stepperSteps = useMemo(
    () => [
      { id: 'intro', label: 'Introdução', state: 'pending' as const },
      {
        id: 'language',
        label: 'Língua estrangeira',
        state: 'pending' as const,
      },
      ...surveyQuestions.map((question) => ({
        id: question.id,
        label: question.stepLabel,
        state: 'pending' as const,
      })),
    ],
    [surveyQuestions]
  );

  const currentQuestion =
    step >= FIRST_SURVEY_STEP && step < summaryStep
      ? surveyQuestions[step - FIRST_SURVEY_STEP]
      : null;

  const canGoNext =
    step === LANGUAGE_STEP
      ? language !== null
      : currentQuestion !== null &&
        isSurveyAnswerComplete(answers[currentQuestion.id]);

  const updateAnswer = useCallback(
    (questionId: string, patch: Partial<SurveyAnswerDraft>) => {
      setAnswers((prev) => {
        const current = prev[questionId] ?? { mode: null, text: '' };
        return { ...prev, [questionId]: { ...current, ...patch } };
      });
    },
    []
  );

  const handleStart = useCallback(() => {
    if (!language) return;
    onStart({
      language,
      surveyAnswers: surveyQuestions.map((question) => {
        const draft = answers[question.id];
        return {
          questionId: question.id,
          answer:
            draft?.mode === SURVEY_ANSWER_MODE.TEXT ? draft.text.trim() : null,
        };
      }),
    });
  }, [language, surveyQuestions, answers, onStart]);

  const renderIntroStep = () => (
    <div className="flex flex-col gap-6" data-testid="enem-classroom-intro">
      {exam.videoUrl && (
        <VideoPlayer
          src={exam.videoUrl}
          title={exam.title}
          className="w-full rounded-xl overflow-hidden"
          autoSave={false}
        />
      )}

      <div className="flex flex-col gap-4">
        <Text size="lg" weight="bold" className="text-text-950">
          Ei, lê isso antes de começar!
        </Text>
        {INTRO_WARNINGS.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex flex-row gap-3 items-start">
            <span className="flex-shrink-0 mt-0.5 text-primary-700">
              <Icon size={24} aria-hidden />
            </span>
            <div className="flex flex-col gap-1">
              <Text size="md" weight="bold" className="text-text-950">
                {title}
              </Text>
              <Text size="sm" className="text-text-600">
                {description}
              </Text>
            </div>
          </div>
        ))}
      </div>

      <Button
        size="large"
        variant="solid"
        action="primary"
        className="w-full"
        onClick={() => setStep(LANGUAGE_STEP)}
        data-testid="enem-classroom-intro-continue"
      >
        Estou em sala. Quero começar!
      </Button>
    </div>
  );

  const renderLanguageStep = () => (
    <div className="flex flex-col gap-4" data-testid="enem-classroom-language">
      <Text size="lg" weight="bold" className="text-text-950">
        Qual língua estrangeira você vai usar na simulação?
      </Text>
      {/* Keyed: RadioGroup captures onValueChange on mount, and without a key
          React would reuse the language group's instance for the survey step
          that renders at the same position. */}
      <RadioGroup
        key="language"
        name="enem-classroom-language"
        value={language ?? undefined}
        onValueChange={(value) => setLanguage(value as EnemClassroomLanguage)}
        className="flex flex-col gap-3"
      >
        {Object.values(ENEM_CLASSROOM_LANGUAGE).map((value) => (
          <RadioGroupItem
            key={value}
            value={value}
            label={ENEM_CLASSROOM_LANGUAGE_LABELS[value]}
            data-testid={`enem-classroom-language-${value.toLowerCase()}`}
          />
        ))}
      </RadioGroup>
    </div>
  );

  const renderSurveyStep = (question: EnemClassroomSurveyQuestion) => {
    const draft = answers[question.id];
    return (
      <div
        className="flex flex-col gap-4"
        data-testid={`enem-classroom-survey-${question.id}`}
      >
        <Text size="lg" weight="bold" className="text-text-950">
          {question.prompt}
        </Text>
        <RadioGroup
          key={question.id}
          name={`enem-classroom-survey-${question.id}`}
          value={draft?.mode ?? undefined}
          onValueChange={(value) =>
            updateAnswer(question.id, { mode: value as SurveyAnswerMode })
          }
          className="flex flex-col gap-3"
        >
          <RadioGroupItem
            value={SURVEY_ANSWER_MODE.TEXT}
            label={question.inputLabel}
            data-testid="enem-classroom-survey-text"
          />
          {draft?.mode === SURVEY_ANSWER_MODE.TEXT && (
            <div className="pl-8">
              <Input
                variant="rounded"
                placeholder={question.inputPlaceholder}
                value={draft.text}
                maxLength={255}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  updateAnswer(question.id, { text: event.target.value })
                }
                data-testid="enem-classroom-survey-input"
              />
            </div>
          )}
          <RadioGroupItem
            value={SURVEY_ANSWER_MODE.SKIP}
            label={question.skipLabel}
            data-testid="enem-classroom-survey-skip"
          />
        </RadioGroup>
      </div>
    );
  };

  const renderSummaryStep = () => (
    <div
      className="flex flex-col items-center gap-6 text-center"
      data-testid="enem-classroom-summary"
    >
      <span className="text-success-600">
        <CheckCircleIcon size={64} weight="fill" aria-hidden />
      </span>
      <div className="flex flex-col gap-2">
        <Text size="xl" weight="bold" className="text-text-950">
          Boa sorte!
        </Text>
        <Text size="sm" className="text-text-600">
          Sua simulação do ENEM já está para começar e o cronômetro vai iniciar.
          Respira fundo e dá o seu melhor!
        </Text>
      </div>

      <div className="flex flex-col gap-3 w-full text-left rounded-xl border border-border-200 p-4">
        <Text size="sm" weight="bold" className="text-text-950">
          Suas respostas
        </Text>
        <dl className="flex flex-col gap-2">
          <div className="flex flex-col">
            <Text as="dt" size="xs" className="text-text-500">
              Idioma
            </Text>
            <Text as="dd" size="sm" className="text-text-950">
              {language ? ENEM_CLASSROOM_LANGUAGE_LABELS[language] : '—'}
            </Text>
          </div>
          {surveyQuestions.map((question) => (
            <div key={question.id} className="flex flex-col">
              <Text as="dt" size="xs" className="text-text-500">
                {question.stepLabel}
              </Text>
              <Text as="dd" size="sm" className="text-text-950">
                {describeSurveyAnswer(question, answers[question.id])}
              </Text>
            </div>
          ))}
        </dl>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <Button
          size="large"
          variant="outline"
          action="primary"
          className="w-full"
          disabled={isStarting}
          onClick={() => setStep(LANGUAGE_STEP)}
          data-testid="enem-classroom-review"
        >
          Revisar minhas respostas
        </Button>
        <Button
          size="large"
          variant="solid"
          action="primary"
          className="w-full"
          disabled={isStarting}
          onClick={handleStart}
          data-testid="enem-classroom-start"
        >
          Iniciar a prova!
        </Button>
      </div>
    </div>
  );

  const renderStepContent = () => {
    if (step === INTRO_STEP) return renderIntroStep();
    if (step === LANGUAGE_STEP) return renderLanguageStep();
    if (currentQuestion) return renderSurveyStep(currentQuestion);
    return renderSummaryStep();
  };

  const showNavigation = step >= LANGUAGE_STEP && step < summaryStep;
  const showStepper = step < summaryStep;

  const footer = showNavigation ? (
    <div className="flex flex-row justify-end gap-2 w-full">
      <Button
        size="medium"
        variant="outline"
        action="secondary"
        onClick={() => setStep((current) => current - 1)}
        data-testid="enem-classroom-previous"
      >
        Anterior
      </Button>
      <Button
        size="medium"
        variant="solid"
        action="primary"
        disabled={!canGoNext}
        onClick={() => setStep((current) => current + 1)}
        data-testid="enem-classroom-next"
      >
        Próximo
      </Button>
    </div>
  ) : undefined;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={ENEM_CLASSROOM_MODAL_TITLE}
      size="md"
      footer={footer}
      contentClassName="flex flex-col gap-6 max-h-[70vh] overflow-y-auto"
    >
      {showStepper && (
        <Stepper steps={stepperSteps} currentStep={step} size="small" />
      )}
      {renderStepContent()}
    </Modal>
  );
};

export default EnemClassroomStartModal;
