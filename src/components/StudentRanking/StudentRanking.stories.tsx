import type { Story } from '@ladle/react';
import { StudentRanking, RankingCard } from './StudentRanking';

/**
 * Default example with both cards
 */
export const Default: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <StudentRanking
      highlightStudents={[
        { position: 1, name: 'Valentina Ribeiro', percentage: 100 },
        { position: 2, name: 'Lucas Almeida', percentage: 100 },
        { position: 3, name: 'Fernanda Costa', percentage: 100 },
      ]}
      attentionStudents={[
        { position: 1, name: 'Ricardo Silva', percentage: 80 },
        { position: 2, name: 'Juliana Santos', percentage: 50 },
        { position: 3, name: 'Gabriel Oliveira', percentage: 40 },
      ]}
    />
  </div>
);

/**
 * With custom titles
 */
export const CustomTitles: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <StudentRanking
      highlightTitle="Top Performers"
      attentionTitle="Needs Improvement"
      highlightStudents={[
        { position: 1, name: 'Maria Silva', percentage: 98 },
        { position: 2, name: 'João Santos', percentage: 95 },
        { position: 3, name: 'Ana Oliveira', percentage: 92 },
      ]}
      attentionStudents={[
        { position: 1, name: 'Pedro Costa', percentage: 45 },
        { position: 2, name: 'Carla Souza', percentage: 38 },
        { position: 3, name: 'Bruno Lima', percentage: 30 },
      ]}
    />
  </div>
);

/**
 * Individual highlight card
 */
export const HighlightCardOnly: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen max-w-md">
    <RankingCard
      title="Estudantes em destaque"
      variant="highlight"
      students={[
        { position: 1, name: 'Valentina Ribeiro', percentage: 100 },
        { position: 2, name: 'Lucas Almeida', percentage: 100 },
        { position: 3, name: 'Fernanda Costa', percentage: 100 },
      ]}
    />
  </div>
);

/**
 * Individual attention card
 */
export const AttentionCardOnly: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen max-w-md">
    <RankingCard
      title="Estudantes precisando de atenção"
      variant="attention"
      students={[
        { position: 1, name: 'Ricardo Silva', percentage: 80 },
        { position: 2, name: 'Juliana Santos', percentage: 50 },
        { position: 3, name: 'Gabriel Oliveira', percentage: 40 },
      ]}
    />
  </div>
);

/**
 * Mobile view - cards stacked vertically
 */
export const MobileView: Story = () => (
  <div className="p-4 bg-gray-100 min-h-screen max-w-[375px]">
    <div className="flex flex-col gap-4">
      <RankingCard
        title="Estudantes em destaque"
        variant="highlight"
        students={[
          { position: 1, name: 'Lucas Carvalho', percentage: 100 },
          { position: 2, name: 'Ana Paula de Souza', percentage: 100 },
          { position: 3, name: 'Ricardo Nascimento', percentage: 100 },
        ]}
      />
      <RankingCard
        title="Estudantes precisando de atenção"
        variant="attention"
        students={[
          { position: 1, name: 'Fernanda Sol', percentage: 40 },
          { position: 2, name: 'Gabriel Santos', percentage: 40 },
          { position: 3, name: 'Juliana Pereira', percentage: 40 },
        ]}
      />
    </div>
  </div>
);

/**
 * With varying percentages
 */
export const VaryingPercentages: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <StudentRanking
      highlightStudents={[
        { position: 1, name: 'Isabela Ferreira', percentage: 100 },
        { position: 2, name: 'Matheus Rodrigues', percentage: 98 },
        { position: 3, name: 'Camila Martins', percentage: 95 },
      ]}
      attentionStudents={[
        { position: 1, name: 'Thiago Nascimento', percentage: 35 },
        { position: 2, name: 'Leticia Araújo', percentage: 28 },
        { position: 3, name: 'Felipe Cardoso', percentage: 20 },
      ]}
    />
  </div>
);

/**
 * With long names (truncation test)
 */
export const LongNames: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <StudentRanking
      highlightStudents={[
        {
          position: 1,
          name: 'Maria Eduarda de Oliveira Santos Silva',
          percentage: 100,
        },
        {
          position: 2,
          name: 'João Pedro Augusto Ferreira da Costa',
          percentage: 98,
        },
        {
          position: 3,
          name: 'Ana Carolina Beatriz Rodrigues Lima',
          percentage: 95,
        },
      ]}
      attentionStudents={[
        {
          position: 1,
          name: 'Carlos Eduardo Henrique Martins Souza',
          percentage: 45,
        },
        {
          position: 2,
          name: 'Fernanda Cristina Aparecida Alves',
          percentage: 38,
        },
        {
          position: 3,
          name: 'Rafael Gustavo Leonardo Pereira',
          percentage: 30,
        },
      ]}
    />
  </div>
);

/**
 * Single student per card
 */
export const SingleStudent: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <StudentRanking
      highlightStudents={[
        { position: 1, name: 'Best Student', percentage: 100 },
      ]}
      attentionStudents={[
        { position: 1, name: 'Student Needing Help', percentage: 25 },
      ]}
    />
  </div>
);

/**
 * Five students per card
 */
export const FiveStudents: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <StudentRanking
      highlightStudents={[
        { position: 1, name: 'Valentina Ribeiro', percentage: 100 },
        { position: 2, name: 'Lucas Almeida', percentage: 100 },
        { position: 3, name: 'Fernanda Costa', percentage: 99 },
        { position: 4, name: 'Marcos Silva', percentage: 98 },
        { position: 5, name: 'Carolina Santos', percentage: 97 },
      ]}
      attentionStudents={[
        { position: 1, name: 'Ricardo Silva', percentage: 40 },
        { position: 2, name: 'Juliana Santos', percentage: 35 },
        { position: 3, name: 'Gabriel Oliveira', percentage: 30 },
        { position: 4, name: 'Amanda Ferreira', percentage: 25 },
        { position: 5, name: 'Bruno Costa', percentage: 20 },
      ]}
    />
  </div>
);
