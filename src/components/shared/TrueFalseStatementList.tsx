import { getStatusStyles } from '../Quiz/QuizContent';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';
import { getStatusBadge } from '../../utils/questionRenderer/components';
import { HtmlMathRenderer } from '../HtmlMathRenderer';
import { TrueFalseEnum } from '../../enums/Quiz';
import { OptionStatus } from '../../enums/Options';

/** One statement of a true/false question, already normalized for rendering. */
export interface TrueFalseStatement {
  id: string;
  /** Statement text; may contain HTML and LaTeX */
  statement: string;
  /** What the student marked. Null when the statement was left blank. */
  studentMark: TrueFalseEnum | null;
  /** Answer key: whether the statement is true. Null when unknown. */
  isTrue: boolean | null;
}

export interface TrueFalseStatementListProps {
  readonly statements: readonly TrueFalseStatement[];
  /**
   * Whether the answer key may be revealed. False while the answer is still
   * pending evaluation or was never submitted.
   */
  readonly showCorrectness?: boolean;
}

/**
 * Read-only list of true/false statements with the student's mark and the
 * answer key.
 *
 * Shared by the activity correction modal and the simulation detail modal so
 * both read the same way. The two callers reach this from different payload
 * shapes — `QuestionResult.selectedOptions` in one, an option's `selectedValue`
 * in the other — and normalize into {@link TrueFalseStatement} before calling.
 *
 * @param props - Component props
 * @returns JSX element
 *
 * @example
 * ```tsx
 * <TrueFalseStatementList
 *   statements={[{ id: '1', statement: 'A água ferve a 100°C', studentMark: TrueFalseEnum.VERDADEIRO, isTrue: true }]}
 *   showCorrectness
 * />
 * ```
 */
export const TrueFalseStatementList = ({
  statements,
  showCorrectness = true,
}: TrueFalseStatementListProps) => {
  // 97 = 'a' in ASCII
  const getLetterByIndex = (index: number) => String.fromCodePoint(97 + index);

  return (
    <div className="pt-2">
      <div className="flex flex-col gap-3.5">
        {statements.map((item, index) => {
          const hasAnswerKey = item.isTrue !== null;
          const hasAnswered = item.studentMark !== null;
          const studentMarkedTrue =
            item.studentMark === TrueFalseEnum.VERDADEIRO;

          const isStudentCorrect =
            hasAnswerKey && hasAnswered && studentMarkedTrue === item.isTrue;

          // Correctness is only shown once the answer key is known AND the
          // answer is no longer pending.
          const canShowCorrectness = showCorrectness && hasAnswerKey;
          const variantCorrect = isStudentCorrect
            ? OptionStatus.CORRECT
            : OptionStatus.INCORRECT;
          const correctAnswer = item.isTrue
            ? TrueFalseEnum.VERDADEIRO
            : TrueFalseEnum.FALSO;

          return (
            <section
              key={item.id || `statement-${index}`}
              className="flex flex-col gap-2"
            >
              <div
                className={cn(
                  'flex flex-row justify-between items-center gap-2 p-2 rounded-md border',
                  canShowCorrectness && hasAnswered
                    ? getStatusStyles(variantCorrect)
                    : ''
                )}
              >
                <Text as="span" size="sm" weight="normal" color="text-text-900">
                  {getLetterByIndex(index).concat(') ')}
                  <HtmlMathRenderer content={item.statement} inline />
                </Text>

                {canShowCorrectness && hasAnswered && (
                  <div className="flex-shrink-0">
                    {getStatusBadge(variantCorrect)}
                  </div>
                )}
              </div>

              {canShowCorrectness && (
                <span className="flex flex-row gap-2 items-center flex-wrap">
                  {hasAnswered ? (
                    <>
                      <Text size="2xs" weight="normal" color="text-text-800">
                        Resposta selecionada: {item.studentMark}
                      </Text>
                      {!isStudentCorrect && (
                        <Text size="2xs" weight="normal" color="text-text-800">
                          | Resposta correta: {correctAnswer}
                        </Text>
                      )}
                    </>
                  ) : (
                    <Text size="2xs" weight="normal" color="text-text-800">
                      Não respondida | Resposta correta: {correctAnswer}
                    </Text>
                  )}
                </span>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default TrueFalseStatementList;
