import type { ReactNode } from 'react';
import { StarIcon } from '@phosphor-icons/react/dist/csr/Star';
import { MedalIcon } from '@phosphor-icons/react/dist/csr/Medal';
import { SealWarningIcon } from '@phosphor-icons/react/dist/csr/SealWarning';
import { SealQuestionIcon } from '@phosphor-icons/react/dist/csr/SealQuestion';
import {
  SimulationStatCard,
  type StatTone,
} from '../shared/SimulationSummaryCards';
import type { EnemMomentMoment } from './types';
import { formatCount, formatScore, MISSING_VALUE } from './utils';

const TONE_ICONS: Record<StatTone, ReactNode> = {
  grade: <StarIcon size={16} weight="bold" />,
  correct: <MedalIcon size={16} weight="bold" />,
  incorrect: <SealWarningIcon size={16} weight="bold" />,
  blank: <SealQuestionIcon size={16} weight="bold" />,
};

export interface ToneTileData {
  key: string;
  tone: StatTone;
  label: string;
  value: string;
}

/**
 * The lib's simulado stat card, with the icon of each tone of the design —
 * the "Dados gerais" of a school's page and the "Desempenho geral" of a
 * student's modal.
 */
export function ToneTile({
  tone,
  label,
  value,
}: Readonly<Omit<ToneTileData, 'key'>>) {
  return (
    <SimulationStatCard
      tone={tone}
      icon={TONE_ICONS[tone]}
      label={label}
      value={value}
    />
  );
}

export const scoreText = (value: number | null) =>
  value === null ? MISSING_VALUE : formatScore(value);

/**
 * Each exam's score in the order of the moments (whatever order the API sent),
 * with its moment's number — 0 for an exam the tabs lack.
 */
export function numberedExamScores(
  examScores: Array<{ examId: string; averageScore: number | null }>,
  moments: EnemMomentMoment[]
) {
  return examScores
    .map((exam) => ({
      ...exam,
      number: moments.findIndex((moment) => moment.examId === exam.examId) + 1,
    }))
    .sort((a, b) => a.number - b.number);
}

/** The three answer counts, as tiles. */
export function answerTiles({
  correct,
  incorrect,
  blank,
}: Readonly<{
  correct: number;
  incorrect: number;
  blank: number;
}>): ToneTileData[] {
  return [
    {
      key: 'correct',
      tone: 'correct',
      label: 'Nº de questões corretas',
      value: formatCount(correct),
    },
    {
      key: 'incorrect',
      tone: 'incorrect',
      label: 'Nº de questões incorretas',
      value: formatCount(incorrect),
    },
    {
      key: 'blank',
      tone: 'blank',
      label: 'Nº de questões em branco',
      value: formatCount(blank),
    },
  ];
}
