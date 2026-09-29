import type { ReactNode } from 'react';
import Modal from '../Modal/Modal';
import { SkeletonCard } from '../Skeleton/Skeleton';
import { MetricBox } from '../shared/MetricBox';
import {
  SectionTitle,
  UserHeader,
  ErrorContent,
} from '../shared/ModalComponents';
import { cn } from '../../utils/utils';
import type { SimulationDetailData } from '../../types/simulations';
import {
  ToneTile,
  answerTiles,
  scoreText,
  type ToneTileData,
} from '../EnemMoment/ToneTiles';
import { EnemMomentPerformanceBadge } from '../EnemMoment/PerformanceBadge';
import type {
  EnemMomentMoment,
  EnemMomentSectionState,
  EnemMomentStudentMoment,
  EnemMomentStudentReport,
} from '../EnemMoment/types';
import {
  formatClock,
  formatDateTime,
  MISSING_VALUE,
} from '../EnemMoment/utils';
import { StudentAnswers } from './StudentAnswers';

const LANGUAGE_LABELS: Record<string, string> = {
  INGLES: 'Inglês',
  ESPANHOL: 'Espanhol',
};

/** Whether the student took a moment — the API says so in `participated`. */
export const tookMoment = (moment: EnemMomentStudentMoment) =>
  moment.participated;

/**
 * The "Desempenho geral" tiles. With more than one moment in the cut ("Geral")
 * each moment's score ("Nota 1", "Nota 2") and then the final one, the order
 * of the design; on a Momento tab that moment's score alone. The answer
 * counts close the grid either way.
 */
export function buildStudentTiles(
  report: EnemMomentStudentReport,
  moments: EnemMomentMoment[]
): ToneTileData[] {
  const grades: ToneTileData[] =
    report.momentos.length > 1
      ? [
          ...report.momentos.map((momento): ToneTileData => {
            const number =
              moments.findIndex((moment) => moment.examId === momento.examId) +
              1;
            return {
              key: momento.examId,
              tone: 'grade',
              label: number > 0 ? `Nota ${number}` : 'Nota',
              value: scoreText(momento.score),
            };
          }),
          {
            key: 'final',
            tone: 'grade',
            label: 'Nota final',
            value: scoreText(report.finalScore),
          },
        ]
      : [
          {
            key: 'moment',
            tone: 'grade',
            label: 'Nota',
            value: scoreText(report.finalScore),
          },
        ];

  return [...grades, ...answerTiles(report)];
}

/**
 * When the student submitted — on "Geral", the last of the moments taken.
 *
 * PENDING: which date "Geral" shows is still to settle with the team.
 */
function lastAnsweredAt(momentos: EnemMomentStudentMoment[]): string | null {
  return momentos.reduce<string | null>(
    (last, momento) =>
      momento.answeredAt && (!last || momento.answeredAt > last)
        ? momento.answeredAt
        : last,
    null
  );
}

/** The foreign language picked — a day 1's; `null` without one. */
function languageOf(momentos: EnemMomentStudentMoment[]): string | null {
  const language = momentos.find((momento) => momento.language)?.language;
  return language ? (LANGUAGE_LABELS[language] ?? language) : null;
}

/** What the modal needs to show and fetch "Respostas". */
interface AnswersProps {
  /** The answers of the moment picked, fetched by the app. */
  answers: EnemMomentSectionState<SimulationDetailData>;
  /**
   * The activity of the moment picked in "Respostas" — the first the student
   * took, until another is picked; `null` when they took none. The app
   * fetches its answers.
   */
  onAnswersActivityChange: (activityId: string | null) => void;
}

/** The modal's body once the student's report is in. */
function StudentReportBody({
  report,
  moments,
  answers,
  onAnswersActivityChange,
}: Readonly<
  {
    report: EnemMomentStudentReport;
    moments: EnemMomentMoment[];
  } & AnswersProps
>) {
  const tiles = buildStudentTiles(report, moments);

  return (
    <div className="flex flex-col gap-6">
      <UserHeader
        name={report.student.studentName}
        school={report.student.schoolName}
        className={report.student.className ?? MISSING_VALUE}
        year={report.student.schoolYearName ?? MISSING_VALUE}
        statusBadge={
          report.performance === null ||
          report.performance === 'NO_EXAM' ? undefined : (
            <EnemMomentPerformanceBadge performance={report.performance} />
          )
        }
      />

      <section className="flex flex-col gap-3">
        <SectionTitle>Dados de simulados</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricBox
            label="Tempo total do simulado"
            value={formatClock(report.totalElapsedSeconds)}
          />
          <MetricBox
            label="Tempo médio em cada questão"
            value={formatClock(report.averageSecondsPerQuestion)}
          />
          <MetricBox
            label="Realizou o simulado"
            value={formatDateTime(lastAnsweredAt(report.momentos))}
          />
          <MetricBox
            label="Idioma"
            value={languageOf(report.momentos) ?? MISSING_VALUE}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle>Desempenho geral</SectionTitle>
        <div
          className={cn(
            'grid grid-cols-2 gap-3',
            tiles.length === 6 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
          )}
        >
          {tiles.map(({ key, ...tile }) => (
            <ToneTile key={key} {...tile} />
          ))}
        </div>
      </section>

      <StudentAnswers
        takenMoments={report.momentos.filter(tookMoment)}
        moments={moments}
        answers={answers}
        onActivityChange={onAnswersActivityChange}
      />
    </div>
  );
}

/**
 * A student's modal of the Momento ENEM screens, for the cut of the page it
 * opens from: who the student is, how the exam went and the answers,
 * question by question. The app fetches the report and the answers.
 */
export function StudentModal({
  isOpen,
  onClose,
  studentReport,
  moments,
  answers,
  onAnswersActivityChange,
}: Readonly<
  {
    isOpen: boolean;
    onClose: () => void;
    studentReport: EnemMomentSectionState<EnemMomentStudentReport>;
    moments: EnemMomentMoment[];
  } & AnswersProps
>) {
  let content: ReactNode = null;
  if (studentReport.loading) {
    content = (
      <div className="flex flex-col gap-4">
        <SkeletonCard className="h-16" />
        <SkeletonCard className="h-24" />
        <SkeletonCard className="h-64" />
      </div>
    );
  } else if (studentReport.error) {
    content = <ErrorContent message={studentReport.error} />;
  } else if (studentReport.data) {
    content = (
      <StudentReportBody
        report={studentReport.data}
        moments={moments}
        answers={answers}
        onAnswersActivityChange={onAnswersActivityChange}
      />
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Desempenho simulado Momento Enem"
      size="xl"
    >
      {content}
    </Modal>
  );
}
