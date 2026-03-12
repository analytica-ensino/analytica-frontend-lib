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
import { stripHtmlTags } from '../../utils/stringUtils';
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
import Text from '../Text/Text';
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
    default:
      return '';
  }
};

/**
 * Normalizes parsed answer data to Record<string, string> format.
 * Handles legacy array format [{ optionId, selectedValue }] by converting to { [optionId]: selectedValue }.
 */
const normalizeAnswerData = (parsed: unknown): Record<string, string> => {
  // Handle legacy array format: [{ optionId: string, selectedValue: string }]
  if (Array.isArray(parsed)) {
    const result: Record<string, string> = {};
    for (const item of parsed) {
      if (
        item &&
        typeof item === 'object' &&
        'optionId' in item &&
        'selectedValue' in item
      ) {
        result[item.optionId as string] = item.selectedValue as string;
      }
    }
    return result;
  }

  // Handle expected object format: { [optionId]: selectedValue }
  if (parsed && typeof parsed === 'object') {
    return parsed as Record<string, string>;
  }

  return {};
};

/**
 * Parses JSON answers from stored answer string.
 * In result mode, uses persisted results. Otherwise, uses current draft answers.
 * Normalizes legacy array format to expected Record<string, string> map.
 */
const parseStoredAnswers = (
  variant: 'result' | 'default',
  resultAnswer: string | null | undefined,
  currentAnswer: string | null | undefined
): Record<string, string> => {
  if (variant === 'result') {
    if (!resultAnswer) return {};
    try {
      const parsed = JSON.parse(resultAnswer);
      return normalizeAnswerData(parsed);
    } catch {
      return {};
    }
  }
  if (currentAnswer) {
    try {
      const parsed = JSON.parse(currentAnswer);
      return normalizeAnswerData(parsed);
    } catch {
      return {};
    }
  }
  return {};
};

/**
 * Converts isCorrect boolean to status variant string.
 * Returns undefined for null/unanswered to keep neutral styling.
 */
const getAnswerStatus = (
  isCorrect: boolean | null
): 'correct' | 'incorrect' | undefined => {
  if (isCorrect === true) return 'correct';
  if (isCorrect === false) return 'incorrect';
  return undefined;
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
    getDissertativeCharLimit,
  } = useQuizStore();

  const currentQuestion = getCurrentQuestion();
  const currentQuestionResult = getQuestionResultByQuestionId(
    currentQuestion?.id || ''
  );

  const currentAnswer = getCurrentAnswer();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const charLimit = getDissertativeCharLimit();

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
                maxLength={charLimit}
                showCharacterCount={!!charLimit}
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
                  <Text size="sm" className="text-text-900">
                    {getLetterByIndex(index).concat(') ').concat(option.label)}
                  </Text>

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
                    <Text size="2xs" className="text-text-800">
                      Resposta selecionada: V
                    </Text>
                    {!option.isCorrect && (
                      <Text size="2xs" className="text-text-800">
                        Resposta correta: F
                      </Text>
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
  const {
    variant,
    getCurrentQuestion,
    getCurrentAnswer,
    selectDissertativeAnswer,
    getQuestionResultByQuestionId,
  } = useQuizStore();

  const currentQuestion = getCurrentQuestion();
  const currentQuestionResult = getQuestionResultByQuestionId(
    currentQuestion?.id || ''
  );
  const currentAnswer = getCurrentAnswer();

  // Extract options from the current question
  // Each option has: id, option (left column), correctValue (right column)
  const questionOptions = useMemo(() => {
    if (!currentQuestion?.options) return [];
    return currentQuestion.options;
  }, [currentQuestion?.options]);

  // Build dotsOptions from correctValue of each option (right column values)
  const dotsOptions = useMemo(() => {
    return questionOptions
      .map((opt) => ({ label: opt.correctValue || '' }))
      .filter((opt) => opt.label !== '');
  }, [questionOptions]);

  // Build options for display (left column with correct answer mapping)
  const options = useMemo(() => {
    return questionOptions.map((opt) => ({
      id: opt.id,
      label: opt.option,
      correctOption: opt.correctValue || '',
    }));
  }, [questionOptions]);

  // Parse stored matching answers from JSON
  // Format: { "optionId": "selectedValue", ... }
  const parsedAnswers: Record<string, string> = useMemo(
    () =>
      parseStoredAnswers(
        variant,
        currentQuestionResult?.answer,
        currentAnswer?.answer
      ),
    [variant, currentQuestionResult?.answer, currentAnswer?.answer]
  );

  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);

  // Initialize userAnswers from options and stored answers
  useEffect(() => {
    if (options.length > 0) {
      setUserAnswers(
        options.map((option) => {
          const storedValue = parsedAnswers[option.id] || null;
          return {
            option: option.label,
            dotOption: storedValue,
            correctOption: option.correctOption,
            isCorrect: storedValue
              ? storedValue === option.correctOption
              : null,
          };
        })
      );
    }
  }, [options, parsedAnswers]);

  const handleSelectDot = (optionIndex: number, dotValue: string) => {
    const option = options[optionIndex];
    if (!option) return;

    // Update local state
    setUserAnswers((prev) => {
      const next = [...prev];
      next[optionIndex] = {
        option: option.label,
        dotOption: dotValue,
        correctOption: option.correctOption,
        isCorrect: dotValue ? dotValue === option.correctOption : null,
      };
      return next;
    });

    // Persist to shared store as JSON
    if (currentQuestion) {
      const newAnswers = { ...parsedAnswers, [option.id]: dotValue };
      selectDissertativeAnswer(currentQuestion.id, JSON.stringify(newAnswers));
    }
  };

  const getLetterByIndex = (index: number) => String.fromCodePoint(97 + index); // 'a', 'b', 'c'...

  const isDefaultVariant = variant === 'default';
  const assignedDots = new Set(
    userAnswers.map((a) => a.dotOption).filter(Boolean)
  );

  if (options.length === 0) {
    return (
      <QuizContainer className={cn('', paddingBottom)}>
        <Text size="sm" className="text-text-500 italic">
          Nenhuma opção de relacionamento disponível
        </Text>
      </QuizContainer>
    );
  }

  return (
    <>
      <QuizSubTitle subTitle="Alternativas" />

      <QuizContainer className={cn('', paddingBottom)}>
        <div className="flex flex-col gap-3.5">
          {options.map((option, index) => {
            const answer = userAnswers[index] || {
              option: option.label,
              dotOption: null,
              correctOption: option.correctOption,
              isCorrect: null,
            };
            const variantCorrect = getAnswerStatus(answer.isCorrect);
            return (
              <section key={option.id} className="flex flex-col gap-2">
                <div
                  className={cn(
                    'grid grid-cols-[1fr_auto] items-center gap-4 p-2 rounded-md',
                    !isDefaultVariant && variantCorrect
                      ? getStatusStyles(variantCorrect)
                      : ''
                  )}
                >
                  <Text size="sm" className="text-text-900">
                    {getLetterByIndex(index) + ') ' + option.label}
                  </Text>

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
                    <div>
                      {answer.isCorrect === null
                        ? null
                        : getStatusBadge(variantCorrect)}
                    </div>
                  )}
                </div>

                {!isDefaultVariant && (
                  <span className="flex flex-row gap-2 items-center">
                    <Text size="2xs" className="text-text-800">
                      Resposta selecionada: {answer.dotOption || 'Nenhuma'}
                    </Text>
                    {answer.isCorrect === false && (
                      <Text size="2xs" className="text-text-800">
                        Resposta correta: {answer.correctOption}
                      </Text>
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

const QuizFill = ({ paddingBottom }: QuizVariantInterface) => {
  const {
    getCurrentQuestion,
    getQuestionResultByQuestionId,
    getCurrentAnswer,
    selectDissertativeAnswer,
    variant,
  } = useQuizStore();

  const currentQuestion = getCurrentQuestion();
  const currentQuestionResult = getQuestionResultByQuestionId(
    currentQuestion?.id || ''
  );
  const currentAnswer = getCurrentAnswer();

  const baseId = useId();

  // Get the additionalContent from the question (contains text with {optionId} placeholders)
  // In result mode, prefer the persisted snapshot to match parsedAnswers
  const additionalContent =
    variant === 'result'
      ? currentQuestionResult?.additionalContent ||
        currentQuestion?.additionalContent ||
        ''
      : currentQuestion?.additionalContent || '';

  // Get the options from the question
  // In result mode, prefer the persisted snapshot to match parsedAnswers
  const questionOptions =
    variant === 'result'
      ? currentQuestionResult?.options || currentQuestion?.options || []
      : currentQuestion?.options || [];

  // Parse current answers from the stored JSON string
  // In result mode, only use persisted results (never fall back to draft answers)
  const parsedAnswers: Record<string, string> = useMemo(
    () =>
      parseStoredAnswers(
        variant,
        currentQuestionResult?.answer,
        currentAnswer?.answer
      ),
    [variant, currentQuestionResult?.answer, currentAnswer?.answer]
  );

  const [localAnswers, setLocalAnswers] =
    useState<Record<string, string>>(parsedAnswers);

  // Sync local answers when question changes
  useEffect(() => {
    setLocalAnswers(parsedAnswers);
  }, [parsedAnswers, currentQuestion?.id]);

  // Handle select change
  const handleSelectChange = (placeholderId: string, optionId: string) => {
    const newAnswers = { ...localAnswers, [placeholderId]: optionId };
    setLocalAnswers(newAnswers);

    // Save to store as JSON string
    if (currentQuestion) {
      selectDissertativeAnswer(currentQuestion.id, JSON.stringify(newAnswers));
    }
  };

  // Get option text by ID
  const getOptionTextById = (optionId: string): string => {
    const option = questionOptions.find((opt) => opt.id === optionId);
    return option?.option || '';
  };

  // Check if an answer is correct (for result mode)
  const isAnswerCorrect = (placeholderId: string): boolean => {
    const selectedOptionId = localAnswers[placeholderId];
    // The placeholder ID is the correct option ID
    return selectedOptionId === placeholderId;
  };

  // Render the select for default mode
  const renderDefaultSelect = (placeholderId: string) => {
    const selectedOptionId = localAnswers[placeholderId];

    return (
      <span
        key={placeholderId}
        className="inline-block align-middle mx-1"
        style={{ display: 'inline-block', verticalAlign: 'middle' }}
      >
        <Select
          value={selectedOptionId || undefined}
          onValueChange={(value) => handleSelectChange(placeholderId, value)}
        >
          <SelectTrigger className="w-auto min-w-[120px] h-7 px-2 bg-background border-gray-300">
            <SelectValue placeholder="Selecione opção" />
          </SelectTrigger>
          <SelectContent>
            {questionOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </span>
    );
  };

  // Render the result badge
  const renderResultBadge = (placeholderId: string) => {
    const selectedOptionId = localAnswers[placeholderId];
    const selectedOptionText = getOptionTextById(selectedOptionId);
    const isCorrect = isAnswerCorrect(placeholderId);

    if (!selectedOptionId) {
      return (
        <span
          key={placeholderId}
          className="inline-block align-middle mx-1"
          style={{ display: 'inline-block', verticalAlign: 'middle' }}
        >
          <Badge
            variant="solid"
            action="error"
            iconRight={<XCircle />}
            size="large"
            className="py-1 px-2"
          >
            <span className="text-text-900">Não respondido</span>
          </Badge>
        </span>
      );
    }

    return (
      <span
        key={placeholderId}
        className="inline-block align-middle mx-1"
        style={{ display: 'inline-block', verticalAlign: 'middle' }}
      >
        <Badge
          variant="solid"
          action={isCorrect ? 'success' : 'error'}
          iconRight={isCorrect ? <CheckCircle /> : <XCircle />}
          size="large"
          className="py-1 px-2"
        >
          <span className="text-text-900">{selectedOptionText}</span>
        </Badge>
      </span>
    );
  };

  // Render the correct answer for resolution
  const renderResolutionAnswer = (placeholderId: string) => {
    // The placeholderId IS the correct option ID
    const correctOptionText = getOptionTextById(placeholderId);

    return (
      <span className="inline mx-1 text-success-600 font-semibold border-b-2 border-success-600">
        {correctOptionText}
      </span>
    );
  };

  // Parse text and render with selects
  const renderTextWithSelects = (text: string, isResolution?: boolean) => {
    const elements: Array<{ element: string | ReactNode; id: string }> = [];
    let lastIndex = 0;
    let elementCounter = 0;

    // Match {uuid} placeholders (UUID format or any alphanumeric with hyphens)
    const regex = /\{([a-zA-Z0-9-]+)\}/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const [fullMatch, placeholderId] = match;
      const startIndex = match.index;

      // Add text before the placeholder
      if (startIndex > lastIndex) {
        elements.push({
          element: text.slice(lastIndex, startIndex),
          id: `${baseId}-text-${++elementCounter}`,
        });
      }

      // Add the appropriate element based on variant and mode
      if (isResolution) {
        elements.push({
          element: renderResolutionAnswer(placeholderId),
          id: `${baseId}-resolution-${++elementCounter}`,
        });
      } else if (variant === 'default') {
        elements.push({
          element: renderDefaultSelect(placeholderId),
          id: `${baseId}-select-${++elementCounter}`,
        });
      } else {
        elements.push({
          element: renderResultBadge(placeholderId),
          id: `${baseId}-result-${++elementCounter}`,
        });
      }

      lastIndex = match.index + fullMatch.length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      elements.push({
        element: text.slice(lastIndex),
        id: `${baseId}-text-${++elementCounter}`,
      });
    }

    return elements;
  };

  // Render HTML content with selects replacing placeholders
  const renderHtmlWithSelects = (
    htmlContent: string,
    isResolution?: boolean
  ) => {
    // For now, we'll strip HTML and render plain text with selects
    // This preserves the placeholder functionality while handling HTML content
    const textContent = stripHtmlTags(htmlContent);
    return renderTextWithSelects(textContent, isResolution);
  };

  if (!currentQuestion || !additionalContent) {
    return (
      <>
        <QuizSubTitle subTitle="Preenchimento" />
        <QuizContainer className="h-auto pb-0">
          <div className="space-y-6 px-4 h-auto">
            <Text
              size="md"
              color="text-text-600"
              weight="normal"
              className={cn(paddingBottom)}
            >
              Nenhum conteúdo disponível para esta questão.
            </Text>
          </div>
        </QuizContainer>
      </>
    );
  }

  return (
    <>
      <QuizSubTitle subTitle="Preencha as lacunas" />

      <QuizContainer className="h-auto pb-0">
        <div className="px-4 h-auto">
          <Text
            size="lg"
            color="text-text-900"
            weight="normal"
            className={cn(variant !== 'result' && paddingBottom)}
          >
            {renderHtmlWithSelects(additionalContent).map((element) => (
              <span key={element.id} className="inline">
                {element.element}
              </span>
            ))}
          </Text>
        </div>
      </QuizContainer>

      {variant === 'result' && (
        <>
          <QuizSubTitle subTitle="Resposta correta" />

          <QuizContainer className="h-auto pb-0">
            <div className="px-4">
              <Text
                size="lg"
                color="text-text-900"
                weight="normal"
                className={cn(paddingBottom)}
              >
                {renderHtmlWithSelects(additionalContent, true).map(
                  (element) => (
                    <span key={element.id} className="inline">
                      {element.element}
                    </span>
                  )
                )}
              </Text>
            </div>
          </QuizContainer>
        </>
      )}
    </>
  );
};

const QuizImageQuestion = ({ paddingBottom }: QuizVariantInterface) => {
  const {
    variant,
    getCurrentQuestion,
    getCurrentAnswer,
    selectDissertativeAnswer,
    getQuestionResultByQuestionId,
  } = useQuizStore();

  const currentQuestion = getCurrentQuestion();
  const currentAnswer = getCurrentAnswer();
  const currentQuestionResult = getQuestionResultByQuestionId(
    currentQuestion?.id || ''
  );

  // Get image URL from additionalContent
  const imageUrl = currentQuestion?.additionalContent || '';

  // Parse correct coordinates from first option (stored as JSON: {"x": number, "y": number})
  const correctPositionRelative = useMemo(() => {
    if (!currentQuestion?.options || currentQuestion.options.length === 0) {
      return { x: 0.5, y: 0.5 }; // Default center
    }
    try {
      const coords = JSON.parse(currentQuestion.options[0].option);
      if (typeof coords.x === 'number' && typeof coords.y === 'number') {
        // Coordinates are stored as percentages (0-100), convert to relative (0-1)
        return { x: coords.x / 100, y: coords.y / 100 };
      }
    } catch {
      // Fall back to default
    }
    return { x: 0.5, y: 0.5 };
  }, [currentQuestion?.options]);

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

  // Parse user's answer from stored JSON or result
  const storedUserAnswer = useMemo(() => {
    if (variant === 'result' && currentQuestionResult?.answer) {
      try {
        const coords = JSON.parse(currentQuestionResult.answer);
        if (typeof coords.x === 'number' && typeof coords.y === 'number') {
          return { x: coords.x / 100, y: coords.y / 100 };
        }
      } catch {
        // Fall back to null
      }
    } else if (currentAnswer?.answer) {
      try {
        const coords = JSON.parse(currentAnswer.answer);
        if (typeof coords.x === 'number' && typeof coords.y === 'number') {
          return { x: coords.x / 100, y: coords.y / 100 };
        }
      } catch {
        // Fall back to null
      }
    }
    return null;
  }, [variant, currentQuestionResult?.answer, currentAnswer?.answer]);

  const [clickPositionRelative, setClickPositionRelative] = useState<{
    x: number;
    y: number;
  } | null>(storedUserAnswer);

  // Sync with stored answer when it changes
  useEffect(() => {
    setClickPositionRelative(storedUserAnswer);
  }, [storedUserAnswer]);

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

    // Save the answer to the store (as percentages 0-100)
    if (currentQuestion) {
      const answerJson = JSON.stringify({
        x: Math.round(positionRelative.x * 100),
        y: Math.round(positionRelative.y * 100),
      });
      selectDissertativeAnswer(currentQuestion.id, answerJson);
    }
  };

  const handleKeyboardActivate = () => {
    if (variant === 'result') return;
    // Choose a deterministic position for keyboard activation; center is a reasonable default
    const centerPosition = { x: 0.5, y: 0.5 };
    setClickPositionRelative(centerPosition);

    // Save the answer to the store (as percentages 0-100)
    if (currentQuestion) {
      const answerJson = JSON.stringify({
        x: Math.round(centerPosition.x * 100),
        y: Math.round(centerPosition.y * 100),
      });
      selectDissertativeAnswer(currentQuestion.id, answerJson);
    }
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
              src={imageUrl || ImageQuestion}
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
