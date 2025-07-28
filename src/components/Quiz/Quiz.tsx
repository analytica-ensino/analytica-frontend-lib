import {
  CaretLeft,
  CaretRight,
  Clock,
  Palette,
  SquaresFour,
  BookOpen,
} from 'phosphor-react';
import Badge from '../Badge/Badge';
import {
  AlternativesList,
  HeaderAlternative,
} from '../Alternative/Alternative';
import Button from '../Button/Button';
import IconButton from '../IconButton/IconButton';
import { forwardRef, useEffect, useState } from 'react';
import { useQuizStore } from './useQuizStore';
import { AlertDialog } from '../AlertDialog/AlertDialog';
import Modal from '../Modal/Modal';
import SimulatedResult from '@/assets/img/simulated-result.png';
import Select, {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../Select/Select';
import { CardStatus } from '../Card/Card';

const Quiz = forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; className?: string }
>(({ children, className, ...props }, ref) => {
  const { isStarted, updateTime, timeElapsed } = useQuizStore();

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isStarted) {
      interval = setInterval(() => {
        updateTime(timeElapsed + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isStarted, timeElapsed, updateTime]);

  return (
    <div
      ref={ref}
      className={`w-full max-w-[1000px] flex flex-col mx-auto h-full relative not-lg:px-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

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
        className={`flex flex-row justify-center items-center relative p-2 ${className}`}
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
      title={currentQuestion ? `Questão ${currentQuestion.id}` : 'Questão 01'}
      subTitle={
        currentQuestion?.knowledgeMatrix?.[0]?.topicId || 'Função horária'
      }
      content={
        currentQuestion?.questionText ||
        'Um carro inicia do repouso e se desloca em linha reta com uma aceleração constante de 2 m/s². Calcule a distância que o carro percorre após 5 segundos.'
      }
    />
  );
};

const QuizContent = forwardRef<
  HTMLDivElement,
  {
    type?: 'Alternativas' | 'Dissertativa';
    children: React.ReactNode;
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
        className={`rounded-t-xl bg-background px-4 pt-4 pb-[80px] h-full flex flex-col gap-4 mb-auto ${className}`}
        {...props}
      >
        {children}
      </div>
    </>
  );
});

const QuizAlternative = () => {
  const {
    getCurrentQuestion,
    selectAnswer,
    getCurrentAnswer,
    isQuestionSkipped,
  } = useQuizStore();
  const currentQuestion = getCurrentQuestion();
  const currentAnswer = getCurrentAnswer();
  const isCurrentQuestionSkipped = currentQuestion
    ? isQuestionSkipped(currentQuestion.id)
    : false;

  // Mapear as alternativas da questão atual
  const alternatives = currentQuestion?.options?.map((option) => ({
    label: option.option,
    value: option.id,
  }));

  if (!alternatives)
    return (
      <div>
        <p>Não há Alternativas</p>
      </div>
    );

  return (
    <div className="space-y-4">
      {isCurrentQuestionSkipped && (
        <div className="bg-warning-background border border-warning-300 rounded-lg p-3">
          <p className="text-warning-900 text-sm font-medium">
            ⚠️ Esta questão foi pulada. Você pode voltar e respondê-la.
          </p>
        </div>
      )}

      <AlternativesList
        key={`question-${currentQuestion?.id || '1'}`}
        name={`question-${currentQuestion?.id || '1'}`}
        layout="default"
        alternatives={alternatives}
        value={currentAnswer}
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
    currentQuestionIndex,
    isQuestionAnswered,
    isQuestionSkipped,
    getTotalQuestions,
  } = useQuizStore();

  const groupedQuestions = getQuestionsGroupedBySubject();
  const totalQuestions = getTotalQuestions();

  const getQuestionStatus = (questionId: string) => {
    if (isQuestionSkipped(questionId)) {
      return 'skipped';
    }
    if (isQuestionAnswered(questionId)) {
      return 'answered';
    }
    return 'unanswered';
  };

  // Filtrar questões baseado no tipo de filtro
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
            return true; // 'all' - mostrar todas
        }
      });

      if (filteredQuestions.length > 0) {
        acc[subjectId] = filteredQuestions;
      }

      return acc;
    },
    {} as { [key: string]: any[] }
  );

  const getQuestionIndex = (questionId: string) => {
    const { bySimulado, byAtividade, byAula } = useQuizStore.getState();
    const quiz = bySimulado || byAtividade || byAula;
    if (!quiz) return 0;

    const index = quiz.questions.findIndex((q) => q.id === questionId);
    return index + 1;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'answered':
        return 'Respondida';
      case 'skipped':
        return 'Pulada';
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
    onGoToSimulated?: () => void;
    onDetailResult?: () => void;
  }
>(({ className, onGoToSimulated, onDetailResult, ...props }, ref) => {
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
    isQuestionSkipped,
  } = useQuizStore();

  const totalQuestions = getTotalQuestions();
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const currentAnswer = getCurrentAnswer();
  const currentQuestion = getCurrentQuestion();
  const isCurrentQuestionSkipped = currentQuestion
    ? isQuestionSkipped(currentQuestion.id)
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
        className={`w-full px-2 bg-background lg:max-w-[1000px] not-lg:max-w-[calc(100vw-32px)] border-t border-border-50 fixed bottom-0 min-h-[80px] flex flex-row justify-between items-center ${className}`}
        {...props}
      >
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
              {
                userAnswers.filter(
                  (answer) => answer.answerKey === answer.correctOptionId
                ).length
              }{' '}
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
});

export {
  QuizTitle,
  Quiz,
  QuizHeader,
  QuizContent,
  QuizAlternative,
  QuizQuestionList,
  QuizFooter,
};

