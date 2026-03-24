import { Fragment, useId, type ReactNode } from 'react';
import Badge from '../../../components/Badge/Badge';
import { CheckCircle, XCircle } from 'phosphor-react';
import { cn } from '../../utils';
import Text from '../../../components/Text/Text';
import type { QuestionRendererProps } from '../types';
import { stripHtmlTags } from '../../stringUtils';

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
 *
 * Data structure:
 * - additionalContent: HTML text with {placeholderId} placeholders
 * - fillAnswers: Record<placeholderId, selectedOptionId> (what student chose)
 * - options: Array<{ id, option }> where id is placeholderId AND correct optionId
 * - Correctness: selectedOptionId === placeholderId means correct
 */
export const FillQuestionContent = ({
  question,
  result,
}: QuestionRendererProps) => {
  const baseId = useId();

  // Get additionalContent (contains HTML with {placeholderId} placeholders)
  // Falls back to question.statement for older questions that may not have additionalContent
  const additionalContent =
    result?.additionalContent ||
    question.additionalContent ||
    question.statement ||
    '';

  // Strip HTML tags for clean text rendering
  const cleanText = stripHtmlTags(additionalContent);

  // Get options array (id is placeholderId, option is the text)
  const options =
    (
      result as {
        options?: Array<{ id: string; option: string; isCorrect: boolean }>;
      }
    )?.options ||
    question.options ||
    [];

  // Build a map of optionId -> option text for quick lookup
  const optionTextMap: Record<string, string> = {};
  options.forEach((opt) => {
    optionTextMap[opt.id] = opt.option;
  });

  // Get fillAnswers: Record<placeholderId, selectedOptionId>
  const fillAnswers: Record<string, string> = {};
  try {
    const resultWithFill = result as {
      fillAnswers?: Record<string, string> | null;
    };
    if (resultWithFill?.fillAnswers) {
      Object.assign(fillAnswers, resultWithFill.fillAnswers);
    } else if (result?.answer) {
      const parsed =
        typeof result.answer === 'string'
          ? JSON.parse(result.answer)
          : result.answer;
      if (typeof parsed === 'object') {
        Object.assign(fillAnswers, parsed);
      }
    }
  } catch {
    // Ignore parse errors
  }

  // Helper to get option text by ID - returns null if not found
  const getOptionTextById = (optionId: string): string | null => {
    if (!optionId) return null;
    return optionTextMap[optionId] ?? null;
  };

  // Check if answer is correct (selectedOptionId === placeholderId)
  const isAnswerCorrect = (placeholderId: string): boolean => {
    const selectedOptionId = fillAnswers[placeholderId];
    return selectedOptionId === placeholderId;
  };

  // Render student answer badge
  const renderStudentBadge = (placeholderId: string) => {
    const selectedOptionId = fillAnswers[placeholderId];
    const selectedOptionText = getOptionTextById(selectedOptionId);
    const isCorrect = isAnswerCorrect(placeholderId);

    if (!selectedOptionId) {
      return (
        <span className="inline-block align-middle mx-1 my-1">
          <Badge
            variant="solid"
            action="error"
            iconRight={<XCircle />}
            size="large"
            className="py-1 px-2"
          >
            Não respondido
          </Badge>
        </span>
      );
    }

    // Handle case where option ID exists but text is not found
    const displayText = selectedOptionText ?? 'Opção não encontrada';

    return (
      <span className="inline-block align-middle mx-1 my-1">
        <Badge
          variant="solid"
          action={isCorrect ? 'success' : 'error'}
          iconRight={isCorrect ? <CheckCircle /> : <XCircle />}
          size="large"
          className="py-1 px-2"
        >
          {displayText}
        </Badge>
      </span>
    );
  };

  // Render correct answer (gabarito)
  const renderCorrectAnswer = (placeholderId: string) => {
    // The placeholderId IS the correct option ID
    const correctOptionText = getOptionTextById(placeholderId);
    const displayText = correctOptionText ?? '[Resposta não disponível]';
    return (
      <span className="inline mx-1 text-success-600 font-semibold border-b-2 border-success-600">
        {displayText}
      </span>
    );
  };

  // Parse text and render with elements
  const renderTextWithElements = (text: string, isGabarito: boolean) => {
    const elements: Array<{ element: string | ReactNode; id: string }> = [];
    let lastIndex = 0;
    const nextId = () => elements.length;

    const regex = /\{([a-zA-Z0-9-]+)\}/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const [fullMatch, placeholderId] = match;
      const startIndex = match.index;

      // Add text before placeholder
      if (startIndex > lastIndex) {
        elements.push({
          element: text.slice(lastIndex, startIndex),
          id: `${baseId}-text-${nextId()}`,
        });
      }

      // Add the appropriate element
      if (isGabarito) {
        elements.push({
          element: renderCorrectAnswer(placeholderId),
          id: `${baseId}-gabarito-${nextId()}`,
        });
      } else {
        elements.push({
          element: renderStudentBadge(placeholderId),
          id: `${baseId}-student-${nextId()}`,
        });
      }

      lastIndex = match.index + fullMatch.length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      elements.push({
        element: text.slice(lastIndex),
        id: `${baseId}-text-${nextId()}`,
      });
    }

    return elements;
  };

  if (!additionalContent) {
    return (
      <div className="pt-2">
        <Text size="md" color="text-text-600" weight="normal">
          Nenhum conteúdo disponível para esta questão.
        </Text>
      </div>
    );
  }

  return (
    <div className="pt-2 space-y-4">
      <div className="space-y-2">
        <Text size="xs" weight="normal" color="text-text-500">
          Resposta do aluno:
        </Text>
        <div className="p-3 bg-background-50 rounded-lg border border-border-100">
          <Text
            as="div"
            size="md"
            color="text-text-900"
            weight="normal"
            className="leading-[2.5] *:inline"
          >
            {renderTextWithElements(cleanText, false).map((element) => (
              <Fragment key={element.id}>{element.element}</Fragment>
            ))}
          </Text>
        </div>
      </div>

      <div className="space-y-2">
        <Text size="xs" weight="normal" color="text-text-500">
          Gabarito:
        </Text>
        <div className="p-3 bg-background-50 rounded-lg border border-border-100">
          <Text
            as="div"
            size="md"
            color="text-text-900"
            weight="normal"
            className="leading-[2.5] *:inline"
          >
            {renderTextWithElements(cleanText, true).map((element) => (
              <Fragment key={element.id}>{element.element}</Fragment>
            ))}
          </Text>
        </div>
      </div>
    </div>
  );
};
