import { useCallback, useMemo, useState } from 'react';
import { UserCircleIcon } from '@phosphor-icons/react/dist/csr/UserCircle';
import { PageContainer } from '../PageContainer/PageContainer';
import Text from '../Text/Text';
import Button from '../Button/Button';
import { TableProvider } from '../TableProvider';
import type { ColumnConfig, TableParams } from '../TableProvider';
import type { FilterConfig } from '../Filter/useTableFilter';
import { useUserAccessData } from '../SimulatedFilters/hooks';
import type { BaseApiClient } from '../../types/api';
import { createUseSimulations } from '../../hooks/useSimulations';
import type { SimulationsStudentItem } from '../../types/simulations';
import { SimulationsDetailModal } from './SimulationsDetailModal';

export interface SimulationsPageProps {
  /** API client used to fetch students and simulations */
  readonly api: BaseApiClient;
  /** Image shown when a search returns no results */
  readonly noSearchImage?: string;
}

const DEFAULT_LIMIT = 10;

/**
 * Teacher-facing simulations page: a paginated list of students with how many
 * simulations each answered, plus a "Ver simulados" action that opens a nested
 * detail modal.
 */
export function SimulationsPage({ api, noSearchImage }: SimulationsPageProps) {
  const useSimulations = useMemo(() => createUseSimulations(api), [api]);
  const { fetchStudents } = useSimulations();
  const { classes } = useUserAccessData(api);

  const [students, setStudents] = useState<SimulationsStudentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<{
    userInstitutionId: string;
    name: string;
  } | null>(null);

  // Build a single-category "Turma" filter so the TableProvider's native filter
  // modal handles multi-selection. The category key is `classIds`, so the
  // selected ids surface in TableParams as `params.classIds`.
  const initialFilters = useMemo<FilterConfig[]>(
    () => [
      {
        key: 'turma',
        label: 'Turma',
        categories: [
          {
            key: 'classIds',
            label: 'Turma',
            selectedIds: [],
            itens: classes.map((c) => ({ id: c.id, name: c.name })),
          },
        ],
      },
    ],
    [classes]
  );

  const handleParamsChange = useCallback(
    (params: TableParams) => {
      const classIds = Array.isArray(params.classIds)
        ? (params.classIds as string[])
        : undefined;
      setLoading(true);
      fetchStudents({
        page: params.page,
        limit: params.limit,
        search: params.search?.trim() || undefined,
        classIds: classIds?.length ? classIds : undefined,
      })
        .then((result) => {
          setStudents(result.data);
          setTotal(result.total);
        })
        .catch(() => {
          setStudents([]);
          setTotal(0);
        })
        .finally(() => setLoading(false));
    },
    [fetchStudents]
  );

  const columns = useMemo<ColumnConfig<SimulationsStudentItem>[]>(
    () => [
      {
        key: 'name',
        label: 'Estudante',
        render: (_value, row) => (
          <span className="flex items-center gap-2">
            <UserCircleIcon size={24} weight="fill" className="text-info-700" />
            <Text size="sm" className="text-text-950">
              {row.name}
            </Text>
          </span>
        ),
      },
      {
        key: 'class',
        label: 'Turma',
        render: (_value, row) => (
          <Text size="sm" className="text-text-900">
            {row.class ?? '-'}
          </Text>
        ),
      },
      {
        key: 'simulationsCount',
        label: 'Simulados',
        render: (_value, row) => (
          <Text size="sm" className="text-text-900">
            {row.simulationsCount}
          </Text>
        ),
      },
      {
        key: 'actions',
        label: '',
        render: (_value, row) => (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="small"
              onClick={() =>
                setSelected({
                  userInstitutionId: row.userInstitutionId,
                  name: row.name,
                })
              }
            >
              Ver simulados
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <PageContainer innerClassName="max-w-[1150px]">
      <div className="mb-4 flex flex-col gap-1">
        <Text size="2xl" weight="bold" className="text-text-950">
          Simulados
        </Text>
        <Text size="sm" className="text-text-600">
          Veja o resultado de todos os simulados realizados por cada estudante
        </Text>
      </div>

      <TableProvider<SimulationsStudentItem>
        data={students}
        headers={columns}
        loading={loading}
        variant="borderless"
        enableSearch
        enableFilters
        enablePagination
        initialFilters={initialFilters}
        rowKey="userInstitutionId"
        searchPlaceholder="Buscar estudante"
        onParamsChange={handleParamsChange}
        paginationConfig={{
          itemLabel: 'estudantes',
          itemsPerPageOptions: [10, 20, 50],
          defaultItemsPerPage: DEFAULT_LIMIT,
          totalItems: total,
        }}
        noSearchResultState={{ image: noSearchImage }}
      />

      <SimulationsDetailModal
        api={api}
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
        student={selected}
      />
    </PageContainer>
  );
}
