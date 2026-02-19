import type { Story } from '@ladle/react';
import { PerformanceRanking } from './PerformanceRanking';

/**
 * State grouping (GENERAL_MANAGER view)
 */
export const StateGrouping: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <PerformanceRanking
      highlightTitle="Regiões em destaque"
      attentionTitle="Regiões precisando de atenção"
      countLabel="estudantes"
      data={{
        groupedBy: 'state',
        highlighted: [
          { position: 1, name: 'SP', count: 150, percentage: 85, trend: 'up' },
          {
            position: 2,
            name: 'RJ',
            count: 120,
            percentage: 78,
            trend: 'down',
          },
          {
            position: 3,
            name: 'MG',
            count: 100,
            percentage: 72,
            trend: null,
          },
        ],
        needsAttention: [
          {
            position: 1,
            name: 'BA',
            count: 30,
            percentage: 25,
            trend: 'down',
          },
          { position: 2, name: 'PE', count: 35, percentage: 28, trend: null },
          { position: 3, name: 'CE', count: 40, percentage: 32, trend: 'up' },
        ],
      }}
    />
  </div>
);

/**
 * Municipality grouping (REGIONAL_MANAGER view)
 */
export const MunicipalityGrouping: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <PerformanceRanking
      highlightTitle="Municípios em destaque"
      attentionTitle="Municípios precisando de atenção"
      countLabel="gestores"
      data={{
        groupedBy: 'municipality',
        highlighted: [
          {
            position: 1,
            name: 'São Paulo',
            count: 150,
            percentage: 85,
            trend: 'up',
          },
          {
            position: 2,
            name: 'Campinas',
            count: 120,
            percentage: 78,
            trend: 'down',
          },
          {
            position: 3,
            name: 'Santos',
            count: 100,
            percentage: 72,
            trend: null,
          },
        ],
        needsAttention: [
          {
            position: 1,
            name: 'Ribeirão Preto',
            count: 30,
            percentage: 25,
            trend: 'down',
          },
          {
            position: 2,
            name: 'Sorocaba',
            count: 35,
            percentage: 28,
            trend: null,
          },
          {
            position: 3,
            name: 'Piracicaba',
            count: 40,
            percentage: 32,
            trend: 'up',
          },
        ],
      }}
    />
  </div>
);

/**
 * Class grouping with shift and grade (UNIT_MANAGER view)
 */
export const ClassGrouping: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <PerformanceRanking
      highlightTitle="Turmas em destaque"
      attentionTitle="Turmas com maior dificuldade"
      countLabel="estudantes"
      data={{
        groupedBy: 'class',
        highlighted: [
          {
            position: 1,
            name: 'Turma A',
            count: 45,
            percentage: 90,
            trend: 'up',
            shift: 'Manhã',
            grade: '9º Ano',
          },
          {
            position: 2,
            name: 'Turma B',
            count: 40,
            percentage: 85,
            trend: 'up',
            shift: 'Tarde',
            grade: '8º Ano',
          },
          {
            position: 3,
            name: 'Turma C',
            count: 38,
            percentage: 80,
            trend: null,
            shift: 'Manhã',
            grade: '7º Ano',
          },
        ],
        needsAttention: [
          {
            position: 1,
            name: 'Turma F',
            count: 10,
            percentage: 20,
            trend: 'down',
            shift: 'Noite',
            grade: '9º Ano',
          },
          {
            position: 2,
            name: 'Turma E',
            count: 12,
            percentage: 25,
            trend: 'down',
            shift: 'Tarde',
            grade: '6º Ano',
          },
          {
            position: 3,
            name: 'Turma D',
            count: 15,
            percentage: 30,
            trend: null,
            shift: 'Manhã',
            grade: '8º Ano',
          },
        ],
      }}
    />
  </div>
);

/**
 * With null positions
 */
export const WithNullPositions: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <PerformanceRanking
      data={{
        groupedBy: 'state',
        highlighted: [
          { position: 1, name: 'SP', count: 150, percentage: 85, trend: 'up' },
          null,
          null,
        ],
        needsAttention: [
          {
            position: 1,
            name: 'BA',
            count: 30,
            percentage: 25,
            trend: 'down',
          },
          null,
          null,
        ],
      }}
    />
  </div>
);
