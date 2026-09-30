import { useMemo } from 'react';
import { ExamIcon } from '@phosphor-icons/react/dist/csr/Exam';
import { NavigationArrowIcon } from '@phosphor-icons/react/dist/csr/NavigationArrow';
import { ProhibitIcon } from '@phosphor-icons/react/dist/csr/Prohibit';
import { StudentIcon } from '@phosphor-icons/react/dist/csr/Student';
import {
  TimeReport,
  type TimeCardData,
  type TimeReportTab,
} from '../TimeReport/TimeReport';
import { SectionContent } from './SectionContent';
import type { EnemMomentSectionState, EnemMomentSummary } from './types';
import { formatCount, formatPercentage } from './utils';

const plural = (count: number, singular: string, pluralForm: string) =>
  `${formatCount(count)} ${count === 1 ? singular : pluralForm}`;

/**
 * The four cards of the unit report (Gestor de Unidade), all counting
 * students of its school:
 *
 * Card 1 — Total de estudantes                : totalStudents                  | "1 escola • 134 turmas"
 * Card 2 — Realizaram o simulado              : participatingStudents          | "de N estudantes"
 * Card 3 — % de realização                    : studentParticipationPercentage | "N ainda não realizaram"
 * Card 4 — Estudantes sem realizar o simulado : studentsWithoutParticipation   | "não realizaram"
 */
export function buildEnemMomentUnitSummaryCards(
  summary: EnemMomentSummary
): TimeCardData[] {
  const where = `${plural(summary.totalSchools, 'escola', 'escolas')} • ${plural(summary.totalClasses, 'turma', 'turmas')}`;

  return [
    {
      id: 'totalStudents',
      label: 'TOTAL DE ESTUDANTES',
      value: formatCount(summary.totalStudents),
      icon: <StudentIcon />,
      footer: where,
    },
    {
      id: 'participatingStudents',
      label: 'REALIZARAM O SIMULADO',
      value: formatCount(summary.participatingStudents),
      icon: <ExamIcon />,
      footer: `de ${plural(summary.totalStudents, 'estudante', 'estudantes')}`,
    },
    {
      id: 'studentParticipationPercentage',
      label: '% DE REALIZAÇÃO',
      value: formatPercentage(summary.studentParticipationPercentage),
      icon: <NavigationArrowIcon />,
      footer: `${formatCount(summary.studentsWithoutParticipation)} ainda não realizaram`,
    },
    {
      id: 'studentsWithoutParticipation',
      label: 'ESTUDANTES SEM REALIZAR O SIMULADO',
      value: formatCount(summary.studentsWithoutParticipation),
      icon: <ProhibitIcon />,
      footer: 'não realizaram',
    },
  ];
}

/** The cards block has no profile tabs: a single, stripless one. */
const SUMMARY_TAB_VALUE = 'enem-moment';

/**
 * The row of four cards at the top of the report, on the lib's TimeReport —
 * the network's cards or the unit's (`buildCards`).
 */
export function EnemMomentSummaryCards({
  summary,
  buildCards,
}: Readonly<{
  summary: EnemMomentSectionState<EnemMomentSummary>;
  buildCards: (summary: EnemMomentSummary) => TimeCardData[];
}>) {
  const tabs = useMemo<TimeReportTab[]>(
    () => [
      {
        value: SUMMARY_TAB_VALUE,
        label: '',
        cards: summary.data ? buildCards(summary.data) : [],
      },
    ],
    [summary.data, buildCards]
  );

  return (
    <SectionContent
      loading={summary.loading}
      error={summary.error}
      minHeight="min-h-[140px]"
    >
      <TimeReport tabs={tabs} activeTab={SUMMARY_TAB_VALUE} />
    </SectionContent>
  );
}
