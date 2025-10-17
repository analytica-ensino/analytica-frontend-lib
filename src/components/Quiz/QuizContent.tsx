import {
  forwardRef,
  MouseEvent,
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ANSWER_STATUS, useQuizStore } from './useQuizStore';
import { cn } from '../../utils/utils';
import Select, {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../Select/Select';
import TextArea from '../TextArea/TextArea';
import { AlternativesList } from '../Alternative/Alternative';
import { MultipleChoiceList } from '../MultipleChoice/MultipleChoice';
import Badge from '../Badge/Badge';
import { CheckCircle, XCircle } from 'phosphor-react';
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

export const getStatusStyles = (variantCorrect?: string) => {
  switch (variantCorrect) {
    case 'correct':
      return 'bg-success-background border-success-300';
    case 'incorrect':
      return 'bg-error-background border-error-300';
  }
};

enum Status {
  CORRECT = 'correct',
  INCORRECT = 'incorrect',
  NEUTRAL = 'neutral',
}

interface QuizVariantInterface {
  paddingBottom?: string;
}

const QuizSubTitle = forwardRef<HTMLDivElement, { subTitle: string }>(
  ({ subTitle, ...props }, ref) => {
    return (
      <div className="px-4 pb-2 pt-6" {...props} ref={ref}>
        <p className="font-bold text-lg text-text-950">{subTitle}</p>
      </div>
    );
  }
);

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

const QuizAlternative = ({ paddingBottom }: QuizVariantInterface) => {
  const {
    getCurrentQuestion,
    selectAnswer,
    getQuestionResultByQuestionId,
    getCurrentAnswer,
    variant,
  } = useQuizStore();
  const currentQuestion = getCurrentQuestion();
  const currentQuestionResult = getQuestionResultByQuestionId(
    currentQuestion?.id || ''
  );

  const currentAnswer = getCurrentAnswer();
  const alternatives = currentQuestion?.options?.map((option) => {
    let status: Status = Status.NEUTRAL;
    if (variant === 'result') {
      const isCorrectOption =
        currentQuestionResult?.options?.find((op) => op.id === option.id)
          ?.isCorrect || false;

      const isSelected = currentQuestionResult?.selectedOptions.some(
        (selectedOption) => selectedOption.optionId === option.id
      );

      // Only show correct/incorrect status if answer is not pending evaluation
      const shouldShowCorrectAnswers =
        currentQuestionResult?.answerStatus !==
          ANSWER_STATUS.PENDENTE_AVALIACAO &&
        currentQuestionResult?.answerStatus !== ANSWER_STATUS.NAO_RESPONDIDO;

      if (shouldShowCorrectAnswers) {
        if (isCorrectOption) {
          status = Status.CORRECT;
        } else if (isSelected && !isCorrectOption) {
          status = Status.INCORRECT;
        } else {
          status = Status.NEUTRAL;
        }
      } else {
        // When pending evaluation, show all options as neutral
        status = Status.NEUTRAL;
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
            value={
              variant === 'result'
                ? currentQuestionResult?.selectedOptions[0]?.optionId || ''
                : currentAnswer?.optionId || ''
            }
            selectedValue={
              variant === 'result'
                ? currentQuestionResult?.selectedOptions[0]?.optionId || ''
                : currentAnswer?.optionId || ''
            }
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

const QuizMultipleChoice = ({ paddingBottom }: QuizVariantInterface) => {
  const {
    getCurrentQuestion,
    selectMultipleAnswer,
    getAllCurrentAnswer,
    getQuestionResultByQuestionId,
    variant,
  } = useQuizStore();
  const currentQuestion = getCurrentQuestion();
  const allCurrentAnswers = getAllCurrentAnswer();
  const currentQuestionResult = getQuestionResultByQuestionId(
    currentQuestion?.id || ''
  );
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

    if (variant == 'result') {
      return (
        currentQuestionResult?.selectedOptions.map((op) => op.optionId) || []
      );
    } else {
      return prevSelectedValuesRef.current;
    }
  }, [
    selectedValues,
    currentQuestion?.id,
    variant,
    currentQuestionResult?.selectedOptions,
  ]);

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
      const isCorrectOption =
        currentQuestionResult?.options?.find((op) => op.id === option.id)
          ?.isCorrect || false;

      const isSelected = currentQuestionResult?.selectedOptions?.some(
        (op) => op.optionId === option.id
      );

      // Only show correct/incorrect status if answer is not pending evaluation
      const shouldShowCorrectAnswers =
        currentQuestionResult?.answerStatus !==
          ANSWER_STATUS.PENDENTE_AVALIACAO &&
        currentQuestionResult?.answerStatus !== ANSWER_STATUS.NAO_RESPONDIDO;

      if (shouldShowCorrectAnswers) {
        if (isCorrectOption) {
          status = Status.CORRECT;
        } else if (isSelected && !isCorrectOption) {
          status = Status.INCORRECT;
        } else {
          status = Status.NEUTRAL;
        }
      } else {
        // When pending evaluation, show all options as neutral
        status = Status.NEUTRAL;
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

const QuizDissertative = ({ paddingBottom }: QuizVariantInterface) => {
  const {
    getCurrentQuestion,
    getCurrentAnswer,
    selectDissertativeAnswer,
    getQuestionResultByQuestionId,
    variant,
  } = useQuizStore();

  const currentQuestion = getCurrentQuestion();
  const currentQuestionResult = getQuestionResultByQuestionId(
    currentQuestion?.id || ''
  );

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

  const localAnswer =
    (variant == 'result'
      ? currentQuestionResult?.answer
      : currentAnswer?.answer) || '';
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
                value={localAnswer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                rows={4}
                className="min-h-[120px] max-h-[400px] resize-none overflow-y-auto"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-text-600 text-md whitespace-pre-wrap">
                {localAnswer || 'Nenhuma resposta fornecida'}
              </p>
            </div>
          )}
        </div>
      </QuizContainer>

      {variant === 'result' &&
        currentQuestionResult?.answerStatus ==
          ANSWER_STATUS.RESPOSTA_INCORRETA && (
          <>
            <QuizSubTitle subTitle="Observação do professor" />

            <QuizContainer className={cn('', paddingBottom)}>
              <p className="text-text-600 text-md whitespace-pre-wrap">
                {currentQuestionResult?.teacherFeedback}
              </p>
            </QuizContainer>
          </>
        )}
    </>
  );
};

const QuizTrueOrFalse = ({ paddingBottom }: QuizVariantInterface) => {
  const { variant } = useQuizStore();
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

  const getLetterByIndex = (index: number) => String.fromCodePoint(97 + index); // 97 = 'a' in ASCII

  const isDefaultVariant = variant === 'default';

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
                    isDefaultVariant ? '' : getStatusStyles(variantCorrect)
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

const QuizConnectDots = ({ paddingBottom }: QuizVariantInterface) => {
  const { variant } = useQuizStore();
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

  const getLetterByIndex = (index: number) => String.fromCodePoint(97 + index); // 'a', 'b', 'c'...

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
                    isDefaultVariant ? '' : getStatusStyles(variantCorrect)
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

const QuizFill = ({ paddingBottom }: QuizVariantInterface) => {
  const { variant } = useQuizStore();
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
    const usedOptions = new Set(
      Object.entries(answers)
        .filter(([key]) => key !== selectId) // Exclude the current selection itself
        .map(([, value]) => value)
    );

    return options.filter((option) => !usedOptions.has(option));
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
        <SelectTrigger className="inline-flex w-auto min-w-[140px] h-8 mx-1 bg-background border-gray-300">
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

const QuizImageQuestion = ({ paddingBottom }: QuizVariantInterface) => {
  const { variant } = useQuizStore();
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

export {
  QuizSubTitle,
  QuizContainer,
  QuizMultipleChoice,
  QuizDissertative,
  QuizTrueOrFalse,
  QuizConnectDots,
  QuizFill,
  QuizImageQuestion,
  QuizAlternative,
};
