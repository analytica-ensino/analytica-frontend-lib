import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import TTSSection from './TTSSection';
import {
  useAccessibilityStore,
  DEFAULT_ACCESSIBILITY_PREFERENCES,
} from '../../store/accessibilityStore';
import type { TTSVoice } from './tts/types';

// Stubs do useTTS — controlados por cada teste.
let voices: TTSVoice[] = [];
let isSupported = true;
let hasPortugueseVoice = true;
const speakMock = jest.fn();
const pauseMock = jest.fn();
const resumeMock = jest.fn();
const stopMock = jest.fn();

jest.mock('../../hooks/useTTS', () => ({
  useTTS: () => ({
    isSupported,
    voices,
    hasPortugueseVoice,
    speak: speakMock,
    pause: pauseMock,
    resume: resumeMock,
    stop: stopMock,
  }),
}));

// Segmented stub que renderiza radios simples para testes determinísticos.
const StubSegmented = <T extends string | number>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  ariaLabel: string;
}) => (
  <div role="radiogroup" aria-label={ariaLabel}>
    {options.map((opt) => (
      <button
        key={String(opt.value)}
        type="button"
        role="radio"
        aria-checked={opt.value === value}
        onClick={() => onChange(opt.value)}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const renderSection = () => render(<TTSSection Segmented={StubSegmented} />);

describe('TTSSection', () => {
  beforeEach(() => {
    voices = [
      { id: 'pt', name: 'Voz pt-BR', lang: 'pt-BR', isLocal: true },
      { id: 'en', name: 'Voice en-US', lang: 'en-US', isLocal: true },
    ];
    isSupported = true;
    hasPortugueseVoice = true;
    speakMock.mockClear();
    pauseMock.mockClear();
    resumeMock.mockClear();
    stopMock.mockClear();
    useAccessibilityStore.setState({
      ...DEFAULT_ACCESSIBILITY_PREFERENCES,
      isPanelOpen: false,
      ttsStatus: 'idle',
    });
  });

  it('shows an unsupported message when the synth is not available', () => {
    isSupported = false;
    renderSection();
    expect(
      screen.getByText(/síntese de voz não está disponível/i)
    ).toBeInTheDocument();
  });

  it('warns the user when no portuguese voice is found', () => {
    hasPortugueseVoice = false;
    renderSection();
    expect(
      screen.getByText(/nenhuma voz em português foi encontrada/i)
    ).toBeInTheDocument();
  });

  it('lists the available voices in the picker once opened', async () => {
    renderSection();
    const trigger = screen.getByTestId('a11y-tts-voice-select');
    expect(trigger).toBeInTheDocument();

    // Select da lib só monta os items quando aberto
    await userEvent.click(trigger);
    expect(screen.getByText(/Voz pt-BR/)).toBeInTheDocument();
    expect(screen.getByText(/Voice en-US/)).toBeInTheDocument();
  });

  it('updates ttsMode through the segmented control', async () => {
    renderSection();
    await userEvent.click(
      screen.getByRole('radio', { name: 'Clique para ler' })
    );
    expect(useAccessibilityStore.getState().ttsMode).toBe('click-to-read');
  });

  it('updates rate via the rate segmented', async () => {
    renderSection();
    await userEvent.click(screen.getByRole('radio', { name: 'Rápido' }));
    expect(useAccessibilityStore.getState().ttsRate).toBe(1.25);
  });

  it('reads the current selection when clicking "Ler seleção"', async () => {
    // Mocka window.getSelection para devolver texto.
    const originalGetSelection = globalThis.getSelection;
    (globalThis as unknown as { getSelection: () => unknown }).getSelection =
      () => ({ toString: () => 'trecho selecionado' });

    renderSection();
    await userEvent.click(screen.getByTestId('a11y-tts-read-selection'));
    expect(speakMock).toHaveBeenCalledWith('trecho selecionado');

    (
      globalThis as unknown as { getSelection: typeof originalGetSelection }
    ).getSelection = originalGetSelection;
  });

  it('does not call speak when no text is selected', async () => {
    const originalGetSelection = globalThis.getSelection;
    (globalThis as unknown as { getSelection: () => unknown }).getSelection =
      () => ({ toString: () => '   ' });

    renderSection();
    await userEvent.click(screen.getByTestId('a11y-tts-read-selection'));
    expect(speakMock).not.toHaveBeenCalled();

    (
      globalThis as unknown as { getSelection: typeof originalGetSelection }
    ).getSelection = originalGetSelection;
  });

  it('shows pause and stop buttons while speaking', async () => {
    useAccessibilityStore.setState({ ttsStatus: 'speaking' });
    renderSection();
    expect(screen.getByTestId('a11y-tts-pause')).toBeInTheDocument();
    expect(screen.getByTestId('a11y-tts-stop')).toBeInTheDocument();
    expect(screen.queryByTestId('a11y-tts-resume')).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId('a11y-tts-pause'));
    expect(pauseMock).toHaveBeenCalled();

    await userEvent.click(screen.getByTestId('a11y-tts-stop'));
    expect(stopMock).toHaveBeenCalled();
  });

  it('shows resume button while paused', async () => {
    useAccessibilityStore.setState({ ttsStatus: 'paused' });
    renderSection();
    expect(screen.getByTestId('a11y-tts-resume')).toBeInTheDocument();
    expect(screen.queryByTestId('a11y-tts-pause')).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId('a11y-tts-resume'));
    expect(resumeMock).toHaveBeenCalled();
  });
});
