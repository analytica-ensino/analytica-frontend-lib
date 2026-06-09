import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditRecommendedLessonModal } from './EditRecommendedLessonModal';
import type { RecommendedClassData } from '../../types/recommendedLessons';

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

// Deterministic ISO builder so we can assert the payload
jest.mock('../ActivityCreate/ActivityCreate.utils', () => ({
  buildISODateTime: (date: string, time: string) => `${date}T${time}:00.000Z`,
}));

const mockAddToast = jest.fn();
jest.mock('../Toast/utils/ToastStore', () => ({
  __esModule: true,
  default: (selector: (s: { addToast: jest.Mock }) => unknown) =>
    selector({ addToast: mockAddToast }),
}));

const baseData: RecommendedClassData = {
  id: 'rc-1',
  title: 'Aula Original',
  startDate: '2026-01-10T08:00:00.000Z',
  finalDate: '2026-01-20T18:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
  progress: 0,
  totalLessons: 3,
};

const renderModal = (
  props: {
    isOpen?: boolean;
    recommendedClassId?: string;
    fetchById?: jest.Mock;
    onUpdate?: jest.Mock;
    onClose?: jest.Mock;
    onSaved?: jest.Mock;
  } = {}
) => {
  const fetchById =
    props.fetchById ?? jest.fn().mockResolvedValue({ ...baseData });
  const onUpdate = props.onUpdate ?? jest.fn().mockResolvedValue(undefined);
  const onClose = props.onClose ?? jest.fn();
  const onSaved = props.onSaved ?? jest.fn();
  render(
    <EditRecommendedLessonModal
      isOpen={props.isOpen ?? true}
      recommendedClassId={
        'recommendedClassId' in props ? props.recommendedClassId : 'rc-1'
      }
      fetchById={fetchById}
      onUpdate={onUpdate}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
  return { fetchById, onUpdate, onClose, onSaved };
};

describe('EditRecommendedLessonModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not load when closed', () => {
    const { fetchById } = renderModal({ isOpen: false });
    expect(fetchById).not.toHaveBeenCalled();
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('does not load without a recommendedClassId', () => {
    const { fetchById } = renderModal({ recommendedClassId: undefined });
    expect(fetchById).not.toHaveBeenCalled();
  });

  it('loads and pre-fills title and dates when opened', async () => {
    const { fetchById } = renderModal();

    await waitFor(() => {
      expect(fetchById).toHaveBeenCalledWith('rc-1');
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Título')).toHaveValue('Aula Original');
    });
    expect(screen.getByLabelText('start-date')).toHaveValue('2026-01-10');
    expect(screen.getByLabelText('final-date')).toHaveValue('2026-01-20');
  });

  it('shows a toast and closes when loading fails', async () => {
    const fetchById = jest.fn().mockRejectedValue(new Error('boom'));
    const onClose = jest.fn();
    renderModal({ fetchById, onClose });

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'warning' })
      );
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('validates an empty title before saving', async () => {
    const { onUpdate } = renderModal();

    await waitFor(() => {
      expect(screen.getByLabelText('Título')).toHaveValue('Aula Original');
    });

    fireEvent.change(screen.getByLabelText('Título'), {
      target: { value: '   ' },
    });
    fireEvent.click(screen.getByText('Salvar alterações'));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('saves the edited title and dates, then fires onSaved', async () => {
    const onUpdate = jest.fn().mockResolvedValue(undefined);
    const onSaved = jest.fn();
    renderModal({ onUpdate, onSaved });

    await waitFor(() => {
      expect(screen.getByLabelText('Título')).toHaveValue('Aula Original');
    });

    fireEvent.change(screen.getByLabelText('Título'), {
      target: { value: 'Novo título' },
    });

    // Read the locally-split values so the assertion is timezone-independent
    const startDate = (screen.getByLabelText('start-date') as HTMLInputElement)
      .value;
    const startTime = (screen.getByLabelText('start-time') as HTMLInputElement)
      .value;
    const finalDate = (screen.getByLabelText('final-date') as HTMLInputElement)
      .value;
    const finalTime = (screen.getByLabelText('final-time') as HTMLInputElement)
      .value;

    fireEvent.click(screen.getByText('Salvar alterações'));

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith('rc-1', {
        title: 'Novo título',
        startDate: `${startDate}T${startTime}:00.000Z`,
        finalDate: `${finalDate}T${finalTime}:00.000Z`,
      });
    });
    expect(onSaved).toHaveBeenCalled();
    expect(mockAddToast).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'success' })
    );
  });

  it('shows a toast and keeps the modal open when saving fails', async () => {
    const onUpdate = jest.fn().mockRejectedValue(new Error('fail'));
    const onSaved = jest.fn();
    renderModal({ onUpdate, onSaved });

    await waitFor(() => {
      expect(screen.getByLabelText('Título')).toHaveValue('Aula Original');
    });

    fireEvent.click(screen.getByText('Salvar alterações'));

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalled();
    });
    expect(onSaved).not.toHaveBeenCalled();
    expect(mockAddToast).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'warning' })
    );
  });

  it('falls back to empty dates and default times when the class has no dates', async () => {
    const fetchById = jest.fn().mockResolvedValue({
      ...baseData,
      title: '',
      startDate: null,
      finalDate: null,
    });
    renderModal({ fetchById });

    await waitFor(() => {
      expect(fetchById).toHaveBeenCalled();
    });

    expect(screen.getByLabelText('start-date')).toHaveValue('');
    expect(screen.getByLabelText('final-date')).toHaveValue('');
    expect(screen.getByLabelText('start-time')).toHaveValue('00:00');
    expect(screen.getByLabelText('final-time')).toHaveValue('23:59');
  });

  it('validates missing dates before saving', async () => {
    const fetchById = jest.fn().mockResolvedValue({
      ...baseData,
      startDate: null,
      finalDate: null,
    });
    const onUpdate = jest.fn();
    renderModal({ fetchById, onUpdate });

    await waitFor(() => {
      expect(screen.getByLabelText('Título')).toHaveValue('Aula Original');
    });

    fireEvent.click(screen.getByText('Salvar alterações'));

    const alerts = await screen.findAllByRole('alert');
    expect(alerts.length).toBeGreaterThan(0);
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('closes when Cancelar is clicked', async () => {
    const { onClose } = renderModal();

    await waitFor(() => {
      expect(screen.getByLabelText('Título')).toHaveValue('Aula Original');
    });

    fireEvent.click(screen.getByText('Cancelar'));
    expect(onClose).toHaveBeenCalled();
  });
});
