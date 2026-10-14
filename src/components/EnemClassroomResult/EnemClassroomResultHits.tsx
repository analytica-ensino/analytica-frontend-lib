import { useId } from 'react';
import Text from '../Text/Text';
import { PerformanceByDifficulty } from '../Quiz/PerformanceByDifficulty';
import type {
  EnemClassroomDifficultyLevel,
  EnemClassroomStudentResult,
} from '../../types/enemClassroom';
import { formatElapsed, spokenElapsed } from './utils';

/** The bars' labels, by the level the API sends. */
const DIFFICULTY_LABELS: Record<
  EnemClassroomDifficultyLevel,
  { label: string; spokenLabel: string }
> = {
  FACIL: { label: 'Fáceis', spokenLabel: 'fáceis' },
  MEDIO: { label: 'Médias', spokenLabel: 'médias' },
  DIFICIL: { label: 'Difíceis', spokenLabel: 'difíceis' },
};

/**
 * "Desempenho por acertos" of a Simulado Momento Enem result: the ring with
 * the time and "45 de 90 Corretas", and the three difficulty bars — the same
 * piece the quiz result draws, fed by the API instead of the quiz store.
 *
 * "de 90" is the student's own block: with a language choice two students of
 * the same exam received different questions.
 */
export const EnemClassroomResultHits = ({
  result,
}: Readonly<{ result: EnemClassroomStudentResult }>) => {
  const titleId = useId();
  const percentage =
    result.answered > 0
      ? Math.round((result.correct / result.answered) * 100)
      : 0;
  const circleAccessibleLabel = [
    `${result.correct} de ${result.answered} questões corretas.`,
    result.elapsedSeconds === null
      ? null
      : `Tempo de prova: ${spokenElapsed(result.elapsedSeconds)}.`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-6 p-6 rounded-xl bg-background border border-border-50"
    >
      <Text
        as="h2"
        id={titleId}
        size="lg"
        weight="bold"
        className="text-text-950"
      >
        Desempenho por acertos
      </Text>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        <PerformanceByDifficulty
          percentage={percentage}
          correct={result.correct}
          total={result.answered}
          timeSpent={
            result.elapsedSeconds === null
              ? null
              : formatElapsed(result.elapsedSeconds)
          }
          circleAccessibleLabel={circleAccessibleLabel}
          difficulties={result.difficulties.map((difficulty) => ({
            ...DIFFICULTY_LABELS[difficulty.level],
            correct: difficulty.correct,
            total: difficulty.answered,
          }))}
        />
      </div>
    </section>
  );
};
