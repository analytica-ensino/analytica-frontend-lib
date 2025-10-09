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

  const mockData = [
    { label: 'Acertos', value: '85%', variant: 'high' as const },
    { label: 'Em andamento', value: 12, variant: 'medium' as const },
    { label: 'Erros', value: '15%', variant: 'low' as const },
    { label: 'Concluídas', value: 24, variant: 'total' as const },
  ];

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

    it('should render Plus icon in button', () => {
      render(<StatisticsCard {...defaultProps} />);

      const button = screen.getByRole('button', { name: /Criar atividade/i });
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should not render button when onEmptyStateButtonClick is undefined', () => {
      render(
        <StatisticsCard
          title="Test"
          emptyStateMessage="No data"
          emptyStateButtonText="Add Data"
        />
      );

      expect(screen.getByText('No data')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /Add Data/i })
      ).not.toBeInTheDocument();
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

      const dropdown = screen.getByRole('button', {
        name: 'Filtro de período',
      });
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
          data={mockData}
          dropdownOptions={dropdownOptions}
          selectedDropdownValue="1year"
          onDropdownChange={handleChange}
        />
      );

      const dropdownTrigger = screen.getByRole('button', {
        name: 'Filtro de período',
      });
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
          data={mockData}
          dropdownOptions={dropdownOptions}
          selectedDropdownValue="6months"
        />
      );

      const dropdown = screen.getByRole('button', {
        name: 'Filtro de período',
      });
      expect(dropdown).toBeInTheDocument();
      expect(dropdown).toHaveTextContent('6 meses');
    });

    it('should not call onDropdownChange when callback is not provided', () => {
      const dropdownOptions = [
        { label: '1 ano', value: '1year' },
        { label: '6 meses', value: '6months' },
      ];

      render(
        <StatisticsCard
          {...defaultProps}
          data={mockData}
          dropdownOptions={dropdownOptions}
          selectedDropdownValue="1year"
        />
      );

      const dropdownTrigger = screen.getByRole('button', {
        name: 'Filtro de período',
      });
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

    it('dropdown should have default aria-label', () => {
      const dropdownOptions = [
        { label: '1 ano', value: '1year' },
        { label: '6 meses', value: '6months' },
      ];

      render(
        <StatisticsCard
          {...defaultProps}
          data={mockData}
          dropdownOptions={dropdownOptions}
          selectedDropdownValue="1year"
        />
      );

      const dropdown = screen.getByRole('button', {
        name: 'Filtro de período',
      });
      expect(dropdown).toHaveAttribute('aria-label', 'Filtro de período');
    });

    it('dropdown should accept custom aria-label', () => {
      const dropdownOptions = [
        { label: '1 ano', value: '1year' },
        { label: '6 meses', value: '6months' },
      ];

      render(
        <StatisticsCard
          {...defaultProps}
          data={mockData}
          dropdownOptions={dropdownOptions}
          selectedDropdownValue="1year"
          dropdownAriaLabel="Custom period filter"
        />
      );

      const dropdown = screen.getByRole('button', {
        name: 'Custom period filter',
      });
      expect(dropdown).toHaveAttribute('aria-label', 'Custom period filter');
    });

    it('button should have type="button"', () => {
      render(<StatisticsCard {...defaultProps} />);

      const button = screen.getByRole('button', { name: /Criar atividade/i });
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('Data Variant', () => {
    it('should render data cards when data is provided', () => {
      render(<StatisticsCard title="Estatística" data={mockData} />);

      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('Acertos')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('Em andamento')).toBeInTheDocument();
      expect(screen.getByText('15%')).toBeInTheDocument();
      expect(screen.getByText('Erros')).toBeInTheDocument();
      expect(screen.getByText('24')).toBeInTheDocument();
      expect(screen.getByText('Concluídas')).toBeInTheDocument();
    });

    it('should not render empty state when data is provided', () => {
      render(
        <StatisticsCard
          title="Estatística"
          data={mockData}
          emptyStateMessage="No data"
          emptyStateButtonText="Create"
        />
      );

      expect(screen.queryByText('No data')).not.toBeInTheDocument();
      expect(screen.queryByText('Create')).not.toBeInTheDocument();
    });

    it('should apply correct variant styles', () => {
      const { container } = render(
        <StatisticsCard title="Estatística" data={mockData} />
      );

      const successCard = container.querySelector('.bg-success-background');
      expect(successCard).toBeInTheDocument();

      const warningCard = container.querySelector('.bg-warning-background');
      expect(warningCard).toBeInTheDocument();

      const errorCard = container.querySelector('.bg-error-background');
      expect(errorCard).toBeInTheDocument();

      const infoCard = container.querySelector('.bg-info-background');
      expect(infoCard).toBeInTheDocument();
    });

    it('should render data in grid layout with responsive classes', () => {
      const { container } = render(
        <StatisticsCard title="Estatística" data={mockData} />
      );

      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass(
        'grid-cols-1',
        'sm:grid-cols-2',
        'lg:grid-cols-4'
      );
    });

    it('should render empty state when data array is empty', () => {
      render(<StatisticsCard {...defaultProps} data={[]} />);

      expect(screen.getByText(/Sem dados por enquanto/i)).toBeInTheDocument();
      expect(screen.getByText('Criar atividade')).toBeInTheDocument();
    });

    it('should render empty state when data is undefined', () => {
      render(<StatisticsCard {...defaultProps} />);

      expect(screen.getByText(/Sem dados por enquanto/i)).toBeInTheDocument();
      expect(screen.getByText('Criar atividade')).toBeInTheDocument();
    });

    it('should handle data with dropdown', () => {
      const dropdownOptions = [
        { label: '1 ano', value: '1year' },
        { label: '6 meses', value: '6months' },
      ];

      render(
        <StatisticsCard
          title="Estatística"
          data={mockData}
          dropdownOptions={dropdownOptions}
          selectedDropdownValue="1year"
        />
      );

      expect(screen.getByText('85%')).toBeInTheDocument();
      const dropdown = screen.getByRole('button', {
        name: 'Filtro de período',
      });
      expect(dropdown).toBeInTheDocument();
      expect(dropdown).toHaveTextContent('1 ano');
    });

    it('should render numeric values correctly', () => {
      const numericData = [
        { label: 'Total', value: 100, variant: 'total' as const },
      ];

      render(<StatisticsCard title="Estatística" data={numericData} />);

      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
    });

    it('should render string values correctly', () => {
      const stringData = [
        { label: 'Taxa', value: '95.5%', variant: 'high' as const },
      ];

      render(<StatisticsCard title="Estatística" data={stringData} />);

      expect(screen.getByText('95.5%')).toBeInTheDocument();
      expect(screen.getByText('Taxa')).toBeInTheDocument();
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
          data={mockData}
          dropdownOptions={dropdownOptions}
          selectedDropdownValue="1year"
        />
      );

      // Open dropdown to see all options
      const dropdownTrigger = screen.getByRole('button', {
        name: 'Filtro de período',
      });
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
