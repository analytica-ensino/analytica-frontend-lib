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

  it('shuffle and repeat list stay enabled with an end-of-video action set', () => {
    fireEvent.click(toggle('Repetir vídeo'));

    expect(toggle('Aleatório')).toBeEnabled();
    expect(toggle('Repetir lista')).toBeEnabled();
  });

  it.each([
    ['Repetir vídeo', 'Voltar ao início da lista', 'repeat-video'],
    ['Voltar ao início da lista', 'Repetir vídeo', 'back-to-start'],
  ])('turning on "%s" disables "%s"', (on, blocked, behavior) => {
    fireEvent.click(toggle(on));

    expect(useMediaPreferencesStore.getState().videoEndBehavior).toBe(behavior);
    expect(toggle(on)).toHaveAttribute('aria-pressed', 'true');
    expect(toggle(blocked)).toBeDisabled();

    fireEvent.click(toggle(on));

    expect(useMediaPreferencesStore.getState().videoEndBehavior).toBe('none');
    expect(toggle(blocked)).toBeEnabled();
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
