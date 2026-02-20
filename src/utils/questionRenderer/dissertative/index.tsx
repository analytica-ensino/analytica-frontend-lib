import type { ReactNode } from 'react';
import { ANSWER_STATUS } from '../../../components/Quiz/useQuizStore';
import Text from '../../../components/Text/Text';
import type { QuestionRendererProps } from '../types';
import { HtmlMathRenderer } from '../../../components/HtmlMathRenderer';

/**
 * Render essay/dissertative question (readonly mode for correction)
 * Returns content without wrapper (for accordion use)
 */
export const renderQuestionDissertative = ({
  result,
}: Omit<QuestionRendererProps, 'question'>): ReactNode => {
  const localAnswer = result?.answer || '';

  return (
    <div className="pt-2 space-y-4">
      <div className="space-y-2">
        <Text size="sm" weight="normal" color="text-text-950">
          Resposta do aluno
        </Text>
        <div className="p-3 bg-background-50 rounded-lg border border-border-100">
          {localAnswer ? (
            <HtmlMathRenderer
              content={localAnswer}
              className="text-sm text-text-700"
            />
          ) : (
            <Text size="sm" weight="normal" color="text-text-700">
              Nenhuma resposta fornecida
            </Text>
          )}
        </div>
      </div>

      {result?.answerStatus === ANSWER_STATUS.RESPOSTA_INCORRETA &&
        result?.teacherFeedback && (
          <div className="space-y-2">
            <Text size="xs" weight="normal" color="text-text-500">
              Observação do professor:
            </Text>
            <div className="p-3 bg-background-50 rounded-lg border border-border-100">
              <HtmlMathRenderer
                content={result.teacherFeedback}
                className="text-sm text-text-700"
              />
            </div>
          </div>
        )}
    </div>
  );
};
