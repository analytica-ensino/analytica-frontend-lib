import { render, screen, cleanup, act } from '@testing-library/react';
import QuizTimer from './QuizTimer';
import { useQuizStore } from '../Quiz/useQuizStore';

const FIVE_HOURS = 5 * 60 * 60;

describe('QuizTimer', () => {
  beforeEach(() => {
    act(() => {
      useQuizStore.getState().resetQuiz();
    });
  });

  afterEach(cleanup);

  it('renders the elapsed time as HH:MM:SS', () => {
    act(() => {
      useQuizStore.getState().updateTime(4271);
    });

    render(<QuizTimer />);

    expect(screen.getByText('01:11:11')).toBeInTheDocument();
  });

  it('renders zero before the exam starts', () => {
    render(<QuizTimer />);

    expect(screen.getByText('00:00:00')).toBeInTheDocument();
  });

  it('keeps hours visible past the ten hour mark', () => {
    act(() => {
      useQuizStore.getState().updateTime(11 * 3600 + 61);
    });

    render(<QuizTimer />);

    expect(screen.getByText('11:01:01')).toBeInTheDocument();
  });

  it('exposes a timer role with an accessible label', () => {
    act(() => {
      useQuizStore.getState().updateTime(60);
    });

    render(<QuizTimer />);

    expect(screen.getByRole('timer')).toHaveAttribute(
      'aria-label',
      'Tempo de prova: 00:01:00'
    );
  });

  it('is not styled as exceeded while under the threshold', () => {
    act(() => {
      useQuizStore.getState().setTimeWarning(FIVE_HOURS);
      useQuizStore.getState().updateTime(FIVE_HOURS - 1);
    });

    render(<QuizTimer />);

    expect(screen.getByRole('timer').className).toContain('text-text-600');
    expect(screen.getByRole('timer').className).not.toContain('text-error-600');
  });

  it('turns red and keeps counting once the threshold is passed', () => {
    act(() => {
      useQuizStore.getState().setTimeWarning(FIVE_HOURS);
      useQuizStore.getState().updateTime(FIVE_HOURS + 754);
    });

    render(<QuizTimer />);

    const timer = screen.getByRole('timer');
    expect(timer.className).toContain('text-error-600');
    // The count continues past the threshold rather than freezing on it.
    expect(screen.getByText('05:12:34')).toBeInTheDocument();
    expect(timer).toHaveAttribute(
      'aria-label',
      'Tempo de prova: 05:12:34 — tempo excedido'
    );
  });

  it('is never styled as exceeded when no threshold is configured', () => {
    act(() => {
      useQuizStore.getState().updateTime(20 * 3600);
    });

    render(<QuizTimer />);

    expect(screen.getByRole('timer').className).not.toContain('text-error-600');
  });

  it('applies a custom className', () => {
    render(<QuizTimer className="ml-2" />);

    expect(screen.getByRole('timer').className).toContain('ml-2');
  });
});
