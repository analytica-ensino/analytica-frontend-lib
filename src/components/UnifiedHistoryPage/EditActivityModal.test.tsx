import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditActivityModal, buildEditPayload } from './EditActivityModal';
import type { BaseApiClient } from '../../types/api';

// --- Leaf component stubs (keep the real validation logic) ---
jest.mock('../Modal/Modal', () => ({
  __esModule: true,
  default: ({
    isOpen,
    title,
    children,
    footer,
  }: {
    isOpen: boolean;
    title: React.ReactNode;
    children?: React.ReactNode;
    footer?: React.ReactNode;
  }) =>
    isOpen ? (
      <div data-testid="modal">
        <div>{title}</div>
        {children}
        {footer}
      </div>
    ) : null,
}));

jest.mock('../Stepper/Stepper', () => ({
  __esModule: true,
  default: ({ currentStep }: { currentStep?: number }) => (
    <div data-testid="stepper" data-current={currentStep} />
  ),
}));

jest.mock('../Input/Input', () => ({
  __esModule: true,
  default: ({
    label,
    value,
    onChange,
    errorMessage,
  }: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    errorMessage?: string;
  }) => (
    <div>
      <input aria-label={label} value={value} onChange={onChange} />
      {errorMessage && <span role="alert">{errorMessage}</span>}
    </div>
  ),
}));

jest.mock('../TextArea/TextArea', () => ({
  __esModule: true,
  default: ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  }) => <textarea aria-label={label} value={value} onChange={onChange} />,
}));

jest.mock('../Chips/Chips', () => ({
  __esModule: true,
  default: ({
    children,
    selected,
    onClick,
  }: {
    children: React.ReactNode;
    selected?: boolean;
    onClick?: () => void;
  }) => (
    <button
      onClick={onClick}
      data-selected={selected ? 'true' : 'false'}
      data-testid={`chip-${children}`}
    >
      {children}
    </button>
  ),
}));

jest.mock('../Button/Button', () => ({
  __esModule: true,
  default: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

jest.mock('../Text/Text', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

jest.mock('../shared/SendModalBase/components/SendModalError', () => ({
  __esModule: true,
  SendModalError: ({ error }: { error?: string }) =>
    error ? <span role="alert">{error}</span> : null,
}));

jest.mock('../shared/SendModalBase/components/DeadlineStep', () => ({
  __esModule: true,
  default: ({
    startDate,
    startTime,
    finalDate,
    finalTime,
    onStartDateChange,
    onStartTimeChange,
    onFinalDateChange,
    onFinalTimeChange,
    errors,
  }: {
    startDate: string;
    startTime: string;
    finalDate: string;
    finalTime: string;
    onStartDateChange: (v: string) => void;
    onStartTimeChange: (v: string) => void;
    onFinalDateChange: (v: string) => void;
    onFinalTimeChange: (v: string) => void;
    errors: {
      startDate?: string;
      startTime?: string;
      finalDate?: string;
      finalTime?: string;
    };
  }) => (
    <div data-testid="deadline-step">
      <input
        aria-label="start-date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
      />
      <input
        aria-label="start-time"
        value={startTime}
        onChange={(e) => onStartTimeChange(e.target.value)}
      />
      <input
        aria-label="final-date"
        value={finalDate}
        onChange={(e) => onFinalDateChange(e.target.value)}
      />
      <input
        aria-label="final-time"
        value={finalTime}
        onChange={(e) => onFinalTimeChange(e.target.value)}
      />
      {errors.startDate && <span role="alert">{errors.startDate}</span>}
      {errors.finalDate && <span role="alert">{errors.finalDate}</span>}
    </div>
  ),
}));

// Deterministic ISO builder so we can assert the PATCH payload
jest.mock('../ActivityCreate/ActivityCreate.utils', () => ({
  buildISODateTime: (date: string, time: string) => `${date}T${time}:00.000Z`,
}));

const mockAddToast = jest.fn();
jest.mock('../Toast/utils/ToastStore', () => ({
  __esModule: true,
  default: (selector: (s: { addToast: jest.Mock }) => unknown) =>
    selector({ addToast: mockAddToast }),
}));

type MockApiClient = {
  get: jest.Mock;
  patch: jest.Mock;
};

const buildApiClient = (
  overrides: Partial<MockApiClient> = {}
): MockApiClient => ({
  get: jest.fn().mockResolvedValue({
    data: {
      data: {
        subtype: 'TAREFA',
        title: 'Atividade Original',
        notification: 'Aviso original',
        startDate: '2026-01-10T08:00:00.000Z',
        finalDate: '2026-01-20T18:00:00.000Z',
      },
    },
  }),
  patch: jest.fn().mockResolvedValue({ data: {} }),
  ...overrides,
});

const renderModal = (
  apiClient: MockApiClient,
  props: { onClose?: jest.Mock; onSaved?: jest.Mock; activityId?: string } = {}
) => {
  const onClose = props.onClose ?? jest.fn();
  const onSaved = props.onSaved ?? jest.fn();
  render(
    <EditActivityModal
      isOpen
      activityId={'activityId' in props ? props.activityId : 'act-1'}
      apiClient={apiClient as unknown as BaseApiClient}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
  return { onClose, onSaved };
};

/** Advance from step 1 to step 2 (requires a valid subtype + title) */
const goToDeadlineStep = () => fireEvent.click(screen.getByText('Próximo'));

describe('EditActivityModal', () => {
  beforeEach(() => {
    mockAddToast.mockClear();
  });

  it('renders nothing when closed', () => {
    const apiClient = buildApiClient();
    render(
      <EditActivityModal
        isOpen={false}
        activityId="act-1"
        apiClient={apiClient as unknown as BaseApiClient}
        onClose={jest.fn()}
        onSaved={jest.fn()}
      />
    );
    expect(screen.queryByTestId('modal')).toBeNull();
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it('loads the activity and pre-fills step 1 on open', async () => {
    const apiClient = buildApiClient();
    renderModal(apiClient);

    expect(apiClient.get).toHaveBeenCalledWith('/activities/act-1/quiz');
    await waitFor(() =>
      expect(screen.getByLabelText('Título')).toHaveValue('Atividade Original')
    );
    expect(screen.getByLabelText('Mensagem da notificação')).toHaveValue(
      'Aviso original'
    );
    expect(screen.getByTestId('chip-Tarefa')).toHaveAttribute(
      'data-selected',
      'true'
    );
    expect(screen.getByTestId('stepper')).toHaveAttribute('data-current', '0');
  });

  it('does not select any chip for a missing/unknown subtype', async () => {
    const apiClient = buildApiClient({
      get: jest.fn().mockResolvedValue({
        data: {
          data: {
            subtype: null,
            title: null,
            notification: null,
            startDate: null,
            finalDate: 'not-a-date',
          },
        },
      }),
    });
    renderModal(apiClient);

    await waitFor(() =>
      expect(screen.getByLabelText('Título')).toHaveValue('')
    );
    expect(screen.getByTestId('chip-Tarefa')).toHaveAttribute(
      'data-selected',
      'false'
    );
    expect(screen.getByLabelText('Mensagem da notificação')).toHaveValue('');
  });

  it('buildEditPayload falls back for missing fields', () => {
    expect(buildEditPayload({})).toEqual({
      subtype: undefined,
      title: '',
      notification: null,
      startDate: 'T00:00:00.000Z',
      finalDate: 'T23:59:00.000Z',
    });
    expect(
      buildEditPayload({
        subtype: undefined,
        title: '  Olá  ',
        notification: '  msg  ',
        startDate: '2026-04-01',
        startTime: '07:30',
        finalDate: '2026-04-02',
        finalTime: '20:00',
      })
    ).toEqual({
      subtype: undefined,
      title: 'Olá',
      notification: 'msg',
      startDate: '2026-04-01T07:30:00.000Z',
      finalDate: '2026-04-02T20:00:00.000Z',
    });
  });

  it('shows a loading state while fetching', async () => {
    let resolveGet: (value: unknown) => void = () => {};
    const apiClient = buildApiClient({
      get: jest.fn().mockReturnValue(
        new Promise((resolve) => {
          resolveGet = resolve;
        })
      ),
    });
    renderModal(apiClient);

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
    resolveGet({
      data: { data: { subtype: 'TAREFA', title: 'X', notification: null } },
    });
    await waitFor(() => expect(screen.queryByText('Carregando...')).toBeNull());
  });

  it('blocks advancing to step 2 with an empty title', async () => {
    const apiClient = buildApiClient();
    renderModal(apiClient);

    await waitFor(() =>
      expect(screen.getByLabelText('Título')).toHaveValue('Atividade Original')
    );
    fireEvent.change(screen.getByLabelText('Título'), {
      target: { value: '' },
    });
    goToDeadlineStep();

    expect(screen.queryByTestId('deadline-step')).toBeNull();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('advances to step 2 and back with the navigation buttons', async () => {
    const apiClient = buildApiClient();
    renderModal(apiClient);

    await waitFor(() =>
      expect(screen.getByLabelText('Título')).toHaveValue('Atividade Original')
    );
    goToDeadlineStep();
    expect(screen.getByTestId('deadline-step')).toBeInTheDocument();
    expect(screen.getByTestId('stepper')).toHaveAttribute('data-current', '1');

    fireEvent.click(screen.getByText('Anterior'));
    expect(screen.getByLabelText('Título')).toBeInTheDocument();
    expect(screen.queryByTestId('deadline-step')).toBeNull();
  });

  it('lets the user change the activity type', async () => {
    const apiClient = buildApiClient();
    renderModal(apiClient);

    await waitFor(() =>
      expect(screen.getByTestId('chip-Prova')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('chip-Prova'));
    expect(screen.getByTestId('chip-Prova')).toHaveAttribute(
      'data-selected',
      'true'
    );
  });

  it('blocks saving when the deadline is before the start date', async () => {
    const apiClient = buildApiClient();
    renderModal(apiClient);

    await waitFor(() =>
      expect(screen.getByLabelText('Título')).toHaveValue('Atividade Original')
    );
    goToDeadlineStep();
    fireEvent.change(screen.getByLabelText('start-date'), {
      target: { value: '2026-02-10' },
    });
    fireEvent.change(screen.getByLabelText('final-date'), {
      target: { value: '2026-02-01' },
    });
    fireEvent.click(screen.getByText('Salvar alterações'));

    expect(apiClient.patch).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('saves the edited fields via PATCH and notifies success', async () => {
    const apiClient = buildApiClient();
    const { onSaved } = renderModal(apiClient);

    await waitFor(() =>
      expect(screen.getByLabelText('Título')).toHaveValue('Atividade Original')
    );
    fireEvent.change(screen.getByLabelText('Título'), {
      target: { value: 'Novo título' },
    });
    fireEvent.change(screen.getByLabelText('Mensagem da notificação'), {
      target: { value: 'Novo aviso' },
    });
    goToDeadlineStep();
    fireEvent.change(screen.getByLabelText('start-date'), {
      target: { value: '2026-02-01' },
    });
    fireEvent.change(screen.getByLabelText('start-time'), {
      target: { value: '09:00' },
    });
    fireEvent.change(screen.getByLabelText('final-date'), {
      target: { value: '2026-02-05' },
    });
    fireEvent.change(screen.getByLabelText('final-time'), {
      target: { value: '18:00' },
    });
    fireEvent.click(screen.getByText('Salvar alterações'));

    await waitFor(() => expect(apiClient.patch).toHaveBeenCalledTimes(1));
    expect(apiClient.patch).toHaveBeenCalledWith('/activities/act-1', {
      subtype: 'TAREFA',
      title: 'Novo título',
      notification: 'Novo aviso',
      startDate: '2026-02-01T09:00:00.000Z',
      finalDate: '2026-02-05T18:00:00.000Z',
    });
    expect(onSaved).toHaveBeenCalledTimes(1);
    expect(mockAddToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Atividade atualizada com sucesso',
        action: 'success',
      })
    );
  });

  it('sends null notification and default times when omitted', async () => {
    const apiClient = buildApiClient({
      get: jest.fn().mockResolvedValue({
        data: {
          data: {
            subtype: 'TAREFA',
            title: 'T',
            notification: null,
            startDate: null,
            finalDate: null,
          },
        },
      }),
    });
    renderModal(apiClient);

    await waitFor(() =>
      expect(screen.getByLabelText('Título')).toHaveValue('T')
    );
    goToDeadlineStep();
    fireEvent.change(screen.getByLabelText('start-date'), {
      target: { value: '2026-03-01' },
    });
    fireEvent.change(screen.getByLabelText('final-date'), {
      target: { value: '2026-03-05' },
    });
    fireEvent.click(screen.getByText('Salvar alterações'));

    await waitFor(() => expect(apiClient.patch).toHaveBeenCalled());
    expect(apiClient.patch).toHaveBeenCalledWith('/activities/act-1', {
      subtype: 'TAREFA',
      title: 'T',
      notification: null,
      startDate: '2026-03-01T00:00:00.000Z',
      finalDate: '2026-03-05T23:59:00.000Z',
    });
  });

  it('notifies a warning when saving fails', async () => {
    const apiClient = buildApiClient({
      patch: jest.fn().mockRejectedValue(new Error('boom')),
    });
    const { onSaved } = renderModal(apiClient);

    await waitFor(() =>
      expect(screen.getByLabelText('Título')).toHaveValue('Atividade Original')
    );
    goToDeadlineStep();
    fireEvent.click(screen.getByText('Salvar alterações'));

    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Erro ao atualizar atividade',
          action: 'warning',
        })
      )
    );
    expect(onSaved).not.toHaveBeenCalled();
  });

  it('notifies a warning and closes when loading fails', async () => {
    const apiClient = buildApiClient({
      get: jest.fn().mockRejectedValue(new Error('nope')),
    });
    const { onClose } = renderModal(apiClient);

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(mockAddToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Erro ao carregar atividade',
        action: 'warning',
      })
    );
  });

  it('does nothing on submit without an activity id', async () => {
    const apiClient = buildApiClient();
    renderModal(apiClient, { activityId: undefined });

    expect(apiClient.get).not.toHaveBeenCalled();
    // Build a valid step 1 manually so we can reach step 2
    fireEvent.click(screen.getByTestId('chip-Tarefa'));
    fireEvent.change(screen.getByLabelText('Título'), {
      target: { value: 'Manual' },
    });
    goToDeadlineStep();
    fireEvent.click(screen.getByText('Salvar alterações'));
    expect(apiClient.patch).not.toHaveBeenCalled();
  });

  it('ignores a late response after unmount', async () => {
    let resolveGet: (value: unknown) => void = () => {};
    const apiClient = buildApiClient({
      get: jest.fn().mockReturnValue(
        new Promise((resolve) => {
          resolveGet = resolve;
        })
      ),
    });
    const { unmount } = render(
      <EditActivityModal
        isOpen
        activityId="act-1"
        apiClient={apiClient as unknown as BaseApiClient}
        onClose={jest.fn()}
        onSaved={jest.fn()}
      />
    );

    unmount();
    resolveGet({
      data: { data: { subtype: 'TAREFA', title: 'late', notification: null } },
    });
    await waitFor(() => expect(apiClient.get).toHaveBeenCalled());
  });

  it('ignores a late error after unmount', async () => {
    let rejectGet: (reason?: unknown) => void = () => {};
    const apiClient = buildApiClient({
      get: jest.fn().mockReturnValue(
        new Promise((_resolve, reject) => {
          rejectGet = reject;
        })
      ),
    });
    const onClose = jest.fn();
    const { unmount } = render(
      <EditActivityModal
        isOpen
        activityId="act-1"
        apiClient={apiClient as unknown as BaseApiClient}
        onClose={onClose}
        onSaved={jest.fn()}
      />
    );

    unmount();
    rejectGet(new Error('late'));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onClose).not.toHaveBeenCalled();
  });
});
