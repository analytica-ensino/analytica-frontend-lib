import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComparatorSelectTypeStep } from './ComparatorSelectTypeStep';
import { DEFAULT_COMPARATOR_LABELS } from '../../types/comparator';

describe('ComparatorSelectTypeStep', () => {
  const defaultProps = {
    onSelectType: jest.fn(),
    canCompareSchools: true,
    canCompareSchoolYears: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render instruction text', () => {
      render(<ComparatorSelectTypeStep {...defaultProps} />);

      expect(
        screen.getByText(DEFAULT_COMPARATOR_LABELS.selectComparisonType)
      ).toBeInTheDocument();
    });

    it('should render both type options when both are available', () => {
      render(<ComparatorSelectTypeStep {...defaultProps} />);

      expect(
        screen.getByText(DEFAULT_COMPARATOR_LABELS.schools)
      ).toBeInTheDocument();
      expect(
        screen.getByText(DEFAULT_COMPARATOR_LABELS.schoolYears)
      ).toBeInTheDocument();
    });

    it('should render school option with description', () => {
      render(<ComparatorSelectTypeStep {...defaultProps} />);

      expect(
        screen.getByText(DEFAULT_COMPARATOR_LABELS.compareSchoolsDescription)
      ).toBeInTheDocument();
    });

    it('should render school years option with description', () => {
      render(<ComparatorSelectTypeStep {...defaultProps} />);

      expect(
        screen.getByText(
          DEFAULT_COMPARATOR_LABELS.compareSchoolYearsDescription
        )
      ).toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    it('should only render schools option when canCompareSchoolYears is false', () => {
      render(
        <ComparatorSelectTypeStep
          {...defaultProps}
          canCompareSchoolYears={false}
        />
      );

      expect(
        screen.getByText(DEFAULT_COMPARATOR_LABELS.schools)
      ).toBeInTheDocument();
      expect(
        screen.queryByText(DEFAULT_COMPARATOR_LABELS.schoolYears)
      ).not.toBeInTheDocument();
    });

    it('should only render school years option when canCompareSchools is false', () => {
      render(
        <ComparatorSelectTypeStep {...defaultProps} canCompareSchools={false} />
      );

      expect(
        screen.queryByText(DEFAULT_COMPARATOR_LABELS.schools)
      ).not.toBeInTheDocument();
      expect(
        screen.getByText(DEFAULT_COMPARATOR_LABELS.schoolYears)
      ).toBeInTheDocument();
    });

    it('should show no access message when neither option is available', () => {
      render(
        <ComparatorSelectTypeStep
          {...defaultProps}
          canCompareSchools={false}
          canCompareSchoolYears={false}
        />
      );

      expect(
        screen.getByText(DEFAULT_COMPARATOR_LABELS.noAccessMessage)
      ).toBeInTheDocument();
      expect(
        screen.queryByText(DEFAULT_COMPARATOR_LABELS.schools)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(DEFAULT_COMPARATOR_LABELS.schoolYears)
      ).not.toBeInTheDocument();
    });
  });

  describe('Button Interaction', () => {
    it('should call onSelectType with "school" when schools button is clicked', async () => {
      const user = userEvent.setup();
      const handleSelectType = jest.fn();

      render(
        <ComparatorSelectTypeStep
          {...defaultProps}
          onSelectType={handleSelectType}
        />
      );

      const schoolsButton = screen
        .getByText(DEFAULT_COMPARATOR_LABELS.schools)
        .closest('button');
      await user.click(schoolsButton!);

      expect(handleSelectType).toHaveBeenCalledTimes(1);
      expect(handleSelectType).toHaveBeenCalledWith('school');
    });

    it('should call onSelectType with "schoolYear" when school years button is clicked', async () => {
      const user = userEvent.setup();
      const handleSelectType = jest.fn();

      render(
        <ComparatorSelectTypeStep
          {...defaultProps}
          onSelectType={handleSelectType}
        />
      );

      const schoolYearsButton = screen
        .getByText(DEFAULT_COMPARATOR_LABELS.schoolYears)
        .closest('button');
      await user.click(schoolYearsButton!);

      expect(handleSelectType).toHaveBeenCalledTimes(1);
      expect(handleSelectType).toHaveBeenCalledWith('schoolYear');
    });
  });

  describe('Custom Labels', () => {
    it('should use custom schools label', () => {
      render(
        <ComparatorSelectTypeStep
          {...defaultProps}
          labels={{ schools: 'Unidades' }}
        />
      );

      expect(screen.getByText('Unidades')).toBeInTheDocument();
    });

    it('should use custom schoolYears label', () => {
      render(
        <ComparatorSelectTypeStep
          {...defaultProps}
          labels={{ schoolYears: 'Classes' }}
        />
      );

      expect(screen.getByText('Classes')).toBeInTheDocument();
    });

    it('should use custom compareSchoolsDescription label', () => {
      render(
        <ComparatorSelectTypeStep
          {...defaultProps}
          labels={{ compareSchoolsDescription: 'Custom school description' }}
        />
      );

      expect(screen.getByText('Custom school description')).toBeInTheDocument();
    });

    it('should use custom compareSchoolYearsDescription label', () => {
      render(
        <ComparatorSelectTypeStep
          {...defaultProps}
          labels={{
            compareSchoolYearsDescription: 'Custom school years description',
          }}
        />
      );

      expect(
        screen.getByText('Custom school years description')
      ).toBeInTheDocument();
    });

    it('should use custom selectComparisonType label', () => {
      render(
        <ComparatorSelectTypeStep
          {...defaultProps}
          labels={{ selectComparisonType: 'Choose type' }}
        />
      );

      expect(screen.getByText('Choose type')).toBeInTheDocument();
    });

    it('should use custom noAccessMessage label', () => {
      render(
        <ComparatorSelectTypeStep
          {...defaultProps}
          canCompareSchools={false}
          canCompareSchoolYears={false}
          labels={{ noAccessMessage: 'Custom no access' }}
        />
      );

      expect(screen.getByText('Custom no access')).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    it('should render options with proper styling', () => {
      render(<ComparatorSelectTypeStep {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('flex-1', 'p-4', 'rounded-xl', 'text-left');
      });
    });

    it('should render with flex layout', () => {
      const { container } = render(
        <ComparatorSelectTypeStep {...defaultProps} />
      );

      const optionsContainer = container.querySelector('.flex.gap-4');
      expect(optionsContainer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined labels gracefully', () => {
      render(<ComparatorSelectTypeStep {...defaultProps} labels={undefined} />);

      expect(
        screen.getByText(DEFAULT_COMPARATOR_LABELS.schools)
      ).toBeInTheDocument();
    });

    it('should handle partial labels object', () => {
      render(
        <ComparatorSelectTypeStep
          {...defaultProps}
          labels={{ schools: 'Custom' }}
        />
      );

      expect(screen.getByText('Custom')).toBeInTheDocument();
      expect(
        screen.getByText(DEFAULT_COMPARATOR_LABELS.schoolYears)
      ).toBeInTheDocument();
    });
  });
});
