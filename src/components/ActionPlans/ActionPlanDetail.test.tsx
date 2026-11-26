import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ActionPlanDetail,
  type ActionPlanDetailProps,
} from './ActionPlanDetail';
import useToastStore from '../Toast/utils/ToastStore';
import {
  apiError,
  fakeApi,
  fullPlan,
  historyEvent,
} from '../../testing/actionPlanDoubles';
import type { ActionPlan } from '../../types/actionPlans';

const HISTORY = [
  historyEvent(),
  historyEvent({
    id: 'event-2',
    type: 'STATUS_CHANGED',
    fromValue: 'NOT_STARTED',
    toValue: 'IN_PROGRESS',
    comment: 'Início das atividades',
    createdAt: '2026-05-02T12:00:00.000Z',
  }),
];

const ASSIGNEES = [
  { userInstitutionId: 'ui-teacher', name: 'Ana Souza', profile: 'TEACHER' },
  { userInstitutionId: 'ui-other', name: 'Bia Lima', profile: 'TEACHER' },
];

const setup = (
  plan: Partial<ActionPlan> = {},
  props: Partial<ActionPlanDetailProps> = {}
) => {
  const api = fakeApi({
    '/action-plans/plan-1': fullPlan(plan),
    '/action-plans/plan-1/history': HISTORY,
    '/action-plans/assignees': ASSIGNEES,
  });
  const handlers = { onBack: jest.fn(), onOpenOrigin: jest.fn() };
  render(
    <ActionPlanDetail
      apiClient={api}
      planId="plan-1"
      userInstitutionId="ui-teacher"
      isManager={false}
      {...handlers}
      {...props}
    />
  );
  return { api, ...handlers };
};

describe('ActionPlanDetail', () => {
  beforeAll(() => {
    // jsdom has no layout; the responsible picker scrolls its highlighted option
    Element.prototype.scrollIntoView = jest.fn();
  });

  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  it('shows the plan, its origin and its history, newest first', async () => {
    setup({ late: true, status: 'IN_PROGRESS' });

    expect(
      await screen.findByRole('heading', { name: 'Melhorar os simulados' })
    ).toBeInTheDocument();
    expect(screen.getByText('Em andamento')).toBeInTheDocument();
    expect(
      screen.getByText('Revisar os simulados com as turmas')
    ).toBeInTheDocument();
    expect(screen.getByText('12/05/2026')).toBeInTheDocument();
    expect(screen.getByText('Atrasado')).toBeInTheDocument();
    expect(screen.getByText('Ana Souza')).toBeInTheDocument();
    expect(screen.getByText('Carlos Silva')).toBeInTheDocument();
    expect(
      screen.getByText('Escola Estadual João da Silva')
    ).toBeInTheDocument();
    expect(screen.getByText('Simulados')).toBeInTheDocument();
    expect(
      screen.getByText('Período do último ano, Todas as turmas')
    ).toBeInTheDocument();

    const entries = screen.getAllByRole('listitem');
    expect(entries[0]).toHaveTextContent(
      "Carlos Silva alterou o status de 'Não iniciado' para 'Em andamento'"
    );
    expect(entries[0]).toHaveTextContent('Comentário: Início das atividades');
    expect(entries[1]).toHaveTextContent('Carlos Silva criou este plano');
  });

  it('goes back and opens the origin', async () => {
    const { onBack, onOpenOrigin } = setup();
    await screen.findByText('Sobre o plano');

    await userEvent.click(screen.getByRole('button', { name: 'Ver origem' }));
    await userEvent.click(
      screen.getByRole('button', { name: 'Voltar para os planos de ação' })
    );

    expect(onOpenOrigin).toHaveBeenCalledWith(
      '/relatorios?relatorio=simulados'
    );
    expect(onBack).toHaveBeenCalled();
  });

  it('says when the plan does not exist or fails to load', async () => {
    const api = fakeApi({});
    api.get.mockRejectedValueOnce(apiError(404));
    const { unmount } = render(
      <ActionPlanDetail
        apiClient={api}
        planId="plan-1"
        userInstitutionId="ui-teacher"
        isManager={false}
        onBack={jest.fn()}
      />
    );
    expect(
      await screen.findByText('Plano de ação não encontrado.')
    ).toBeInTheDocument();
    unmount();

    api.get.mockRejectedValueOnce(apiError(500));
    render(
      <ActionPlanDetail
        apiClient={api}
        planId="plan-1"
        userInstitutionId="ui-teacher"
        isManager={false}
        onBack={jest.fn()}
      />
    );
    expect(
      await screen.findByText('Não foi possível carregar o plano de ação.')
    ).toBeInTheDocument();
  });

  it('changes the status with the reason, then refreshes the history', async () => {
    const { api } = setup();
    api.patch.mockResolvedValueOnce({
      data: { message: 'ok', data: fullPlan({ status: 'DONE' }) },
    });
    await userEvent.click(
      await screen.findByRole('button', { name: 'Editar status' })
    );

    fireEvent.click(screen.getByRole('combobox', { name: /Status/ }));
    expect(
      screen.queryByRole('option', { name: 'Cancelado' })
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('option', { name: 'Concluído' }));
    await userEvent.type(
      screen.getByPlaceholderText('Insira o motivo da alteração'),
      'Revisão feita'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(api.patch).toHaveBeenCalledWith('/action-plans/plan-1/status', {
      status: 'DONE',
      comment: 'Revisão feita',
    });
    expect(await screen.findByText('Concluído')).toBeInTheDocument();
    await waitFor(() =>
      expect(
        api.get.mock.calls.filter(
          ([url]) => url === '/action-plans/plan-1/history'
        )
      ).toHaveLength(2)
    );
    expect(useToastStore.getState().toasts[0]).toEqual(
      expect.objectContaining({ title: 'Status alterado' })
    );
  });

  it('offers "Cancelado" to the creator only', async () => {
    setup({}, { userInstitutionId: 'ui-manager', isManager: true });
    await userEvent.click(
      await screen.findByRole('button', { name: 'Editar status' })
    );

    fireEvent.click(screen.getByRole('combobox', { name: /Status/ }));

    expect(
      screen.getByRole('option', { name: 'Cancelado' })
    ).toBeInTheDocument();
  });

  it('leaves the status of a canceled plan to its creator', async () => {
    setup({ status: 'CANCELED' });

    await screen.findByText('Sobre o plano');

    expect(
      screen.queryByRole('button', { name: 'Editar status' })
    ).not.toBeInTheDocument();
  });

  it('lets the managers of the school cancel a plan whose creator is gone', async () => {
    setup(
      { createdBy: null, status: 'CANCELED' },
      { userInstitutionId: 'ui-unit', isManager: true }
    );

    expect(
      await screen.findByRole('button', { name: 'Editar status' })
    ).toBeInTheDocument();
    expect(screen.getAllByText('Usuário removido')).toHaveLength(1);
  });

  it('keeps the modal open and tells why a status change failed', async () => {
    const { api } = setup();
    api.patch.mockRejectedValueOnce(
      apiError(400, 'Plano de ação não encontrado')
    );
    await userEvent.click(
      await screen.findByRole('button', { name: 'Editar status' })
    );
    fireEvent.click(screen.getByRole('combobox', { name: /Status/ }));
    fireEvent.click(screen.getByRole('option', { name: 'Em andamento' }));
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(useToastStore.getState().toasts[0]).toEqual(
        expect.objectContaining({
          title: 'Não foi possível alterar o status',
          description: 'Plano de ação não encontrado',
        })
      )
    );
    expect(screen.getByText('Editar status')).toBeInTheDocument();
  });

  it('closes the status modal without a request when nothing changed', async () => {
    const { api } = setup();
    await userEvent.click(
      await screen.findByRole('button', { name: 'Editar status' })
    );

    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(api.patch).not.toHaveBeenCalled();
    expect(screen.queryByText('Editar status')).not.toBeInTheDocument();
  });

  it('edits only the fields that changed, without the responsible for a teacher', async () => {
    const { api } = setup();
    await userEvent.click(
      await screen.findByRole('button', { name: 'Editar plano de ação' })
    );

    expect(screen.queryByText('Responsável', { selector: 'label' })).toBeNull();
    const title = screen.getByTestId('action-plan-title-input');
    await userEvent.clear(title);
    await userEvent.type(title, 'Simulados com as turmas');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(api.patch).toHaveBeenCalledTimes(1);
    expect(api.patch).toHaveBeenCalledWith('/action-plans/plan-1', {
      title: 'Simulados com as turmas',
    });
    await waitFor(() =>
      expect(
        screen.queryByText('Editar plano de ação', { selector: 'h2' })
      ).not.toBeInTheDocument()
    );
  });

  it('lets a manager hand the plan to someone else from the form', async () => {
    const { api } = setup(
      {},
      { userInstitutionId: 'ui-manager', isManager: true }
    );
    await userEvent.click(
      await screen.findByRole('button', { name: 'Editar plano de ação' })
    );

    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith('/action-plans/assignees', {
        params: { schoolId: 'school-a' },
      })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Responsável' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Bia Lima' }));
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(api.patch).toHaveBeenCalledTimes(1);
    expect(api.patch).toHaveBeenCalledWith('/action-plans/plan-1/responsible', {
      responsibleUserInstitutionId: 'ui-other',
    });
  });

  it('refuses an empty title and a deadline before today', async () => {
    const { api } = setup();
    await userEvent.click(
      await screen.findByRole('button', { name: 'Editar plano de ação' })
    );

    await userEvent.clear(screen.getByTestId('action-plan-title-input'));
    fireEvent.change(screen.getByTestId('action-plan-deadline-input'), {
      target: { value: '2020-01-01' },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(screen.getByText('Informe o título do plano')).toBeInTheDocument();
    expect(
      screen.getByText('O prazo não pode ser antes de hoje')
    ).toBeInTheDocument();
    expect(api.patch).not.toHaveBeenCalled();
  });
});
