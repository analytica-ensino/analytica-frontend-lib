import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActionPlanFormModal } from './ActionPlanFormModal';
import { addDays, todayInSaoPaulo } from './actionPlans.utils';
import useToastStore from '../Toast/utils/ToastStore';
import { apiError, fakeApi, fullPlan } from '../../testing/actionPlanDoubles';

const ORIGIN = fullPlan().origin;

const ASSIGNEES = [
  { userInstitutionId: 'ui-teacher', name: 'Ana Souza', profile: 'TEACHER' },
];

describe('ActionPlanFormModal (create)', () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = jest.fn();
  });

  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  const fill = async (deadline: string) => {
    await userEvent.type(
      screen.getByTestId('action-plan-title-input'),
      'Reforçar frações'
    );
    await userEvent.type(
      screen.getByPlaceholderText('Insira a descrição do plano'),
      'Com o 6º ano'
    );
    fireEvent.change(screen.getByTestId('action-plan-deadline-input'), {
      target: { value: deadline },
    });
  };

  it('creates a teacher plan with its origin, the teacher as responsible', async () => {
    const api = fakeApi({});
    const onSaved = jest.fn();
    const deadline = addDays(todayInSaoPaulo(), 10);
    render(
      <ActionPlanFormModal
        mode="create"
        apiClient={api}
        isManager={false}
        origin={ORIGIN}
        onClose={jest.fn()}
        onSaved={onSaved}
      />
    );

    expect(
      screen.getByRole('heading', { name: 'Criar plano de ação' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Responsável' })
    ).not.toBeInTheDocument();
    await fill(deadline);
    await userEvent.click(screen.getByRole('button', { name: 'Criar plano' }));

    expect(api.post).toHaveBeenCalledWith('/action-plans', {
      title: 'Reforçar frações',
      description: 'Com o 6º ano',
      deadline,
      origin: ORIGIN,
    });
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(useToastStore.getState().toasts[0]).toEqual(
      expect.objectContaining({
        title: 'Plano de ação criado!',
        description: 'Acesse a área de planos de ação para visualizar',
      })
    );
  });

  it("creates a manager's plan for the school, with the responsible picked", async () => {
    const api = fakeApi({ '/action-plans/assignees': ASSIGNEES });
    const deadline = todayInSaoPaulo();
    render(
      <ActionPlanFormModal
        mode="create"
        apiClient={api}
        isManager
        origin={ORIGIN}
        schoolId="school-a"
        onClose={jest.fn()}
        onSaved={jest.fn()}
      />
    );

    await fill(deadline);
    fireEvent.click(screen.getByRole('button', { name: 'Responsável' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Ana Souza' }));
    await userEvent.click(screen.getByRole('button', { name: 'Criar plano' }));

    expect(api.post).toHaveBeenCalledWith('/action-plans', {
      title: 'Reforçar frações',
      description: 'Com o 6º ano',
      deadline,
      origin: ORIGIN,
      responsibleUserInstitutionId: 'ui-teacher',
      schoolId: 'school-a',
    });
  });

  it("lets a manager with no school in view pick the person, and the plan takes that person's school", async () => {
    const api = fakeApi({
      '/action-plans/assignees': [
        {
          ...ASSIGNEES[0],
          school: { id: 'school-b', name: 'Escola Estadual do Centro' },
        },
      ],
    });
    const deadline = todayInSaoPaulo();
    render(
      <ActionPlanFormModal
        mode="create"
        apiClient={api}
        isManager
        origin={ORIGIN}
        onClose={jest.fn()}
        onSaved={jest.fn()}
      />
    );

    await fill(deadline);
    await userEvent.click(screen.getByRole('button', { name: 'Criar plano' }));
    expect(screen.getByText('Escolha o responsável')).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Responsável' }));
    fireEvent.click(
      await screen.findByRole('option', {
        name: 'Ana Souza · Escola Estadual do Centro',
      })
    );
    await userEvent.click(screen.getByRole('button', { name: 'Criar plano' }));

    expect(api.get).toHaveBeenCalledWith('/action-plans/assignees', {
      params: {},
    });
    expect(api.post).toHaveBeenCalledWith('/action-plans', {
      title: 'Reforçar frações',
      description: 'Com o 6º ano',
      deadline,
      origin: ORIGIN,
      responsibleUserInstitutionId: 'ui-teacher',
    });
  });

  it('starts with the suggested title, which the person may change', async () => {
    render(
      <ActionPlanFormModal
        mode="create"
        apiClient={fakeApi({})}
        isManager={false}
        origin={ORIGIN}
        suggestedTitle="Apoiar os estudantes com maior dificuldade"
        onClose={jest.fn()}
        onSaved={jest.fn()}
      />
    );

    const input = screen.getByTestId('action-plan-title-input');
    expect(input).toHaveValue('Apoiar os estudantes com maior dificuldade');
    await userEvent.clear(input);
    await userEvent.type(input, 'Reforço de frações');
    expect(input).toHaveValue('Reforço de frações');
  });

  it('hides "Ver origem" for a link the app does not have', () => {
    const onOpenOrigin = jest.fn();
    const { rerender } = render(
      <ActionPlanFormModal
        mode="create"
        apiClient={fakeApi({})}
        isManager={false}
        origin={ORIGIN}
        onOpenOrigin={onOpenOrigin}
        canOpenOrigin={() => false}
        onClose={jest.fn()}
        onSaved={jest.fn()}
      />
    );
    expect(
      screen.queryByRole('button', { name: 'Ver origem' })
    ).not.toBeInTheDocument();

    rerender(
      <ActionPlanFormModal
        mode="create"
        apiClient={fakeApi({})}
        isManager={false}
        origin={ORIGIN}
        onOpenOrigin={onOpenOrigin}
        canOpenOrigin={(link) => link === ORIGIN.link}
        onClose={jest.fn()}
        onSaved={jest.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ver origem' }));
    expect(onOpenOrigin).toHaveBeenCalledWith(ORIGIN.link);
  });

  it('searches the responsible by name', async () => {
    const api = fakeApi({ '/action-plans/assignees': ASSIGNEES });
    render(
      <ActionPlanFormModal
        mode="create"
        apiClient={api}
        isManager
        origin={ORIGIN}
        schoolId="school-a"
        onClose={jest.fn()}
        onSaved={jest.fn()}
      />
    );

    // The picker opens once the first people arrive
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Responsável' })).toBeEnabled()
    );
    fireEvent.click(screen.getByRole('button', { name: 'Responsável' }));
    fireEvent.change(await screen.findByRole('combobox'), {
      target: { value: 'ana' },
    });

    await waitFor(
      () =>
        expect(api.get).toHaveBeenCalledWith('/action-plans/assignees', {
          params: { schoolId: 'school-a', search: 'ana' },
        }),
      { timeout: 2000 }
    );
  });

  it('asks for a deadline and keeps the form when the backend refuses', async () => {
    const api = fakeApi({});
    api.post.mockRejectedValueOnce(
      apiError(400, 'O responsável não pode receber planos desta escola')
    );
    render(
      <ActionPlanFormModal
        mode="create"
        apiClient={api}
        isManager={false}
        origin={ORIGIN}
        onClose={jest.fn()}
        onSaved={jest.fn()}
      />
    );

    await userEvent.type(
      screen.getByTestId('action-plan-title-input'),
      'Reforçar frações'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Criar plano' }));
    expect(screen.getByText('Informe o prazo')).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();

    fireEvent.change(screen.getByTestId('action-plan-deadline-input'), {
      target: { value: todayInSaoPaulo() },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Criar plano' }));

    await waitFor(() =>
      expect(useToastStore.getState().toasts[0]).toEqual(
        expect.objectContaining({
          title: 'Não foi possível criar o plano',
          description: 'O responsável não pode receber planos desta escola',
        })
      )
    );
    expect(screen.getByTestId('action-plan-title-input')).toHaveValue(
      'Reforçar frações'
    );
  });
});
