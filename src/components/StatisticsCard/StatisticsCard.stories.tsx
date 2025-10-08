import type { Story } from '@ladle/react';
import { StatisticsCard } from './StatisticsCard';
import { Plus } from 'phosphor-react';

/**
 * Default story showcasing the basic empty state
 */
export const Default: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <StatisticsCard
      title="Estatística das atividades"
      emptyStateMessage="Sem dados por enquanto. Crie uma atividade para que os resultados apareçam aqui."
      emptyStateButtonText="Criar atividade"
      onEmptyStateButtonClick={() => console.log('Create activity clicked')}
    />
  </div>
);

/**
 * Story with icon in the button
 */
export const WithButtonIcon: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <StatisticsCard
      title="Estatística das atividades"
      emptyStateMessage="Sem dados por enquanto. Crie uma atividade para que os resultados apareçam aqui."
      emptyStateButtonText="Criar atividade"
      emptyStateButtonIcon={<Plus size={16} />}
      onEmptyStateButtonClick={() => console.log('Create activity clicked')}
    />
  </div>
);

/**
 * Story with dropdown filter options
 */
export const WithDropdown: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <StatisticsCard
      title="Estatística das atividades"
      emptyStateMessage="Sem dados por enquanto. Crie uma atividade para que os resultados apareçam aqui."
      emptyStateButtonText="Criar atividade"
      emptyStateButtonIcon={<Plus size={16} />}
      onEmptyStateButtonClick={() => console.log('Create activity clicked')}
      dropdownOptions={[
        { label: '1 ano', value: '1year' },
        { label: '6 meses', value: '6months' },
        { label: '3 meses', value: '3months' },
        { label: '1 mês', value: '1month' },
      ]}
      selectedDropdownValue="1year"
      onDropdownChange={(value) => console.log('Dropdown changed to:', value)}
    />
  </div>
);

/**
 * Story with custom message
 */
export const CustomMessage: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <StatisticsCard
      title="Desempenho dos alunos"
      emptyStateMessage="Nenhum resultado encontrado. Adicione alunos à sua turma para visualizar os dados de desempenho."
      emptyStateButtonText="Adicionar alunos"
      emptyStateButtonIcon={<Plus size={16} />}
      onEmptyStateButtonClick={() => console.log('Add students clicked')}
    />
  </div>
);

/**
 * Story with long message to test text wrapping
 */
export const LongMessage: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <StatisticsCard
      title="Relatórios detalhados"
      emptyStateMessage="Ainda não há dados disponíveis para exibição neste relatório. Para começar a visualizar estatísticas detalhadas, crie pelo menos uma atividade e aguarde a participação dos alunos. Os resultados serão atualizados automaticamente conforme novos dados forem coletados."
      emptyStateButtonText="Criar primeira atividade"
      emptyStateButtonIcon={<Plus size={16} />}
      onEmptyStateButtonClick={() =>
        console.log('Create first activity clicked')
      }
    />
  </div>
);

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
 * Story with custom className
 */
export const WithCustomClassName: Story = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <StatisticsCard
      title="Estatística customizada"
      emptyStateMessage="Componente com classe customizada aplicada."
      emptyStateButtonText="Ação customizada"
      emptyStateButtonIcon={<Plus size={16} />}
      onEmptyStateButtonClick={() => console.log('Custom action clicked')}
      className="shadow-lg border border-gray-200"
    />
  </div>
);

/**
 * Story for responsive testing (mobile view)
 */
export const MobileView: Story = () => (
  <div className="p-4 bg-gray-100 min-h-screen max-w-[375px]">
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
      onDropdownChange={(value) => console.log('Dropdown changed to:', value)}
    />
  </div>
);
