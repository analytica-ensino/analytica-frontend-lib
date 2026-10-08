import { forwardRef, useEffect, useState } from 'react';
import { CardResults, CardStatus } from '../Card/Card';
import {
  ANSWER_STATUS,
  Question,
  QuestionResult,
  QUESTION_DIFFICULTY,
  QUIZ_TYPE,
  SUBTYPE_ENUM,
  useQuizStore,
} from './useQuizStore';
import { PerformanceByDifficulty } from './PerformanceByDifficulty';
import { cn, getSubjectColorWithOpacity } from '../../utils/utils';
import Badge from '../Badge/Badge';
import { useTheme } from '../../hooks/useTheme';
import Button from '../Button/Button';
import { formatExamInfo, shouldShowExamInfo } from './Quiz.utils';
import Text from '../Text/Text';

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
    const {
      getQuestionResultByQuestionId,
      getCurrentQuestion,
      questionsResult,
    } = useQuizStore();
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
      questionsResult,
    ]);

    const getClassesByAnswersStatus = () => {
      // Guard para quando status ainda está carregando
      if (status === undefined) {
        return 'bg-gray-100';
      }

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
      // Guard para quando status ainda está carregando
      if (status === undefined) {
        return 'Carregando...';
      }

      switch (status) {
        case ANSWER_STATUS.RESPOSTA_CORRETA:
          // Emoji decorativo: sem o aria-hidden o leitor anuncia
          // "confete" (ou o nome do emoji) antes da mensagem.
          return (
            <>
              <Text as="span" color="text-text-700" aria-hidden="true">
                🎉
              </Text>{' '}
              Parabéns!!
            </>
          );
        case ANSWER_STATUS.RESPOSTA_INCORRETA:
          return 'Não foi dessa vez...';
        case ANSWER_STATUS.PENDENTE_AVALIACAO:
          return 'Avaliação pendente';
        case ANSWER_STATUS.NAO_RESPONDIDO:
          return 'Não foi dessa vez...você deixou a resposta em branco';
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
        {/* `<output>` (região viva nativa): o resultado muda ao navegar entre
            questões e o leitor de tela precisa anunciar o novo feedback sem
            mover o foco. `contents` mantém o layout do flex do pai. */}
        <output className="contents">
          <Text as="span" className="block text-text-950 font-bold text-lg">
            Resultado
          </Text>
          <Text as="span" className="block text-text-700 text-md">
            {getLabelByAnswersStatus()}
          </Text>
        </output>
      </div>
    );
  }
);

const getRetryButtonLabel = (type: QUIZ_TYPE | undefined) => {
  switch (type) {
    case QUIZ_TYPE.ATIVIDADE:
      return 'Refazer atividade';
    case QUIZ_TYPE.QUESTIONARIO:
      return 'Repetir questionário';
    case QUIZ_TYPE.SIMULADO:
      return 'Repetir simulado';
    default:
      return 'Refazer';
  }
};

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
      {/* Título principal da tela de resultado: h1 para a navegação por
          cabeçalhos do leitor de tela. */}
      <Text as="h1" size="2xl" weight="bold" color="text-text-950">
        Resultado
      </Text>
      <div className="flex flex-row gap-3 items-center">
        {canRetry && onRepeat && (
          <Button
            variant="solid"
            action="primary"
            size="medium"
            onClick={onRepeat}
          >
            {getRetryButtonLabel(quiz?.type)}
          </Button>
        )}

        {showBadge && <QuizBadge subtype={quiz?.subtype || undefined} />}
      </div>
    </div>
  );
});

const QuizResultTitle = forwardRef<HTMLHeadingElement, { className?: string }>(
  ({ className, ...props }, ref) => {
    const { getQuizTitle } = useQuizStore();
    const quizTitle = getQuizTitle();

    // Título da atividade logo abaixo do h1 "Resultado": seção de nível 2.
    return (
      <h2
        className={cn('pt-6 pb-4 text-text-950 font-bold text-lg', className)}
        ref={ref}
        {...props}
      >
        {quizTitle}
      </h2>
    );
  }
);

/**
 * Update statistics counters based on difficulty level
 * @param stats - Statistics object to update
 * @param difficulty - Question difficulty level
 * @param isCorrect - Whether the answer is correct
 */
const updateDifficultyStats = (
  stats: {
    correctEasyAnswers: number;
    correctMediumAnswers: number;
    correctDifficultAnswers: number;
    totalEasyQuestions: number;
    totalMediumQuestions: number;
    totalDifficultQuestions: number;
  },
  difficulty: string | undefined,
  isCorrect: boolean
) => {
  if (difficulty === QUESTION_DIFFICULTY.FACIL) {
    stats.totalEasyQuestions++;
    if (isCorrect) stats.correctEasyAnswers++;
  } else if (difficulty === QUESTION_DIFFICULTY.MEDIO) {
    stats.totalMediumQuestions++;
    if (isCorrect) stats.correctMediumAnswers++;
  } else if (difficulty === QUESTION_DIFFICULTY.DIFICIL) {
    stats.totalDifficultQuestions++;
    if (isCorrect) stats.correctDifficultAnswers++;
  }
};

/**
 * Duração falada, para leitor de tela: "0 horas e 0 minutos".
 *
 * O tempo aparece no círculo como "00:00", que o leitor anuncia como número de
 * relógio ("zero dois pontos zero") em vez de duração. Isto escreve por extenso.
 *
 * @param totalMinutes - Minutos gastos, como o store guarda
 * @returns A duração em palavras
 *
 * @example
 * ```typescript
 * formatSpokenDuration(0);  // '0 horas e 0 minutos'
 * formatSpokenDuration(91); // '1 hora e 31 minutos'
 * ```
 */
const formatSpokenDuration = (totalMinutes: number): string => {
  const safeMinutes = Number.isFinite(totalMinutes)
    ? Math.max(0, Math.round(totalMinutes))
    : 0;
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  const hoursLabel = hours === 1 ? 'hora' : 'horas';
  const minutesLabel = minutes === 1 ? 'minuto' : 'minutos';

  return `${hours} ${hoursLabel} e ${minutes} ${minutesLabel}`;
};

/**
 * Calculate answer statistics by difficulty level
 * @param answers - Array of question answers
 * @returns Statistics object with counts by difficulty
 */
const calculateAnswerStatistics = (
  answers: Array<{
    answerStatus: string;
    difficultyLevel?: string;
  }>
) => {
  const stats = {
    correctAnswers: 0,
    correctEasyAnswers: 0,
    correctMediumAnswers: 0,
    correctDifficultAnswers: 0,
    totalEasyQuestions: 0,
    totalMediumQuestions: 0,
    totalDifficultQuestions: 0,
  };

  for (const answer of answers) {
    const isCorrect = answer.answerStatus === ANSWER_STATUS.RESPOSTA_CORRETA;

    if (isCorrect) {
      stats.correctAnswers++;
    }

    updateDifficultyStats(stats, answer.difficultyLevel, isCorrect);
  }

  return stats;
};

const QuizResultPerformance = forwardRef<
  HTMLDivElement,
  {
    showDetails?: boolean;
    /**
     * Tempo gasto, dentro do anel. Segue `showDetails` por padrão; existe
     * separado porque uma prova feita no papel tem o desempenho por
     * dificuldade, mas não tem cronômetro — qualquer número ali seria
     * inventado.
     */
    showTimeSpent?: boolean;
  }
>(({ showDetails = true, showTimeSpent = showDetails, ...props }, ref) => {
  const {
    getTotalQuestions,
    formatTime,
    getQuestionResultStatistics,
    getQuestionResult,
  } = useQuizStore();

  const totalQuestions = getTotalQuestions();
  const questionResult = getQuestionResult();

  const stats = questionResult
    ? calculateAnswerStatistics(questionResult.answers)
    : {
        correctAnswers: 0,
        correctEasyAnswers: 0,
        correctMediumAnswers: 0,
        correctDifficultAnswers: 0,
        totalEasyQuestions: 0,
        totalMediumQuestions: 0,
        totalDifficultQuestions: 0,
      };

  const percentage =
    totalQuestions > 0
      ? Math.round((stats.correctAnswers / totalQuestions) * 100)
      : 0;

  const resultStatistics = getQuestionResultStatistics();
  const correctAnswers = resultStatistics?.correctAnswers ?? '--';
  // Só formata quando o tempo vai aparecer: numa prova feita no papel não há
  // cronômetro, e `formatTime` de um zero inventado não serve pra nada.
  const timeSpent = showTimeSpent
    ? formatTime((resultStatistics?.timeSpent ?? 0) * 60)
    : null;
  const spokenTimeSpent = formatSpokenDuration(
    resultStatistics?.timeSpent ?? 0
  );

  /**
   * Leitura do anel: o conteúdo do miolo escrito como frase, mais o tempo por
   * extenso. O percentual NÃO entra aqui — ele vem do valor do próprio
   * `<progress>`, que o leitor anuncia logo depois do nome.
   *
   * Já esteve num `aria-valuetext` junto com "Desempenho: X por cento", e o
   * resultado foi o percentual falado duas vezes: em elemento nativo o
   * `valuetext` não substitui o valor, ele soma.
   *
   * O tempo precisa estar escrito aqui porque no círculo ele aparece como
   * "00:00", que o leitor anunciaria como hora em vez de duração.
   */
  const circleAccessibleLabel = [
    `${correctAnswers} de ${totalQuestions} questões corretas.`,
    timeSpent ? `Tempo de conclusão: ${spokenTimeSpent}.` : null,
  ]
    .filter(Boolean)
    .join(' ');

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
      <PerformanceByDifficulty
        percentage={percentage}
        correct={correctAnswers}
        total={totalQuestions}
        timeSpent={timeSpent}
        circleAccessibleLabel={circleAccessibleLabel}
        difficulties={
          showDetails
            ? [
                {
                  label: 'Fáceis',
                  spokenLabel: 'fáceis',
                  correct: stats.correctEasyAnswers,
                  total: stats.totalEasyQuestions,
                },
                {
                  label: 'Médias',
                  spokenLabel: 'médias',
                  correct: stats.correctMediumAnswers,
                  total: stats.totalMediumQuestions,
                },
                {
                  label: 'Difíceis',
                  spokenLabel: 'difíceis',
                  correct: stats.correctDifficultAnswers,
                  total: stats.totalDifficultQuestions,
                },
              ]
            : null
        }
      />
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

      for (const question of questions) {
        // Nota: questões em branco ou com avaliação pendente entram como
        // "incorretas" nesta contagem (e, portanto, no nome acessível do
        // CardResults). Mantido como está; revisar se o produto pedir.
        if (question.answerStatus === ANSWER_STATUS.RESPOSTA_CORRETA) {
          correct++;
        } else {
          incorrect++;
        }
      }

      return {
        subject: {
          name:
            questions?.[0]?.knowledgeMatrix?.[0]?.subject?.name ??
            'Sem componente curricular',
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
      <Text
        as="h2"
        size="lg"
        weight="bold"
        color="text-text-950"
        className="pt-6 pb-4"
      >
        Componentes curriculares
      </Text>

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
  subjectName,
}: {
  subject: string;
  onQuestionClick: (
    question: Question | QuestionResult['answers'][number]
  ) => void;
  subjectName?: string;
}) => {
  const { getQuestionsGroupedBySubject, getQuestionIndex, quiz } =
    useQuizStore();
  const groupedQuestions = getQuestionsGroupedBySubject();

  const showExamInfo = shouldShowExamInfo(quiz);

  const answeredQuestions = groupedQuestions[subject] || [];
  const formattedQuestions =
    subject == 'all'
      ? Object.values(groupedQuestions).flat()
      : answeredQuestions;
  return (
    <div className="flex flex-col">
      <div className="flex flex-row pt-4 justify-between">
        {/* Nesta visão o nome do componente curricular é o título da tela. */}
        <Text as="h1" size="2xl" weight="bold" color="text-text-950">
          {subjectName ||
            formattedQuestions?.[0]?.knowledgeMatrix?.[0]?.subject?.name ||
            'Sem componente curricular'}
        </Text>
      </div>

      <section className="flex flex-col ">
        <Text
          as="h2"
          size="lg"
          weight="bold"
          color="text-text-950"
          className="pt-6 pb-4"
        >
          Resultado das questões
        </Text>

        <ul className="flex flex-col gap-2 pt-4">
          {formattedQuestions.map((question) => {
            // questionId exists in QuestionResult answers, id in Question
            const questionId =
              'questionId' in question ? question.questionId : question.id;
            const questionIndex = getQuestionIndex(questionId);

            // examBoard and examYear only exist in Question type - only show for SIMULADO
            const examBoard =
              'examBoard' in question ? question.examBoard : null;
            const examYear = 'examYear' in question ? question.examYear : null;
            const examInfo = showExamInfo
              ? formatExamInfo(examBoard, examYear)
              : '';
            const questionTitle = `Questão ${questionIndex.toString().padStart(2, '0')}`;
            const header = examInfo
              ? `${questionTitle} ${examInfo}`
              : questionTitle;
            return (
              <li key={question.id}>
                <CardStatus
                  className="max-w-full"
                  header={header}
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
