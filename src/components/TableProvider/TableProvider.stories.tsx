import type { Story } from '@ladle/react';
import { TableProvider, ColumnConfig } from './TableProvider';
import Badge from '../Badge/Badge';
import ProgressBar from '../ProgressBar/ProgressBar';

// Mock data type
interface Activity extends Record<string, unknown> {
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
          { id: 'Matemática', name: 'Matemática' },
          { id: 'História', name: 'História' },
          { id: 'Física', name: 'Física' },
          { id: 'Português', name: 'Português' },
          { id: 'Química', name: 'Química' },
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
    <TableProvider<Activity>
      data={mockActivities}
      headers={columns}
      variant="default"
    />
  );
};

/**
 * Table with all features enabled
 */
export const AllFeatures: Story = () => {
  return (
    <TableProvider<Activity>
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
    <TableProvider<Activity>
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
    <TableProvider<Activity> data={[]} headers={columns} variant="default" />
  );
};

/**
 * Borderless variant with pagination
 */
export const BorderlessWithPagination: Story = () => {
  return (
    <TableProvider<Activity>
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

/**
 * Custom responsive layout using render props
 * This demonstrates how to use the render prop pattern to create custom layouts
 * while preserving the original responsive behavior
 */
export const CustomResponsiveLayout: Story = () => {
  const handleCreateActivity = () => {
    console.log('Create activity clicked');
  };

  return (
    <TableProvider<Activity>
      data={mockActivities}
      headers={columns}
      variant="borderless"
      enableSearch
      enableFilters
      enableTableSort
      enablePagination
      initialFilters={filterConfigs}
      paginationConfig={{
        itemLabel: 'atividades',
        itemsPerPageOptions: [5, 10, 20],
        defaultItemsPerPage: 5,
      }}
      searchPlaceholder="Buscar atividades..."
    >
      {({ controls, table, pagination }) => (
        <>
          {/* Actions Bar - Responsive layout */}
          <div className="flex flex-col md:flex-row w-full items-stretch md:items-center md:justify-between gap-4 mb-4">
            {/* Left side - Action button */}
            <button
              onClick={handleCreateActivity}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Criar Atividade
            </button>

            {/* Right side - Filter and Search Controls */}
            {controls}
          </div>

          {/* Content - Inside white card */}
          <div className="w-full bg-white rounded-xl p-6 space-y-4 shadow-sm">
            {table}
            {pagination}
          </div>
        </>
      )}
    </TableProvider>
  );
};

/**
 * Server-side sorting + a filter dropdown inside a column header.
 *
 * The "Escola" and "% de acesso" columns sort; "Status" both sorts (by the
 * ranking behind the label) and filters, through the caret in its header.
 * Sorting/filtering only report the change through `onParamsChange` — the API
 * is what actually reorders and filters. Watch the query string: it carries
 * `schools_sortBy`, `schools_sortOrder` and `schools_colfilter_statusFilter`.
 */
interface School extends Record<string, unknown> {
  schoolId: string;
  schoolName: string;
  municipalityName: string;
  status: 'DESTAQUE' | 'ACIMA_DA_MEDIA' | 'PONTO_DE_ATENCAO' | 'SEM_ACESSO';
  accessPercentage: number;
}

const mockSchools: School[] = [
  {
    schoolId: '1',
    schoolName: 'Alberto Santos Dumont',
    municipalityName: 'APUCARANA',
    status: 'PONTO_DE_ATENCAO',
    accessPercentage: 11,
  },
  {
    schoolId: '2',
    schoolName: 'Carlos Massaretto',
    municipalityName: 'APUCARANA',
    status: 'DESTAQUE',
    accessPercentage: 85,
  },
  {
    schoolId: '3',
    schoolName: 'Jose Canale',
    municipalityName: 'CURITIBA',
    status: 'ACIMA_DA_MEDIA',
    accessPercentage: 67,
  },
  {
    schoolId: '4',
    schoolName: 'Nilo Cairo',
    municipalityName: 'LONDRINA',
    status: 'SEM_ACESSO',
    accessPercentage: 0,
  },
];

const STATUS_LABELS: Record<School['status'], string> = {
  DESTAQUE: 'DESTAQUE',
  ACIMA_DA_MEDIA: 'ACIMA DA MÉDIA',
  PONTO_DE_ATENCAO: 'PONTO DE ATENÇÃO',
  SEM_ACESSO: 'SEM ACESSO',
};

export const ServerSortWithHeaderFilter: Story = () => {
  const schoolColumns: ColumnConfig<School>[] = [
    { key: 'schoolName', label: 'Escola' },
    { key: 'municipalityName', label: 'Município' },
    {
      key: 'status',
      label: 'Status',
      filter: {
        paramKey: 'statusFilter',
        allLabel: 'Todos os status',
        options: (Object.keys(STATUS_LABELS) as School['status'][]).map(
          (value) => ({ value, label: STATUS_LABELS[value] })
        ),
      },
      render: (_value, row) => (
        <Badge variant="solid" action="info">
          {STATUS_LABELS[row.status]}
        </Badge>
      ),
    },
    {
      key: 'accessPercentage',
      label: '% de acesso por período',
      render: (_value, row) => (
        <div className="flex flex-col gap-1">
          <span>{row.accessPercentage}%</span>
          <ProgressBar value={row.accessPercentage} />
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <TableProvider<School>
        data={mockSchools}
        headers={schoolColumns}
        tableId="schools"
        enableTableSort
        sortMode="server"
        sortableColumns="all"
        enablePagination
        paginationConfig={{
          itemLabel: 'escolas',
          totalItems: 4,
          totalPages: 1,
        }}
        onParamsChange={(params) => console.log('params →', params)}
      />
    </div>
  );
};
