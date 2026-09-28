import { fireEvent, render, screen } from '@testing-library/react';
import { usePreviewCardToggle } from './PreviewCardParts';

/** Minimal card with a nested button that does not stop propagation. */
const ToggleCard = () => {
  const { isExpanded, handleCardClick } = usePreviewCardToggle(false);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      onClick={handleCardClick}
      onKeyDown={() => undefined}
    >
      <button type="button">inner</button>
      <span>body</span>
    </div>
  );
};

describe('usePreviewCardToggle', () => {
  it('ignores clicks coming from nested buttons', () => {
    render(<ToggleCard />);

    const card = screen.getByRole('button', { expanded: false });

    fireEvent.click(screen.getByText('inner'));
    expect(card).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(screen.getByText('body'));
    expect(card).toHaveAttribute('aria-expanded', 'true');
  });
});
