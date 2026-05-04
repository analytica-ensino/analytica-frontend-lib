import type { Story } from '@ladle/react';
import {
  SimulatedRankingCard,
  SimulatedStudentRanking,
} from './SimulatedStudentRanking';
import { ScoreType } from '../../types/common';

const highlightStudents = [
  { position: 1, name: 'Maria Eduarda', average: 94.2 },
  { position: 2, name: 'Lucas Silva', average: 91.8 },
  { position: 3, name: 'Carla Souza', average: 89.4 },
];

const attentionStudents = [
  { position: 1, name: 'Pedro Lima', average: 42.3 },
  { position: 2, name: 'Ana Clara', average: 39.9 },
  { position: 3, name: 'Joao Pedro', average: 35.1 },
];

export const Default: Story = () => (
  <SimulatedStudentRanking
    highlightStudents={highlightStudents}
    attentionStudents={attentionStudents}
  />
);

export const TriScore: Story = () => (
  <SimulatedStudentRanking
    highlightStudents={[
      { position: 1, name: 'Maria Eduarda', average: 712.4 },
      { position: 2, name: 'Lucas Silva', average: 701.8 },
      { position: 3, name: 'Carla Souza', average: 688.1 },
    ]}
    attentionStudents={[
      { position: 1, name: 'Pedro Lima', average: 458.6 },
      { position: 2, name: 'Ana Clara', average: 441.1 },
      { position: 3, name: 'Joao Pedro', average: 420.9 },
    ]}
    scoreType={ScoreType.TRI}
  />
);

export const CustomTitles: Story = () => (
  <SimulatedStudentRanking
    highlightTitle="Top desempenho"
    attentionTitle="Precisam de apoio"
    highlightStudents={highlightStudents}
    attentionStudents={attentionStudents}
  />
);

export const EmptyCard: Story = () => (
  <div className="max-w-md">
    <SimulatedRankingCard
      title="Sem estudantes"
      variant="highlight"
      students={[]}
      icon={<span>🏅</span>}
    />
  </div>
);
