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

  it.each(['Aleatório', 'Repetir lista'])('liga e desliga "%s"', (name) => {
    fireEvent.click(toggle(name));
    expect(toggle(name)).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(toggle(name));
    expect(toggle(name)).toHaveAttribute('aria-pressed', 'false');
  });

  it('aleatório e repetir lista ficam livres com o fim do vídeo definido', () => {
    fireEvent.click(toggle('Repetir vídeo'));

    expect(toggle('Aleatório')).toBeEnabled();
    expect(toggle('Repetir lista')).toBeEnabled();
  });

  it.each([
    ['Repetir vídeo', 'Voltar ao início da lista', 'repeat-video'],
    ['Voltar ao início da lista', 'Repetir vídeo', 'back-to-start'],
  ])('ativar "%s" desabilita "%s"', (on, blocked, behavior) => {
    fireEvent.click(toggle(on));

    expect(useMediaPreferencesStore.getState().videoEndBehavior).toBe(behavior);
    expect(toggle(on)).toHaveAttribute('aria-pressed', 'true');
    expect(toggle(blocked)).toBeDisabled();

    fireEvent.click(toggle(on));

    expect(useMediaPreferencesStore.getState().videoEndBehavior).toBe('none');
    expect(toggle(blocked)).toBeEnabled();
  });

  it('mostra o nome da ação em tooltip', () => {
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
