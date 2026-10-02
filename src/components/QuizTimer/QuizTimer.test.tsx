import { render, screen, cleanup, act } from '@testing-library/react';
import QuizTimer, { TIMER_ANNOUNCE_INTERVAL_SECONDS } from './QuizTimer';
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

    expect(screen.getByRole('timer').className).toContain('text-info-800');
    expect(screen.getByRole('timer').className).not.toContain('text-error-700');
  });

  it('turns red and keeps counting once the threshold is passed', () => {
    act(() => {
      useQuizStore.getState().setTimeWarning(FIVE_HOURS);
      useQuizStore.getState().updateTime(FIVE_HOURS + 754);
    });

    render(<QuizTimer />);

    const timer = screen.getByRole('timer');
    expect(timer.className).toContain('text-error-700');
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

    expect(screen.getByRole('timer').className).not.toContain('text-error-700');
  });

  it('applies a custom className', () => {
    render(<QuizTimer className="ml-2" />);

    expect(screen.getByRole('timer').className).toContain('ml-2');
  });

  describe('accessibility', () => {
    it('stays out of the Tab order, being read by the screen reader cursor', () => {
      render(<QuizTimer />);

      expect(screen.getByRole('timer')).not.toHaveAttribute('tabindex');
    });

    it('hides the icon and digits from assistive tech', () => {
      render(<QuizTimer />);

      const timer = screen.getByRole('timer');
      expect(timer.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
      expect(screen.getByText('00:00:00')).toHaveAttribute(
        'aria-hidden',
        'true'
      );
    });

    it('announces nothing before the first interval', () => {
      act(() => {
        useQuizStore.getState().updateTime(TIMER_ANNOUNCE_INTERVAL_SECONDS - 1);
      });

      render(<QuizTimer />);

      const region = screen.getByTestId('quiz-timer-announcement');
      expect(region).toHaveAttribute('aria-live', 'polite');
      expect(region).toHaveTextContent('');
    });

    it('only updates the announcement once per interval', () => {
      act(() => {
        useQuizStore.getState().updateTime(TIMER_ANNOUNCE_INTERVAL_SECONDS);
      });

      render(<QuizTimer />);

      const region = screen.getByTestId('quiz-timer-announcement');
      expect(region).toHaveTextContent('Tempo de prova: 00:05:00');

      act(() => {
        useQuizStore
          .getState()
          .updateTime(TIMER_ANNOUNCE_INTERVAL_SECONDS * 2 - 1);
      });
      expect(region).toHaveTextContent('Tempo de prova: 00:05:00');

      act(() => {
        useQuizStore.getState().updateTime(TIMER_ANNOUNCE_INTERVAL_SECONDS * 2);
      });
      expect(region).toHaveTextContent('Tempo de prova: 00:10:00');
    });

    it('announces the moment the time was exceeded, not the stale boundary', () => {
      act(() => {
        useQuizStore.getState().setTimeWarning(60);
        useQuizStore.getState().updateTime(61);
      });

      render(<QuizTimer />);

      const region = screen.getByTestId('quiz-timer-announcement');
      expect(region).toHaveTextContent(
        'Tempo de prova: 00:01:01 — tempo excedido'
      );

      // Stays put until the next boundary, so it is announced only once
      act(() => {
        useQuizStore.getState().updateTime(TIMER_ANNOUNCE_INTERVAL_SECONDS - 1);
      });
      expect(region).toHaveTextContent(
        'Tempo de prova: 00:01:01 — tempo excedido'
      );

      // Then resumes the regular cadence
      act(() => {
        useQuizStore.getState().updateTime(TIMER_ANNOUNCE_INTERVAL_SECONDS);
      });
      expect(region).toHaveTextContent(
        'Tempo de prova: 00:05:00 — tempo excedido'
      );
    });

    it('captures the elapsed time when the warning starts after mount and clears it on reset', () => {
      act(() => {
        useQuizStore.getState().setTimeWarning(60);
        useQuizStore.getState().updateTime(59);
      });

      render(<QuizTimer />);

      const region = screen.getByTestId('quiz-timer-announcement');
      expect(region).toHaveTextContent('');

      act(() => {
        useQuizStore.getState().updateTime(62);
      });
      expect(region).toHaveTextContent(
        'Tempo de prova: 00:01:02 — tempo excedido'
      );

      act(() => {
        useQuizStore.getState().updateTime(0);
      });
      expect(region).toHaveTextContent('');
    });
  });
});
