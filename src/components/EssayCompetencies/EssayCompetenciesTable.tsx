import { useState, useCallback, useEffect, useMemo } from 'react';
import { TableProvider } from '../TableProvider';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';
import { useEssayCompetenciesOverview } from './useEssayCompetenciesOverview';
import { EssayCompetenceDetailsModal } from './EssayCompetenceDetailsModal';
import type {
  EssayCompetenciesTableProps,
  EssayCompetencyOverviewItem,
} from './types';

/**
 * Proficiency cell component with progress bar
 */
function ProficiencyCell({ percentage }: { readonly percentage: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <Text size="sm" className="min-w-[40px] text-right text-text-950">
        {Math.round(percentage)}%
      </Text>
      <div className="w-16 h-2 bg-background-100 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full',
            percentage >= 70
              ? 'bg-success-500'
              : percentage >= 50
                ? 'bg-warning-500'
                : 'bg-error-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Table columns configuration
 */
const TABLE_COLUMNS = [
  {
    key: 'name',
    label: 'Competência',
    sortable: true,
    className: 'py-3 px-4 text-start',
    render: (_value: unknown, row: Record<string, unknown>, _index: number) => {
      const item = row as unknown as EssayCompetencyOverviewItem;
      return `C${item.competencyNumber} - ${item.name}`;
    },
  },
  {
    key: 'essaysCount',
    label: 'Redações',
    sortable: true,
    className: 'py-3 px-4 text-center',
    align: 'center' as const,
    width: '100px',
  },
  {
    key: 'studentsCount',
    label: 'Estudantes',
    sortable: true,
    className: 'py-3 px-4 text-center',
    align: 'center' as const,
    width: '100px',
  },
  {
    key: 'averagePercentage',
    label: 'Proficiência',
    sortable: true,
    className: 'py-3 px-4 text-center',
    align: 'center' as const,
    width: '160px',
    render: (_value: unknown, row: Record<string, unknown>, _index: number) => {
      const item = row as unknown as EssayCompetencyOverviewItem;
      return <ProficiencyCell percentage={item.averagePercentage} />;
    },
  },
];

/**
 * Table showing the 5 ENEM essay competencies with stats
 * Clicking on a competency opens the EssayCompetenceDetailsModal
 */
export function EssayCompetenciesTable({
  api,
  period,
  schoolIds,
  schoolYearIds,
  classIds,
}: EssayCompetenciesTableProps) {
  const { data, loading, fetchOverview } = useEssayCompetenciesOverview(api);
  const [selectedCompetence, setSelectedCompetence] = useState<{
    number: number;
    name: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch data when filters change
  useEffect(() => {
    fetchOverview({
      period,
      schoolIds,
      schoolYearIds,
      classIds,
    });
  }, [period, schoolIds, schoolYearIds, classIds, fetchOverview]);

  const handleRowClick = useCallback(
    (row: Record<string, unknown>, _index: number) => {
      const item = row as unknown as EssayCompetencyOverviewItem;
      setSelectedCompetence({
        number: item.competencyNumber,
        name: item.name,
      });
      setIsModalOpen(true);
    },
    []
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedCompetence(null);
  }, []);

  const competencies = useMemo(() => data?.competencies ?? [], [data]);

  return (
    <>
      <TableProvider
        data={competencies as unknown as Record<string, unknown>[]}
        headers={TABLE_COLUMNS}
        variant="borderless"
        loading={loading}
        enableSearch
        enableTableSort
        enablePagination
        enableRowClick
        onRowClick={handleRowClick}
        rowKey="competencyNumber"
        paginationConfig={{
          itemLabel: 'competências',
          itemsPerPageOptions: [5],
          defaultItemsPerPage: 5,
          totalItems: competencies.length,
        }}
        searchPlaceholder="Buscar"
        headerContent={
          <Text as="h3" size="lg" weight="bold" className="text-text-950">
            Proficiência por competência
          </Text>
        }
      />

      {/* Competence Details Modal */}
      <EssayCompetenceDetailsModal
        api={api}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        competenceNumber={selectedCompetence?.number ?? null}
        competenceName={selectedCompetence?.name}
        period={period}
        schoolIds={schoolIds}
        schoolYearIds={schoolYearIds}
        classIds={classIds}
      />
    </>
  );
}
