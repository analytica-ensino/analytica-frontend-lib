import { render, screen } from '@testing-library/react';
import { LevelBar } from './LevelBar';

describe('LevelBar', () => {
  it('always renders four segments', () => {
    render(<LevelBar value={1} />);
    expect(screen.getAllByTestId(/level-bar-(filled|empty)/)).toHaveLength(4);
  });

  it('fills the first `value` segments', () => {
    render(<LevelBar value={2} />);
    expect(screen.getAllByTestId('level-bar-filled')).toHaveLength(2);
    expect(screen.getAllByTestId('level-bar-empty')).toHaveLength(2);
  });

  it('applies the given colour to the filled segments only', () => {
    render(<LevelBar value={1} colorClass="bg-warning-400" />);
    expect(screen.getAllByTestId('level-bar-filled')[0]).toHaveClass(
      'bg-warning-400'
    );
    expect(screen.getAllByTestId('level-bar-empty')[0]).not.toHaveClass(
      'bg-warning-400'
    );
  });

  it('clamps values above four and below zero', () => {
    const { rerender } = render(<LevelBar value={99} />);
    expect(screen.getAllByTestId('level-bar-filled')).toHaveLength(4);
    expect(screen.queryAllByTestId('level-bar-empty')).toHaveLength(0);

    rerender(<LevelBar value={-3} />);
    expect(screen.queryAllByTestId('level-bar-filled')).toHaveLength(0);
    expect(screen.getAllByTestId('level-bar-empty')).toHaveLength(4);
  });

  // The level is shown as adjacent text by the consumer, so the bar itself is
  // decorative and must not be announced twice.
  it('is hidden from assistive tech', () => {
    const { container } = render(<LevelBar value={3} />);
    expect(
      container.querySelector('[data-component="LevelBar"]')
    ).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('meter')).not.toBeInTheDocument();
  });
});
