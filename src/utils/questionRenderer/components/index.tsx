import { useId, type ReactNode } from 'react';
import Badge from '../../../components/Badge/Badge';
import { CheckCircle, XCircle } from 'phosphor-react';
import { cn } from '../../utils';
import Text from '@/components/Text/Text';
import type { QuestionRendererProps } from '../types';

/**
 * Get status badge component
 */
export const getStatusBadge = (status?: 'correct' | 'incorrect'): ReactNode => {
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

/**
 * Container component for question content
 */
export const QuestionContainer = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'bg-background rounded-t-xl px-4 pt-4 pb-[80px] h-auto flex flex-col gap-4 mb-auto',
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * Subtitle component for question sections
 */
export const QuestionSubTitle = ({ subTitle }: { subTitle: string }) => {
  return (
    <div className="px-4 pb-2 pt-6">
      <Text size="md" weight="bold" color="text-text-950">
        {subTitle}
      </Text>
    </div>
  );
};

/**
 * Internal component for fill in the blanks question
 * Uses useId hook to generate unique IDs
 */
export const FillQuestionContent = ({
  question,
  result,
}: QuestionRendererProps) => {
  // Extract text from statement - it should contain {{placeholders}}
  const text = question.statement || '';
  const baseId = useId();

  // Parse student answer - assuming it's stored in result.answer as JSON or structured data
  // For now, we'll need to extract from the answer field
  // The answer might be structured or we need to parse placeholders from the statement
  const studentAnswers: Record<
    string,
    { answer: string; isCorrect: boolean; correctAnswer: string }
  > = {};

  // Try to parse answer if it's JSON, otherwise use empty object
  try {
    if (result?.answer) {
      const parsed =
        typeof result.answer === 'string'
          ? JSON.parse(result.answer)
          : result.answer;
      if (typeof parsed === 'object') {
        Object.assign(studentAnswers, parsed);
      }
    }
  } catch (error) {
    console.error('Error parsing answer:', error);
  }

  // Extract placeholders from text
  const regex = /\{\{([\p{L}\p{M}\d_]+)\}\}/gu;
  const placeholders: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    placeholders.push(match[1]);
  }

  // Build correct answers from studentAnswers - use the already-parsed correctAnswer field
  const correctAnswers: Record<string, string> = {};
  placeholders.forEach((placeholder) => {
    correctAnswers[placeholder] =
      studentAnswers[placeholder]?.correctAnswer || `[${placeholder}]`;
  });

  /**
   * Add text element to elements array
   */
  const addTextElement = (
    elements: Array<{ element: string | ReactNode; id: string }>,
    textContent: string,
    elementCounter: { current: number }
  ) => {
    if (textContent) {
      elements.push({
        element: textContent,
        id: `${baseId}-text-${++elementCounter.current}`,
      });
    }
  };

  /**
   * Render placeholder for gabarito (correct answer)
   */
  const renderGabaritoPlaceholder = (
    selectId: string,
    elementCounter: { current: number }
  ): { element: ReactNode; id: string } => {
    const correctAnswer = correctAnswers[selectId] || `[${selectId}]`;
    return {
      element: (
        <Text
          key={`${baseId}-gabarito-${selectId}`}
          size="md"
          weight="semibold"
          color="text-success-600"
          className="inline-flex mb-2.5 border-b-2 border-success-600"
        >
          {correctAnswer}
        </Text>
      ),
      id: `${baseId}-gabarito-${++elementCounter.current}`,
    };
  };

  /**
   * Render placeholder for student answer
   */
  const renderStudentPlaceholder = (
    selectId: string,
    elementCounter: { current: number }
  ): { element: ReactNode; id: string } => {
    const studentAnswer = studentAnswers[selectId];
    if (!studentAnswer) {
      return {
        element: (
          <Text
            key={`${baseId}-no-answer-${selectId}`}
            size="md"
            weight="normal"
            color="text-text-400"
            className="inline-flex mb-2.5 border-b-2 border-text-300"
          >
            [Não respondido]
          </Text>
        ),
        id: `${baseId}-no-answer-${++elementCounter.current}`,
      };
    }

    const isCorrect = studentAnswer.isCorrect;
    const colorClass = isCorrect
      ? 'text-success-600 border-success-600'
      : 'text-error-600 border-error-600';

    return {
      element: (
        <Badge
          key={`${baseId}-answer-${selectId}`}
          variant="solid"
          action={isCorrect ? 'success' : 'error'}
          iconRight={isCorrect ? <CheckCircle /> : <XCircle />}
          size="large"
          className={`py-3 w-[180px] justify-between mb-2.5 ${colorClass}`}
        >
          <span className="text-text-900">{studentAnswer.answer}</span>
        </Badge>
      ),
      id: `${baseId}-answer-${++elementCounter.current}`,
    };
  };

  /**
   * Render text with answers or gabarito
   */
  const renderTextWithAnswers = (isGabarito = false) => {
    const elements: Array<{ element: string | ReactNode; id: string }> = [];
    let lastIndex = 0;
    const elementCounter = { current: 0 };

    regex.lastIndex = 0; // Reset regex
    while ((match = regex.exec(text)) !== null) {
      const [fullMatch, selectId] = match;
      const startIndex = match.index;

      // Add text before placeholder
      if (startIndex > lastIndex) {
        addTextElement(
          elements,
          text.slice(lastIndex, startIndex),
          elementCounter
        );
      }

      // Add placeholder element
      const placeholderElement = isGabarito
        ? renderGabaritoPlaceholder(selectId, elementCounter)
        : renderStudentPlaceholder(selectId, elementCounter);
      elements.push(placeholderElement);

      lastIndex = match.index + fullMatch.length;
    }

    // Add remaining text after last placeholder
    if (lastIndex < text.length) {
      addTextElement(elements, text.slice(lastIndex), elementCounter);
    }

    return elements;
  };

  return (
    <div className="pt-2 space-y-4">
      <div className="space-y-2">
        <Text size="xs" weight="normal" color="text-text-500">
          Resposta do aluno:
        </Text>
        <div className="p-3 bg-background-50 rounded-lg border border-border-100">
          <div className="leading-8">
            {renderTextWithAnswers(false).map((element) => (
              <Text
                key={element.id}
                size="md"
                weight="normal"
                color="text-text-900"
              >
                {element.element}
              </Text>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Text size="xs" weight="normal" color="text-text-500">
          Gabarito:
        </Text>
        <div className="p-3 bg-background-50 rounded-lg border border-border-100">
          <div className="leading-8">
            {renderTextWithAnswers(true).map((element) => (
              <Text
                key={element.id}
                size="md"
                weight="normal"
                color="text-text-900"
              >
                {element.element}
              </Text>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
