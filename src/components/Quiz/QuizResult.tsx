import { forwardRef, useEffect, useState } from 'react';
import { CardResults, CardStatus } from '../Card/Card';
import {
  ANSWER_STATUS,
  Question,
  QUESTION_DIFFICULTY,
  SUBTYPE_ENUM,
  useQuizStore,
} from './useQuizStore';
import ProgressCircle from '../ProgressCircle/ProgressCircle';
import { Clock } from 'phosphor-react';
import ProgressBar from '../ProgressBar/ProgressBar';
import { cn, getSubjectColorWithOpacity } from '../../utils/utils';
import Badge from '../Badge/Badge';
import { useTheme } from '../../hooks/useTheme';
import Button from '../Button/Button';

const QuizBadge = ({
  subtype,
}: {
  subtype: SUBTYPE_ENUM | undefined | string;
}) => {
  switch (subtype) {
    case SUBTYPE_ENUM.PROVA:
      return (
        <Badge variant="examsOutlined" action="exam2" data-testid="quiz-badge">
          Prova
        </Badge>
      );
    case SUBTYPE_ENUM.ENEM_PROVA_1:
    case SUBTYPE_ENUM.ENEM_PROVA_2:
      return (
        <Badge variant="examsOutlined" action="exam1" data-testid="quiz-badge">
          Enem
        </Badge>
      );
    case SUBTYPE_ENUM.VESTIBULAR:
      return (
        <Badge variant="examsOutlined" action="exam4" data-testid="quiz-badge">
          Vestibular
        </Badge>
      );
    case SUBTYPE_ENUM.SIMULADO:
    case SUBTYPE_ENUM.SIMULADAO:
    case undefined:
      return (
        <Badge variant="examsOutlined" action="exam3" data-testid="quiz-badge">
          Simuladão
        </Badge>
      );
    default:
      return (
        <Badge variant="solid" action="info" data-testid="quiz-badge">
          {subtype}
        </Badge>
      );
  }
};

const QuizHeaderResult = forwardRef<HTMLDivElement, { className?: string }>(
  ({ className, ...props }, ref) => {
    const { getQuestionResultByQuestionId, getCurrentQuestion } =
      useQuizStore();
    const [status, setStatus] = useState<ANSWER_STATUS | undefined>(undefined);
    useEffect(() => {
      const cq = getCurrentQuestion();
      if (!cq) {
        setStatus(undefined);
        return;
      }
      const qr = getQuestionResultByQuestionId(cq.id);
      setStatus(qr?.answerStatus);
    }, [
      getCurrentQuestion,
      getQuestionResultByQuestionId,
      getCurrentQuestion()?.id,
    ]);

    const getClassesByAnswersStatus = () => {
      switch (status) {
        case ANSWER_STATUS.RESPOSTA_CORRETA:
          return 'bg-success-background';
        case ANSWER_STATUS.RESPOSTA_INCORRETA:
          return 'bg-error-background';
        case ANSWER_STATUS.PENDENTE_AVALIACAO:
          return 'bg-info-background';
        default:
          return 'bg-error-background';
      }
    };

    const getLabelByAnswersStatus = () => {
      switch (status) {
        case ANSWER_STATUS.RESPOSTA_CORRETA:
          return '🎉 Parabéns!!';
        case ANSWER_STATUS.RESPOSTA_INCORRETA:
          return 'Não foi dessa vez...';
        case ANSWER_STATUS.PENDENTE_AVALIACAO:
          return 'Avaliação pendente';
        case ANSWER_STATUS.NAO_RESPONDIDO:
        default:
          return 'Não foi dessa vez...você deixou a resposta em branco';
      }
    };
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-row items-center gap-10 p-3.5 rounded-xl mb-4',
          getClassesByAnswersStatus(),
          className
        )}
        {...props}
      >
        <p className="text-text-950 font-bold text-lg">Resultado</p>
        <p className="text-text-700 text-md">{getLabelByAnswersStatus()}</p>
      </div>
    );
  }
);

const QuizResultHeaderTitle = forwardRef<
  HTMLDivElement,
  {
    className?: string;
    showBadge?: boolean;
    onRepeat?: () => void;
    canRetry?: boolean;
  }
>(({ className, showBadge = true, onRepeat, canRetry, ...props }, ref) => {
  const { quiz } = useQuizStore();
  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-row pt-4 justify-between items-center',
        className
      )}
      {...props}
    >
      <p className="text-text-950 font-bold text-2xl">Resultado</p>
      <div className="flex flex-row gap-3 items-center">
        {canRetry && (
          <Button
            variant="solid"
            action="primary"
            size="medium"
            onClick={() => {
              onRepeat?.();
            }}
          >
            Repetir questionário
          </Button>
        )}

        {showBadge && <QuizBadge subtype={quiz?.subtype || undefined} />}
      </div>
    </div>
  );
});

const QuizResultTitle = forwardRef<
  HTMLParagraphElement,
  { className?: string }
>(({ className, ...props }, ref) => {
  const { getQuizTitle } = useQuizStore();
  const quizTitle = getQuizTitle();

  return (
    <p
      className={cn('pt-6 pb-4 text-text-950 font-bold text-lg', className)}
      ref={ref}
      {...props}
    >
      {quizTitle}
    </p>
  );
});

const QuizResultPerformance = forwardRef<
  HTMLDivElement,
  { showDetails?: boolean }
>(({ showDetails = true, ...props }, ref) => {
  const {
    getTotalQuestions,
    formatTime,
    getQuestionResultStatistics,
    getQuestionResult,
  } = useQuizStore();

  const totalQuestions = getTotalQuestions();
  const questionResult = getQuestionResult();

  let correctAnswers = 0;
  let correctEasyAnswers = 0;
  let correctMediumAnswers = 0;
  let correctDifficultAnswers = 0;
  let totalEasyQuestions = 0;
  let totalMediumQuestions = 0;
  let totalDifficultQuestions = 0;

  if (questionResult) {
    questionResult.answers.forEach((answer) => {
      const isCorrect = answer.answerStatus == ANSWER_STATUS.RESPOSTA_CORRETA;

      if (isCorrect) {
        correctAnswers++;
      }

      if (answer.difficultyLevel === QUESTION_DIFFICULTY.FACIL) {
        totalEasyQuestions++;
        if (isCorrect) {
          correctEasyAnswers++;
        }
      } else if (answer.difficultyLevel === QUESTION_DIFFICULTY.MEDIO) {
        totalMediumQuestions++;
        if (isCorrect) {
          correctMediumAnswers++;
        }
      } else if (answer.difficultyLevel === QUESTION_DIFFICULTY.DIFICIL) {
        totalDifficultQuestions++;
        if (isCorrect) {
          correctDifficultAnswers++;
        }
      }
    });
  }

  const percentage =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;

  const classesJustifyBetween = showDetails
    ? 'justify-between'
    : 'justify-center';
  return (
    <div
      className={cn(
        'flex flex-row gap-6 p-6 rounded-xl bg-background',
        classesJustifyBetween
      )}
      ref={ref}
      {...props}
    >
      <div className="relative">
        <ProgressCircle
          size="medium"
          variant="green"
          value={percentage}
          showPercentage={false}
          label=""
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showDetails && (
            <div className="flex items-center gap-1 mb-1">
              <Clock size={12} weight="regular" className="text-text-800" />
              <span className="text-2xs font-medium text-text-800">
                {formatTime(
                  (getQuestionResultStatistics()?.timeSpent ?? 0) * 60
                )}
              </span>
            </div>
          )}

          <div className="text-2xl font-medium text-text-800 leading-7">
            {getQuestionResultStatistics()?.correctAnswers ?? '--'} de{' '}
            {totalQuestions}
          </div>

          <div className="text-2xs font-medium text-text-600 mt-1">
            Corretas
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="flex flex-col gap-4 w-full">
          <ProgressBar
            className="w-full"
            layout="stacked"
            variant="green"
            value={correctEasyAnswers}
            max={totalEasyQuestions}
            label="Fáceis"
            showHitCount
            labelClassName="text-base font-medium text-text-800 leading-none"
            percentageClassName="text-xs font-medium leading-[14px] text-right"
          />

          <ProgressBar
            className="w-full"
            layout="stacked"
            variant="green"
            value={correctMediumAnswers}
            max={totalMediumQuestions}
            label="Médias"
            showHitCount
            labelClassName="text-base font-medium text-text-800 leading-none"
            percentageClassName="text-xs font-medium leading-[14px] text-right"
          />

          <ProgressBar
            className="w-full"
            layout="stacked"
            variant="green"
            value={correctDifficultAnswers}
            max={totalDifficultQuestions}
            label="Difíceis"
            showHitCount
            labelClassName="text-base font-medium text-text-800 leading-none"
            percentageClassName="text-xs font-medium leading-[14px] text-right"
          />
        </div>
      )}
    </div>
  );
});

const QuizListResult = forwardRef<
  HTMLDivElement,
  {
    className?: string;
    onSubjectClick?: (subject: string) => void;
  }
>(({ className, onSubjectClick, ...props }, ref) => {
  const { getQuestionsGroupedBySubject } = useQuizStore();
  const { isDark } = useTheme();
  const groupedQuestions = getQuestionsGroupedBySubject();
  const subjectsStats = Object.entries(groupedQuestions).map(
    ([subjectId, questions]) => {
      let correct = 0;
      let incorrect = 0;

      questions.forEach((question) => {
        if (question.answerStatus == ANSWER_STATUS.RESPOSTA_CORRETA) {
          correct++;
        } else {
          incorrect++;
        }
      });

      return {
        subject: {
          name:
            questions?.[0]?.knowledgeMatrix?.[0]?.subject?.name ??
            'Sem matéria',
          id: subjectId,
          color: questions?.[0]?.knowledgeMatrix?.[0]?.subject?.color ?? '',
          icon: questions?.[0]?.knowledgeMatrix?.[0]?.subject?.icon ?? '',
        },
        correct,
        incorrect,
        total: questions.length,
      };
    }
  );

  return (
    <section ref={ref} className={className} {...props}>
      <p className="pt-6 pb-4 text-text-950 font-bold text-lg">Matérias</p>

      <ul className="flex flex-col gap-2">
        {subjectsStats.map((subject) => (
          <li key={subject.subject.id}>
            <CardResults
              onClick={() => onSubjectClick?.(subject.subject.id)}
              className="max-w-full"
              header={subject.subject.name}
              correct_answers={subject.correct}
              incorrect_answers={subject.incorrect}
              icon={subject.subject.icon || 'Book'}
              color={
                getSubjectColorWithOpacity(subject.subject.color, isDark) ||
                undefined
              }
              direction="row"
            />
          </li>
        ))}
      </ul>
    </section>
  );
});

const QuizListResultByMateria = ({
  subject,
  onQuestionClick,
}: {
  subject: string;
  onQuestionClick: (question: Question) => void;
}) => {
  const { getQuestionsGroupedBySubject, getQuestionIndex } = useQuizStore();
  const groupedQuestions = getQuestionsGroupedBySubject();

  const answeredQuestions = groupedQuestions[subject] || [];
  const formattedQuestions =
    subject == 'all'
      ? Object.values(groupedQuestions).flat()
      : answeredQuestions;
  return (
    <div className="flex flex-col">
      <div className="flex flex-row pt-4 justify-between">
        <p className="text-text-950 font-bold text-2xl">
          {answeredQuestions?.[0]?.knowledgeMatrix?.[0]?.subject?.name ??
            'Sem matéria'}
        </p>
      </div>

      <section className="flex flex-col ">
        <p className="pt-6 pb-4 text-text-950 font-bold text-lg">
          Resultado das questões
        </p>

        <ul className="flex flex-col gap-2 pt-4">
          {formattedQuestions.map((question) => {
            const questionIndex = getQuestionIndex(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (question as any).questionId ?? question.id
            );
            return (
              <li key={question.id}>
                <CardStatus
                  className="max-w-full"
                  header={`Questão ${questionIndex.toString().padStart(2, '0')}`}
                  status={(() => {
                    if (
                      question.answerStatus === ANSWER_STATUS.RESPOSTA_CORRETA
                    )
                      return 'correct';
                    if (
                      question.answerStatus === ANSWER_STATUS.RESPOSTA_INCORRETA
                    )
                      return 'incorrect';
                    if (question.answerStatus === ANSWER_STATUS.NAO_RESPONDIDO)
                      return 'unanswered';
                    if (
                      question.answerStatus === ANSWER_STATUS.PENDENTE_AVALIACAO
                    )
                      return 'pending';
                    return undefined;
                  })()}
                  onClick={() => onQuestionClick?.(question)}
                />
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
};

export {
  QuizListResultByMateria,
  QuizListResult,
  QuizResultPerformance,
  QuizResultTitle,
  QuizResultHeaderTitle,
  QuizHeaderResult,
};
