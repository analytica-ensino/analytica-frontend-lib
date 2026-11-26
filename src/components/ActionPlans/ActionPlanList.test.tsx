import '@testing-library/jest-dom';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActionPlanList, type ActionPlanListProps } from './ActionPlanList';
import { addDays, todayInSaoPaulo } from './actionPlans.utils';
import useToastStore from '../Toast/utils/ToastStore';
import { apiError, fakeApi, summary } from '../../testing/actionPlanDoubles';
import type { CategoryConfig } from '../CheckBoxGroup/CheckBoxGroup';

// The real group pulls the whole lib barrel; this one lists each category and
// narrows it to its first option on demand.
jest.mock('../CheckBoxGroup/CheckBoxGroup', () => ({
  CheckboxGroup: ({
    categories,
    onCategoriesChange,
  }: {
    categories: CategoryConfig[];
    onCategoriesChange: (categories: CategoryConfig[]) => void;
  }) => (
    <div>
      {categories.map((category) => (
        <button
          key={category.key}
          type="button"
          onClick={() =>
            onCategoriesChange(
              categories.map((other) =>
                other.key === category.key
                  ? { ...other, selectedIds: [other.itens?.[0]?.id ?? ''] }
                  : other
              )
            )
          }
        >
          Só o primeiro de {category.label}
        </button>
      ))}
    </div>
  ),
}));

const PAGE = (items = [summary()]) => ({
  items,
  pagination: {
    page: 1,
    limit: 10,
    total: items.length,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
});

const OPTIONS = {
  schools: [{ id: 'school-a', name: 'Escola A' }],
  responsibles: [{ userInstitutionId: 'ui-teacher', name: 'Ana Souza' }],
};

const setup = (
  props: Partial<ActionPlanListProps> = {},
  items = [summary()]
) => {
  const api = fakeApi({
    '/action-plans': PAGE(items),
    '/action-plans/filter-options': OPTIONS,
  });
  const handlers = {
    onTabChange: jest.fn(),
    onOpenPlan: jest.fn(),
  };
  const view = render(
    <ActionPlanList
      apiClient={api}
      isManager={false}
      tab="responsible"
      {...handlers}
      {...props}
    />
  );
  const listCalls = () =>
    api.get.mock.calls
      .filter(([url]) => url === '/action-plans')
      .map(([, config]) => config?.params);
  return { api, view, listCalls, ...handlers };
};

describe('ActionPlanList', () => {
  beforeEach(() => {
    globalThis.history.replaceState({}, '', '/planos-de-acao');
    useToastStore.setState({ toasts: [] });
  });

  it('lists the plans of the tab, by deadline', async () => {
    const { listCalls } = setup({}, [
      summary({ late: true, status: 'IN_PROGRESS' }),
    ]);

    const row = (await screen.findByText('Melhorar os simulados')).closest(
      'tr'
    ) as HTMLElement;

    expect(listCalls()[0]).toEqual({
      page: 1,
      limit: 10,
      tab: 'responsible',
      sortBy: 'deadline',
      sortOrder: 'asc',
    });
    expect(within(row).getByText('12/05')).toBeInTheDocument();
    expect(within(row).getByText('Atrasado')).toBeInTheDocument();
    expect(
      within(row).getByText('Escola Estadual João da Silva')
    ).toBeInTheDocument();
    expect(within(row).getByText('Ana Souza')).toBeInTheDocument();
    expect(within(row).getByText('Em andamento')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Cancelar o plano/ })
    ).not.toBeInTheDocument();
  });

  it('opens a plan from its row', async () => {
    const { onOpenPlan } = setup();

    await userEvent.click(await screen.findByText('Melhorar os simulados'));

    expect(onOpenPlan).toHaveBeenCalledWith('plan-1');
  });

  it('asks the host to change the tab, and fetches the one it gets', async () => {
    const { view, listCalls, onTabChange, api } = setup();
    await screen.findByText('Melhorar os simulados');

    await userEvent.click(screen.getByText('Criados por mim'));
    expect(onTabChange).toHaveBeenCalledWith('created');

    view.rerender(
      <ActionPlanList
        apiClient={api}
        isManager={false}
        tab="created"
        onTabChange={onTabChange}
        onOpenPlan={jest.fn()}
      />
    );

    await waitFor(() =>
      expect(listCalls().at(-1)).toEqual(
        expect.objectContaining({ page: 1, tab: 'created' })
      )
    );
    expect(api.get).toHaveBeenCalledWith('/action-plans/filter-options', {
      params: { tab: 'created' },
    });
  });

  it('cancels a plan of "Criados por mim" without opening it', async () => {
    const { api, onOpenPlan, listCalls } = setup({ tab: 'created' });

    await userEvent.click(
      await screen.findByRole('button', {
        name: 'Cancelar o plano Melhorar os simulados',
      })
    );

    expect(api.patch).toHaveBeenCalledWith('/action-plans/plan-1/status', {
      status: 'CANCELED',
    });
    expect(onOpenPlan).not.toHaveBeenCalled();
    await waitFor(() => expect(listCalls()).toHaveLength(2));
    expect(useToastStore.getState().toasts[0]).toEqual(
      expect.objectContaining({ title: 'Plano cancelado', action: 'success' })
    );
  });

  it('reactivates a canceled plan as not started', async () => {
    const { api } = setup({ tab: 'created' }, [
      summary({ status: 'CANCELED' }),
    ]);

    await userEvent.click(
      await screen.findByRole('button', {
        name: 'Ativar o plano Melhorar os simulados',
      })
    );

    expect(api.patch).toHaveBeenCalledWith('/action-plans/plan-1/status', {
      status: 'NOT_STARTED',
    });
  });

  it("tells why a cancel was refused, in the backend's words", async () => {
    const { api } = setup({ tab: 'created' });
    api.patch.mockRejectedValueOnce(
      apiError(400, 'Só quem criou o plano pode cancelá-lo')
    );

    await userEvent.click(
      await screen.findByRole('button', {
        name: 'Cancelar o plano Melhorar os simulados',
      })
    );

    await waitFor(() =>
      expect(useToastStore.getState().toasts[0]).toEqual(
        expect.objectContaining({
          title: 'Não foi possível cancelar o plano',
          description: 'Só quem criou o plano pode cancelá-lo',
        })
      )
    );
  });

  it('shows the empty state of each tab, with the assistant only when given', async () => {
    const onCreateWithAssistant = jest.fn();
    const { view, api } = setup({}, []);

    expect(
      await screen.findByText('Você ainda não tem planos de ação')
    ).toBeInTheDocument();
    expect(screen.queryByText('Criar plano com IA')).not.toBeInTheDocument();

    view.rerender(
      <ActionPlanList
        apiClient={api}
        isManager={false}
        tab="created"
        onTabChange={jest.fn()}
        onOpenPlan={jest.fn()}
        onCreateWithAssistant={onCreateWithAssistant}
      />
    );

    expect(
      await screen.findByText('Comece um plano de ação')
    ).toBeInTheDocument();
    const buttons = screen.getAllByRole('button', {
      name: /Criar plano com IA/,
    });
    await userEvent.click(buttons[0]);
    expect(onCreateWithAssistant).toHaveBeenCalled();
  });

  it('applies the filters from page 1 and counts them on the button', async () => {
    const { listCalls } = setup();
    await screen.findByText('Melhorar os simulados');

    await userEvent.click(screen.getByRole('button', { name: /Filtros/ }));
    await userEvent.click(screen.getByText('Só o primeiro de Status'));
    await userEvent.click(screen.getByText('Próximos 7 dias'));
    await userEvent.click(screen.getByRole('switch'));
    await userEvent.click(screen.getByText('Aplicar'));

    const today = todayInSaoPaulo();
    await waitFor(() =>
      expect(listCalls().at(-1)).toEqual({
        page: 1,
        limit: 10,
        tab: 'responsible',
        sortBy: 'deadline',
        sortOrder: 'asc',
        status: ['NOT_STARTED'],
        deadlineFrom: today,
        deadlineTo: addDays(today, 7),
        late: 'true',
      })
    );
    expect(screen.getByRole('button', { name: /Filtros/ })).toHaveTextContent(
      '3'
    );
  });

  it('offers the responsible filter to managers only', async () => {
    const { view, api } = setup();
    await screen.findByText('Melhorar os simulados');
    await userEvent.click(screen.getByRole('button', { name: /Filtros/ }));
    expect(
      screen.queryByText('Só o primeiro de Responsável')
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Fechar modal'));

    view.rerender(
      <ActionPlanList
        apiClient={api}
        isManager
        tab="responsible"
        onTabChange={jest.fn()}
        onOpenPlan={jest.fn()}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: /Filtros/ }));

    expect(
      screen.getByText('Só o primeiro de Responsável')
    ).toBeInTheDocument();
  });

  it('says when the list fails, and tries again', async () => {
    let calls = 0;
    const api = fakeApi({
      '/action-plans': () => {
        calls += 1;
        if (calls === 1) throw apiError(500);
        return PAGE();
      },
      '/action-plans/filter-options': OPTIONS,
    });
    render(
      <ActionPlanList
        apiClient={api}
        isManager={false}
        tab="responsible"
        onTabChange={jest.fn()}
        onOpenPlan={jest.fn()}
      />
    );

    expect(
      await screen.findByText('Não foi possível carregar os planos de ação.')
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Tentar novamente' })
    );

    expect(
      await screen.findByText('Melhorar os simulados')
    ).toBeInTheDocument();
  });
});
