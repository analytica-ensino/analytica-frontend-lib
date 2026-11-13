import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LessonQueueControls } from './LessonQueueControls';
import { useMediaPreferencesStore } from '../../store/mediaPreferencesStore';

const toggle = (name: string) => screen.getByRole('button', { name });

describe('LessonQueueControls', () => {
  beforeEach(() => {
    useMediaPreferencesStore.setState({
      queueShuffle: false,
      queueRepeatList: false,
      videoEndBehavior: 'none',
    });
    render(<LessonQueueControls />);
  });

  it.each(['Aleatório', 'Repetir lista'])('toggles "%s" on and off', (name) => {
    fireEvent.click(toggle(name));
    expect(toggle(name)).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(toggle(name));
    expect(toggle(name)).toHaveAttribute('aria-pressed', 'false');
  });

  it('turning on "Repetir vídeo" turns "Repetir lista" off and disables it', () => {
    fireEvent.click(toggle('Repetir lista'));
    fireEvent.click(toggle('Repetir vídeo'));

    expect(useMediaPreferencesStore.getState().videoEndBehavior).toBe(
      'repeat-video'
    );
    expect(useMediaPreferencesStore.getState().queueRepeatList).toBe(false);
    expect(toggle('Repetir lista')).toBeDisabled();
    expect(toggle('Repetir lista')).toHaveAttribute('aria-pressed', 'false');
    expect(toggle('Aleatório')).toBeEnabled();
    expect(toggle('Voltar ao início da lista')).toBeEnabled();

    fireEvent.click(toggle('Repetir vídeo'));

    expect(useMediaPreferencesStore.getState().videoEndBehavior).toBe('none');
    expect(toggle('Repetir lista')).toBeEnabled();
    expect(toggle('Repetir lista')).toHaveAttribute('aria-pressed', 'false');
  });

  it('turning on "Voltar ao início da lista" disables "Repetir vídeo"', () => {
    fireEvent.click(toggle('Voltar ao início da lista'));

    expect(useMediaPreferencesStore.getState().videoEndBehavior).toBe(
      'back-to-start'
    );
    expect(toggle('Repetir vídeo')).toBeDisabled();
    expect(toggle('Repetir lista')).toBeEnabled();

    fireEvent.click(toggle('Voltar ao início da lista'));

    expect(useMediaPreferencesStore.getState().videoEndBehavior).toBe('none');
    expect(toggle('Repetir vídeo')).toBeEnabled();
  });

  it('"Voltar ao início da lista" replaces an active "Repetir vídeo"', () => {
    fireEvent.click(toggle('Repetir vídeo'));
    fireEvent.click(toggle('Voltar ao início da lista'));

    expect(useMediaPreferencesStore.getState().videoEndBehavior).toBe(
      'back-to-start'
    );
    expect(toggle('Repetir vídeo')).toHaveAttribute('aria-pressed', 'false');
    expect(toggle('Repetir vídeo')).toBeDisabled();
    expect(toggle('Repetir lista')).toBeEnabled();
  });

  it('uses the design colors for selected and not selected', () => {
    fireEvent.click(toggle('Aleatório'));

    expect(toggle('Aleatório')).toHaveClass(
      'text-primary-700!',
      'border-transparent'
    );
    expect(toggle('Repetir lista')).toHaveClass(
      'text-primary-950',
      'border-primary-950',
      'hover:text-primary-400!'
    );
  });

  it('shows the action name in a tooltip', () => {
    const texts = screen
      .getAllByRole('tooltip', { hidden: true })
      .map((t) => t.textContent);

    expect(texts).toEqual([
      'Aleatório',
      'Repetir lista',
      'Repetir vídeo',
      'Voltar ao início da lista',
    ]);
  });
});
