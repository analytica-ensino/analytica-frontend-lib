import Text from '../Text/Text';
import { SectionContent } from './SectionContent';
import { ExamCardsRow, ScoreBandChart, students } from './ExamCards';
import type {
  EnemMomentExamData,
  EnemMomentSectionState,
  EnemMomentSummary,
} from './types';

/**
 * "Dados do simulado" of the unit report (Gestor de Unidade, professor): how its students scored, then
 * Participação, Idioma and Tempo in a row.
 *
 * One school, so no histogram of school averages; Participação splits the
 * students of the cards, who took the exam and who did not.
 */
export function UnitExamDataSection({
  summary,
  examData,
  hasLanguageChoice,
  examDurationSeconds,
}: Readonly<{
  summary: EnemMomentSectionState<EnemMomentSummary>;
  examData: EnemMomentSectionState<EnemMomentExamData>;
  /** Whether the cut has a day 1 — `null` while the exams are not known. */
  hasLanguageChoice: boolean | null;
  /** The cut's time limit, from its exams — `null` while they are not known. */
  examDurationSeconds: number | null;
}>) {
  return (
    <section className="flex flex-col gap-4">
      <Text as="h2" size="xl" weight="bold" className="text-text-950">
        Dados do simulado
      </Text>
      <SectionContent
        loading={summary.loading || examData.loading}
        error={summary.error ?? examData.error}
        minHeight="min-h-[520px]"
      >
        {summary.data && examData.data && (
          <div className="flex flex-col gap-4">
            <ScoreBandChart
              title="Estudantes por faixa de nota"
              bands={examData.data.studentScoreBands}
              formatTotal={students}
              barColor="bg-info-500"
            />
            <ExamCardsRow
              participation={{
                participated: summary.data.participatingStudents,
                notParticipated: summary.data.studentsWithoutParticipation,
              }}
              examData={examData.data}
              hasLanguageChoice={hasLanguageChoice}
              examDurationSeconds={examDurationSeconds}
            />
          </div>
        )}
      </SectionContent>
    </section>
  );
}
