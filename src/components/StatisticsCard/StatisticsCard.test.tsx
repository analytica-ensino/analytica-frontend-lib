import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StatisticsCard } from './StatisticsCard';

describe('StatisticsCard', () => {
  const defaultProps = {
    title: 'Estatística das atividades',
    emptyStateMessage:
      'Sem dados por enquanto. Crie uma atividade para que os resultados apareçam aqui.',
    emptyStateButtonText: 'Criar atividade',
    onEmptyStateButtonClick: jest.fn(),
  };

  describe('Rendering', () => {
    it('should render title correctly', () => {
      render(<StatisticsCard {...defaultProps} />);

      expect(
        screen.getByText('Estatística das atividades')
      ).toBeInTheDocument();
    });

    it('should render empty state message', () => {
      render(<StatisticsCard {...defaultProps} />);

      expect(screen.getByText(/Sem dados por enquanto/i)).toBeInTheDocument();
    });

    it('should render button with correct text', () => {
      render(<StatisticsCard {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /Criar atividade/i })
      ).toBeInTheDocument();
    });

    it('should render button icon when provided', () => {
      render(
        <StatisticsCard
          {...defaultProps}
          emptyStateButtonIcon={<span data-testid="icon">+</span>}
        />
      );

      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByTestId('icon')).toHaveTextContent('+');
    });

    it('should render dropdown when options are provided', () => {
      const dropdownOptions = [
        { label: '1 ano', value: '1year' },
        { label: '6 meses', value: '6months' },
      ];

      render(
        <StatisticsCard
          {...defaultProps}
          dropdownOptions={dropdownOptions}
          selectedDropdownValue="1year"
        />
      );

      const dropdown = screen.getByRole('button', { name: /1 ano/i });
      expect(dropdown).toBeInTheDocument();
    });

    it('should not render dropdown when options are not provided', () => {
      render(<StatisticsCard {...defaultProps} />);

      expect(
        screen.queryByRole('button', { name: /Selecione um período/i })
      ).not.toBeInTheDocument();
    });

    it('should not render dropdown when options array is empty', () => {
      render(<StatisticsCard {...defaultProps} dropdownOptions={[]} />);

      expect(
        screen.queryByRole('button', { name: /Selecione um período/i })
      ).not.toBeInTheDocument();
    });

    it('should apply additional className when provided', () => {
      const { container } = render(
        <StatisticsCard {...defaultProps} className="custom-class" />
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('Interactions', () => {
    it('should call onEmptyStateButtonClick when button is clicked', () => {
      const handleClick = jest.fn();

      render(
        <StatisticsCard
          {...defaultProps}
          onEmptyStateButtonClick={handleClick}
        />
      );

      const button = screen.getByRole('button', { name: /Criar atividade/i });
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should call onDropdownChange when dropdown value changes', () => {
      const handleChange = jest.fn();
      const dropdownOptions = [
        { label: '1 ano', value: '1year' },
        { label: '6 meses', value: '6months' },
      ];

      render(
        <StatisticsCard
          {...defaultProps}
          dropdownOptions={dropdownOptions}
          selectedDropdownValue="1year"
          onDropdownChange={handleChange}
        />
      );

      const dropdownTrigger = screen.getByRole('button', { name: /1 ano/i });
      fireEvent.click(dropdownTrigger);

      const option = screen.getByRole('menuitem', { name: /6 meses/i });
      fireEvent.click(option);

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith('6months');
    });

    it('should display selected value in dropdown', () => {
      const dropdownOptions = [
        { label: '1 ano', value: '1year' },
        { label: '6 meses', value: '6months' },
      ];

      render(
        <StatisticsCard
          {...defaultProps}
          dropdownOptions={dropdownOptions}
          selectedDropdownValue="6months"
        />
      );

      const dropdown = screen.getByRole('button', { name: /6 meses/i });
      expect(dropdown).toBeInTheDocument();
    });

    it('should not call onDropdownChange when callback is not provided', () => {
      const dropdownOptions = [
        { label: '1 ano', value: '1year' },
        { label: '6 meses', value: '6months' },
      ];

      render(
        <StatisticsCard
          {...defaultProps}
          dropdownOptions={dropdownOptions}
          selectedDropdownValue="1year"
        />
      );

      const dropdownTrigger = screen.getByRole('button', { name: /1 ano/i });
      // Should not throw error when onChange is called without callback
      expect(() => {
        fireEvent.click(dropdownTrigger);
        const option = screen.getByRole('menuitem', { name: /6 meses/i });
        fireEvent.click(option);
      }).not.toThrow();
    });
  });

  describe('Styles', () => {
    it('should have dashed border on empty card', () => {
      const { container } = render(<StatisticsCard {...defaultProps} />);

      const emptyCard = container.querySelector('.border-dashed');
      expect(emptyCard).toBeInTheDocument();
      expect(emptyCard).toHaveClass('border');
      expect(emptyCard).toHaveClass('border-border-300');
    });

    it('should have correct base style classes applied', () => {
      const { container } = render(<StatisticsCard {...defaultProps} />);

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-background');
      expect(card).toHaveClass('rounded-xl');
      expect(card).toHaveClass('p-4');
    });

    it('should have correct button style classes', () => {
      render(<StatisticsCard {...defaultProps} />);

      const button = screen.getByRole('button', { name: /Criar atividade/i });
      expect(button).toHaveClass('border-primary-950');
      expect(button).toHaveClass('text-primary-950');
    });
  });

  describe('Accessibility', () => {
    it('button should be keyboard accessible', () => {
      const handleClick = jest.fn();

      render(
        <StatisticsCard
          {...defaultProps}
          onEmptyStateButtonClick={handleClick}
        />
      );

      const button = screen.getByRole('button', { name: /Criar atividade/i });
      button.focus();

      expect(button).toHaveFocus();
    });

    it('button should have accessible text', () => {
      render(<StatisticsCard {...defaultProps} />);

      const button = screen.getByRole('button', { name: /Criar atividade/i });
      expect(button).toBeInTheDocument();
    });

    it('dropdown should have proper accessible name', () => {
      const dropdownOptions = [
        { label: '1 ano', value: '1year' },
        { label: '6 meses', value: '6months' },
      ];

      render(
        <StatisticsCard
          {...defaultProps}
          dropdownOptions={dropdownOptions}
          selectedDropdownValue="1year"
        />
      );

      const dropdown = screen.getByRole('button', { name: /1 ano/i });
      expect(dropdown).toBeInTheDocument();
    });

    it('button should have type="button"', () => {
      render(<StatisticsCard {...defaultProps} />);

      const button = screen.getByRole('button', { name: /Criar atividade/i });
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing optional props', () => {
      render(<StatisticsCard {...defaultProps} />);

      expect(
        screen.getByText('Estatística das atividades')
      ).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render all dropdown options', () => {
      const dropdownOptions = [
        { label: '1 ano', value: '1year' },
        { label: '6 meses', value: '6months' },
        { label: '3 meses', value: '3months' },
      ];

      render(
        <StatisticsCard
          {...defaultProps}
          dropdownOptions={dropdownOptions}
          selectedDropdownValue="1year"
        />
      );

      // Open dropdown to see all options
      const dropdownTrigger = screen.getByRole('button', { name: /1 ano/i });
      fireEvent.click(dropdownTrigger);

      expect(
        screen.getByRole('menuitem', { name: /1 ano/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('menuitem', { name: /6 meses/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('menuitem', { name: /3 meses/i })
      ).toBeInTheDocument();
    });

    it('should handle empty className prop', () => {
      const { container } = render(
        <StatisticsCard {...defaultProps} className="" />
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-background');
    });
  });
});
