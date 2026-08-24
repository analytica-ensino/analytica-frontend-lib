import type { ReactNode } from 'react';
import { ANSWER_STATUS } from '../../../components/Quiz/useQuizStore';
import type { QuestionRendererProps } from '../types';
import {
  TrueFalseStatementList,
  type TrueFalseStatement,
} from '../../../components/shared/TrueFalseStatementList';
import { TrueFalseEnum } from '../../../enums/Quiz';

/**
 * Render true or false question
 * Each option has a statement, and student marks V or F for each
 * Returns content without wrapper (for accordion use)
 */
export const renderQuestionTrueOrFalse = ({
  question,
  result,
}: QuestionRendererProps): ReactNode => {
  const options = question.options || [];

  const shouldShowStatus =
    result?.answerStatus !== ANSWER_STATUS.PENDENTE_AVALIACAO &&
    result?.answerStatus !== ANSWER_STATUS.NAO_RESPONDIDO;

  const statements: TrueFalseStatement[] = options.map((option) => {
    // `isCorrect` means two different things in the two arrays: in
    // `selectedOptions` it is what the STUDENT marked (true = V), in `options`
    // it is the answer key (true = the statement is true).
    const studentSelection = result?.selectedOptions?.find(
      (op) => op.optionId === option.id
    );
    const answerKeyOption = result?.options?.find((op) => op.id === option.id);

    let studentMark: TrueFalseEnum | null = null;
    if (studentSelection !== undefined) {
      studentMark = studentSelection.isCorrect
        ? TrueFalseEnum.VERDADEIRO
        : TrueFalseEnum.FALSO;
    }

    return {
      id: option.id,
      statement: option.option,
      studentMark,
      isTrue: answerKeyOption?.isCorrect ?? null,
    };
  });

  return (
    <TrueFalseStatementList
      statements={statements}
      showCorrectness={shouldShowStatus}
    />
  );
};
