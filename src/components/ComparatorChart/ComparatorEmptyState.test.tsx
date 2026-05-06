import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComparatorEmptyState } from './ComparatorEmptyState';
import { DEFAULT_COMPARATOR_LABELS } from '../../types/comparator';

describe('ComparatorEmptyState', () => {
  const defaultProps = {
    onSelectClick: jest.fn(),
    canCompareSchools: true,
    canCompareSchoolYears: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the title', () => {
      render(<ComparatorEmptyState {...defaultProps} />);

      expect(
        screen.getByText(DEFAULT_COMPARATOR_LABELS.title)
      ).toBeInTheDocument();
    });

    it('should render chart icon svg', () => {
      const { container } = render(<ComparatorEmptyState {...defaultProps} />);

      const svg = container.querySelector('svg.w-12.h-12');
      expect(svg).toBeInTheDocument();
    });

    it('should render with vertical layout', () => {
      const { container } = render(<ComparatorEmptyState {...defaultProps} />);

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('flex', 'flex-col');
    });
  });

  describe('Description Text', () => {
    it('should show combined description when both options are available', () => {
      render(<ComparatorEmptyState {...defaultProps} />);

      expect(
        screen.getByText(
          /Selecione escolas ou turmas para visualizar a comparação/i
        )
      ).toBeInTheDocument();
    });

    it('should show schools-only description when only canCompareSchools is true', () => {
      render(
        <ComparatorEmptyState
          {...defaultProps}
          canCompareSchools={true}
          canCompareSchoolYears={false}
        />
      );

      expect(
        screen.getByText(/Selecione escolas para visualizar a comparação/i)
      ).toBeInTheDocument();
    });

    it('should show school years-only description when only canCompareSchoolYears is true', () => {
      render(
        <ComparatorEmptyState
          {...defaultProps}
          canCompareSchools={false}
          canCompareSchoolYears={true}
        />
      );

      expect(
        screen.getByText(/Selecione turmas para visualizar a comparação/i)
      ).toBeInTheDocument();
    });

    it('should show no access message when neither option is available', () => {
      render(
        <ComparatorEmptyState
          {...defaultProps}
          canCompareSchools={false}
          canCompareSchoolYears={false}
        />
      );

      expect(
        screen.getByText(DEFAULT_COMPARATOR_LABELS.noAccessMessage)
      ).toBeInTheDocument();
    });
  });

  describe('Button Rendering', () => {
    it('should render button when at least one comparison option is available', () => {
      render(<ComparatorEmptyState {...defaultProps} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should not render button when no comparison options are available', () => {
      render(
        <ComparatorEmptyState
          {...defaultProps}
          canCompareSchools={false}
          canCompareSchoolYears={false}
        />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should show "Selecionar comparação" when both options are available', () => {
      render(<ComparatorEmptyState {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /Selecionar comparação/i })
      ).toBeInTheDocument();
    });

    it('should show "Selecionar escolas" when only schools option is available', () => {
      render(
        <ComparatorEmptyState
          {...defaultProps}
          canCompareSchools={true}
          canCompareSchoolYears={false}
        />
      );

      expect(
        screen.getByRole('button', { name: /Selecionar escolas/i })
      ).toBeInTheDocument();
    });

    it('should show "Selecionar turmas" when only school years option is available', () => {
      render(
        <ComparatorEmptyState
          {...defaultProps}
          canCompareSchools={false}
          canCompareSchoolYears={true}
        />
      );

      expect(
        screen.getByRole('button', { name: /Selecionar turmas/i })
      ).toBeInTheDocument();
    });

    it('should render Plus icon in button', () => {
      render(<ComparatorEmptyState {...defaultProps} />);

      const button = screen.getByRole('button');
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Button Interaction', () => {
    it('should call onSelectClick when button is clicked', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(
        <ComparatorEmptyState {...defaultProps} onSelectClick={handleClick} />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should disable button when isLoading is true', () => {
      render(<ComparatorEmptyState {...defaultProps} isLoading={true} />);

      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should enable button when isLoading is false', () => {
      render(<ComparatorEmptyState {...defaultProps} isLoading={false} />);

      expect(screen.getByRole('button')).not.toBeDisabled();
    });
  });

  describe('Custom Labels', () => {
    it('should use custom title label', () => {
      render(
        <ComparatorEmptyState
          {...defaultProps}
          labels={{ title: 'Custom Title' }}
        />
      );

      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('should use custom button text for selectComparison', () => {
      render(
        <ComparatorEmptyState
          {...defaultProps}
          labels={{ selectComparison: 'Custom Select' }}
        />
      );

      expect(
        screen.getByRole('button', { name: /Custom Select/i })
      ).toBeInTheDocument();
    });

    it('should use custom schools label', () => {
      render(
        <ComparatorEmptyState
          {...defaultProps}
          canCompareSchools={true}
          canCompareSchoolYears={false}
          labels={{ schools: 'Unidades', selectSchools: 'Escolher Unidades' }}
        />
      );

      expect(
        screen.getByRole('button', { name: /Escolher Unidades/i })
      ).toBeInTheDocument();
    });

    it('should use custom schoolYears label', () => {
      render(
        <ComparatorEmptyState
          {...defaultProps}
          canCompareSchools={false}
          canCompareSchoolYears={true}
          labels={{
            schoolYears: 'Classes',
            selectSchoolYears: 'Escolher Classes',
          }}
        />
      );

      expect(
        screen.getByRole('button', { name: /Escolher Classes/i })
      ).toBeInTheDocument();
    });

    it('should use custom noAccessMessage', () => {
      render(
        <ComparatorEmptyState
          {...defaultProps}
          canCompareSchools={false}
          canCompareSchoolYears={false}
          labels={{ noAccessMessage: 'Custom no access message' }}
        />
      );

      expect(screen.getByText('Custom no access message')).toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
    it('should render icon container with correct styling', () => {
      const { container } = render(<ComparatorEmptyState {...defaultProps} />);

      const iconContainer = container.querySelector('.w-24.h-24.rounded-full');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass('bg-primary-100');
    });

    it('should center content', () => {
      const { container } = render(<ComparatorEmptyState {...defaultProps} />);

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('items-center', 'justify-center');
    });

    it('should have proper spacing', () => {
      const { container } = render(<ComparatorEmptyState {...defaultProps} />);

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('gap-6');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined labels gracefully', () => {
      render(<ComparatorEmptyState {...defaultProps} labels={undefined} />);

      expect(
        screen.getByText(DEFAULT_COMPARATOR_LABELS.title)
      ).toBeInTheDocument();
    });

    it('should handle partial labels object', () => {
      render(
        <ComparatorEmptyState {...defaultProps} labels={{ title: 'Partial' }} />
      );

      expect(screen.getByText('Partial')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Selecionar comparação/i })
      ).toBeInTheDocument();
    });
  });
});
