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

  it.each(['Ordem aleatória', 'Repetir a lista'])(
    'liga e desliga "%s"',
    (name) => {
      fireEvent.click(toggle(name));
      expect(toggle(name)).toHaveAttribute('aria-pressed', 'true');

      fireEvent.click(toggle(name));
      expect(toggle(name)).toHaveAttribute('aria-pressed', 'false');
    }
  );

  it('repetir um vídeo e voltar ao início se excluem', () => {
    fireEvent.click(toggle('Repetir um vídeo'));
    expect(useMediaPreferencesStore.getState().videoEndBehavior).toBe(
      'repeat-video'
    );

    fireEvent.click(toggle('Voltar ao início'));
    expect(toggle('Voltar ao início')).toHaveAttribute('aria-pressed', 'true');
    expect(toggle('Repetir um vídeo')).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(toggle('Repetir um vídeo'));
    expect(toggle('Voltar ao início')).toHaveAttribute('aria-pressed', 'false');
  });

  it.each(['Repetir um vídeo', 'Voltar ao início'])(
    'desliga "%s" no segundo clique',
    (name) => {
      fireEvent.click(toggle(name));
      fireEvent.click(toggle(name));

      expect(useMediaPreferencesStore.getState().videoEndBehavior).toBe('none');
    }
  );
});
