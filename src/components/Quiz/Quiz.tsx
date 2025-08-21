import {
  CaretLeft,
  CaretRight,
  Clock,
  SquaresFour,
  BookOpen,
  Book,
  CheckCircle,
  XCircle,
} from 'phosphor-react';
import Badge from '../Badge/Badge';
import {
  AlternativesList,
  HeaderAlternative,
} from '../Alternative/Alternative';
import Button from '../Button/Button';
import IconButton from '../IconButton/IconButton';
import {
  forwardRef,
  ReactNode,
  useEffect,
  useMemo,
  useId,
  useState,
  useCallback,
  useRef,
  ComponentType,
  MouseEvent,
} from 'react';
import {
  Question,
  useQuizStore,
  QUESTION_DIFFICULTY,
  QUESTION_TYPE,
  ANSWER_STATUS,
  QUESTION_STATUS,
} from './useQuizStore';
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
import { MultipleChoiceList } from '../MultipleChoice/MultipleChoice';
import TextArea from '../TextArea/TextArea';
import ImageQuestion from '../../assets/img/mock-image-question.png';

export const getStatusBadge = (status?: 'correct' | 'incorrect') => {
  switch (status) {
    case 'correct':
      return (
        <Badge variant="solid" action="success" iconLeft={<CheckCircle />}>
          Resposta correta
        </Badge>
      );
    case 'incorrect':
      return (
        <Badge variant="solid" action="error" iconLeft={<XCircle />}>
          Resposta incorreta
        </Badge>
      );
    default:
      return null;
  }
};

const getStatusStyles = (variantCorrect?: string) => {
  switch (variantCorrect) {
    case 'correct':
      return 'bg-success-background border-success-300';
    case 'incorrect':
      return 'bg-error-background border-error-300';
  }
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
    const { getQuestionResultByQuestionId, getCurrentQuestion } =
      useQuizStore();
    const [isCorrect, setIsCorrect] = useState(false);

    useEffect(() => {
      const currentQuestion = getCurrentQuestion();
      if (currentQuestion) {
        const questionResult = getQuestionResultByQuestionId(
          currentQuestion.id
        );

        if (questionResult) {
          // QuestionResult contains the answer status from backend
          setIsCorrect(
            questionResult.answerStatus === QUESTION_STATUS.RESPOSTA_CORRETA
          );
        } else {
          setIsCorrect(false);
        }
      }
    }, [getCurrentQuestion(), getQuestionResultByQuestionId]);

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

const QuizSubTitle = forwardRef<HTMLDivElement, { subTitle: string }>(
  ({ subTitle, ...props }, ref) => {
    return (
      <div className="px-4 pb-2 pt-6" {...props} ref={ref}>
        <p className="font-bold text-lg text-text-950">{subTitle}</p>
      </div>
    );
  }
);

const QuizHeader = () => {
  const { getCurrentQuestion, currentQuestionIndex } = useQuizStore();
  const currentQuestion = getCurrentQuestion();

  return (
    <HeaderAlternative
      title={
        currentQuestion ? `Questão ${currentQuestionIndex + 1}` : 'Questão'
      }
      subTitle={currentQuestion?.knowledgeMatrix?.[0]?.topicId ?? ''}
      content={currentQuestion?.questionText ?? ''}
    />
  );
};

const QuizContainer = forwardRef<
  HTMLDivElement,
  { children: ReactNode; className?: string }
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'bg-background rounded-t-xl px-4 pt-4 pb-[80px] h-auto flex flex-col gap-4 mb-auto',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

const QuizContent = forwardRef<
  HTMLDivElement,
  {
    paddingBottom?: string;
  }
>(({ paddingBottom }) => {
  const { getCurrentQuestion, variant } = useQuizStore();
  const currentQuestion = getCurrentQuestion();

  const questionComponents: Record<
    string,
    ComponentType<QuizVariantInterface>
  > = {
    [QUESTION_TYPE.ALTERNATIVA]: QuizAlternative,
    [QUESTION_TYPE.MULTIPLA_CHOICE]: QuizMultipleChoice,
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
    <QuestionComponent variant={variant} paddingBottom={paddingBottom} />
  ) : null;
});

enum Status {
  CORRECT = 'correct',
  INCORRECT = 'incorrect',
  NEUTRAL = 'neutral',
}

interface QuizVariantInterface {
  variant?: 'result' | 'default';
  paddingBottom?: string;
}

const QuizAlternative = ({
  variant = 'default',
  paddingBottom,
}: QuizVariantInterface) => {
  const { getCurrentQuestion, selectAnswer, getCurrentAnswer } = useQuizStore();
  const currentQuestion = getCurrentQuestion();
  const currentAnswer = getCurrentAnswer();
  const alternatives = currentQuestion?.options?.map((option) => {
    let status: Status = Status.NEUTRAL;

    if (variant === 'result') {
      const isCorrectOption = currentQuestion.options.find((op) =>
        currentQuestion.correctOptionIds?.includes(op.id)
      );

      if (isCorrectOption?.id === option.id) {
        status = Status.CORRECT;
      } else if (
        currentAnswer?.optionId === option.id &&
        option.id !== isCorrectOption?.id
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
    <>
      <QuizSubTitle subTitle="Alternativas" />

      <QuizContainer className={cn('', paddingBottom)}>
        <div className="space-y-4">
          <AlternativesList
            mode={variant === 'default' ? 'interactive' : 'readonly'}
            key={`question-${currentQuestion?.id || '1'}`}
            name={`question-${currentQuestion?.id || '1'}`}
            layout="compact"
            alternatives={alternatives}
            value={currentAnswer?.optionId || ''}
            selectedValue={currentAnswer?.optionId || ''}
            onValueChange={(value) => {
              if (currentQuestion) {
                selectAnswer(currentQuestion.id, value);
              }
            }}
          />
        </div>
      </QuizContainer>
    </>
  );
};

const QuizMultipleChoice = ({
  variant = 'default',
  paddingBottom,
}: QuizVariantInterface) => {
  const { getCurrentQuestion, selectMultipleAnswer, getAllCurrentAnswer } =
    useQuizStore();
  const currentQuestion = getCurrentQuestion();
  const allCurrentAnswers = getAllCurrentAnswer();

  // Use ref to track previous values and prevent unnecessary updates
  const prevSelectedValuesRef = useRef<string[]>([]);
  const prevQuestionIdRef = useRef<string>('');

  // Memoize the answer IDs to prevent unnecessary re-renders
  const allCurrentAnswerIds = useMemo(() => {
    return allCurrentAnswers?.map((answer) => answer.optionId) || [];
  }, [allCurrentAnswers]);

  // Memoize the selected values to prevent infinite loops
  const selectedValues = useMemo(() => {
    return allCurrentAnswerIds?.filter((id): id is string => id !== null) || [];
  }, [allCurrentAnswerIds]);

  // Only update selectedValues if they actually changed or question changed
  const stableSelectedValues = useMemo(() => {
    const currentQuestionId = currentQuestion?.id || '';
    const hasQuestionChanged = prevQuestionIdRef.current !== currentQuestionId;

    if (hasQuestionChanged) {
      prevQuestionIdRef.current = currentQuestionId;
      prevSelectedValuesRef.current = selectedValues;
      return selectedValues;
    }

    // Only update if values actually changed
    const hasValuesChanged =
      JSON.stringify(prevSelectedValuesRef.current) !==
      JSON.stringify(selectedValues);
    if (hasValuesChanged) {
      prevSelectedValuesRef.current = selectedValues;
      return selectedValues;
    }

    return prevSelectedValuesRef.current;
  }, [selectedValues, currentQuestion?.id]);

  // Memoize the callback to prevent unnecessary re-renders
  const handleSelectedValues = useCallback(
    (values: string[]) => {
      if (currentQuestion) {
        selectMultipleAnswer(currentQuestion.id, values);
      }
    },
    [currentQuestion, selectMultipleAnswer]
  );

  // Create a stable key to force re-mount when question changes
  const questionKey = useMemo(
    () => `question-${currentQuestion?.id || '1'}`,
    [currentQuestion?.id]
  );
  const choices = currentQuestion?.options?.map((option) => {
    let status: Status = Status.NEUTRAL;

    if (variant === 'result') {
      const isAllCorrectOptionId = currentQuestion.options
        .filter((op) => currentQuestion.correctOptionIds?.includes(op.id))
        .map((op) => op.id);

      if (isAllCorrectOptionId.includes(option.id)) {
        status = Status.CORRECT;
      } else if (
        allCurrentAnswerIds?.includes(option.id) &&
        !isAllCorrectOptionId.includes(option.id)
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

  if (!choices)
    return (
      <div>
        <p>Não há Escolhas Multiplas</p>
      </div>
    );

  return (
    <>
      <QuizSubTitle subTitle="Alternativas" />

      <QuizContainer className={cn('', paddingBottom)}>
        <div className="space-y-4">
          <MultipleChoiceList
            choices={choices}
            key={questionKey}
            name={questionKey}
            selectedValues={stableSelectedValues}
            onHandleSelectedValues={handleSelectedValues}
            mode={variant === 'default' ? 'interactive' : 'readonly'}
          />
        </div>
      </QuizContainer>
    </>
  );
};

const QuizDissertative = ({
  variant = 'default',
  paddingBottom,
}: QuizVariantInterface) => {
  const { getCurrentQuestion, getCurrentAnswer, selectDissertativeAnswer } =
    useQuizStore();

  const currentQuestion = getCurrentQuestion();
  const currentAnswer = getCurrentAnswer();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleAnswerChange = (value: string) => {
    if (currentQuestion) {
      selectDissertativeAnswer(currentQuestion.id, value);
    }
  };

  // Auto-resize function
  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const minHeight = 120; // 120px minimum height
      const maxHeight = 400; // 400px maximum height
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, []);

  // Adjust height when currentAnswer changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [currentAnswer, adjustTextareaHeight]);

  if (!currentQuestion) {
    return (
      <div className="space-y-4">
        <p className="text-text-600 text-md">Nenhuma questão disponível</p>
      </div>
    );
  }

  return (
    <>
      <QuizSubTitle subTitle="Resposta" />

      <QuizContainer className={cn(variant != 'result' && paddingBottom)}>
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {variant === 'default' ? (
            <div className="space-y-4">
              <TextArea
                ref={textareaRef}
                placeholder="Escreva sua resposta"
                value={currentAnswer?.answer || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                rows={4}
                className="min-h-[120px] max-h-[400px] resize-none overflow-y-auto"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-text-600 text-md whitespace-pre-wrap">
                {currentAnswer?.answer || 'Nenhuma resposta fornecida'}
              </p>
            </div>
          )}
        </div>
      </QuizContainer>

      {variant === 'result' &&
        currentAnswer?.answerStatus == ANSWER_STATUS.RESPOSTA_INCORRETA && (
          <>
            <QuizSubTitle subTitle="Observação do professor" />

            <QuizContainer className={cn('', paddingBottom)}>
              <p className="text-text-600 text-md whitespace-pre-wrap">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc,
                eget aliquam massa nisl quis neque. Pellentesque habitant morbi
                tristique senectus et netus et malesuada fames ac turpis
                egestas. Vestibulum ante ipsum primis in faucibus orci luctus et
                ultrices posuere cubilia curae; Integer euismod, urna eu
                tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam
                massa nisl quis neque. Pellentesque habitant morbi tristique
                senectus et netus et malesuada fames ac turpis egestas.
                Suspendisse potenti. Nullam ac urna eu felis dapibus condimentum
                sit amet a augue. Sed non neque elit. Sed ut imperdiet nisi.
                Proin condimentum fermentum nunc. Etiam pharetra, erat sed
                fermentum feugiat, velit mauris egestas quam, ut aliquam massa
                nisl quis neque. Suspendisse in orci enim. Mauris euismod, urna
                eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam
                massa nisl quis neque. Pellentesque habitant morbi tristique
                senectus et netus et malesuada fames ac turpis egestas.
                Vestibulum ante ipsum primis in faucibus orci luctus et ultrices
                posuere cubilia curae; Integer euismod, urna eu tincidunt
                consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl
                quis neque. Pellentesque habitant morbi tristique senectus et
                netus et malesuada fames ac turpis egestas. Suspendisse potenti.
                Nullam ac urna eu felis dapibus condimentum sit amet a augue.
                Sed non neque elit. Sed ut imperdiet nisi. Proin condimentum
                fermentum nunc. Etiam pharetra, erat sed fermentum feugiat,
                velit mauris egestas quam, ut aliquam massa nisl quis neque.
                Suspendisse in orci enim. Pellentesque habitant morbi tristique
                senectus et netus et malesuada fames ac turpis egestas.
                Vestibulum ante ipsum primis in faucibus orci luctus et ultrices
                posuere cubilia curae; Integer euismod, urna eu tincidunt
                consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl
                quis neque. Pellentesque habitant morbi tristique senectus et
                netus et malesuada fames ac turpis egestas. Suspendisse potenti.
                Nullam ac urna eu felis dapibus condimentum sit amet a augue.
                Sed non neque elit. Sed ut imperdiet nisi. Proin condimentum
                fermentum nunc. Etiam pharetra, erat sed fermentum feugiat,
                velit mauris egestas quam, ut aliquam massa nisl quis neque.
                Suspendisse in orci enim.
              </p>
            </QuizContainer>
          </>
        )}
    </>
  );
};

const QuizTrueOrFalse = ({
  variant = 'default',
  paddingBottom,
}: QuizVariantInterface) => {
  const options = [
    {
      label: '25 metros',
      isCorrect: true,
    },
    {
      label: '30 metros',
      isCorrect: false,
    },
    {
      label: '40 metros',
      isCorrect: false,
    },
    {
      label: '50 metros',
      isCorrect: false,
    },
  ];

  const getLetterByIndex = (index: number) => String.fromCharCode(97 + index); // 97 = 'a' in ASCII

  const isDefaultVariant = variant == 'default';

  return (
    <>
      <QuizSubTitle subTitle="Alternativas" />

      <QuizContainer className={cn('', paddingBottom)}>
        <div className="flex flex-col gap-3.5">
          {options.map((option, index) => {
            const variantCorrect = option.isCorrect ? 'correct' : 'incorrect';
            return (
              <section
                key={option.label.concat(`-${index}`)}
                className="flex flex-col gap-2"
              >
                <div
                  className={cn(
                    'flex flex-row justify-between items-center gap-2 p-2 rounded-md',
                    !isDefaultVariant ? getStatusStyles(variantCorrect) : ''
                  )}
                >
                  <p className="text-text-900 text-sm">
                    {getLetterByIndex(index).concat(') ').concat(option.label)}
                  </p>

                  {isDefaultVariant ? (
                    <Select size="medium">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Selecione opcão" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="V">Verdadeiro</SelectItem>
                        <SelectItem value="F">Falso</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex-shrink-0">
                      {getStatusBadge(variantCorrect)}
                    </div>
                  )}
                </div>

                {!isDefaultVariant && (
                  <span className="flex flex-row gap-2 items-center">
                    <p className="text-text-800 text-2xs">
                      Resposta selecionada: V
                    </p>
                    {!option.isCorrect && (
                      <p className="text-text-800 text-2xs">
                        Resposta correta: F
                      </p>
                    )}
                  </span>
                )}
              </section>
            );
          })}
        </div>
      </QuizContainer>
    </>
  );
};

interface UserAnswer {
  option: string;
  dotOption: string | null;
  correctOption: string;
  isCorrect: boolean | null;
}

const QuizConnectDots = ({
  variant = 'default',
  paddingBottom,
}: QuizVariantInterface) => {
  const dotsOptions = [
    { label: 'Ração' },
    { label: 'Rato' },
    { label: 'Grama' },
    { label: 'Peixe' },
  ];

  const options = [
    {
      label: 'Cachorro',
      correctOption: 'Ração',
    },
    {
      label: 'Gato',
      correctOption: 'Rato',
    },
    {
      label: 'Cabra',
      correctOption: 'Grama',
    },
    {
      label: 'Baleia',
      correctOption: 'Peixe',
    },
  ];

  const mockUserAnswers = [
    {
      option: 'Cachorro',
      dotOption: 'Ração',
      correctOption: 'Ração',
      isCorrect: true,
    },
    {
      option: 'Gato',
      dotOption: 'Rato',
      correctOption: 'Rato',
      isCorrect: true,
    },
    {
      option: 'Cabra',
      dotOption: 'Peixe',
      correctOption: 'Grama',
      isCorrect: false,
    },
    {
      option: 'Baleia',
      dotOption: 'Grama',
      correctOption: 'Peixe',
      isCorrect: false,
    },
  ];

  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>(() => {
    if (variant === 'result') {
      return mockUserAnswers;
    }
    return options.map((option) => ({
      option: option.label,
      dotOption: null,
      correctOption: option.correctOption,
      isCorrect: null,
    }));
  });

  const handleSelectDot = (optionIndex: number, dotValue: string) => {
    setUserAnswers((prev) => {
      const next = [...prev];
      const { label: optionLabel, correctOption } = options[optionIndex];
      next[optionIndex] = {
        option: optionLabel,
        dotOption: dotValue,
        correctOption,
        isCorrect: dotValue ? dotValue === correctOption : null,
      };
      return next;
    });
  };

  const getLetterByIndex = (index: number) => String.fromCharCode(97 + index); // 'a', 'b', 'c'...

  const isDefaultVariant = variant === 'default';
  const assignedDots = new Set(
    userAnswers.map((a) => a.dotOption).filter(Boolean)
  );

  return (
    <>
      <QuizSubTitle subTitle="Alternativas" />

      <QuizContainer className={cn('', paddingBottom)}>
        <div className="flex flex-col gap-3.5">
          {options.map((option, index) => {
            const answer = userAnswers[index];
            const variantCorrect = answer.isCorrect ? 'correct' : 'incorrect';
            return (
              <section key={option.label} className="flex flex-col gap-2">
                <div
                  className={cn(
                    'flex flex-row justify-between items-center gap-2 p-2 rounded-md',
                    !isDefaultVariant ? getStatusStyles(variantCorrect) : ''
                  )}
                >
                  <p className="text-text-900 text-sm">
                    {getLetterByIndex(index) + ') ' + option.label}
                  </p>

                  {isDefaultVariant ? (
                    <Select
                      size="medium"
                      value={answer.dotOption || undefined}
                      onValueChange={(value) => handleSelectDot(index, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Selecione opção" />
                      </SelectTrigger>

                      <SelectContent>
                        {dotsOptions
                          .filter(
                            (dot) =>
                              !assignedDots.has(dot.label) ||
                              answer.dotOption === dot.label
                          )
                          .map((dot) => (
                            <SelectItem key={dot.label} value={dot.label}>
                              {dot.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex-shrink-0">
                      {answer.isCorrect === null
                        ? null
                        : getStatusBadge(variantCorrect)}
                    </div>
                  )}
                </div>

                {!isDefaultVariant && (
                  <span className="flex flex-row gap-2 items-center">
                    <p className="text-text-800 text-2xs">
                      Resposta selecionada: {answer.dotOption || 'Nenhuma'}
                    </p>
                    {!answer.isCorrect && (
                      <p className="text-text-800 text-2xs">
                        Resposta correta: {answer.correctOption}
                      </p>
                    )}
                  </span>
                )}
              </section>
            );
          })}
        </div>
      </QuizContainer>
    </>
  );
};

interface FillUserAnswer {
  selectId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

const QuizFill = ({
  variant = 'default',
  paddingBottom = 'pb-[80px]',
}: QuizVariantInterface) => {
  const options = [
    'ciência',
    'disciplina',
    'área',
    'especialidade',
    'variações',
  ];

  const exampleText = `A meteorologia é a {{ciencia}} que estuda os fenômenos atmosféricos e suas {{variações}}. Esta disciplina científica tem como objetivo principal {{objetivo}} o comportamento da atmosfera terrestre.

  Os meteorologistas utilizam diversos {{instrumentos}} para coletar dados atmosféricos, incluindo termômetros, barômetros e {{equipamentos}} modernos como radares meteorológicos.`;

  // Mock data for result variant - simulating user answers
  const mockUserAnswers: FillUserAnswer[] = [
    {
      selectId: 'ciencia',
      userAnswer: 'tecnologia',
      correctAnswer: 'ciência',
      isCorrect: false,
    },
    {
      selectId: 'variações',
      userAnswer: 'variações',
      correctAnswer: 'variações',
      isCorrect: true,
    },
    {
      selectId: 'objetivo',
      userAnswer: 'estudar',
      correctAnswer: 'compreender',
      isCorrect: false,
    },
    {
      selectId: 'instrumentos',
      userAnswer: 'ferramentas',
      correctAnswer: 'instrumentos',
      isCorrect: false,
    },
    {
      selectId: 'equipamentos',
      userAnswer: 'equipamentos',
      correctAnswer: 'equipamentos',
      isCorrect: true,
    },
  ];

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const baseId = useId(); // Generate base ID for this component instance

  // Get available options for a specific select
  const getAvailableOptionsForSelect = (selectId: string) => {
    const usedOptions = Object.entries(answers)
      .filter(([key]) => key !== selectId) // Exclude the current selection itself
      .map(([, value]) => value);

    return options.filter((option) => !usedOptions.includes(option));
  };

  const handleSelectChange = (selectId: string, value: string) => {
    const newAnswers = { ...answers, [selectId]: value };
    setAnswers(newAnswers);
  };

  const renderResolutionElement = (selectId: string) => {
    const mockAnswer = mockUserAnswers.find(
      (answer) => answer.selectId === selectId
    );

    return (
      <p className="inline-flex mb-2.5 text-success-600 font-semibold text-md border-b-2 border-success-600">
        {mockAnswer?.correctAnswer}
      </p>
    );
  };

  const renderDefaultElement = (
    selectId: string,
    startIndex: number,
    selectedValue: string,
    availableOptionsForThisSelect: string[]
  ) => {
    return (
      <Select
        key={`${selectId}-${startIndex}`}
        value={selectedValue}
        onValueChange={(value) => handleSelectChange(selectId, value)}
        className="inline-flex mb-2.5"
      >
        <SelectTrigger className="inline-flex w-auto min-w-[140px] h-8 mx-1 bg-white border-gray-300">
          <SelectValue placeholder="Selecione opção" />
        </SelectTrigger>
        <SelectContent>
          {availableOptionsForThisSelect.map((option, index) => (
            <SelectItem key={`${option}-${index}`} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  const renderResultElement = (selectId: string) => {
    const mockAnswer = mockUserAnswers.find(
      (answer) => answer.selectId === selectId
    );

    if (!mockAnswer) return null;

    const action = mockAnswer.isCorrect ? 'success' : 'error';
    const icon = mockAnswer.isCorrect ? <CheckCircle /> : <XCircle />;

    return (
      <Badge
        key={selectId}
        variant="solid"
        action={action}
        iconRight={icon}
        size="large"
        className="py-3 w-[180px] justify-between mb-2.5"
      >
        <span className="text-text-900">{mockAnswer.userAnswer}</span>
      </Badge>
    );
  };

  const renderTextWithSelects = (text: string, isResolution?: boolean) => {
    const elements: Array<{ element: string | ReactNode; id: string }> = [];
    let lastIndex = 0;
    let elementCounter = 0;

    // Support Unicode letters/marks and digits: allows placeholders like {{variações}}
    const regex = /\{\{([\p{L}\p{M}\d_]+)\}\}/gu;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const [fullMatch, selectId] = match;
      const startIndex = match.index;

      if (startIndex > lastIndex) {
        elements.push({
          element: text.slice(lastIndex, startIndex),
          id: `${baseId}-text-${++elementCounter}`,
        });
      }

      const selectedValue = answers[selectId];
      const availableOptionsForThisSelect =
        getAvailableOptionsForSelect(selectId);

      if (isResolution) {
        elements.push({
          element: renderResolutionElement(selectId),
          id: `${baseId}-resolution-${++elementCounter}`,
        });
      } else if (variant === 'default') {
        elements.push({
          element: renderDefaultElement(
            selectId,
            startIndex,
            selectedValue,
            availableOptionsForThisSelect
          ),
          id: `${baseId}-select-${++elementCounter}`,
        });
      } else {
        const resultElement = renderResultElement(selectId);
        if (resultElement) {
          elements.push({
            element: resultElement,
            id: `${baseId}-result-${++elementCounter}`,
          });
        }
      }

      lastIndex = match.index + fullMatch.length;
    }

    if (lastIndex < text.length) {
      elements.push({
        element: text.slice(lastIndex),
        id: `${baseId}-text-${++elementCounter}`,
      });
    }

    return elements;
  };

  return (
    <>
      <QuizSubTitle subTitle="Alternativas" />

      <QuizContainer className="h-auto pb-0">
        <div className="space-y-6 px-4 h-auto">
          <div
            className={cn(
              'text-lg text-text-900 leading-8 h-auto',
              variant != 'result' && paddingBottom
            )}
          >
            {renderTextWithSelects(exampleText).map((element) => (
              <span key={element.id}>{element.element}</span>
            ))}
          </div>
        </div>
      </QuizContainer>

      {variant === 'result' && (
        <>
          <QuizSubTitle subTitle="Resultado" />

          <QuizContainer className="h-auto pb-0">
            <div className="space-y-6 px-4">
              <div
                className={cn('text-lg text-text-900 leading-8', paddingBottom)}
              >
                {renderTextWithSelects(exampleText, true).map((element) => (
                  <span key={element.id}>{element.element}</span>
                ))}
              </div>
            </div>
          </QuizContainer>
        </>
      )}
    </>
  );
};

const QuizImageQuestion = ({
  variant = 'default',
  paddingBottom,
}: QuizVariantInterface) => {
  const correctPositionRelative = { x: 0.48, y: 0.45 };

  // Calculate correctRadiusRelative automatically based on the circle dimensions
  const calculateCorrectRadiusRelative = (): number => {
    // The correct answer circle has width: 15% and height: 30%
    // We'll use the average of these as the radius
    const circleWidthRelative = 0.15; // 15%
    const circleHeightRelative = 0.3; // 30%

    // Calculate the average radius (half of the average of width and height)
    const averageRadius = (circleWidthRelative + circleHeightRelative) / 4;

    // Add a small tolerance for better user experience
    const tolerance = 0.02; // 2% tolerance

    return averageRadius + tolerance;
  };

  const correctRadiusRelative = calculateCorrectRadiusRelative();
  const mockUserAnswerRelative = { x: 0.72, y: 0.348 };

  const [clickPositionRelative, setClickPositionRelative] = useState<{
    x: number;
    y: number;
  } | null>(variant == 'result' ? mockUserAnswerRelative : null);

  // Helper function to safely convert click coordinates to relative coordinates
  const convertToRelativeCoordinates = (
    x: number,
    y: number,
    rect: DOMRect
  ): { x: number; y: number } => {
    // Guard against division by zero or extremely small dimensions
    const safeWidth = Math.max(rect.width, 0.001);
    const safeHeight = Math.max(rect.height, 0.001);

    // Convert to relative coordinates and clamp to [0, 1] range
    const xRelative = Math.max(0, Math.min(1, x / safeWidth));
    const yRelative = Math.max(0, Math.min(1, y / safeHeight));

    return { x: xRelative, y: yRelative };
  };

  const handleImageClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (variant === 'result') return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Use helper function for safe conversion
    const positionRelative = convertToRelativeCoordinates(x, y, rect);
    setClickPositionRelative(positionRelative);
  };

  const handleKeyboardActivate = () => {
    if (variant === 'result') return;
    // Choose a deterministic position for keyboard activation; center is a reasonable default
    setClickPositionRelative({ x: 0.5, y: 0.5 });
  };

  const isCorrect = () => {
    if (!clickPositionRelative) return false;

    const distance = Math.sqrt(
      Math.pow(clickPositionRelative.x - correctPositionRelative.x, 2) +
        Math.pow(clickPositionRelative.y - correctPositionRelative.y, 2)
    );

    return distance <= correctRadiusRelative;
  };

  const getUserCircleColorClasses = () => {
    if (variant === 'default') {
      return 'bg-indicator-primary/70 border-[#F8CC2E]';
    }

    if (variant === 'result') {
      return isCorrect()
        ? 'bg-success-600/70 border-white' // Green for correct answer
        : 'bg-indicator-error/70 border-white'; // Red for incorrect answer
    }

    return 'bg-success-600/70 border-white';
  };

  return (
    <>
      <QuizSubTitle subTitle="Clique na área correta" />

      <QuizContainer className={cn('', paddingBottom)}>
        <div
          data-testid="quiz-image-container"
          className="space-y-6 p-3 relative inline-block"
        >
          {variant == 'result' && (
            <div
              data-testid="quiz-legend"
              className="flex items-center gap-4 text-xs"
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indicator-primary/70 border border-[#F8CC2E]"></div>
                <span className="text-text-600 font-medium text-sm">
                  Área correta
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success-600/70 border border-white"></div>
                <span className="text-text-600 font-medium text-sm">
                  Resposta correta
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indicator-error/70 border border-white"></div>
                <span className="text-text-600 font-medium text-sm">
                  Resposta incorreta
                </span>
              </div>
            </div>
          )}

          <button
            data-testid="quiz-image-button"
            type="button"
            className="relative cursor-pointer w-full h-full border-0 bg-transparent p-0"
            onClick={handleImageClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleKeyboardActivate();
              }
            }}
            aria-label="Área da imagem interativa"
          >
            <img
              data-testid="quiz-image"
              src={ImageQuestion}
              alt="Question"
              className="w-full h-auto rounded-md"
            />

            {/* Correct answer circle - only show in result variant */}
            {variant === 'result' && (
              <div
                data-testid="quiz-correct-circle"
                className="absolute rounded-full bg-indicator-primary/70 border-4 border-[#F8CC2E] pointer-events-none"
                style={{
                  minWidth: '50px',
                  maxWidth: '160px',
                  width: '15%',
                  aspectRatio: '1 / 1',
                  left: `calc(${correctPositionRelative.x * 100}% - 7.5%)`,
                  top: `calc(${correctPositionRelative.y * 100}% - 15%)`,
                }}
              />
            )}

            {/* User's answer circle */}
            {clickPositionRelative && (
              <div
                data-testid="quiz-user-circle"
                className={`absolute rounded-full border-4 pointer-events-none ${getUserCircleColorClasses()}`}
                style={{
                  minWidth: '30px',
                  maxWidth: '52px',
                  width: '5%',
                  aspectRatio: '1 / 1',
                  left: `calc(${clickPositionRelative.x * 100}% - 2.5%)`,
                  top: `calc(${clickPositionRelative.y * 100}% - 2.5%)`,
                }}
              />
            )}
          </button>
        </div>
      </QuizContainer>
    </>
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
    onGoToSimulated?: () => void;
    onDetailResult?: () => void;
    handleFinishSimulated?: () => void;
  }
>(
  (
    {
      className,
      onGoToSimulated,
      onDetailResult,
      handleFinishSimulated,
      ...props
    },
    ref
  ) => {
    const {
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
    const [alertDialogOpen, setAlertDialogOpen] = useState(false);
    const [modalResultOpen, setModalResultOpen] = useState(false);
    const [modalNavigateOpen, setModalNavigateOpen] = useState(false);
    const [modalResolutionOpen, setModalResolutionOpen] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const unansweredQuestions = getUnansweredQuestionsFromUserAnswers();
    const allQuestions = getTotalQuestions();

    const handleFinishQuiz = async () => {
      if (unansweredQuestions.length > 0) {
        setAlertDialogOpen(true);
        return;
      }

      try {
        if (handleFinishSimulated) {
          await Promise.resolve(handleFinishSimulated());
        }
        setModalResultOpen(true);
      } catch (err) {
        console.error('handleFinishSimulated failed:', err);
        setModalResultOpen(true);
      }
    };

    const handleAlertSubmit = async () => {
      try {
        if (handleFinishSimulated) {
          await Promise.resolve(handleFinishSimulated());
        }
        setModalResultOpen(true);
        setAlertDialogOpen(false);
      } catch (err) {
        console.error('handleFinishSimulated failed:', err);
        setModalResultOpen(true);
        setAlertDialogOpen(false);
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
            <div className="flex flex-row items-center justify-end w-full">
              <Button
                variant="solid"
                action="primary"
                size="medium"
                onClick={() => setModalResolutionOpen(true)}
              >
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
          onSubmit={handleAlertSubmit}
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
                {getQuestionResultStatistics()?.correctAnswers ?? '--'} de{' '}
                {allQuestions} questões.
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

        <Modal
          isOpen={modalResolutionOpen}
          onClose={() => setModalResolutionOpen(false)}
          title="Resolução"
          size={'lg'}
        >
          {currentQuestion?.solutionExplanation}
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
          {bySimulated.type}
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
        const isCorrect =
          answer.answerStatus == QUESTION_STATUS.RESPOSTA_CORRETA;

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
              {getQuestionResultStatistics()?.correctAnswers ?? '--'} de{' '}
              {totalQuestions}
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
          if (userAnswerItem?.answerStatus == ANSWER_STATUS.RESPOSTA_CORRETA) {
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
  const {
    getQuestionsGroupedBySubject,
    getUserAnswerByQuestionId,
    getQuestionIndex,
  } = useQuizStore();
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
          {answeredQuestions.map((question) => {
            const questionIndex = getQuestionIndex(question.id);
            return (
              <li key={question.id}>
                <CardStatus
                  className="max-w-full"
                  header={`Questão ${questionIndex.toString().padStart(2, '0')}`}
                  status={(() => {
                    const userAnswer = getUserAnswerByQuestionId(question.id);
                    if (
                      userAnswer?.answerStatus ===
                      ANSWER_STATUS.RESPOSTA_CORRETA
                    )
                      return 'correct';
                    if (
                      userAnswer?.answerStatus ===
                      ANSWER_STATUS.RESPOSTA_INCORRETA
                    )
                      return 'incorrect';
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
  QuizMultipleChoice,
  QuizDissertative,
  QuizTrueOrFalse,
  QuizConnectDots,
  QuizFill,
  QuizImageQuestion,
};
