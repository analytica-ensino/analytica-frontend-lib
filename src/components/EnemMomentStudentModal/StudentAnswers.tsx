import { useEffect, useMemo, useState } from 'react';
import Text from '../Text/Text';
import Select, {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../Select/Select';
import { SkeletonCard } from '../Skeleton/Skeleton';
import { SectionTitle } from '../shared/ModalComponents';
import { SimulationQuestionItem } from '../SimulationsPage';
import type { SimulationDetailData } from '../../types/simulations';
import type {
  EnemMomentMoment,
  EnemMomentSectionState,
  EnemMomentStudentMoment,
} from '../EnemMoment/types';

/**
 * "Respostas" of a student's modal: a moment picked in the select, then its
 * questions. The select offers only the moments the student took — on a
 * Momento tab, that one.
 */
export function StudentAnswers({
  takenMoments,
  moments,
  answers,
  onActivityChange,
}: Readonly<{
  /** The moments of the cut the student took. */
  takenMoments: EnemMomentStudentMoment[];
  moments: EnemMomentMoment[];
  /** The answers of the moment picked, fetched by the app. */
  answers: EnemMomentSectionState<SimulationDetailData>;
  /** The activity whose answers to fetch — `null` without one. */
  onActivityChange: (activityId: string | null) => void;
}>) {
  // In the order of the moments, whatever order the API listed them in.
  const options = useMemo(
    () =>
      moments.flatMap((moment) => {
        const taken = takenMoments.find(
          (momento) => momento.examId === moment.examId
        );
        return taken ? [{ ...moment, activityId: taken.activityId }] : [];
      }),
    [moments, takenMoments]
  );
  const [picked, setPicked] = useState<string | null>(null);
  const option =
    options.find((moment) => moment.examId === picked) ?? options[0] ?? null;
  const examId = option?.examId ?? null;

  const activityId = option?.activityId ?? null;
  useEffect(() => {
    onActivityChange(activityId);
  }, [activityId, onActivityChange]);

  let list = null;
  if (examId === null) {
    list = (
      <Text size="sm" className="text-text-500">
        O estudante não respondeu nenhuma prova.
      </Text>
    );
  } else if (answers.loading) {
    list = <SkeletonCard className="h-64" />;
  } else if (answers.error) {
    list = (
      <Text size="sm" className="text-text-500">
        {answers.error}
      </Text>
    );
  } else if (answers.data) {
    list = (
      <div className="flex flex-col gap-2">
        {/* Read-only: no `onSaveComment`, so no comment field. */}
        {answers.data.questions.map((question, index) => (
          <SimulationQuestionItem
            key={question.questionId}
            question={question}
            index={index}
          />
        ))}
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-row items-center gap-4">
        <SectionTitle>Respostas</SectionTitle>
        {options.length > 0 && examId && (
          <Select value={examId} onValueChange={setPicked}>
            <SelectTrigger className="w-40" aria-label="Momento">
              <SelectValue placeholder="Momento" />
            </SelectTrigger>
            <SelectContent>
              {options.map((moment) => (
                <SelectItem key={moment.examId} value={moment.examId}>
                  {moment.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      {list}
    </section>
  );
}
