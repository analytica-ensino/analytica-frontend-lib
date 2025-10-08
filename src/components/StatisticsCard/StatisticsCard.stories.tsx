import type { Story } from '@ladle/react';
import { StatisticsCard } from './StatisticsCard';
import { Plus } from 'phosphor-react';

/**
 * Story showing multiple cards together
 */
export const MultipleCards: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen space-y-6">
    <StatisticsCard
      title="Estatística das atividades"
      emptyStateMessage="Sem dados por enquanto. Crie uma atividade para que os resultados apareçam aqui."
      emptyStateButtonText="Criar atividade"
      emptyStateButtonIcon={<Plus size={16} />}
      onEmptyStateButtonClick={() => console.log('Create activity clicked')}
      dropdownOptions={[
        { label: '1 ano', value: '1year' },
        { label: '6 meses', value: '6months' },
      ]}
      selectedDropdownValue="1year"
    />
    <StatisticsCard
      title="Desempenho geral"
      emptyStateMessage="Adicione atividades para começar a acompanhar o desempenho."
      emptyStateButtonText="Ver tutorial"
      onEmptyStateButtonClick={() => console.log('View tutorial clicked')}
    />
  </div>
);

/**
 * Story with numeric data
 */
export const WithNumericData: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <StatisticsCard
      title="Desempenho dos alunos"
      data={[
        { label: 'Total de alunos', value: 156, variant: 'info' },
        { label: 'Aprovados', value: 142, variant: 'success' },
        { label: 'Em recuperação', value: 8, variant: 'warning' },
        { label: 'Reprovados', value: 6, variant: 'error' },
      ]}
      dropdownOptions={[
        { label: '2024', value: '2024' },
        { label: '2023', value: '2023' },
      ]}
      selectedDropdownValue="2024"
    />
  </div>
);

/**
 * Story with mixed data values
 */
export const WithMixedData: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <StatisticsCard
      title="Relatório geral"
      data={[
        { label: 'Taxa de conclusão', value: '92.5%', variant: 'success' },
        { label: 'Média geral', value: 8.7, variant: 'info' },
        { label: 'Pendências', value: 3, variant: 'warning' },
        { label: 'Taxa de evasão', value: '2.1%', variant: 'error' },
      ]}
    />
  </div>
);

/**
 * Story showing all variants in multiple cards
 */
export const AllVariants: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen space-y-6">
    <StatisticsCard
      title="Estatísticas com dados"
      data={[
        { label: 'Acertos', value: '85%', variant: 'success' },
        { label: 'Em andamento', value: 12, variant: 'warning' },
        { label: 'Erros', value: '15%', variant: 'error' },
        { label: 'Concluídas', value: 24, variant: 'info' },
      ]}
      dropdownOptions={[
        { label: '1 ano', value: '1year' },
        { label: '6 meses', value: '6months' },
      ]}
      selectedDropdownValue="1year"
    />
    <StatisticsCard
      title="Estatísticas sem dados (empty state)"
      emptyStateMessage="Sem dados por enquanto. Crie uma atividade para que os resultados apareçam aqui."
      emptyStateButtonText="Criar atividade"
      emptyStateButtonIcon={<Plus size={16} />}
      onEmptyStateButtonClick={() => console.log('Create activity clicked')}
      dropdownOptions={[
        { label: '1 ano', value: '1year' },
        { label: '6 meses', value: '6months' },
      ]}
      selectedDropdownValue="6months"
    />
  </div>
);

/**
 * Story for mobile view with data cards
 */
export const MobileView: Story = () => (
  <div className="p-4 bg-gray-100 min-h-screen max-w-[375px]">
    <StatisticsCard
      title="Estatística das atividades"
      data={[
        { label: 'Acertos', value: '85%', variant: 'success' },
        { label: 'Em andamento', value: 12, variant: 'warning' },
        { label: 'Erros', value: '15%', variant: 'error' },
        { label: 'Concluídas', value: 24, variant: 'info' },
      ]}
      dropdownOptions={[
        { label: '1 ano', value: '1year' },
        { label: '6 meses', value: '6months' },
      ]}
      selectedDropdownValue="1year"
      onDropdownChange={(value) => console.log('Dropdown changed to:', value)}
    />
  </div>
);
