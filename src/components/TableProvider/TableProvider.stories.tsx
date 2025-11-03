import type { Story } from '@ladle/react';
import { TableProvider, ColumnConfig } from './TableProvider';
import Badge from '../Badge/Badge';
import ProgressBar from '../ProgressBar/ProgressBar';

// Mock data type
interface Activity {
  id: string;
  title: string;
  status: 'ATIVA' | 'CONCLUÍDA' | 'VENCIDA';
  completionPercentage: number;
  deadline: string;
  subject: string;
}

// Mock data
const mockActivities: Activity[] = [
  {
    id: '1',
    title: 'Prova de Matemática',
    status: 'ATIVA',
    completionPercentage: 75,
    deadline: '15/12/2024',
    subject: 'Matemática',
  },
  {
    id: '2',
    title: 'Trabalho de História',
    status: 'CONCLUÍDA',
    completionPercentage: 100,
    deadline: '10/12/2024',
    subject: 'História',
  },
  {
    id: '3',
    title: 'Exercícios de Física',
    status: 'VENCIDA',
    completionPercentage: 45,
    deadline: '05/12/2024',
    subject: 'Física',
  },
  {
    id: '4',
    title: 'Redação de Português',
    status: 'ATIVA',
    completionPercentage: 60,
    deadline: '20/12/2024',
    subject: 'Português',
  },
  {
    id: '5',
    title: 'Experimento de Química',
    status: 'ATIVA',
    completionPercentage: 30,
    deadline: '18/12/2024',
    subject: 'Química',
  },
];

// Column configuration
const columns: ColumnConfig<Activity>[] = [
  {
    key: 'title',
    label: 'Título',
    sortable: true,
  },
  {
    key: 'subject',
    label: 'Matéria',
    sortable: true,
  },
  {
    key: 'deadline',
    label: 'Prazo',
    sortable: true,
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (value) => {
      const statusMap = {
        ATIVA: { action: 'warning' as const, label: 'Ativa' },
        CONCLUÍDA: { action: 'success' as const, label: 'Concluída' },
        VENCIDA: { action: 'error' as const, label: 'Vencida' },
      };
      const status = statusMap[value as keyof typeof statusMap];
      return (
        <Badge variant="solid" action={status.action} size="small">
          {status.label}
        </Badge>
      );
    },
  },
  {
    key: 'completionPercentage',
    label: 'Conclusão',
    sortable: true,
    render: (value) => (
      <ProgressBar
        value={value as number}
        variant="blue"
        size="medium"
        layout="compact"
        showPercentage
        compactWidth="w-[100px]"
      />
    ),
  },
];

// Filter configuration
const filterConfigs = [
  {
    key: 'status',
    label: 'STATUS',
    categories: [
      {
        key: 'status',
        label: 'Status da Atividade',
        selectedIds: [] as string[],
        itens: [
          { id: 'ATIVA', name: 'Ativa' },
          { id: 'CONCLUÍDA', name: 'Concluída' },
          { id: 'VENCIDA', name: 'Vencida' },
        ],
      },
    ],
  },
  {
    key: 'subject',
    label: 'MATÉRIA',
    categories: [
      {
        key: 'subject',
        label: 'Matéria',
        selectedIds: [] as string[],
        itens: [
          { id: 'matematica', name: 'Matemática' },
          { id: 'historia', name: 'História' },
          { id: 'fisica', name: 'Física' },
          { id: 'portugues', name: 'Português' },
          { id: 'quimica', name: 'Química' },
        ],
      },
    ],
  },
];

/**
 * Basic table with data
 */
export const Basic: Story = () => {
  return (
    <TableProvider data={mockActivities} headers={columns} variant="default" />
  );
};

/**
 * Table with all features enabled
 */
export const AllFeatures: Story = () => {
  return (
    <TableProvider
      data={mockActivities}
      headers={columns}
      variant="borderless"
      enableSearch
      enableFilters
      enableTableSort
      enablePagination
      enableRowClick
      initialFilters={filterConfigs}
      paginationConfig={{
        itemLabel: 'atividades',
        itemsPerPageOptions: [5, 10, 20],
        defaultItemsPerPage: 5,
      }}
      searchPlaceholder="Buscar atividades..."
      onParamsChange={(params) => {
        console.log('Params changed:', params);
      }}
      onRowClick={(row) => {
        console.log('Row clicked:', row);
      }}
    />
  );
};

/**
 * Table with search and sorting only
 */
export const SearchAndSort: Story = () => {
  return (
    <TableProvider
      data={mockActivities}
      headers={columns}
      variant="default"
      enableSearch
      enableTableSort
      searchPlaceholder="Buscar atividades..."
      onParamsChange={(params) => {
        console.log('Params changed:', params);
      }}
    />
  );
};

/**
 * Loading state
 */
export const Loading: Story = () => {
  return (
    <TableProvider
      data={[]}
      headers={columns}
      variant="default"
      loading
      enableSearch
      enableFilters
    />
  );
};

/**
 * Empty state
 */
export const Empty: Story = () => {
  return (
    <TableProvider
      data={[]}
      headers={columns}
      variant="default"
      emptyStateMessage="Nenhuma atividade encontrada"
      emptyStateButtonLabel="Criar Atividade"
      onEmptyStateButtonClick={() => {
        alert('Criar nova atividade');
      }}
    />
  );
};

/**
 * Borderless variant with pagination
 */
export const BorderlessWithPagination: Story = () => {
  return (
    <TableProvider
      data={mockActivities}
      headers={columns}
      variant="borderless"
      enablePagination
      enableTableSort
      paginationConfig={{
        itemLabel: 'atividades',
        defaultItemsPerPage: 3,
      }}
    />
  );
};
