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
        icon={<span />}
        imageUrl="https://cdn.test/frame.jpg"
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
      <NextLessonCountdown
        title="A"
        icon={<span />}
        onComplete={first}
        onCancel={onCancel}
      />
    );

    for (let second = 1; second < NEXT_LESSON_COUNTDOWN_SECONDS; second++) {
      act(() => {
        jest.advanceTimersByTime(1000);
      });
    }
    rerender(
      <NextLessonCountdown
        title="A"
        icon={<span />}
        onComplete={second}
        onCancel={onCancel}
      />
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
        icon={<span />}
        onComplete={jest.fn()}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('assistir agora avança na hora e só uma vez', () => {
    const onComplete = jest.fn();
    render(
      <NextLessonCountdown
        title="A"
        icon={<span />}
        onComplete={onComplete}
        onCancel={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Assistir agora' }));
    act(() => {
      jest.advanceTimersByTime(NEXT_LESSON_COUNTDOWN_SECONDS * 1000);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('mostra matéria e subtema acima do título, como o card do painel', () => {
    const { rerender } = render(
      <NextLessonCountdown
        title="Função horária"
        subtitle="Física • Cinemática"
        icon={<span data-testid="icon" />}
        color="#ff0000"
        onComplete={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    expect(screen.getByText('Física • Cinemática')).toBeInTheDocument();
    expect(screen.getByText('Função horária')).toBeInTheDocument();
    const iconBox = screen.getByTestId('icon').parentElement;
    expect(iconBox).toHaveStyle({ backgroundColor: '#ff0000' });

    rerender(
      <NextLessonCountdown
        title="Função horária"
        icon={<span data-testid="icon" />}
        color="bg-subject-1"
        onComplete={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    expect(screen.queryByText('Física • Cinemática')).not.toBeInTheDocument();
    expect(screen.getByTestId('icon').parentElement).toHaveClass(
      'bg-subject-1'
    );
    expect(
      screen.getByTestId('icon').parentElement?.style.backgroundColor
    ).toBe('');
  });

  it('mostra o frame inicial só quando existe', () => {
    const { container, rerender } = render(
      <NextLessonCountdown
        title="A"
        icon={<span />}
        imageUrl="https://cdn.test/frame.jpg"
        onComplete={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      'https://cdn.test/frame.jpg'
    );

    rerender(
      <NextLessonCountdown
        title="A"
        icon={<span />}
        onComplete={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(container.querySelector('img')).toBeNull();
  });
});
