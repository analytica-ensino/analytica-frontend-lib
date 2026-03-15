import { HtmlHTMLAttributes, useMemo, useId, ReactNode } from 'react';
import { cn } from '../../utils/utils';
import { CheckCircle, XCircle, ArrowRight } from 'phosphor-react';
import Badge from '../Badge/Badge';
import Text from '../Text/Text';
import Select, {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../Select/Select';

export interface ConnectDotsOption {
  id: string;
  option: string;
  correctValue: string;
}

export interface ConnectDotsProps extends HtmlHTMLAttributes<HTMLDivElement> {
  /** Available options with their correct values */
  options: ConnectDotsOption[];
  /** Current answers as a map of optionId -> selectedValue */
  answers?: Record<string, string>;
  /** Callback when an answer changes (only for interactive mode) */
  onAnswerChange?: (optionId: string, selectedValue: string) => void;
  /** Display mode */
  mode?: 'interactive' | 'readonly' | 'result';
  /** Whether component is disabled (only for interactive mode) */
  disabled?: boolean;
}

/**
 * ConnectDots component for displaying matching/connect-the-dots questions
 *
 * @example
 * // Readonly mode - shows correct matches with arrows
 * <ConnectDots
 *   options={[
 *     { id: 'opt-1', option: 'I. Event A', correctValue: '2001' },
 *     { id: 'opt-2', option: 'II. Event B', correctValue: '1989' },
 *   ]}
 *   mode="readonly"
 * />
 *
 * @example
 * // Interactive mode - shows select dropdowns
 * <ConnectDots
 *   options={[...]}
 *   mode="interactive"
 *   answers={answers}
 *   onAnswerChange={(optionId, value) => setAnswers({...answers, [optionId]: value})}
 * />
 *
 * @example
 * // Result mode - shows badges with correct/incorrect indicators
 * <ConnectDots
 *   options={[...]}
 *   mode="result"
 *   answers={userAnswers}
 * />
 */
const ConnectDots = ({
  options,
  answers = {},
  onAnswerChange,
  mode = 'interactive',
  disabled = false,
  className,
  ...props
}: ConnectDotsProps) => {
  const baseId = useId();

  // Get all unique correct values for the dropdown options
  const availableValues = useMemo(() => {
    const values = options.map((opt) => opt.correctValue);
    // Remove duplicates and sort
    return [...new Set(values)].sort();
  }, [options]);

  // Check if an answer is correct
  const isAnswerCorrect = (optionId: string): boolean => {
    const option = options.find((opt) => opt.id === optionId);
    if (!option) return false;
    const selectedValue = answers[optionId];
    return selectedValue === option.correctValue;
  };

  // Render select for interactive mode
  const renderInteractiveItem = (option: ConnectDotsOption, index: number) => {
    const selectedValue = answers[option.id];

    return (
      <div
        key={`${baseId}-item-${index}`}
        className={cn(
          'flex flex-row items-center gap-3 p-3 rounded-md border border-border-200 bg-background',
          disabled && 'opacity-50 pointer-events-none'
        )}
      >
        <div className="flex-1">
          <Text size="sm" className="text-text-900">
            {option.option}
          </Text>
        </div>

        <ArrowRight size={20} className="text-text-400 flex-shrink-0" />

        <div className="w-[150px] flex-shrink-0">
          <Select
            value={selectedValue || undefined}
            onValueChange={(value) => onAnswerChange?.(option.id, value)}
          >
            <SelectTrigger className="w-full h-8 px-2 bg-background border-gray-300">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {availableValues.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  // Render correct match for readonly mode
  const renderReadonlyItem = (option: ConnectDotsOption, index: number) => {
    return (
      <div
        key={`${baseId}-readonly-${index}`}
        className="flex flex-row items-center gap-3 p-3 rounded-md border border-success-300 bg-success-50"
      >
        <div className="flex-1">
          <Text size="sm" className="text-text-900">
            {option.option}
          </Text>
        </div>

        <ArrowRight size={20} className="text-success-600 flex-shrink-0" />

        <div className="flex-shrink-0">
          <Text size="sm" weight="medium" className="text-success-700">
            {option.correctValue}
          </Text>
        </div>
      </div>
    );
  };

  // Render result item with correct/incorrect indicator
  const renderResultItem = (option: ConnectDotsOption, index: number) => {
    const selectedValue = answers[option.id];
    const isCorrect = isAnswerCorrect(option.id);
    const hasAnswer = !!selectedValue;

    return (
      <div
        key={`${baseId}-result-${index}`}
        className={cn(
          'flex flex-row items-center gap-3 p-3 rounded-md border',
          hasAnswer
            ? isCorrect
              ? 'border-success-300 bg-success-50'
              : 'border-error-300 bg-error-50'
            : 'border-error-300 bg-error-50'
        )}
      >
        <div className="flex-1">
          <Text size="sm" className="text-text-900">
            {option.option}
          </Text>
        </div>

        <ArrowRight
          size={20}
          className={cn(
            'flex-shrink-0',
            hasAnswer
              ? isCorrect
                ? 'text-success-600'
                : 'text-error-600'
              : 'text-error-600'
          )}
        />

        <div className="flex-shrink-0">
          {hasAnswer ? (
            <Badge
              variant="solid"
              action={isCorrect ? 'success' : 'error'}
              iconRight={isCorrect ? <CheckCircle /> : <XCircle />}
              size="large"
              className="py-1 px-2"
            >
              <span className="text-text-900">{selectedValue}</span>
            </Badge>
          ) : (
            <Badge
              variant="solid"
              action="error"
              iconRight={<XCircle />}
              size="large"
              className="py-1 px-2"
            >
              <span className="text-text-900">Não respondido</span>
            </Badge>
          )}
        </div>

        {/* Show correct answer if wrong */}
        {hasAnswer && !isCorrect && (
          <Text size="xs" className="text-success-600 flex-shrink-0">
            (Correto: {option.correctValue})
          </Text>
        )}
      </div>
    );
  };

  // Render the appropriate element based on mode
  const renderItem = (option: ConnectDotsOption, index: number): ReactNode => {
    switch (mode) {
      case 'interactive':
        return renderInteractiveItem(option, index);
      case 'readonly':
        return renderReadonlyItem(option, index);
      case 'result':
        return renderResultItem(option, index);
      default:
        return renderReadonlyItem(option, index);
    }
  };

  // Build the rendered content
  const renderedContent = useMemo(() => {
    return options.map((option, index) => renderItem(option, index));
  }, [options, baseId, mode, answers, disabled, availableValues]);

  return (
    <div className={cn('flex flex-col gap-2', className)} {...props}>
      {renderedContent}
    </div>
  );
};

export { ConnectDots };
