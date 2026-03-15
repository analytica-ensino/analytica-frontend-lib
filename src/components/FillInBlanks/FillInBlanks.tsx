import { HtmlHTMLAttributes, useMemo, useId, ReactNode } from 'react';
import { cn } from '../../utils/utils';
import { CheckCircle, XCircle } from 'phosphor-react';
import Badge from '../Badge/Badge';
import Text from '../Text/Text';
import Select, {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../Select/Select';

export interface FillInBlanksOption {
  id: string;
  option: string;
}

export interface FillInBlanksProps extends HtmlHTMLAttributes<HTMLDivElement> {
  /** The text content with {uuid} placeholders */
  content: string;
  /** Available options to fill in the blanks */
  options: FillInBlanksOption[];
  /** Current answers as a map of placeholderId -> selectedOptionId */
  answers?: Record<string, string>;
  /** Callback when an answer changes (only for interactive mode) */
  onAnswerChange?: (placeholderId: string, optionId: string) => void;
  /** Display mode */
  mode?: 'interactive' | 'readonly' | 'result';
  /** Whether component is disabled (only for interactive mode) */
  disabled?: boolean;
}

/**
 * Parse content and extract text parts and placeholder IDs
 */
function parseContent(content: string): Array<{ type: 'text' | 'placeholder'; value: string }> {
  const parts: Array<{ type: 'text' | 'placeholder'; value: string }> = [];
  const regex = /\{([a-zA-Z0-9-]+)\}/g;
  let lastIndex = 0;
  let match;

  // Strip HTML tags for cleaner parsing
  const cleanContent = content.replace(/<[^>]*>/g, '');

  while ((match = regex.exec(cleanContent)) !== null) {
    // Add text before the placeholder
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        value: cleanContent.slice(lastIndex, match.index),
      });
    }

    // Add the placeholder
    parts.push({
      type: 'placeholder',
      value: match[1],
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < cleanContent.length) {
    parts.push({
      type: 'text',
      value: cleanContent.slice(lastIndex),
    });
  }

  return parts;
}

/**
 * FillInBlanks component for displaying fill-in-the-blanks questions
 *
 * @example
 * // Readonly mode - shows correct answers with green underlined text
 * <FillInBlanks
 *   content="A {uuid-1} é uma {uuid-2}."
 *   options={[{ id: 'uuid-1', option: 'Terra' }, { id: 'uuid-2', option: 'planeta' }]}
 *   mode="readonly"
 * />
 *
 * @example
 * // Interactive mode - shows select dropdowns
 * <FillInBlanks
 *   content="A {uuid-1} é uma {uuid-2}."
 *   options={[{ id: 'uuid-1', option: 'Terra' }, { id: 'uuid-2', option: 'planeta' }]}
 *   mode="interactive"
 *   answers={answers}
 *   onAnswerChange={(placeholderId, optionId) => setAnswers({...answers, [placeholderId]: optionId})}
 * />
 *
 * @example
 * // Result mode - shows badges with correct/incorrect indicators
 * <FillInBlanks
 *   content="A {uuid-1} é uma {uuid-2}."
 *   options={[{ id: 'uuid-1', option: 'Terra' }, { id: 'uuid-2', option: 'planeta' }]}
 *   mode="result"
 *   answers={userAnswers}
 * />
 */
const FillInBlanks = ({
  content,
  options,
  answers = {},
  onAnswerChange,
  mode = 'interactive',
  disabled = false,
  className,
  ...props
}: FillInBlanksProps) => {
  const baseId = useId();

  // Create a map of option IDs to their text
  const optionsMap = useMemo(() => {
    return new Map(options.map((opt) => [opt.id, opt.option]));
  }, [options]);

  // Parse the content into parts
  const parsedParts = useMemo(() => parseContent(content), [content]);

  // Get option text by ID
  const getOptionText = (optionId: string): string => {
    return optionsMap.get(optionId) || '';
  };

  // Check if an answer is correct (the placeholderId IS the correct option ID)
  const isAnswerCorrect = (placeholderId: string): boolean => {
    const selectedOptionId = answers[placeholderId];
    return selectedOptionId === placeholderId;
  };

  // Render select for interactive mode
  const renderSelect = (placeholderId: string, index: number) => {
    const selectedOptionId = answers[placeholderId];

    return (
      <span
        key={`${baseId}-select-${index}`}
        className={cn(
          'inline-block align-middle mx-1',
          disabled && 'opacity-50 pointer-events-none'
        )}
      >
        <Select
          value={selectedOptionId || undefined}
          onValueChange={(value) => onAnswerChange?.(placeholderId, value)}
        >
          <SelectTrigger className="w-auto min-w-[120px] h-7 px-2 bg-background border-gray-300">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </span>
    );
  };

  // Render correct answer for readonly mode
  const renderCorrectAnswer = (placeholderId: string, index: number) => {
    const correctText = getOptionText(placeholderId);

    return (
      <span
        key={`${baseId}-answer-${index}`}
        className="text-success-600 underline font-medium"
      >
        {correctText}
      </span>
    );
  };

  // Render result badge
  const renderResultBadge = (placeholderId: string, index: number) => {
    const selectedOptionId = answers[placeholderId];
    const selectedText = getOptionText(selectedOptionId);
    const isCorrect = isAnswerCorrect(placeholderId);

    if (!selectedOptionId) {
      return (
        <span
          key={`${baseId}-result-${index}`}
          className="inline-block align-middle mx-1"
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
        key={`${baseId}-result-${index}`}
        className="inline-block align-middle mx-1"
      >
        <Badge
          variant="solid"
          action={isCorrect ? 'success' : 'error'}
          iconRight={isCorrect ? <CheckCircle /> : <XCircle />}
          size="large"
          className="py-1 px-2"
        >
          <span className="text-text-900">{selectedText}</span>
        </Badge>
      </span>
    );
  };

  // Render the appropriate element based on mode
  const renderPlaceholder = (placeholderId: string, index: number): ReactNode => {
    switch (mode) {
      case 'interactive':
        return renderSelect(placeholderId, index);
      case 'readonly':
        return renderCorrectAnswer(placeholderId, index);
      case 'result':
        return renderResultBadge(placeholderId, index);
      default:
        return renderCorrectAnswer(placeholderId, index);
    }
  };

  // Build the rendered content
  const renderedContent = useMemo(() => {
    return parsedParts.map((part, index) => {
      if (part.type === 'text') {
        return <span key={`${baseId}-text-${index}`}>{part.value}</span>;
      }
      return renderPlaceholder(part.value, index);
    });
  }, [parsedParts, baseId, mode, answers, options, disabled]);

  return (
    <div className={cn('leading-relaxed', className)} {...props}>
      <Text size="sm" className="text-text-900">
        {renderedContent}
      </Text>
    </div>
  );
};

export { FillInBlanks };
