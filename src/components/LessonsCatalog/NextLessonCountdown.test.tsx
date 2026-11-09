import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  NEXT_LESSON_COUNTDOWN_SECONDS,
  NextLessonCountdown,
} from './NextLessonCountdown';

describe('NextLessonCountdown', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('mostra a próxima aula e completa uma vez ao chegar a zero', () => {
    const onComplete = jest.fn();
    render(
      <NextLessonCountdown
        title="Aula 2"
        onComplete={onComplete}
        onCancel={jest.fn()}
      />
    );

    expect(screen.getByText('Aula 2')).toBeInTheDocument();
    expect(screen.getByText('Próxima aula em 5s')).toBeInTheDocument();

    for (let second = 1; second < NEXT_LESSON_COUNTDOWN_SECONDS; second++) {
      act(() => {
        jest.advanceTimersByTime(1000);
      });
    }
    expect(onComplete).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('usa o onComplete mais recente sem reiniciar a contagem', () => {
    const first = jest.fn();
    const second = jest.fn();
    const onCancel = jest.fn();
    const { rerender } = render(
      <NextLessonCountdown title="A" onComplete={first} onCancel={onCancel} />
    );

    for (let second = 1; second < NEXT_LESSON_COUNTDOWN_SECONDS; second++) {
      act(() => {
        jest.advanceTimersByTime(1000);
      });
    }
    rerender(
      <NextLessonCountdown title="A" onComplete={second} onCancel={onCancel} />
    );
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('cancela pelo botão', () => {
    const onCancel = jest.fn();
    render(
      <NextLessonCountdown
        title="A"
        onComplete={jest.fn()}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
