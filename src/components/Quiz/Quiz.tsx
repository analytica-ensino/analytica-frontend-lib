import {
  CaretLeft,
  CaretRight,
  Clock,
  SquaresFour,
  BookOpen,
  Book,
} from 'phosphor-react';
import Badge from '../Badge/Badge';
import {
  AlternativesList,
  HeaderAlternative,
} from '../Alternative/Alternative';
import Button from '../Button/Button';
import IconButton from '../IconButton/IconButton';
import { forwardRef, ReactNode, useState } from 'react';
import { Question, useQuizStore, QUESTION_DIFFICULTY } from './useQuizStore';
import { AlertDialog } from '../AlertDialog/AlertDialog';
import Modal from '../Modal/Modal';
import SimulatedResult from '@/assets/img/simulated-result.png';
import Select, {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../Select/Select';
import { CardResults, CardStatus } from '../Card/Card';
import ProgressCircle from '../ProgressCircle/ProgressCircle';
import ProgressBar from '../ProgressBar/ProgressBar';
import { cn } from '../../utils/utils';

const Quiz = forwardRef<
  HTMLDivElement,
  { children: ReactNode; className?: string }
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'w-full max-w-[1000px] flex flex-col mx-auto h-full relative not-lg:px-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

const QuizHeaderResult = forwardRef<HTMLDivElement, { className?: string }>(
  ({ className, ...props }, ref) => {
    const { getCurrentQuestion, getCurrentAnswer } = useQuizStore();
    const currentQuestion = getCurrentQuestion();
    const userAnswer = getCurrentAnswer();

    // Verifica se o usuário acertou comparando sua resposta com a resposta correta
    const isCorrect = userAnswer === currentQuestion?.correctOptionId;

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-row items-center gap-10 p-3.5 rounded-xl mb-4',
          isCorrect ? 'bg-success-background' : 'bg-error-background',
          className
        )}
        {...props}
      >
        <p className="text-text-950 font-bold text-lg">Resultado</p>
        <p className="text-text-700 text-md">
          {isCorrect ? '🎉 Parabéns!!' : 'Não foi dessa vez...'}
        </p>
      </div>
    );
  }
);

const QuizTitle = forwardRef<HTMLDivElement, { className?: string }>(
  ({ className, ...props }, ref) => {
    const {
      currentQuestionIndex,
      getTotalQuestions,
      getQuizTitle,
      timeElapsed,
      formatTime,
      isStarted,
    } = useQuizStore();

    const totalQuestions = getTotalQuestions();
    const quizTitle = getQuizTitle();

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-row justify-center items-center relative p-2',
          className
        )}
        {...props}
      >
        <span className="flex flex-col gap-2 text-center">
          <p className="text-text-950 font-bold text-md">{quizTitle}</p>
          <p className="text-text-600 text-xs">
            {totalQuestions > 0
              ? `${currentQuestionIndex + 1} de ${totalQuestions}`
              : '0 de 0'}
          </p>
        </span>

        <span className="absolute right-2">
          <Badge variant="outlined" action="info" iconLeft={<Clock />}>
            {isStarted ? formatTime(timeElapsed) : '00:00'}
          </Badge>
        </span>
      </div>
    );
  }
);

const QuizHeader = () => {
  const { getCurrentQuestion } = useQuizStore();
  const currentQuestion = getCurrentQuestion();

  return (
    <HeaderAlternative
      title={currentQuestion ? `Questão ${currentQuestion.id}` : 'Questão'}
      subTitle={currentQuestion?.knowledgeMatrix?.[0]?.topicId ?? ''}
      content={currentQuestion?.questionText ?? ''}
    />
  );
};

const QuizContent = forwardRef<
  HTMLDivElement,
  {
    type?: 'Alternativas' | 'Dissertativa';
    children: ReactNode;
    className?: string;
  }
>(({ type = 'Alternativas', children, className, ...props }, ref) => {
  return (
    <>
      <div className="px-4 pb-2 pt-6">
        <p className="font-bold text-lg text-text-950">{type}</p>
      </div>

      <div
        ref={ref}
        className={cn(
          'rounded-t-xl px-4 pt-4 pb-[80px] h-full flex flex-col gap-4 mb-auto',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </>
  );
});

enum Status {
  CORRECT = 'correct',
  INCORRECT = 'incorrect',
  NEUTRAL = 'neutral',
}

interface QuizAlternativeInterface {
  variant?: 'result' | 'default';
}

const QuizAlternative = ({ variant = 'default' }: QuizAlternativeInterface) => {
  const { getCurrentQuestion, selectAnswer, getCurrentAnswer } = useQuizStore();
  const currentQuestion = getCurrentQuestion();
  const currentAnswer = getCurrentAnswer();
  const alternatives = currentQuestion?.options?.map((option) => {
    let status: Status = Status.NEUTRAL;

    if (variant === 'result') {
      if (option.id === currentQuestion.correctOptionId) {
        status = Status.CORRECT;
      } else if (
        currentAnswer === option.id &&
        option.id !== currentQuestion.correctOptionId
      ) {
        status = Status.INCORRECT;
      }
    }

    return {
      label: option.option,
      value: option.id,
      status: status,
    };
  });

  if (!alternatives)
    return (
      <div>
        <p>Não há Alternativas</p>
      </div>
    );

  return (
    <div className="space-y-4">
      <AlternativesList
        mode={variant === 'default' ? 'interactive' : 'readonly'}
        key={`question-${currentQuestion?.id || '1'}`}
        name={`question-${currentQuestion?.id || '1'}`}
        layout="compact"
        alternatives={alternatives}
        value={currentAnswer}
        selectedValue={currentAnswer}
        onValueChange={(value) => {
          if (currentQuestion) {
            selectAnswer(currentQuestion.id, value);
          }
        }}
      />
    </div>
  );
};

const QuizQuestionList = ({
  filterType = 'all',
  onQuestionClick,
}: {
  filterType?: string;
  onQuestionClick?: () => void;
} = {}) => {
  const {
    getQuestionsGroupedBySubject,
    goToQuestion,
    getQuestionStatusFromUserAnswers,
  } = useQuizStore();

  const groupedQuestions = getQuestionsGroupedBySubject();

  const getQuestionStatus = (questionId: string) => {
    return getQuestionStatusFromUserAnswers(questionId);
  };

  const filteredGroupedQuestions = Object.entries(groupedQuestions).reduce(
    (acc, [subjectId, questions]) => {
      const filteredQuestions = questions.filter((question) => {
        const status = getQuestionStatus(question.id);

        switch (filterType) {
          case 'answered':
            return status === 'answered';
          case 'unanswered':
            return status === 'unanswered';
          default:
            return true;
        }
      });

      if (filteredQuestions.length > 0) {
        acc[subjectId] = filteredQuestions;
      }

      return acc;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    {} as { [key: string]: any[] }
  );

  const getQuestionIndex = (questionId: string) => {
    const { bySimulated, byActivity, byQuestionary } = useQuizStore.getState();
    const quiz = bySimulated ?? byActivity ?? byQuestionary;
    if (!quiz) return 0;

    const index = quiz.questions.findIndex((q) => q.id === questionId);
    return index + 1;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'answered':
        return 'Respondida';
      case 'skipped':
        return 'Não respondida';
      default:
        return 'Em branco';
    }
  };
  return (
    <div className="space-y-6 px-4">
      {Object.entries(filteredGroupedQuestions).map(
        ([subjectId, questions]) => (
          <section key={subjectId} className="flex flex-col gap-2">
            <span className="pt-6 pb-4 flex flex-row gap-2">
              <div className="bg-primary-500 p-1 rounded-sm flex items-center justify-center">
                <BookOpen size={17} className="text-white" />
              </div>
              <p className="text-text-800 font-bold text-lg">{subjectId}</p>
            </span>

            <ul className="flex flex-col gap-2">
              {questions.map((question) => {
                const status = getQuestionStatus(question.id);
                const questionNumber = getQuestionIndex(question.id);

                return (
                  <CardStatus
                    key={question.id}
                    header={`Questão ${questionNumber.toString().padStart(2, '0')}`}
                    label={getStatusLabel(status)}
                    onClick={() => {
                      goToQuestion(questionNumber - 1);
                      onQuestionClick?.();
                    }}
                  />
                );
              })}
            </ul>
          </section>
        )
      )}
    </div>
  );
};

const QuizFooter = forwardRef<
  HTMLDivElement,
  {
    className?: string;
    variant?: 'result' | 'default';
    onGoToSimulated?: () => void;
    onDetailResult?: () => void;
  }
>(
  (
    {
      className,
      onGoToSimulated,
      onDetailResult,
      variant = 'default',
      ...props
    },
    ref
  ) => {
    const {
      currentQuestionIndex,
      getUserAnswers,
      getTotalQuestions,
      goToNextQuestion,
      goToPreviousQuestion,
      getUnansweredQuestionsFromUserAnswers,
      getCurrentAnswer,
      skipQuestion,
      getCurrentQuestion,
      getQuestionStatusFromUserAnswers,
      getActiveQuiz,
    } = useQuizStore();

    const totalQuestions = getTotalQuestions();
    const isFirstQuestion = currentQuestionIndex === 0;
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
    const currentAnswer = getCurrentAnswer();
    const currentQuestion = getCurrentQuestion();
    const isCurrentQuestionSkipped = currentQuestion
      ? getQuestionStatusFromUserAnswers(currentQuestion.id) === 'skipped'
      : false;
    const [alertDialogOpen, setAlertDialogOpen] = useState(false);
    const [modalResultOpen, setModalResultOpen] = useState(false);
    const [modalNavigateOpen, setModalNavigateOpen] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const unansweredQuestions = getUnansweredQuestionsFromUserAnswers();
    const userAnswers = getUserAnswers();
    const allQuestions = getTotalQuestions();

    return (
      <>
        <footer
          ref={ref}
          className={cn(
            'w-full px-2 bg-background lg:max-w-[1000px] not-lg:max-w-[calc(100vw-32px)] border-t border-border-50 fixed bottom-0 min-h-[80px] flex flex-row justify-between items-center',
            className
          )}
          {...props}
        >
          {variant === 'default' ? (
            <>
              <div className="flex flex-row items-center gap-1">
                <IconButton
                  icon={<SquaresFour size={24} className="text-text-950" />}
                  size="md"
                  onClick={() => setModalNavigateOpen(true)}
                />

                {isFirstQuestion ? (
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => {
                      skipQuestion();
                      goToNextQuestion();
                    }}
                  >
                    Pular
                  </Button>
                ) : (
                  <Button
                    size="medium"
                    variant="link"
                    action="primary"
                    iconLeft={<CaretLeft size={18} />}
                    onClick={() => {
                      goToPreviousQuestion();
                    }}
                  >
                    Voltar
                  </Button>
                )}
              </div>

              {!isFirstQuestion && (
                <Button
                  size="small"
                  variant="outline"
                  action="primary"
                  onClick={() => {
                    skipQuestion();
                    goToNextQuestion();
                  }}
                >
                  Pular
                </Button>
              )}

              {isLastQuestion ? (
                <Button
                  size="medium"
                  variant="solid"
                  action="primary"
                  disabled={!currentAnswer && !isCurrentQuestionSkipped}
                  onClick={() => {
                    if (unansweredQuestions.length > 0) {
                      setAlertDialogOpen(true);
                    } else {
                      setModalResultOpen(true);
                    }
                  }}
                >
                  Finalizar
                </Button>
              ) : (
                <Button
                  size="medium"
                  variant="link"
                  action="primary"
                  iconRight={<CaretRight size={18} />}
                  disabled={!currentAnswer && !isCurrentQuestionSkipped}
                  onClick={() => {
                    goToNextQuestion();
                  }}
                >
                  Avançar
                </Button>
              )}
            </>
          ) : (
            <div className="flex flex-row items-center justify-end w-full">
              <Button variant="solid" action="primary" size="medium">
                Ver Resolução
              </Button>
            </div>
          )}
        </footer>

        <AlertDialog
          isOpen={alertDialogOpen}
          onChangeOpen={setAlertDialogOpen}
          title="Finalizar simulado?"
          description={
            unansweredQuestions.length > 0
              ? `Você deixou as questões ${unansweredQuestions.join(', ')} sem resposta. Finalizar agora pode impactar seu desempenho.`
              : 'Tem certeza que deseja finalizar o simulado?'
          }
          cancelButtonLabel="Voltar e revisar"
          submitButtonLabel="Finalizar Mesmo Assim"
          onSubmit={() => {
            setModalResultOpen(true);
          }}
        />

        <Modal
          isOpen={modalResultOpen}
          onClose={() => setModalResultOpen(false)}
          title=""
          closeOnBackdropClick={false}
          closeOnEscape={false}
          hideCloseButton
          size={'md'}
        >
          <div className="flex flex-col w-full h-full items-center justify-center gap-4">
            <img
              src={SimulatedResult}
              alt="Simulated Result"
              className="w-[282px] h-auto object-cover"
            />
            <div className="flex flex-col gap-2 text-center">
              <h2 className="text-text-950 font-bold text-lg">
                Você concluiu o simulado!
              </h2>
              <p className="text-text-500 font-sm">
                Você acertou{' '}
                {(() => {
                  const activeQuiz = getActiveQuiz();
                  if (!activeQuiz) return 0;

                  return userAnswers.filter((answer) => {
                    const question = activeQuiz.quiz.questions.find(
                      (q) => q.id === answer.questionId
                    );
                    return (
                      question && answer.answer === question.correctOptionId
                    );
                  }).length;
                })()}{' '}
                de {allQuestions} questões.
              </p>
            </div>

            <div className="px-6 flex flex-row items-center gap-2 w-full">
              <Button
                variant="outline"
                className="w-full"
                size="small"
                onClick={onGoToSimulated}
              >
                Ir para simulados
              </Button>

              <Button className="w-full" onClick={onDetailResult}>
                Detalhar resultado
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={modalNavigateOpen}
          onClose={() => setModalNavigateOpen(false)}
          title="Questões"
          size={'lg'}
        >
          <div className="flex flex-col w-full h-full">
            <div className="flex flex-row justify-between items-center py-6 pt-6 pb-4 border-b border-border-200">
              <p className="text-text-950 font-bold text-lg">Filtrar por</p>
              <span className="max-w-[266px]">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger variant="rounded" className="max-w-[266px]">
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="unanswered">Em branco</SelectItem>
                    <SelectItem value="answered">Respondidas</SelectItem>
                  </SelectContent>
                </Select>
              </span>
            </div>

            <div className="flex flex-col gap-2 not-lg:h-[calc(100vh-200px)] lg:max-h-[687px] overflow-y-auto">
              <QuizQuestionList
                filterType={filterType}
                onQuestionClick={() => setModalNavigateOpen(false)}
              />
            </div>
          </div>
        </Modal>
      </>
    );
  }
);

// QUIZ RESULT COMPONENTS

const QuizResultHeaderTitle = forwardRef<
  HTMLDivElement,
  { className?: string }
>(({ className, ...props }, ref) => {
  const { bySimulated } = useQuizStore();

  return (
    <div
      ref={ref}
      className={cn('flex flex-row pt-4 justify-between', className)}
      {...props}
    >
      <p className="text-text-950 font-bold text-2xl">Resultado</p>
      {bySimulated && (
        <Badge variant="solid" action="info">
          {bySimulated.category}
        </Badge>
      )}
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

const QuizResultPerformance = forwardRef<HTMLDivElement>(
  ({ ...props }, ref) => {
    const {
      getTotalQuestions,
      timeElapsed,
      formatTime,
      bySimulated,
      byActivity,
      byQuestionary,
      getUserAnswerByQuestionId,
    } = useQuizStore();

    const totalQuestions = getTotalQuestions();
    const quiz = bySimulated || byActivity || byQuestionary;

    let correctAnswers = 0;
    let correctEasyAnswers = 0;
    let correctMediumAnswers = 0;
    let correctDifficultAnswers = 0;
    let totalEasyQuestions = 0;
    let totalMediumQuestions = 0;
    let totalDifficultQuestions = 0;

    if (quiz) {
      quiz.questions.forEach((question) => {
        const userAnswerItem = getUserAnswerByQuestionId(question.id);
        const userAnswer = userAnswerItem?.answer;
        const isCorrect = userAnswer && userAnswer === question.correctOptionId;

        if (isCorrect) {
          correctAnswers++;
        }

        if (question.difficulty === QUESTION_DIFFICULTY.FACIL) {
          totalEasyQuestions++;
          if (isCorrect) {
            correctEasyAnswers++;
          }
        } else if (question.difficulty === QUESTION_DIFFICULTY.MEDIO) {
          totalMediumQuestions++;
          if (isCorrect) {
            correctMediumAnswers++;
          }
        } else if (question.difficulty === QUESTION_DIFFICULTY.DIFICIL) {
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

    return (
      <div
        className="flex flex-row gap-6 p-6 rounded-xl bg-background justify-between"
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
            <div className="flex items-center gap-1 mb-1">
              <Clock size={12} weight="regular" className="text-text-800" />
              <span className="text-2xs font-medium text-text-800">
                {formatTime(timeElapsed)}
              </span>
            </div>

            <div className="text-2xl font-medium text-text-800 leading-7">
              {correctAnswers} de {totalQuestions}
            </div>

            <div className="text-2xs font-medium text-text-600 mt-1">
              Corretas
            </div>
          </div>
        </div>

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
      </div>
    );
  }
);

const QuizListResult = forwardRef<
  HTMLDivElement,
  {
    className?: string;
    onSubjectClick?: (subject: string) => void;
  }
>(({ className, onSubjectClick, ...props }, ref) => {
  const {
    getQuestionsGroupedBySubject,
    isQuestionAnswered,
    getUserAnswerByQuestionId,
  } = useQuizStore();
  const groupedQuestions = getQuestionsGroupedBySubject();

  const subjectsStats = Object.entries(groupedQuestions).map(
    ([subjectId, questions]) => {
      let correct = 0;
      let incorrect = 0;

      questions.forEach((question) => {
        if (isQuestionAnswered(question.id)) {
          const userAnswerItem = getUserAnswerByQuestionId(question.id);
          const userAnswer = userAnswerItem?.answer;
          if (userAnswer === question.correctOptionId) {
            correct++;
          } else {
            incorrect++;
          }
        }
      });

      return {
        subject: subjectId,
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
          <li key={subject.subject}>
            <CardResults
              onClick={() => onSubjectClick?.(subject.subject)}
              className="max-w-full"
              header={subject.subject}
              correct_answers={subject.correct}
              incorrect_answers={subject.incorrect}
              icon={<Book size={20} />}
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
  const { getQuestionsGroupedBySubject, getUserAnswerByQuestionId } =
    useQuizStore();
  const groupedQuestions = getQuestionsGroupedBySubject();

  const answeredQuestions = groupedQuestions[subject] || [];

  return (
    <div className="w-full max-w-[1000px] flex flex-col mx-auto h-full relative not-lg:px-6">
      <div className="flex flex-row pt-4 justify-between">
        <p className="text-text-950 font-bold text-2xl">{subject}</p>
      </div>

      <section className="flex flex-col ">
        <p className="pt-6 pb-4 text-text-950 font-bold text-lg">
          Resultado das questões
        </p>

        <ul className="flex flex-col gap-2 pt-4">
          {answeredQuestions.map((question) => (
            <li key={question.id}>
              <CardStatus
                className="max-w-full"
                header={`Questão ${question.id}`}
                status={(() => {
                  const userAnswer = getUserAnswerByQuestionId(question.id);
                  return userAnswer &&
                    userAnswer.answer === question.correctOptionId
                    ? 'correct'
                    : 'incorrect';
                })()}
                onClick={() => onQuestionClick?.(question)}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export {
  QuizHeaderResult,
  QuizTitle,
  Quiz,
  QuizHeader,
  QuizContent,
  QuizAlternative,
  QuizQuestionList,
  QuizFooter,
  QuizListResult,
  QuizResultHeaderTitle,
  QuizResultTitle,
  QuizResultPerformance,
  QuizListResultByMateria,
};
