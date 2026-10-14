import { ClockIcon } from '@phosphor-icons/react/dist/csr/Clock';
import ProgressBar from '../ProgressBar/ProgressBar';
import ProgressCircle from '../ProgressCircle/ProgressCircle';

/** One difficulty bar: "Fáceis 28 de 30". */
export interface DifficultyBarData {
  /** What the bar shows, e.g. "Fáceis". */
  label: string;
  /** The same, lowercase, for the sentence screen readers hear: "fáceis". */
  spokenLabel: string;
  correct: number;
  total: number;
}

/**
 * Accessible name of a difficulty progress bar on the result screen.
 *
 * @param difficultyLabel - Difficulty name in lowercase, e.g. "fáceis"
 * @param correct - Number of correct answers for this difficulty
 * @param total - Number of questions for this difficulty
 * @returns The sentence announced by screen readers
 *
 * @example
 * ```typescript
 * getDifficultyAccessibleLabel('fáceis', 2, 5); // 'Questões fáceis: 2 de 5 corretas.'
 * getDifficultyAccessibleLabel('fáceis', 0, 0); // 'Questões fáceis: nenhuma questão.'
 * ```
 */
export const getDifficultyAccessibleLabel = (
  difficultyLabel: string,
  correct: number,
  total: number
): string =>
  total > 0
    ? `Questões ${difficultyLabel}: ${correct} de ${total} corretas.`
    : `Questões ${difficultyLabel}: nenhuma questão.`;

/**
 * The ring with "X de Y Corretas" (and the time, when there is one) and the
 * difficulty bars beside it — what "Desempenho por acertos" draws.
 *
 * Presentational: it takes the numbers and computes nothing, so the quiz result
 * (which counts from the quiz store) and the Simulado Momento Enem result
 * (which receives them from the API) draw the same thing. Rendered as a
 * fragment: the caller's row lays the ring and the bars out.
 */
export const PerformanceByDifficulty = ({
  percentage,
  correct,
  total,
  timeSpent,
  circleAccessibleLabel,
  difficulties,
}: Readonly<{
  /** How much of the ring is filled, 0-100. */
  percentage: number;
  /** The "X" of "X de Y"; a placeholder such as "--" while unknown. */
  correct: number | string;
  total: number;
  /** As written beside the clock; no clock without it. */
  timeSpent: string | null;
  /**
   * The ring's content as a sentence — the percentage is announced by the
   * `<progress>` itself and must not be repeated here.
   */
  circleAccessibleLabel: string;
  /** The bars, in order; none without them. */
  difficulties: ReadonlyArray<DifficultyBarData> | null;
}>) => (
  <>
    <div className="relative">
      <ProgressCircle
        size="medium"
        variant="green"
        value={percentage}
        showPercentage={false}
        label=""
        accessibleLabel={circleAccessibleLabel}
      />

      {/* Duplicata visual do que o anel já anuncia (ver
          `circleAccessibleLabel`): fora da árvore de acessibilidade para o
          leitor não ler o mesmo resultado em pedaços. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex flex-col items-center justify-center"
      >
        {timeSpent !== null && (
          <div className="flex items-center gap-1 mb-1">
            <ClockIcon size={12} weight="regular" className="text-text-800" />
            <span className="text-2xs font-medium text-text-800">
              {timeSpent}
            </span>
          </div>
        )}

        <div className="text-2xl font-medium text-text-800 leading-7">
          {correct} de {total}
        </div>

        <div className="text-2xs font-medium text-text-600 mt-1">Corretas</div>
      </div>
    </div>

    {difficulties && (
      <div className="flex flex-col gap-4 w-full">
        {difficulties.map((difficulty) => (
          <ProgressBar
            key={difficulty.label}
            className="w-full"
            layout="stacked"
            variant="green"
            value={difficulty.correct}
            max={difficulty.total}
            label={difficulty.label}
            // Frase completa: "2 de 5" sozinho não diz que são acertos, e
            // sem questões a barra não deve soar como "0 de 0".
            accessibleLabel={getDifficultyAccessibleLabel(
              difficulty.spokenLabel,
              difficulty.correct,
              difficulty.total
            )}
            showHitCount
            labelClassName="text-base font-medium text-text-800 leading-none"
            percentageClassName="text-xs font-medium leading-[14px] text-right"
          />
        ))}
      </div>
    )}
  </>
);
