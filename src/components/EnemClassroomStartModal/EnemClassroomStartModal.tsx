import { useCallback, useEffect, useMemo, useState, ChangeEvent } from 'react';
import Modal from '../Modal/Modal';
import Stepper from '../Stepper/Stepper';
import Button from '../Button/Button';
import Input from '../Input/Input';
import CheckBox from '../CheckBox/CheckBox';
import Text from '../Text/Text';
import VideoPlayer from '../VideoPlayer/VideoPlayer';
import { CaretLeftIcon } from '@phosphor-icons/react/dist/csr/CaretLeft';
import { CaretRightIcon } from '@phosphor-icons/react/dist/csr/CaretRight';
import { CheckIcon } from '@phosphor-icons/react/dist/csr/Check';
import { cn } from '../../utils/utils';
import warningClassroomIcon from '../../assets/img/enemClassroom/warning-classroom.png';
import warningTimerIcon from '../../assets/img/enemClassroom/warning-timer.png';
import warningIrreversibleIcon from '../../assets/img/enemClassroom/warning-irreversible.png';
import flagEnglish from '../../assets/img/enemClassroom/flag-english.png';
import flagSpanish from '../../assets/img/enemClassroom/flag-spanish.png';
import surveyCourseIllustration from '../../assets/img/enemClassroom/survey-course.svg';
import surveyUniversityIllustration from '../../assets/img/enemClassroom/survey-university.png';
import {
  ENEM_CLASSROOM_LANGUAGE,
  ENEM_CLASSROOM_LANGUAGE_LABELS,
  type EnemClassroomExam,
  type EnemClassroomLanguage,
  type EnemClassroomStartPayload,
  type EnemClassroomStudentTexts,
  type EnemClassroomSurveyQuestion,
} from '../../types/enemClassroom';

/** Title shared by every step, as in the design. */
/**
 * The three warnings of the introduction step. The exam only counts when
 * taken in class, so they are shown before anything else. The first one is
 * the backoffice's to write (`studentTexts`); the other two are fixed.
 *
 * @param texts - The exam's texts
 * @returns The warnings in order
 */
const buildIntroWarnings = (texts: EnemClassroomStudentTexts) => [
  {
    icon: warningClassroomIcon,
    title: texts.introWarningTitle,
    description: texts.introWarningText,
  },
  {
    icon: warningTimerIcon,
    title: 'O cronômetro liga na hora',
    description:
      'Assim que clicar em começar, o tempo já corre e não para, mesmo se fechar o navegador.',
  },
  {
    icon: warningIrreversibleIcon,
    title: 'Não tem como desfazer',
    description:
      'Iniciar fora do horário estabelecido pelo seu professor em sala de aula pode atrapalhar seu resultado!',
  },
];

/** Flag shown next to each language, as in the design. */
const LANGUAGE_FLAGS: Record<EnemClassroomLanguage, string> = {
  [ENEM_CLASSROOM_LANGUAGE.INGLES]: flagEnglish,
  [ENEM_CLASSROOM_LANGUAGE.ESPANHOL]: flagSpanish,
};

/**
 * Illustration of each survey step, in the order the steps are asked: the
 * course question, then the university one.
 *
 * Fixed here rather than sent by the backoffice, so it is keyed by position —
 * reordering the questions there moves the illustration with the position,
 * not with the question. A question past the end simply gets none.
 */
const SURVEY_ILLUSTRATIONS = [
  surveyCourseIllustration,
  surveyUniversityIllustration,
] as const;

/**
 * The white card the warnings and the options sit on. Same vocabulary as
 * SelectionButton, so the modal reads like the rest of the design system
 * against the modal's `secondary-50` background.
 */
const CARD_CLASSES =
  'rounded-xl border border-border-50 bg-background shadow-soft-shadow-1';

/**
 * Gradiente da identidade da simulação em sala de aula — os mesmos tons do
 * card do painel do aluno. Não sai dos tokens de tema porque é a marca da
 * prova, não a da instituição.
 *
 * Literal, e não `bg-gradient-to-r from-… to-…`: o Tailwind v4 interpola
 * `in oklab`, o que muda os tons do meio em relação ao sRGB do design.
 *
 * `border-0` porque o `solid/primary` do Button traz `border-primary-950`, que
 * o gradiente não cobre — ele só troca o fundo. Zerar a largura, em vez de
 * pintar a borda de transparente, também neutraliza as cores de hover e
 * active, que voltariam a aparecer.
 */
const GRADIENT_CTA_CLASSES =
  'bg-[linear-gradient(270deg,#B21FF6_0%,#F95493_100%)] border-0 hover:opacity-90 transition-opacity';

/**
 * One selectable option: a card carrying an optional icon and a label.
 *
 * The radio control itself is visually hidden — in the design the card's own
 * border carries the selection. The native input stays in the tree so the
 * options remain a real radio group: arrow keys move between them and screen
 * readers announce "1 of 2", which a set of toggle buttons would not.
 */
const OptionCard = ({
  name,
  value,
  label,
  iconSrc,
  checked,
  onSelect,
  testId,
}: {
  name: string;
  value: string;
  label: string;
  iconSrc?: string;
  checked: boolean;
  onSelect: () => void;
  testId?: string;
}) => (
  <label
    className={cn(
      CARD_CLASSES,
      'flex flex-row items-center gap-3 px-4 py-3.5',
      'cursor-pointer transition-colors hover:bg-background-100',
      'focus-within:ring-2 focus-within:ring-indicator-info',
      checked && 'border-primary-700 ring-1 ring-primary-700'
    )}
  >
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={onSelect}
      className="sr-only"
      data-testid={testId}
    />
    {iconSrc && (
      <img src={iconSrc} alt="" aria-hidden className="w-6 h-6 flex-shrink-0" />
    )}
    <Text size="sm" weight="semibold" className="text-text-900">
      {label}
    </Text>
  </label>
);

/**
 * How a survey question was answered. The student either writes an answer or
 * ticks "ainda estou pensando" — the tick clears and disables the field, so
 * the two never disagree.
 */
interface SurveyAnswerDraft {
  skipped: boolean;
  text: string;
}

/**
 * One line of the summary: the step's name over what the student answered.
 */
const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col rounded-lg bg-primary-50 px-3 py-2">
    <Text as="dt" size="sm" weight="bold" className="text-primary-800">
      {label}
    </Text>
    <Text as="dd" size="sm" className="text-text-600">
      {value}
    </Text>
  </div>
);

/** The introduction is always first; the first choice comes right after it. */
const INTRO_STEP = 0;
const FIRST_CHOICE_STEP = 1;

/** One screen of the flow. Which ones exist depends on the exam. */
type FlowStep =
  | { kind: 'intro' }
  | { kind: 'language' }
  | { kind: 'survey'; question: EnemClassroomSurveyQuestion; index: number }
  | { kind: 'summary' };

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
  draft?.skipped === true || (draft?.text.trim().length ?? 0) > 0;

/**
 * The text shown for a survey answer on the summary screen.
 */
const describeSurveyAnswer = (
  question: EnemClassroomSurveyQuestion,
  draft: SurveyAnswerDraft | undefined
) => (draft && !draft.skipped ? draft.text.trim() : question.skipLabel);

/**
 * Start flow of the in-classroom ENEM simulation.
 *
 * Steps, in order: introduction (video + warnings), foreign language — only
 * when the exam offers the choice —, one step per survey question, and a
 * summary the student confirms before the exam opens. The stepper only lists
 * the steps that carry a choice; the summary is a screen of its own, as in
 * the design.
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
  // The screens this exam has: no language step on an exam without the
  // choice, so the student goes from the warnings straight to the survey.
  const steps = useMemo<FlowStep[]>(
    () => [
      { kind: 'intro' },
      ...(exam.languageChoice ? [{ kind: 'language' } as const] : []),
      ...surveyQuestions.map((question, index) => ({
        kind: 'survey' as const,
        question,
        index,
      })),
      { kind: 'summary' },
    ],
    [exam.languageChoice, surveyQuestions]
  );
  const summaryStep = steps.length - 1;

  const [step, setStep] = useState(INTRO_STEP);
  const [language, setLanguage] = useState<EnemClassroomLanguage | null>(null);
  const [answers, setAnswers] = useState<Record<string, SurveyAnswerDraft>>({});

  // Every opening starts from the introduction with nothing filled in — and
  // so does a different exam handed in while the modal is open, whose steps
  // and questions are not the ones the answers were given to.
  useEffect(() => {
    if (isOpen) {
      setStep(INTRO_STEP);
      setLanguage(null);
      setAnswers({});
    }
  }, [isOpen, exam.id]);

  const stepperSteps = useMemo(
    () =>
      steps
        .filter((flowStep) => flowStep.kind !== 'summary')
        .map((flowStep) => {
          if (flowStep.kind === 'intro') {
            return {
              id: 'intro',
              label: 'Introdução',
              state: 'pending' as const,
            };
          }
          if (flowStep.kind === 'language') {
            return {
              id: 'language',
              label: 'Língua estrangeira',
              state: 'pending' as const,
            };
          }
          return {
            id: flowStep.question.id,
            label: flowStep.question.stepLabel,
            state: 'pending' as const,
          };
        }),
    [steps]
  );

  const currentStep = steps[step] ?? steps[INTRO_STEP];
  /**
   * Só o passo da introdução, e só quando há vídeo, prende o player no topo e
   * rola o conteúdo abaixo dele. Nos outros passos a rolagem segue sendo a do
   * Modal — tirá-la de lá sempre cortaria as perguntas em tela baixa.
   */
  const hasPinnedVideo = currentStep.kind === 'intro' && Boolean(exam.videoUrl);
  const currentQuestion =
    currentStep.kind === 'survey' ? currentStep.question : null;

  const canGoNext =
    currentStep.kind === 'language'
      ? language !== null
      : currentQuestion !== null &&
        isSurveyAnswerComplete(answers[currentQuestion.id]);

  const updateAnswer = useCallback(
    (questionId: string, patch: Partial<SurveyAnswerDraft>) => {
      setAnswers((prev) => {
        const current = prev[questionId] ?? { skipped: false, text: '' };
        return { ...prev, [questionId]: { ...current, ...patch } };
      });
    },
    []
  );

  const handleStart = useCallback(() => {
    // The language is only a choice on an exam that offers one.
    if (exam.languageChoice && !language) return;
    onStart({
      language: exam.languageChoice ? language : null,
      surveyAnswers: surveyQuestions.map((question) => {
        const draft = answers[question.id];
        const text = draft && !draft.skipped ? draft.text.trim() : '';
        return { questionId: question.id, answer: text || null };
      }),
    });
  }, [exam.languageChoice, language, surveyQuestions, answers, onStart]);

  const renderIntroStep = () => (
    <div
      className="flex flex-col gap-6 min-h-0"
      data-testid="enem-classroom-intro"
    >
      {exam.videoUrl && (
        <Text
          size="md"
          weight="semibold"
          className="text-text-950"
          data-testid="enem-classroom-intro-video-text"
        >
          {exam.studentTexts.introVideoText}
        </Text>
      )}
      {exam.videoUrl && (
        <VideoPlayer
          src={exam.videoUrl}
          title={exam.title}
          // O desenho mostra só o vídeo: o nome da prova já está no título do
          // modal. O `title` fica para rotular o player nos leitores de tela.
          hideHeader
          className="w-full rounded-xl overflow-hidden flex-none"
          autoSave={false}
        />
      )}

      {/*
       * Com vídeo, a rolagem é daqui para baixo: o player e o botão ficam
       * parados e só os avisos correm entre eles. Rolando o modal inteiro o
       * vídeo saía cortado pelo topo.
       */}
      <div
        className={cn(
          'flex flex-col gap-4',
          hasPinnedVideo && 'flex-1 min-h-0 overflow-y-auto'
        )}
      >
        <Text size="lg" weight="bold" className="text-text-950">
          {exam.studentTexts.introHeading}
        </Text>
        {buildIntroWarnings(exam.studentTexts).map(
          ({ icon, title, description }) => (
            <div
              key={title}
              className={cn(
                CARD_CLASSES,
                'flex flex-row gap-4 items-start p-4'
              )}
            >
              <img
                src={icon}
                alt=""
                aria-hidden
                className="flex-shrink-0 w-10 h-10"
              />
              <div className="flex flex-col gap-1">
                <Text size="md" weight="bold" className="text-text-950">
                  {title}
                </Text>
                <Text size="sm" className="text-text-600">
                  {description}
                </Text>
              </div>
            </div>
          )
        )}
      </div>

      <Button
        size="large"
        variant="solid"
        action="primary"
        className={cn('w-full flex-none', GRADIENT_CTA_CLASSES)}
        onClick={() => setStep(FIRST_CHOICE_STEP)}
        data-testid="enem-classroom-intro-continue"
      >
        Estou em sala. Quero começar!
      </Button>
    </div>
  );

  const renderLanguageStep = () => (
    <div className="flex flex-col gap-4" data-testid="enem-classroom-language">
      <Text
        id="enem-classroom-language-prompt"
        size="lg"
        weight="bold"
        className="text-text-950"
      >
        Qual língua estrangeira você vai usar na simulação?
      </Text>
      <div
        role="radiogroup"
        aria-labelledby="enem-classroom-language-prompt"
        className="flex flex-col gap-4"
      >
        {Object.values(ENEM_CLASSROOM_LANGUAGE).map((value) => (
          <OptionCard
            key={value}
            name="enem-classroom-language"
            value={value}
            label={ENEM_CLASSROOM_LANGUAGE_LABELS[value]}
            iconSrc={LANGUAGE_FLAGS[value]}
            checked={language === value}
            onSelect={() => setLanguage(value)}
            testId={`enem-classroom-language-${value.toLowerCase()}`}
          />
        ))}
      </div>
    </div>
  );

  const renderSurveyStep = (
    question: EnemClassroomSurveyQuestion,
    index: number
  ) => {
    const draft = answers[question.id];
    const illustration = SURVEY_ILLUSTRATIONS[index];
    // The two ways of answering disable each other, so they can never
    // contradict — and either one on its own releases the step.
    const hasText = (draft?.text.trim().length ?? 0) > 0;
    const isSkipped = draft?.skipped === true;
    return (
      <div
        className="flex flex-col gap-4"
        data-testid={`enem-classroom-survey-${question.id}`}
      >
        {illustration && (
          <img
            src={illustration}
            alt=""
            aria-hidden
            className="w-[220px] max-w-full self-center"
            data-testid="enem-classroom-survey-illustration"
          />
        )}
        <Text
          id={`enem-classroom-survey-prompt-${question.id}`}
          size="lg"
          weight="bold"
          className="text-text-950"
        >
          {question.prompt}
        </Text>
        <div className="flex flex-col gap-2">
          <Text
            as="label"
            htmlFor={`enem-classroom-survey-input-${question.id}`}
            size="sm"
            className="text-text-600"
          >
            {question.inputLabel}
          </Text>
          <Input
            id={`enem-classroom-survey-input-${question.id}`}
            variant="rounded"
            placeholder={question.inputPlaceholder}
            value={draft?.text ?? ''}
            maxLength={255}
            disabled={isSkipped}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              updateAnswer(question.id, { text: event.target.value })
            }
            data-testid="enem-classroom-survey-input"
          />
        </div>

        <CheckBox
          label={question.skipLabel}
          checked={isSkipped}
          disabled={hasText}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            updateAnswer(question.id, { skipped: event.target.checked })
          }
          data-testid="enem-classroom-survey-skip"
        />
      </div>
    );
  };

  const renderSummaryStep = () => (
    <div
      className="flex flex-col items-center gap-6 text-center"
      data-testid="enem-classroom-summary"
    >
      <span className="flex items-center justify-center w-14 h-14 rounded-full bg-success-200 text-success-950">
        <CheckIcon size={24} aria-hidden />
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

      <div
        className={cn(CARD_CLASSES, 'flex flex-col gap-3 w-full text-left p-4')}
      >
        <Text size="sm" weight="bold" className="text-text-950">
          Suas respostas
        </Text>
        <dl className="flex flex-col gap-2">
          {exam.languageChoice && (
            <SummaryRow
              label="Idioma"
              value={language ? ENEM_CLASSROOM_LANGUAGE_LABELS[language] : '—'}
            />
          )}
          {surveyQuestions.map((question) => (
            <SummaryRow
              key={question.id}
              label={question.stepLabel}
              value={describeSurveyAnswer(question, answers[question.id])}
            />
          ))}
        </dl>
        <Button
          size="medium"
          variant="outline"
          action="primary"
          className="self-center"
          disabled={isStarting}
          onClick={() => setStep(FIRST_CHOICE_STEP)}
          data-testid="enem-classroom-review"
        >
          Revisar minhas respostas
        </Button>
      </div>

      <Button
        size="large"
        variant="solid"
        action="primary"
        className={cn('w-full', GRADIENT_CTA_CLASSES)}
        disabled={isStarting}
        onClick={handleStart}
        data-testid="enem-classroom-start"
      >
        Iniciar a prova!
      </Button>
    </div>
  );

  const renderStepContent = () => {
    if (currentStep.kind === 'intro') return renderIntroStep();
    if (currentStep.kind === 'language') return renderLanguageStep();
    if (currentStep.kind === 'survey')
      return renderSurveyStep(currentStep.question, currentStep.index);
    return renderSummaryStep();
  };

  const showNavigation = step >= FIRST_CHOICE_STEP && step < summaryStep;
  const showStepper = step < summaryStep;

  const footer = showNavigation ? (
    <div className="flex flex-row justify-end gap-2 w-full">
      <Button
        size="medium"
        variant="outline"
        action="primary"
        iconLeft={<CaretLeftIcon size={16} aria-hidden />}
        onClick={() => setStep((current) => current - 1)}
        data-testid="enem-classroom-previous"
      >
        Anterior
      </Button>
      <Button
        size="medium"
        variant="solid"
        action="primary"
        iconRight={<CaretRightIcon size={16} aria-hidden />}
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
      /*
       * A tela de resumo abre com o header vazio, só o X — quem dá o título
       * ali é o "Boa sorte!". O texto continua no <h2>, apenas oculto: o
       * `aria-labelledby` do Modal aponta pra ele, e um h2 vazio deixaria o
       * dialog sem nome acessível.
       */
      title={
        showStepper ? exam.title : <span className="sr-only">{exam.title}</span>
      }
      size="lg"
      footer={footer}
      // Com o vídeo preso, quem rola é o bloco de avisos, não o Modal.
      contentClassName={cn(
        'flex flex-col gap-6',
        hasPinnedVideo && 'overflow-hidden'
      )}
    >
      {showStepper && (
        <Stepper steps={stepperSteps} currentStep={step} size="small" />
      )}
      {renderStepContent()}
    </Modal>
  );
};

export default EnemClassroomStartModal;
