import { render, screen, fireEvent } from '@testing-library/react';
import { FilterActions } from './FilterActions';

describe('FilterActions', () => {
  it('renders nothing without handlers', () => {
    const { container } = render(<FilterActions />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders both actions and calls their handlers', () => {
    const onClearFilters = jest.fn();
    const onApplyFilters = jest.fn();
    render(
      <FilterActions
        onClearFilters={onClearFilters}
        onApplyFilters={onApplyFilters}
      />
    );

    fireEvent.click(screen.getByText('Limpar filtros'));
    fireEvent.click(screen.getByText('Filtrar'));

    expect(onClearFilters).toHaveBeenCalledTimes(1);
    expect(onApplyFilters).toHaveBeenCalledTimes(1);
  });

  it('shows the top divider by default', () => {
    const { container } = render(<FilterActions onApplyFilters={jest.fn()} />);

    expect(container.firstChild).toHaveClass('border-t');
  });

  it('hides the top divider when showDivider is false', () => {
    const { container } = render(
      <FilterActions onApplyFilters={jest.fn()} showDivider={false} />
    );

    expect(container.firstChild).not.toHaveClass('border-t');
  });

  it('appends custom classes to the actions row', () => {
    const { container } = render(
      <FilterActions onApplyFilters={jest.fn()} className="gap-4" />
    );

    expect(container.firstChild).toHaveClass('gap-4');
  });
});
