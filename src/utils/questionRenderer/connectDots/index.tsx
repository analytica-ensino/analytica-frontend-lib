import type { ReactNode } from 'react';
import { cn } from '../../../utils/utils';
import Text from '../../../components/Text/Text';
import { QuestionSubTitle, QuestionContainer } from '../components';

/**
 * Render connect dots question (not implemented)
 */
export const renderQuestionConnectDots = ({
  paddingBottom,
}: {
  paddingBottom?: string;
} = {}): ReactNode => {
  return (
    <>
      <QuestionSubTitle subTitle="Tipo de questão: Ligar Pontos" />
      <QuestionContainer className={cn('', paddingBottom)}>
        <div className="space-y-4">
          <Text size="md" weight="normal" color="text-text-600">
            Tipo de questão: Ligar Pontos (não implementado)
          </Text>
        </div>
      </QuestionContainer>
    </>
  );
};
