import {
  BookOpen,
  CaretLeft,
  CaretRight,
  Clock,
  SquaresFour,
} from 'phosphor-react';
import Badge from '../Badge/Badge';
import { HeaderAlternative } from '../Alternative/Alternative';
import Button from '../Button/Button';
import IconButton from '../IconButton/IconButton';
import {
  forwardRef,
  ReactNode,
  useEffect,
  useState,
  ComponentType,
} from 'react';
import { useQuizStore, QUESTION_TYPE, QUIZ_TYPE } from './useQuizStore';
import { AlertDialog } from '../AlertDialog/AlertDialog';
import Modal from '../Modal/Modal';

import Select, {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../Select/Select';
import { cn } from '../../utils/utils';
import {
  QuizAlternative,
  QuizConnectDots,
  QuizDissertative,
  QuizFill,
  QuizImageQuestion,
  QuizMultipleChoice,
  QuizTrueOrFalse,
} from './QuizContent';
import { CardStatus } from '../Card/Card';

// Função para obter configuração do tipo de quiz
export const getQuizTypeConfig = (type: QUIZ_TYPE) => {
  // Configuração centralizada para cada tipo de quiz
  const QUIZ_TYPE_CONFIG = {
    [QUIZ_TYPE.SIMULADO]: {
      label: 'Simulado',
      article: 'o',
      preposition: 'do',
    },
    [QUIZ_TYPE.QUESTIONARIO]: {
      label: 'Questionário',
      article: 'o',
      preposition: 'do',
    },
    [QUIZ_TYPE.ATIVIDADE]: {
      label: 'Atividade',
      article: 'a',
      preposition: 'da',
    },
  } as const;

  const config = QUIZ_TYPE_CONFIG[type];
  return config || QUIZ_TYPE_CONFIG[QUIZ_TYPE.SIMULADO]; // fallback para simulado
};

// Função para obter o label do tipo
export const getTypeLabel = (type: QUIZ_TYPE) => {
  return getQuizTypeConfig(type).label;
};

// Função para obter o artigo (o/a)
export const getQuizArticle = (type: QUIZ_TYPE) => {
  return getQuizTypeConfig(type).article;
};

// Função para obter a preposição (do/da)
export const getQuizPreposition = (type: QUIZ_TYPE) => {
  return getQuizTypeConfig(type).preposition;
};

// Função para gerar título de conclusão
export const getCompletionTitle = (type: QUIZ_TYPE) => {
  const config = getQuizTypeConfig(type);
  return `Você concluiu ${config.article} ${config.label.toLowerCase()}!`;
};

// Função para gerar texto de confirmação de saída
export const getExitConfirmationText = (type: QUIZ_TYPE) => {
  const config = getQuizTypeConfig(type);
  return `Se você sair ${config.preposition} ${config.label.toLowerCase()} agora, todas as respostas serão perdidas.`;
};

// Função para gerar texto de confirmação de finalização
export const getFinishConfirmationText = (type: QUIZ_TYPE) => {
  const config = getQuizTypeConfig(type);
  return `Tem certeza que deseja finalizar ${config.article} ${config.label.toLowerCase()}?`;
};

const Quiz = forwardRef<
  HTMLDivElement,
  { children: ReactNode; className?: string; variant?: 'result' | 'default' }
>(({ children, className, variant = 'default', ...props }, ref) => {
  const { setVariant } = useQuizStore();

  useEffect(() => {
    setVariant(variant);
  }, [variant, setVariant]);

  return (
    <div ref={ref} className={cn('flex flex-col', className)} {...props}>
      {children}
    </div>
  );
});

const QuizTitle = forwardRef<
  HTMLDivElement,
  { className?: string; onBack?: () => void }
>(({ className, onBack, ...props }, ref) => {
  const {
    quiz,
    currentQuestionIndex,
    getTotalQuestions,
    getQuizTitle,
    timeElapsed,
    formatTime,
    isStarted,
  } = useQuizStore();

  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  const totalQuestions = getTotalQuestions();
  const quizTitle = getQuizTitle();

  const handleBackClick = () => {
    if (isStarted) {
      setShowExitConfirmation(true);
    } else {
      actionOnBack();
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirmation(false);
    actionOnBack();
  };

  const actionOnBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  const handleCancelExit = () => {
    setShowExitConfirmation(false);
  };

  return (
    <>
      <div
        ref={ref}
        className={cn(
          'flex flex-row justify-between items-center relative p-2',
          className
        )}
        {...props}
      >
        <IconButton
          icon={<CaretLeft size={24} />}
          size="md"
          aria-label="Voltar"
          onClick={handleBackClick}
        />
        <span className="flex flex-col gap-2 text-center">
          <p className="text-text-950 font-bold text-md">{quizTitle}</p>
          <p className="text-text-600 text-xs">
            {totalQuestions > 0
              ? `${currentQuestionIndex + 1} de ${totalQuestions}`
              : '0 de 0'}
          </p>
        </span>

        <span className="flex flex-row items-center justify-center">
          <Badge variant="outlined" action="info" iconLeft={<Clock />}>
            {isStarted ? formatTime(timeElapsed) : '00:00'}
          </Badge>
        </span>
      </div>

      <AlertDialog
        isOpen={showExitConfirmation}
        onChangeOpen={setShowExitConfirmation}
        title="Deseja sair?"
        description={getExitConfirmationText(quiz?.type || QUIZ_TYPE.SIMULADO)}
        cancelButtonLabel="Voltar e revisar"
        submitButtonLabel="Sair Mesmo Assim"
        onSubmit={handleConfirmExit}
        onCancel={handleCancelExit}
      />
    </>
  );
});

const QuizHeader = () => {
  const { getCurrentQuestion, currentQuestionIndex } = useQuizStore();
  const currentQuestion = getCurrentQuestion();
  return (
    <HeaderAlternative
      title={
        currentQuestion ? `Questão ${currentQuestionIndex + 1}` : 'Questão'
      }
      subTitle={currentQuestion?.knowledgeMatrix?.[0]?.topic?.name ?? ''}
      content={currentQuestion?.statement ?? ''}
    />
  );
};

const QuizContent = ({ paddingBottom }: { paddingBottom?: string }) => {
  const { getCurrentQuestion } = useQuizStore();
  const currentQuestion = getCurrentQuestion();
  const questionComponents: Record<
    string,
    ComponentType<QuizVariantInterface>
  > = {
    [QUESTION_TYPE.ALTERNATIVA]: QuizAlternative,
    [QUESTION_TYPE.MULTIPLA_ESCOLHA]: QuizMultipleChoice,
    [QUESTION_TYPE.DISSERTATIVA]: QuizDissertative,
    [QUESTION_TYPE.VERDADEIRO_FALSO]: QuizTrueOrFalse,
    [QUESTION_TYPE.LIGAR_PONTOS]: QuizConnectDots,
    [QUESTION_TYPE.PREENCHER]: QuizFill,
    [QUESTION_TYPE.IMAGEM]: QuizImageQuestion,
  };

  const QuestionComponent = currentQuestion
    ? questionComponents[currentQuestion.questionType]
    : null;

  return QuestionComponent ? (
    <QuestionComponent paddingBottom={paddingBottom} />
  ) : null;
};

interface QuizVariantInterface {
  paddingBottom?: string;
}

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
    getQuestionIndex,
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
            return status === 'unanswered' || status === 'skipped';
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'answered':
        return 'Respondida';
      case 'skipped':
        return 'Em branco';
      default:
        return 'Em branco';
    }
  };
  return (
    <div className="space-y-6 px-4 h-full">
      {Object.entries(filteredGroupedQuestions).length == 0 && (
        <div className="flex items-center justify-center text-gray-500 py-8 h-full">
          <p className="text-lg">Nenhum resultado</p>
        </div>
      )}
      {Object.entries(filteredGroupedQuestions).map(
        ([subjectId, questions]) => (
          <section key={subjectId} className="flex flex-col gap-2">
            <span className="pt-6 pb-4 flex flex-row gap-2">
              <div className="bg-primary-500 p-1 rounded-sm flex items-center justify-center">
                <BookOpen size={17} className="text-white" />
              </div>
              <p className="text-text-800 font-bold text-lg">
                {questions?.[0]?.knowledgeMatrix?.[0]?.subject?.name ??
                  'Sem matéria'}
              </p>
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
    onGoToSimulated?: () => void;
    onDetailResult?: () => void;
    handleFinishSimulated?: () => void;
    onGoToNextModule?: () => void;
    onRepeat?: () => void;
    onTryLater?: () => void;
    resultImageComponent?: ReactNode;
    resultIncorrectImageComponent?: ReactNode;
  }
>(
  (
    {
      className,
      onGoToSimulated,
      onDetailResult,
      handleFinishSimulated,
      onGoToNextModule,
      onRepeat,
      onTryLater,
      resultImageComponent,
      resultIncorrectImageComponent,
      ...props
    },
    ref
  ) => {
    const {
      quiz,
      currentQuestionIndex,
      getTotalQuestions,
      goToNextQuestion,
      goToPreviousQuestion,
      getUnansweredQuestionsFromUserAnswers,
      getCurrentAnswer,
      skipQuestion,
      getCurrentQuestion,
      getQuestionStatusFromUserAnswers,
      variant,
      getQuestionResultStatistics,
    } = useQuizStore();

    const totalQuestions = getTotalQuestions();
    const isFirstQuestion = currentQuestionIndex === 0;
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
    const currentAnswer = getCurrentAnswer();
    const currentQuestion = getCurrentQuestion();
    const isCurrentQuestionSkipped = currentQuestion
      ? getQuestionStatusFromUserAnswers(currentQuestion.id) === 'skipped'
      : false;
    // Sistema unificado de controle de modais
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<string>('all');

    // Funções para controlar modais
    const openModal = (modalName: string) => setActiveModal(modalName);
    const closeModal = () => setActiveModal(null);
    const isModalOpen = (modalName: string) => activeModal === modalName;
    const unansweredQuestions = getUnansweredQuestionsFromUserAnswers();
    const allQuestions = getTotalQuestions();
    const stats = getQuestionResultStatistics();
    const correctAnswers = stats?.correctAnswers;
    const totalAnswers = stats?.totalAnswered;
    const quizType = quiz?.type || QUIZ_TYPE.SIMULADO;
    const quizTypeLabel = getTypeLabel(quizType);

    const handleFinishQuiz = async () => {
      if (unansweredQuestions.length > 0) {
        openModal('alertDialog');
        return;
      }

      try {
        if (handleFinishSimulated) {
          await Promise.resolve(handleFinishSimulated());
        }

        if (
          quizType === QUIZ_TYPE.QUESTIONARIO &&
          typeof correctAnswers === 'number' &&
          typeof totalAnswers === 'number' &&
          correctAnswers === totalAnswers
        ) {
          openModal('modalQuestionnaireAllCorrect');
          return;
        }

        if (
          quizType === QUIZ_TYPE.QUESTIONARIO &&
          typeof correctAnswers === 'number' &&
          correctAnswers === 0
        ) {
          openModal('modalQuestionnaireAllIncorrect');
          return;
        }
        openModal('modalResult');
      } catch (err) {
        console.error('handleFinishSimulated failed:', err);
        return;
      }
    };

    const handleAlertSubmit = async () => {
      try {
        if (handleFinishSimulated) {
          await Promise.resolve(handleFinishSimulated());
        }

        if (
          quizType === QUIZ_TYPE.QUESTIONARIO &&
          typeof correctAnswers === 'number' &&
          typeof totalAnswers === 'number' &&
          correctAnswers === totalAnswers
        ) {
          openModal('modalQuestionnaireAllCorrect');
          return;
        }

        if (
          quizType === QUIZ_TYPE.QUESTIONARIO &&
          typeof correctAnswers === 'number' &&
          correctAnswers === 0
        ) {
          openModal('modalQuestionnaireAllIncorrect');
          return;
        }

        openModal('modalResult');
      } catch (err) {
        console.error('handleFinishSimulated failed:', err);
        closeModal();
        return;
      }
    };

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
                  onClick={() => openModal('modalNavigate')}
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

              {!isFirstQuestion && !isLastQuestion && (
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
                  onClick={handleFinishQuiz}
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
            <div className="flex flex-row items-center justify-center w-full">
              <Button
                variant="link"
                action="primary"
                size="medium"
                onClick={() => openModal('modalResolution')}
              >
                Ver resolução
              </Button>
            </div>
          )}
        </footer>

        <AlertDialog
          isOpen={isModalOpen('alertDialog')}
          onChangeOpen={(open) =>
            open ? openModal('alertDialog') : closeModal()
          }
          title={`Finalizar ${quizTypeLabel.toLowerCase()}?`}
          description={
            unansweredQuestions.length > 0
              ? `Você deixou as questões ${unansweredQuestions.join(', ')} sem resposta. Finalizar agora pode impactar seu desempenho.`
              : getFinishConfirmationText(quizType)
          }
          cancelButtonLabel="Voltar e revisar"
          submitButtonLabel="Finalizar Mesmo Assim"
          onSubmit={handleAlertSubmit}
        />

        <Modal
          isOpen={isModalOpen('modalResult')}
          onClose={closeModal}
          title=""
          closeOnEscape={false}
          hideCloseButton
          size={'md'}
        >
          <div className="flex flex-col w-full h-full items-center justify-center gap-4">
            {resultImageComponent ? (
              <div className="w-[282px] h-auto">{resultImageComponent}</div>
            ) : (
              <div className="w-[282px] h-[200px] bg-gray-100 rounded-md flex items-center justify-center">
                <span className="text-gray-500 text-sm">
                  Imagem de resultado
                </span>
              </div>
            )}
            <div className="flex flex-col gap-2 text-center">
              <h2 className="text-text-950 font-bold text-lg">
                {getCompletionTitle(quizType)}
              </h2>
              <p className="text-text-500 font-sm">
                Você acertou {correctAnswers ?? '--'} de {allQuestions}{' '}
                questões.
              </p>
            </div>

            <div className="px-6 flex flex-row items-center gap-2 w-full">
              <Button
                variant="outline"
                className="w-full"
                size="small"
                onClick={onGoToSimulated}
              >
                {quizTypeLabel === 'Questionário'
                  ? 'Ir para aulas'
                  : `Ir para ${quizTypeLabel.toLocaleLowerCase()}s`}
              </Button>

              <Button className="w-full" onClick={onDetailResult}>
                Detalhar resultado
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={isModalOpen('modalNavigate')}
          onClose={closeModal}
          title="Questões"
          size={'lg'}
        >
          <div className="flex flex-col w-full not-lg:h-[calc(100vh-200px)] lg:max-h-[687px] lg:h-[687px]">
            <div className="flex flex-row justify-between items-center py-6 pt-6 pb-4 border-b border-border-200 flex-shrink-0">
              <p className="text-text-950 font-bold text-lg">Filtrar por</p>
              <span className="max-w-[266px]">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger
                    variant="rounded"
                    className="max-w-[266px] min-w-[160px]"
                  >
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

            <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto">
              <QuizQuestionList
                filterType={filterType}
                onQuestionClick={closeModal}
              />
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={isModalOpen('modalResolution')}
          onClose={closeModal}
          title="Resolução"
          size={'lg'}
        >
          {currentQuestion?.solutionExplanation}
        </Modal>

        <Modal
          isOpen={isModalOpen('modalQuestionnaireAllCorrect')}
          onClose={closeModal}
          title=""
          closeOnEscape={false}
          hideCloseButton
          size={'md'}
        >
          <div className="flex flex-col w-full h-full items-center justify-center gap-4">
            {resultImageComponent ? (
              <div className="w-[282px] h-auto">{resultImageComponent}</div>
            ) : (
              <div className="w-[282px] h-[200px] bg-gray-100 rounded-md flex items-center justify-center">
                <span className="text-gray-500 text-sm">
                  Imagem de resultado
                </span>
              </div>
            )}
            <div className="flex flex-col gap-2 text-center">
              <h2 className="text-text-950 font-bold text-lg">🎉 Parabéns!</h2>
              <p className="text-text-500 font-sm">
                Você concluiu o módulo Movimento Uniforme.
              </p>
            </div>

            <div className="px-6 flex flex-row items-center gap-2 w-full">
              <Button className="w-full" onClick={onGoToNextModule}>
                Próximo módulo
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={isModalOpen('modalQuestionnaireAllIncorrect')}
          onClose={closeModal}
          title=""
          closeOnEscape={false}
          hideCloseButton
          size={'md'}
        >
          <div className="flex flex-col w-full h-full items-center justify-center gap-4">
            {resultIncorrectImageComponent ? (
              <div className="w-[282px] h-auto">
                {resultIncorrectImageComponent}
              </div>
            ) : (
              <div className="w-[282px] h-[200px] bg-gray-100 rounded-md flex items-center justify-center">
                <span className="text-gray-500 text-sm">
                  Imagem de resultado
                </span>
              </div>
            )}
            <div className="flex flex-col gap-2 text-center">
              <h2 className="text-text-950 font-bold text-lg">
                😕 Não foi dessa vez...
              </h2>
              <p className="text-text-500 font-sm">
                Você tirou 0 no questionário, mas não se preocupe! Isso é apenas
                uma oportunidade de aprendizado.
              </p>

              <p className="text-text-500 font-sm">
                Que tal tentar novamente para melhorar sua nota? Estamos aqui
                para te ajudar a entender o conteúdo e evoluir.
              </p>

              <p className="text-text-500 font-sm">
                Clique em Repetir Questionário e mostre do que você é capaz! 💪
              </p>
            </div>

            <div className="flex flex-row justify-center items-center gap-2 w-full">
              <Button
                type="button"
                variant="link"
                size="small"
                className="w-auto"
                onClick={() => {
                  closeModal();
                  openModal('alertDialogTryLater');
                }}
              >
                Tentar depois
              </Button>

              <Button
                variant="outline"
                size="small"
                className="w-auto"
                onClick={onDetailResult}
              >
                Detalhar resultado
              </Button>

              <Button
                className="w-auto"
                size="small"
                onClick={onGoToNextModule}
              >
                Próximo módulo
              </Button>
            </div>
          </div>
        </Modal>

        <AlertDialog
          isOpen={isModalOpen('alertDialogTryLater')}
          onChangeOpen={(open) =>
            open ? openModal('alertDialogTryLater') : closeModal()
          }
          title="Tentar depois?"
          description={
            'Você optou por refazer o questionário mais tarde.\n\nLembre-se: enquanto não refazer o questionário, sua nota permanecerá 0 no sistema.'
          }
          cancelButtonLabel="Repetir questionário"
          submitButtonLabel="Tentar depois"
          onSubmit={() => {
            onTryLater?.();
            closeModal();
          }}
          onCancel={() => {
            onRepeat?.();
            closeModal();
          }}
        />
      </>
    );
  }
);

export {
  QuizTitle,
  Quiz,
  QuizHeader,
  QuizContent,
  QuizFooter,
  QuizQuestionList,
};
