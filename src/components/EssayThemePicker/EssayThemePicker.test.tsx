import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { EssayThemePicker } from './EssayThemePicker';
import type { BaseApiClient } from '../../types/api';
import type { EssayTheme } from '../../types/essayThemes';

const theme = (overrides: Partial<EssayTheme> = {}): EssayTheme => ({
  id: 'theme-1',
  title: 'Cidadania digital na era da informação',
  description: null,
  supportingTexts: [],
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

const themesResponse = (themes: EssayTheme[], total = themes.length) => ({
  data: {
    message: 'ok',
    data: { themes, pagination: { page: 1, limit: 20, total, totalPages: 1 } },
  },
});

const makeApi = (get: jest.Mock): BaseApiClient =>
  ({ get }) as unknown as BaseApiClient;

const defaultProps = {
  selectedTheme: null,
  onSelectTheme: jest.fn(),
  onRemoveTheme: jest.fn(),
};

/** The picker debounces the search, so tests must let the timer run. */
const flushDebounce = async () => {
  await act(async () => {
    jest.advanceTimersByTime(500);
  });
};

describe('EssayThemePicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('reads the theme bank on mount', async () => {
    const get = jest.fn().mockResolvedValue(themesResponse([theme()]));
    render(<EssayThemePicker {...defaultProps} apiClient={makeApi(get)} />);

    await flushDebounce();

    expect(get).toHaveBeenCalledWith('/essays/themes', {
      params: { page: 1, limit: 20 },
    });
    expect(
      screen.getByText('Cidadania digital na era da informação')
    ).toBeInTheDocument();
  });

  it('shows the total returned by the API', async () => {
    const get = jest.fn().mockResolvedValue(themesResponse([theme()], 4));
    render(<EssayThemePicker {...defaultProps} apiClient={makeApi(get)} />);

    await flushDebounce();

    expect(screen.getByText('4 temas total')).toBeInTheDocument();
  });

  it('renders the origin badge only when the backend carries it', async () => {
    const get = jest
      .fn()
      .mockResolvedValue(
        themesResponse([
          theme({ id: 'a' }),
          theme({ id: 'b', origin: 'Enem 2024' }),
        ])
      );
    render(<EssayThemePicker {...defaultProps} apiClient={makeApi(get)} />);

    await flushDebounce();

    // Two themes rendered, but only the one carrying `origin` shows a badge.
    expect(screen.getByText('Enem 2024')).toBeInTheDocument();
  });

  it('attaches a theme when "Adicionar à atividade" is clicked', async () => {
    const onSelectTheme = jest.fn();
    const picked = theme();
    const get = jest.fn().mockResolvedValue(themesResponse([picked]));
    render(
      <EssayThemePicker
        {...defaultProps}
        apiClient={makeApi(get)}
        onSelectTheme={onSelectTheme}
      />
    );

    await flushDebounce();
    fireEvent.click(screen.getByText('Adicionar à atividade'));

    expect(onSelectTheme).toHaveBeenCalledWith(picked);
  });

  it('does not offer the attached theme again in the bank', async () => {
    const attached = theme({ id: 'attached', title: 'Tema escolhido' });
    const other = theme({ id: 'other', title: 'Outro tema' });
    const get = jest.fn().mockResolvedValue(themesResponse([attached, other]));

    render(
      <EssayThemePicker
        {...defaultProps}
        apiClient={makeApi(get)}
        selectedTheme={attached}
      />
    );

    await flushDebounce();

    // Present once, in the preview panel — not repeated in the bank list.
    expect(screen.getAllByText('Tema escolhido')).toHaveLength(1);
    expect(screen.getByText('Outro tema')).toBeInTheDocument();
    expect(screen.getAllByText('Adicionar à atividade')).toHaveLength(1);
  });

  it('detaches the theme through the trash action', async () => {
    const onRemoveTheme = jest.fn();
    const get = jest.fn().mockResolvedValue(themesResponse([]));

    render(
      <EssayThemePicker
        {...defaultProps}
        apiClient={makeApi(get)}
        selectedTheme={theme()}
        onRemoveTheme={onRemoveTheme}
      />
    );

    await flushDebounce();
    fireEvent.click(screen.getByLabelText('Remover tema'));

    expect(onRemoveTheme).toHaveBeenCalledTimes(1);
  });

  it('offers no trash action when nothing is attached', async () => {
    const get = jest.fn().mockResolvedValue(themesResponse([]));
    render(<EssayThemePicker {...defaultProps} apiClient={makeApi(get)} />);

    await flushDebounce();

    expect(screen.queryByLabelText('Remover tema')).not.toBeInTheDocument();
    expect(
      screen.getByText(
        'Nenhum tema adicionado. Escolha um tema no banco ao lado.'
      )
    ).toBeInTheDocument();
  });

  it('searches the bank, debounced', async () => {
    const get = jest.fn().mockResolvedValue(themesResponse([theme()]));
    render(<EssayThemePicker {...defaultProps} apiClient={makeApi(get)} />);

    await flushDebounce();
    expect(get).toHaveBeenCalledTimes(1);

    fireEvent.change(screen.getByPlaceholderText('Buscar'), {
      target: { value: 'cidadania' },
    });
    // Still one call: the request waits for the debounce.
    expect(get).toHaveBeenCalledTimes(1);

    await flushDebounce();

    expect(get).toHaveBeenLastCalledWith('/essays/themes', {
      params: { page: 1, limit: 20, search: 'cidadania' },
    });
  });

  it('reports an empty bank', async () => {
    const get = jest.fn().mockResolvedValue(themesResponse([]));
    render(<EssayThemePicker {...defaultProps} apiClient={makeApi(get)} />);

    await flushDebounce();

    expect(screen.getByText('Nenhum tema encontrado.')).toBeInTheDocument();
  });

  it('surfaces a load failure', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const get = jest.fn().mockRejectedValue(new Error('403'));
    render(<EssayThemePicker {...defaultProps} apiClient={makeApi(get)} />);

    await flushDebounce();

    await waitFor(() => {
      expect(
        screen.getByText('Erro ao carregar temas de redação')
      ).toBeInTheDocument();
    });
  });

  it('keeps "Baixar pdf" disabled until a theme is attached', async () => {
    const get = jest.fn().mockResolvedValue(themesResponse([]));
    const onDownloadPdf = jest.fn();

    const { rerender } = render(
      <EssayThemePicker
        {...defaultProps}
        apiClient={makeApi(get)}
        onDownloadPdf={onDownloadPdf}
      />
    );
    await flushDebounce();

    expect(screen.getByText('Baixar pdf').closest('button')).toBeDisabled();

    rerender(
      <EssayThemePicker
        {...defaultProps}
        apiClient={makeApi(get)}
        selectedTheme={theme()}
        onDownloadPdf={onDownloadPdf}
      />
    );

    const button = screen.getByText('Baixar pdf').closest('button');
    expect(button).toBeEnabled();
    fireEvent.click(button!);
    expect(onDownloadPdf).toHaveBeenCalledTimes(1);
  });
});
