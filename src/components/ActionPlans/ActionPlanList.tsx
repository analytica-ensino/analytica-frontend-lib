import { useCallback, useMemo, useState, type MouseEvent } from 'react';
import { FunnelIcon } from '@phosphor-icons/react/dist/csr/Funnel';
import { SparkleIcon } from '@phosphor-icons/react/dist/csr/Sparkle';
import Text from '../Text/Text';
import Button from '../Button/Button';
import EmptyState from '../EmptyState/EmptyState';
import { Menu, MenuContent, MenuItem } from '../Menu/Menu';
import {
  TableProvider,
  type ColumnConfig,
  type TableComponents,
  type TableParams,
} from '../TableProvider/TableProvider';
import { TableHeaderRow } from '../shared/TableHeaderRow';
import useToastStore from '../Toast/utils/ToastStore';
import { getApiErrorMessage } from '../../utils/apiErrorMessage';
import { cn } from '../../utils/utils';
import type { BaseApiClient } from '../../types/api';
import {
  ACTION_PLAN_LIST_TAB,
  ACTION_PLAN_SORT,
  ACTION_PLAN_STATUS,
  type ActionPlanListTab,
  type ActionPlanStatus,
  type ActionPlanSummary,
} from '../../types/actionPlans';
import {
  countActiveFilters,
  EMPTY_ACTION_PLAN_FILTERS,
  filtersToParams,
  formatShortDate,
  todayInSaoPaulo,
  type ActionPlanFilters,
} from './actionPlans.utils';
import { ActionPlanLateBadge, ActionPlanStatusBadge } from './ActionPlanBadges';
import { ActionPlanFiltersModal } from './ActionPlanFiltersModal';
import {
  changeActionPlanStatus,
  useActionPlanFilterOptions,
  useActionPlanList,
} from './useActionPlans';

export interface ActionPlanListProps {
  /** The host's API client */
  apiClient: BaseApiClient;
  /** Managers filter by responsible and sort by it */
  isManager: boolean;
  /**
   * The tab shown, kept by the host (in the URL), so coming back from a plan
   * lands on the tab it was opened from.
   */
  tab: ActionPlanListTab;
  onTabChange: (tab: ActionPlanListTab) => void;
  /** Opens a plan's detail */
  onOpenPlan: (planId: string) => void;
  /** "Criar plano com IA". Without it, the button is not shown. */
  onCreateWithAssistant?: () => void;
  /** Illustration of the empty tabs */
  emptyStateImage?: string;
  /** Illustration of a search without results */
  noSearchImage?: string;
  className?: string;
}

/** A plan as the table shows it. */
type ActionPlanRow = {
  id: string;
  title: string;
  deadline: string;
  late: boolean;
  school: string;
  responsible: string;
  status: ActionPlanStatus;
};

const toRow = (plan: ActionPlanSummary): ActionPlanRow => ({
  id: plan.id,
  title: plan.title,
  deadline: plan.deadline,
  late: plan.late,
  school: plan.school.name,
  responsible: plan.responsible?.name ?? '—',
  status: plan.status,
});

const EMPTY_STATES: Record<
  ActionPlanListTab,
  { title: string; description: string }
> = {
  [ACTION_PLAN_LIST_TAB.RESPONSIBLE]: {
    title: 'Você ainda não tem planos de ação',
    description:
      'Quando um plano for atribuído a você, ele aparecerá aqui. Que tal criar o primeiro com base nas evidências dos relatórios?',
  },
  [ACTION_PLAN_LIST_TAB.CREATED]: {
    title: 'Comece um plano de ação',
    description:
      'Crie um plano usando dados dos relatórios para definir prioridades e ações para o aprendizado dos estudantes',
  },
};

/**
 * "Planos de ação" of the teacher and the manager (AE-3366): the plans they
 * are responsible for or created, filtered by status, school, responsible
 * (managers), deadline and lateness, searched by title and sorted by column.
 * On "Criados por mim" each plan can be canceled, or reactivated once
 * canceled. A plan opens in its detail.
 */
export const ActionPlanList = ({
  apiClient,
  isManager,
  tab,
  onTabChange,
  onOpenPlan,
  onCreateWithAssistant,
  emptyStateImage,
  noSearchImage,
  className,
}: Readonly<ActionPlanListProps>) => {
  const addToast = useToastStore((state) => state.addToast);
  const list = useActionPlanList(apiClient);
  const options = useActionPlanFilterOptions(apiClient, tab);
  const [filters, setFilters] = useState<ActionPlanFilters>(
    EMPTY_ACTION_PLAN_FILTERS
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  // Another tab holds other schools and people: its filters start over. Reset
  // while rendering, so the new tab is fetched once, already without them.
  const [filtersTab, setFiltersTab] = useState(tab);
  if (filtersTab !== tab) {
    setFiltersTab(tab);
    setFilters(EMPTY_ACTION_PLAN_FILTERS);
  }

  const today = todayInSaoPaulo();
  const externalParams = useMemo(
    () => ({ tab, ...filtersToParams(filters, today) }),
    [tab, filters, today]
  );
  const activeFilters = countActiveFilters(filters);

  const { fetchPage, reload } = list;
  const handleParamsChange = useCallback(
    (params: TableParams) => {
      fetchPage(params as unknown as Record<string, unknown>);
    },
    [fetchPage]
  );

  const toggleCancellation = useCallback(
    async (row: ActionPlanRow, event: MouseEvent) => {
      event.stopPropagation();
      if (pendingId) return;
      const canceling = row.status !== ACTION_PLAN_STATUS.CANCELED;
      setPendingId(row.id);
      try {
        await changeActionPlanStatus(
          apiClient,
          row.id,
          canceling
            ? ACTION_PLAN_STATUS.CANCELED
            : ACTION_PLAN_STATUS.NOT_STARTED
        );
        addToast({
          title: canceling ? 'Plano cancelado' : 'Plano reativado',
          action: 'success',
        });
        await reload();
      } catch (error) {
        addToast({
          title: canceling
            ? 'Não foi possível cancelar o plano'
            : 'Não foi possível reativar o plano',
          description: getApiErrorMessage(error),
          action: 'warning',
        });
      } finally {
        setPendingId(null);
      }
    },
    [apiClient, addToast, pendingId, reload]
  );

  const headers = useMemo((): ColumnConfig<ActionPlanRow>[] => {
    const columns: ColumnConfig<ActionPlanRow>[] = [
      {
        key: ACTION_PLAN_SORT.DEADLINE,
        label: 'Prazo',
        sortable: true,
        width: '140px',
        render: (_, row) => (
          <span className="flex items-center gap-2 whitespace-nowrap">
            {formatShortDate(row.deadline)}
            {row.late && <ActionPlanLateBadge />}
          </span>
        ),
      },
      {
        key: 'title',
        label: 'Título',
        render: (_, row) => (
          <span className="line-clamp-2 break-words">{row.title}</span>
        ),
      },
      { key: ACTION_PLAN_SORT.SCHOOL, label: 'Escola', sortable: true },
      {
        key: ACTION_PLAN_SORT.RESPONSIBLE,
        label: 'Responsável',
        sortable: isManager,
      },
      {
        key: ACTION_PLAN_SORT.STATUS,
        label: 'Status',
        sortable: true,
        render: (_, row) => <ActionPlanStatusBadge status={row.status} />,
      },
    ];
    if (tab === ACTION_PLAN_LIST_TAB.CREATED) {
      columns.push({
        key: 'actions',
        label: '',
        align: 'right',
        render: (_, row) => {
          const canceled = row.status === ACTION_PLAN_STATUS.CANCELED;
          return (
            <Button
              variant="outline"
              size="small"
              action={canceled ? 'primary' : 'negative'}
              disabled={pendingId === row.id}
              aria-label={`${canceled ? 'Ativar' : 'Cancelar'} o plano ${row.title}`}
              onClick={(event) => toggleCancellation(row, event)}
            >
              {canceled ? 'Ativar' : 'Cancelar'}
            </Button>
          );
        },
      });
    }
    return columns;
  }, [isManager, tab, pendingId, toggleCancellation]);

  const emptyState = activeFilters
    ? {
        title: 'Nenhum plano encontrado',
        description: 'Ajuste os filtros para ver outros planos.',
        buttonText: 'Limpar filtros',
        buttonVariant: 'outline' as const,
        onButtonClick: () => setFilters(EMPTY_ACTION_PLAN_FILTERS),
      }
    : {
        component: (
          <EmptyState
            image={emptyStateImage}
            title={EMPTY_STATES[tab].title}
            description={EMPTY_STATES[tab].description}
            {...(onCreateWithAssistant && {
              buttonText: 'Criar plano com IA',
              buttonIcon: <SparkleIcon size={18} />,
              buttonVariant: 'outline' as const,
              buttonAction: 'primary' as const,
              onButtonClick: onCreateWithAssistant,
            })}
          />
        ),
      };

  const createButton = onCreateWithAssistant ? (
    <Button
      size="medium"
      iconLeft={<SparkleIcon size={18} weight="fill" />}
      onClick={onCreateWithAssistant}
    >
      Criar plano com IA
    </Button>
  ) : null;

  const filtersButton = (
    <Button
      variant="outline"
      size="medium"
      onClick={() => setFiltersOpen(true)}
    >
      <FunnelIcon size={20} />
      Filtros
      {activeFilters > 0 && (
        <span className="ml-2 rounded-full bg-primary-500 px-2 py-0.5 text-xs text-white">
          {activeFilters}
        </span>
      )}
    </Button>
  );

  return (
    <div
      className={cn('flex w-full flex-col gap-6', className)}
      data-testid="action-plan-list"
    >
      <div className="flex w-full flex-col items-start gap-0 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        <Text
          as="h1"
          weight="bold"
          className="text-xl leading-[28px] tracking-[0.2px] lg:text-2xl"
        >
          Planos de ação
        </Text>
        <div className="w-full lg:w-auto lg:shrink-0">
          <Menu
            defaultValue={ACTION_PLAN_LIST_TAB.RESPONSIBLE}
            value={tab}
            onValueChange={(value) => onTabChange(value as ActionPlanListTab)}
            variant="menu2"
            className="bg-transparent px-0 shadow-none"
          >
            <MenuContent
              variant="menu2"
              className="w-full min-w-0 max-w-full lg:w-auto"
            >
              <MenuItem
                variant="menu2"
                value={ACTION_PLAN_LIST_TAB.RESPONSIBLE}
                className="flex-1 whitespace-nowrap lg:flex-none"
              >
                Sou responsável
              </MenuItem>
              <MenuItem
                variant="menu2"
                value={ACTION_PLAN_LIST_TAB.CREATED}
                className="flex-1 whitespace-nowrap lg:flex-none"
              >
                Criados por mim
              </MenuItem>
            </MenuContent>
          </Menu>
        </div>
      </div>

      {list.error ? (
        <div className="flex flex-col items-center gap-4 rounded-xl bg-background p-10">
          <Text size="md" className="text-text-800">
            Não foi possível carregar os planos de ação.
          </Text>
          <Button variant="outline" size="small" onClick={() => reload()}>
            Tentar novamente
          </Button>
        </div>
      ) : (
        <TableProvider
          data={list.items.map(toRow)}
          headers={headers}
          loading={list.loading}
          variant="borderless"
          rowKey="id"
          enableSearch
          enableTableSort
          sortMode="server"
          defaultSort={{ sortBy: ACTION_PLAN_SORT.DEADLINE, sortOrder: 'asc' }}
          enablePagination
          enableRowClick
          externalParams={externalParams}
          searchPlaceholder="Buscar plano"
          caption="Planos de ação"
          paginationConfig={{
            itemLabel: 'planos',
            itemsPerPageOptions: [10, 20, 50],
            defaultItemsPerPage: 10,
            totalItems: list.pagination.total,
            totalPages: list.pagination.totalPages,
          }}
          emptyState={emptyState}
          noSearchResultState={{
            title: 'Nenhum plano encontrado',
            description: 'Tente buscar por outro título.',
            image: noSearchImage,
          }}
          onParamsChange={handleParamsChange}
          onRowClick={(row) => onOpenPlan(row.id)}
          getRowActionLabel={(row) => `Abrir o plano ${row.title}`}
        >
          {({ search, table, pagination }: TableComponents) => (
            <div className="flex flex-col gap-4">
              <TableHeaderRow
                action={createButton}
                filters={filtersButton}
                search={search}
              />
              <div className="flex flex-col gap-4 rounded-xl bg-background p-6">
                {table}
                {pagination}
              </div>
            </div>
          )}
        </TableProvider>
      )}

      {filtersOpen && (
        <ActionPlanFiltersModal
          filters={filters}
          options={options}
          showResponsible={isManager}
          onApply={(applied) => {
            setFilters(applied);
            setFiltersOpen(false);
          }}
          onClose={() => setFiltersOpen(false)}
        />
      )}
    </div>
  );
};

export default ActionPlanList;
