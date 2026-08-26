import type { ReactNode } from 'react';
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

      {/* The teacher's observation is not echoed here. It lives in the editable
          textarea of the correction block right below, already filled in — and
          this read-only copy only appeared when the answer was marked wrong, so
          an observation on a correct answer vanished on reopening the modal. */}
    </div>
  );
};
