import { render, screen } from '@testing-library/react';
import { DraftsTab } from './DraftsTab';

describe('DraftsTab', () => {
  it('should render placeholder message', () => {
    render(<DraftsTab />);

    expect(
      screen.getByText('Rascunhos em desenvolvimento')
    ).toBeInTheDocument();
  });

  it('should have correct container styling', () => {
    const { container } = render(<DraftsTab />);
    const div = container.firstChild as HTMLElement;

    expect(div).toHaveClass('flex');
    expect(div).toHaveClass('items-center');
    expect(div).toHaveClass('justify-center');
    expect(div).toHaveClass('bg-background');
    expect(div).toHaveClass('rounded-xl');
    expect(div).toHaveClass('w-full');
    expect(div).toHaveClass('min-h-[705px]');
  });
});
