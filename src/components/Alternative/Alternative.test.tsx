import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import {
  AlternativesList,
  Alternative,
  HeaderAlternative,
} from './Alternative';

/**
 * Mock for useId hook to ensure consistent IDs in tests
 */
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useId: () => 'test-id',
}));

describe('AlternativesList', () => {
  const mockAlternatives: Alternative[] = [
    { value: 'a', label: 'Alternativa A' },
    { value: 'b', label: 'Alternativa B' },
    { value: 'c', label: 'Alternativa C' },
  ];

  const mockAlternativesWithStatus: Alternative[] = [
    { value: 'a', label: 'Alternativa A', status: 'correct' },
    { value: 'b', label: 'Alternativa B', status: 'incorrect' },
    { value: 'c', label: 'Alternativa C' },
  ];

  const mockAlternativesDetailed: Alternative[] = [
    {
      value: 'a',
      label: 'Alternativa A',
      description: 'Descrição da alternativa A',
      status: 'correct',
    },
    {
      value: 'b',
      label: 'Alternativa B',
      description: 'Descrição da alternativa B',
    },
    { value: 'c', label: 'Alternativa C', disabled: true },
  ];

  describe('Basic rendering', () => {
    it('renders basic alternatives list', () => {
      render(<AlternativesList alternatives={mockAlternatives} />);

      expect(screen.getByText('Alternativa A')).toBeInTheDocument();
      expect(screen.getByText('Alternativa B')).toBeInTheDocument();
      expect(screen.getByText('Alternativa C')).toBeInTheDocument();
    });

    it('renders with default selected value', () => {
      render(
        <AlternativesList alternatives={mockAlternatives} defaultValue="b" />
      );

      const radioB = screen.getByDisplayValue('b');
      expect(radioB).toBeChecked();
    });

    it('generates unique group name when not provided', () => {
      render(<AlternativesList alternatives={mockAlternatives} />);

      const radioA = screen.getByDisplayValue('a');
      expect(radioA).toHaveAttribute('name', 'alternatives-test-id');
    });

    it('uses custom group name', () => {
      render(
        <AlternativesList alternatives={mockAlternatives} name="custom-group" />
      );

      const radioA = screen.getByDisplayValue('a');
      expect(radioA).toHaveAttribute('name', 'custom-group');
    });

    it('applies custom CSS classes', () => {
      const { container } = render(
        <AlternativesList
          alternatives={mockAlternatives}
          className="custom-class"
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });
  });

  describe('Layouts', () => {
    it('applies default layout', () => {
      const { container } = render(
        <AlternativesList alternatives={mockAlternatives} />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('gap-3.5');
    });

    it('applies compact layout', () => {
      const { container } = render(
        <AlternativesList alternatives={mockAlternatives} layout="compact" />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('gap-2');
    });

    it('applies detailed layout with descriptions', () => {
      const { container } = render(
        <AlternativesList
          alternatives={mockAlternativesDetailed}
          layout="detailed"
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('gap-4');
      expect(
        screen.getByText('Descrição da alternativa A')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Descrição da alternativa B')
      ).toBeInTheDocument();
    });
  });

  describe('Alternative status', () => {
    it('applies styles for correct alternative', () => {
      const { container } = render(
        <AlternativesList alternatives={mockAlternativesWithStatus} />
      );

      const correctAlternative = container.querySelector(
        '.bg-success-background'
      );
      expect(correctAlternative).toBeInTheDocument();
      expect(correctAlternative).toHaveClass('border-success-300');
    });

    it('applies styles for incorrect alternative', () => {
      const { container } = render(
        <AlternativesList alternatives={mockAlternativesWithStatus} />
      );

      const incorrectAlternative = container.querySelector(
        '.bg-error-background'
      );
      expect(incorrectAlternative).toBeInTheDocument();
      expect(incorrectAlternative).toHaveClass('border-error-300');
    });

    it('applies default styles for neutral alternative', () => {
      const { container } = render(
        <AlternativesList alternatives={mockAlternatives} />
      );

      const neutralAlternatives = container.querySelectorAll('.bg-background');
      expect(neutralAlternatives.length).toBeGreaterThan(0);
    });

    it('displays correct answer badge', () => {
      render(<AlternativesList alternatives={mockAlternativesWithStatus} />);

      expect(screen.getByText('Resposta correta')).toBeInTheDocument();
    });

    it('displays incorrect answer badge', () => {
      render(<AlternativesList alternatives={mockAlternativesWithStatus} />);

      expect(screen.getByText('Resposta incorreta')).toBeInTheDocument();
    });
  });

  describe('Disabled state', () => {
    it('disables all alternatives when disabled is true', () => {
      render(<AlternativesList alternatives={mockAlternatives} disabled />);

      // Check if hidden inputs are disabled
      const hiddenInputs = screen.getAllByDisplayValue(/[abc]/);
      hiddenInputs.forEach((input) => {
        expect(input).toBeDisabled();
      });
    });

    it('disables specific alternative', () => {
      const alternativesWithDisabled = [
        ...mockAlternatives,
        { value: 'd', label: 'Alternativa D', disabled: true },
      ];

      render(<AlternativesList alternatives={alternativesWithDisabled} />);

      const disabledRadio = screen.getByDisplayValue('d');
      expect(disabledRadio).toBeDisabled();

      const enabledRadio = screen.getByDisplayValue('a');
      expect(enabledRadio).not.toBeDisabled();
    });

    it('applies opacity for disabled alternative', () => {
      const { container } = render(
        <AlternativesList alternatives={mockAlternativesDetailed} />
      );

      const disabledElement = container.querySelector('.opacity-50');
      expect(disabledElement).toBeInTheDocument();
    });
  });

  describe('Interactive mode', () => {
    it('allows alternative selection', async () => {
      const handleValueChange = jest.fn();
      const user = userEvent.setup();

      render(
        <AlternativesList
          alternatives={mockAlternatives}
          onValueChange={handleValueChange}
        />
      );

      const radioB = screen.getByDisplayValue('b');
      await user.click(radioB);

      expect(handleValueChange).toHaveBeenCalledWith('b');
    });

    it('works as controlled component', () => {
      const { rerender } = render(
        <AlternativesList alternatives={mockAlternatives} value="a" />
      );

      let radioA = screen.getByDisplayValue('a');
      expect(radioA).toBeChecked();

      rerender(<AlternativesList alternatives={mockAlternatives} value="b" />);

      const radioB = screen.getByDisplayValue('b');
      expect(radioB).toBeChecked();
      expect(radioA).not.toBeChecked();
    });

    it('applies hover classes in interactive mode', () => {
      const { container } = render(
        <AlternativesList alternatives={mockAlternatives} />
      );

      const neutralAlternative = container.querySelector(
        '.hover\\:bg-background-50'
      );
      expect(neutralAlternative).toBeInTheDocument();
    });
  });

  describe('Readonly mode', () => {
    it('renders in readonly mode without RadioGroup', () => {
      render(
        <AlternativesList
          alternatives={mockAlternativesWithStatus}
          mode="readonly"
          selectedValue="b"
        />
      );

      // Should not have functional radio elements
      const radioGroup = screen.queryByRole('radiogroup');
      expect(radioGroup).not.toBeInTheDocument();

      // Should display alternatives
      expect(screen.getByText('Alternativa A')).toBeInTheDocument();
      expect(screen.getByText('Alternativa B')).toBeInTheDocument();
    });

    it('shows user selected alternative in readonly mode', () => {
      const { container } = render(
        <AlternativesList
          alternatives={mockAlternativesWithStatus}
          mode="readonly"
          selectedValue="b"
        />
      );

      // Check if there's a visual radio marked
      const selectedRadios = container.querySelectorAll('.border-primary-950');
      expect(selectedRadios.length).toBeGreaterThan(0);
    });

    it('marks incorrect answer when user selects wrong alternative', () => {
      render(
        <AlternativesList
          alternatives={mockAlternativesWithStatus}
          mode="readonly"
          selectedValue="b" // User selected 'b' which has status 'incorrect'
        />
      );

      expect(screen.getByText('Resposta incorreta')).toBeInTheDocument();
    });

    it('shows correct answer regardless of user selection', () => {
      render(
        <AlternativesList
          alternatives={mockAlternativesWithStatus}
          mode="readonly"
          selectedValue="b" // User selected 'b'
        />
      );

      // Alternative 'a' has status 'correct', so should show as correct
      expect(screen.getByText('Resposta correta')).toBeInTheDocument();
    });

    it('does not apply hover classes in readonly mode', () => {
      const { container } = render(
        <AlternativesList alternatives={mockAlternatives} mode="readonly" />
      );

      const hoverClasses = container.querySelector('.hover\\:bg-background-50');
      expect(hoverClasses).not.toBeInTheDocument();
    });

    it('renders visual radio without functionality in readonly', () => {
      const { container } = render(
        <AlternativesList
          alternatives={mockAlternatives}
          mode="readonly"
          selectedValue="a"
        />
      );

      const visualRadios = container.querySelectorAll('.rounded-full.border-2');
      expect(visualRadios.length).toBe(mockAlternatives.length);

      // Check if has cursor-default (not clickable)
      const radioWithCursor = container.querySelector('.cursor-default');
      expect(radioWithCursor).toBeInTheDocument();
    });
  });

  describe('Detailed layout', () => {
    it('renders detailed layout with all features', () => {
      render(
        <AlternativesList
          alternatives={mockAlternativesDetailed}
          layout="detailed"
        />
      );

      // Check if descriptions are present
      expect(
        screen.getByText('Descrição da alternativa A')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Descrição da alternativa B')
      ).toBeInTheDocument();

      // Check if badge is present
      expect(screen.getByText('Resposta correta')).toBeInTheDocument();
    });

    it('renders detailed layout in readonly mode', () => {
      render(
        <AlternativesList
          alternatives={mockAlternativesDetailed}
          layout="detailed"
          mode="readonly"
          selectedValue="b"
        />
      );

      expect(
        screen.getByText('Descrição da alternativa A')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Descrição da alternativa B')
      ).toBeInTheDocument();
      expect(screen.getByText('Resposta correta')).toBeInTheDocument();
    });

    it('applies correct styles for detailed layout', () => {
      const { container } = render(
        <AlternativesList
          alternatives={mockAlternativesDetailed}
          layout="detailed"
        />
      );

      const detailedItems = container.querySelectorAll(
        '.border-2.rounded-lg.p-4'
      );
      expect(detailedItems.length).toBe(mockAlternativesDetailed.length);
    });
  });

  describe('Alternatives without value', () => {
    it('generates alternative ID when value is not present', () => {
      const alternativesWithoutValue: Alternative[] = [
        { value: '', label: 'Alternativa sem valor' },
        { value: 'b', label: 'Alternativa B' },
      ];

      const { container } = render(
        <AlternativesList alternatives={alternativesWithoutValue} />
      );

      // Should generate ID based on index
      const element = container.querySelector('#alt-0');
      expect(element).toBeInTheDocument();
    });
  });

  describe('User interactions', () => {
    it('allows clicking on label to select', async () => {
      const handleValueChange = jest.fn();
      const user = userEvent.setup();

      render(
        <AlternativesList
          alternatives={mockAlternatives}
          onValueChange={handleValueChange}
        />
      );

      const labelB = screen.getByText('Alternativa B');
      await user.click(labelB);

      expect(handleValueChange).toHaveBeenCalledWith('b');
    });

    it('does not allow interaction with disabled alternatives', async () => {
      const handleValueChange = jest.fn();
      const user = userEvent.setup();

      render(
        <AlternativesList
          alternatives={mockAlternativesDetailed}
          onValueChange={handleValueChange}
        />
      );

      const disabledLabel = screen.getByText('Alternativa C');
      await user.click(disabledLabel);

      expect(handleValueChange).not.toHaveBeenCalledWith('c');
    });

    it('changes text color based on selection state', async () => {
      const handleValueChange = jest.fn();
      const user = userEvent.setup();

      render(
        <AlternativesList
          alternatives={mockAlternatives}
          onValueChange={handleValueChange}
        />
      );

      // Initially, all labels should have text-text-600 (not selected)
      const labelA = screen.getByText('Alternativa A');
      const labelB = screen.getByText('Alternativa B');
      const labelC = screen.getByText('Alternativa C');

      expect(labelA).toHaveClass('text-text-600');
      expect(labelA).not.toHaveClass('text-primary-950');
      expect(labelB).toHaveClass('text-text-600');
      expect(labelB).not.toHaveClass('text-primary-950');
      expect(labelC).toHaveClass('text-text-600');
      expect(labelC).not.toHaveClass('text-primary-950');

      // Click on alternative B
      await user.click(labelB);

      // After selection, B should have text-primary-950, others should remain text-text-600
      expect(labelA).toHaveClass('text-text-600');
      expect(labelA).not.toHaveClass('text-text-950');
      expect(labelB).toHaveClass('text-text-950');
      expect(labelB).not.toHaveClass('text-text-600');
      expect(labelC).toHaveClass('text-text-600');
      expect(labelC).not.toHaveClass('text-primary-950');

      // Click on alternative A
      await user.click(labelA);

      // Now A should have text-primary-950, B and C should have text-text-600
      expect(labelA).toHaveClass('text-primary-950');
      expect(labelA).not.toHaveClass('text-text-600');
      expect(labelB).toHaveClass('text-text-600');
      expect(labelB).not.toHaveClass('text-primary-950');
      expect(labelC).toHaveClass('text-text-600');
      expect(labelC).not.toHaveClass('text-primary-950');
    });

    it('changes text color in detailed layout based on selection state', async () => {
      const handleValueChange = jest.fn();
      const user = userEvent.setup();

      render(
        <AlternativesList
          alternatives={mockAlternativesDetailed}
          layout="detailed"
          onValueChange={handleValueChange}
        />
      );

      // Initially, all labels should have text-text-600 (not selected)
      const labelA = screen.getByText('Alternativa A');
      const labelB = screen.getByText('Alternativa B');

      expect(labelA).toHaveClass('text-text-600');
      expect(labelA).not.toHaveClass('text-text-950');
      expect(labelB).toHaveClass('text-text-600');
      expect(labelB).not.toHaveClass('text-text-950');

      // Click on alternative B
      await user.click(labelB);

      // After selection, B should have text-primary-950, A should remain text-text-600
      expect(labelA).toHaveClass('text-text-600');
      expect(labelA).not.toHaveClass('text-text-950');
      expect(labelB).toHaveClass('text-text-950');
      expect(labelB).not.toHaveClass('text-text-600');
    });
  });

  describe('Accessibility', () => {
    it('associates labels correctly with inputs', () => {
      render(<AlternativesList alternatives={mockAlternatives} />);

      const radioA = screen.getByDisplayValue('a');
      const labelA = screen.getByText('Alternativa A');

      expect(labelA).toHaveAttribute('for', radioA.id);
    });

    it('has accessible radiogroup structure', () => {
      render(<AlternativesList alternatives={mockAlternatives} />);

      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).toBeInTheDocument();

      const radios = screen.getAllByRole('radio', { hidden: true });
      // Now there are 2 radio elements per alternative (accessible + visual)
      expect(radios).toHaveLength(mockAlternatives.length);
    });
  });

  describe('Edge cases', () => {
    it('handles empty alternatives list', () => {
      const { container } = render(<AlternativesList alternatives={[]} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toBeInTheDocument();
      expect(wrapper.children).toHaveLength(0);
    });

    it("handles alternatives that don't have label", () => {
      const alternativesWithoutLabel: Alternative[] = [
        { value: 'a', label: '' },
        { value: 'b', label: 'Alternativa B' },
      ];

      render(<AlternativesList alternatives={alternativesWithoutLabel} />);

      expect(screen.getByDisplayValue('a')).toBeInTheDocument();
      expect(screen.getByText('Alternativa B')).toBeInTheDocument();
    });

    it('works with only one alternative', () => {
      const singleAlternative: Alternative[] = [
        { value: 'single', label: 'Única alternativa' },
      ];

      render(<AlternativesList alternatives={singleAlternative} />);

      expect(screen.getByText('Única alternativa')).toBeInTheDocument();
      expect(screen.getByDisplayValue('single')).toBeInTheDocument();
    });
  });

  describe('Complex visual states', () => {
    it('combines status and disabled correctly', () => {
      const complexAlternatives: Alternative[] = [
        {
          value: 'a',
          label: 'Correta e desabilitada',
          status: 'correct',
          disabled: true,
        },
        {
          value: 'b',
          label: 'Incorreta e desabilitada',
          status: 'incorrect',
          disabled: true,
        },
      ];

      const { container } = render(
        <AlternativesList alternatives={complexAlternatives} />
      );

      // Should have elements with opacity and status
      const correctDisabled = container.querySelector(
        '.bg-success-background.opacity-50'
      );
      const incorrectDisabled = container.querySelector(
        '.bg-error-background.opacity-50'
      );

      expect(correctDisabled).toBeInTheDocument();
      expect(incorrectDisabled).toBeInTheDocument();
    });

    it('renders correctly in readonly with detailed layout', () => {
      render(
        <AlternativesList
          alternatives={mockAlternativesDetailed}
          mode="readonly"
          layout="detailed"
          selectedValue="a"
        />
      );

      expect(screen.getByText('Alternativa A')).toBeInTheDocument();
      expect(
        screen.getByText('Descrição da alternativa A')
      ).toBeInTheDocument();
      expect(screen.getByText('Resposta correta')).toBeInTheDocument();
    });
  });

  describe('Conditional badge rendering', () => {
    it('does not render badge when status is neutral', () => {
      render(<AlternativesList alternatives={mockAlternatives} />);

      expect(screen.queryByText('Resposta correta')).not.toBeInTheDocument();
      expect(screen.queryByText('Resposta incorreta')).not.toBeInTheDocument();
    });

    it('renders badges only for alternatives with status', () => {
      const mixedAlternatives: Alternative[] = [
        { value: 'a', label: 'Alternativa A', status: 'correct' },
        { value: 'b', label: 'Alternativa B' }, // without status
        { value: 'c', label: 'Alternativa C', status: 'incorrect' },
      ];

      render(<AlternativesList alternatives={mixedAlternatives} />);

      expect(screen.getByText('Resposta correta')).toBeInTheDocument();
      expect(screen.getByText('Resposta incorreta')).toBeInTheDocument();

      // Should have only 2 badges (not 3)
      const badges = screen.getAllByText(/Resposta/);
      expect(badges).toHaveLength(2);
    });
  });

  describe('getStatusStyles function with default value', () => {
    it('applies hover classes by default when isReadonly is not provided (default value false)', () => {
      // Test to cover line 96: isReadonly: boolean = false
      const { container } = render(
        <AlternativesList
          alternatives={mockAlternatives}
          mode="interactive" // interactive mode uses default value of isReadonly = false
        />
      );

      // Check if hover classes are present (behavior when isReadonly = false by default)
      const hoverElements = container.querySelectorAll(
        '.hover\\:bg-background-50'
      );
      expect(hoverElements.length).toBeGreaterThan(0);

      // Check that there are no elements with specific status (neutral status)
      const neutralAlternatives = container.querySelectorAll(
        '.bg-background.border-border-100'
      );
      expect(neutralAlternatives.length).toBeGreaterThan(0);
    });

    it('does not apply hover classes when isReadonly is explicitly true', () => {
      // Comparison test to ensure default value is working
      const { container } = render(
        <AlternativesList
          alternatives={mockAlternatives}
          mode="readonly" // readonly mode sets isReadonly = true explicitly
        />
      );

      // Check that there are NO hover classes (behavior when isReadonly = true)
      const hoverElements = container.querySelectorAll(
        '.hover\\:bg-background-50'
      );
      expect(hoverElements.length).toBe(0);
    });
  });

  describe('Alternative.disabled in readonly mode (line 212)', () => {
    it('applies opacity-50 for disabled alternative in readonly mode', () => {
      // Specific test for line 212: alternative.disabled ? 'opacity-50' : ''
      const alternativesWithDisabled: Alternative[] = [
        { value: 'a', label: 'Alternativa habilitada' },
        { value: 'b', label: 'Alternativa desabilitada', disabled: true },
        {
          value: 'c',
          label: 'Alternativa com status e disabled',
          status: 'correct',
          disabled: true,
        },
      ];

      const { container } = render(
        <AlternativesList
          alternatives={alternativesWithDisabled}
          mode="readonly"
          selectedValue="a"
        />
      );

      // Check that there are exactly 2 elements with opacity-50 (the two disabled alternatives)
      const disabledElements = container.querySelectorAll('.opacity-50');
      expect(disabledElements).toHaveLength(2);

      // Check that enabled alternative does NOT have opacity-50
      const enabledElement = container.querySelector('span');
      expect(enabledElement?.closest('.opacity-50')).toBeNull();

      // Check that labels of disabled alternatives are present
      expect(screen.getByText('Alternativa desabilitada')).toBeInTheDocument();
      expect(
        screen.getByText('Alternativa com status e disabled')
      ).toBeInTheDocument();
    });

    it('does not apply opacity-50 when alternative.disabled is false in readonly mode', () => {
      // Test for the opposite side of the condition (alternative.disabled ? 'opacity-50' : '')
      const alternativesEnabled: Alternative[] = [
        { value: 'a', label: 'Alternativa A', disabled: false },
        { value: 'b', label: 'Alternativa B' }, // disabled undefined (falsy)
      ];

      const { container } = render(
        <AlternativesList alternatives={alternativesEnabled} mode="readonly" />
      );

      // Check that there are NO elements with opacity-50
      const disabledElements = container.querySelectorAll('.opacity-50');
      expect(disabledElements).toHaveLength(0);
    });

    it('applies opacity-50 for disabled alternative in detailed readonly layout', () => {
      // Test to ensure line 212 also works in detailed layout
      const alternativesWithDisabledDetailed: Alternative[] = [
        {
          value: 'a',
          label: 'Alternativa detalhada desabilitada',
          description: 'Descrição da alternativa',
          disabled: true,
          status: 'incorrect',
        },
      ];

      const { container } = render(
        <AlternativesList
          alternatives={alternativesWithDisabledDetailed}
          mode="readonly"
          layout="detailed"
        />
      );

      // Check that element with opacity-50 exists in detailed layout
      const disabledElement = container.querySelector('.opacity-50');
      expect(disabledElement).toBeInTheDocument();
      expect(disabledElement).toHaveClass('border-2', 'rounded-lg', 'p-4');

      // Check that description is present even with disabled
      expect(screen.getByText('Descrição da alternativa')).toBeInTheDocument();
    });
  });
});

describe('HeaderAlternative', () => {
  const mockProps = {
    title: 'Questão 1',
    subTitle: 'Matemática - Álgebra',
    content: 'Resolva a equação quadrática x² + 5x + 6 = 0.',
  };

  describe('Basic rendering', () => {
    it('renders with all required props', () => {
      render(<HeaderAlternative {...mockProps} />);

      expect(screen.getByText('Questão 1')).toBeInTheDocument();
      expect(screen.getByText('Matemática - Álgebra')).toBeInTheDocument();
      expect(
        screen.getByText('Resolva a equação quadrática x² + 5x + 6 = 0.')
      ).toBeInTheDocument();
    });

    it('renders with different content', () => {
      const differentProps = {
        title: 'Análise de Texto',
        subTitle: 'Português - Literatura',
        content: 'Leia o texto e responda às questões propostas.',
      };

      render(<HeaderAlternative {...differentProps} />);

      expect(screen.getByText('Análise de Texto')).toBeInTheDocument();
      expect(screen.getByText('Português - Literatura')).toBeInTheDocument();
      expect(
        screen.getByText('Leia o texto e responda às questões propostas.')
      ).toBeInTheDocument();
    });

    it('applies default CSS classes', () => {
      const { container } = render(<HeaderAlternative {...mockProps} />);

      const headerElement = container.firstChild as HTMLElement;
      expect(headerElement).toHaveClass(
        'bg-background',
        'p-4',
        'flex',
        'flex-col',
        'gap-4',
        'rounded-xl'
      );
    });

    it('applies custom CSS classes', () => {
      const { container } = render(
        <HeaderAlternative {...mockProps} className="custom-class" />
      );

      const headerElement = container.firstChild as HTMLElement;
      expect(headerElement).toHaveClass('custom-class');
    });
  });

  describe('Content structure', () => {
    it('renders title with correct styling', () => {
      render(<HeaderAlternative {...mockProps} />);

      const titleElement = screen.getByText('Questão 1');
      expect(titleElement).toHaveClass('text-text-950', 'font-bold', 'text-lg');
    });

    it('renders subtitle with correct styling', () => {
      render(<HeaderAlternative {...mockProps} />);

      const subtitleElement = screen.getByText('Matemática - Álgebra');
      expect(subtitleElement).toHaveClass('text-text-700', 'text-sm');
    });

    it('renders content with correct styling', () => {
      render(<HeaderAlternative {...mockProps} />);

      const contentElement = screen.getByText(
        'Resolva a equação quadrática x² + 5x + 6 = 0.'
      );
      expect(contentElement).toHaveClass('text-text-950', 'text-md');
    });

    it('has correct flex structure', () => {
      const { container } = render(<HeaderAlternative {...mockProps} />);

      const headerElement = container.firstChild as HTMLElement;
      const titleContainer = headerElement.querySelector('span');

      expect(titleContainer).toHaveClass('flex', 'flex-col');
    });
  });

  describe('ForwardRef functionality', () => {
    it('forwards ref correctly', () => {
      const ref = jest.fn();
      const { container } = render(
        <HeaderAlternative {...mockProps} ref={ref} />
      );

      expect(ref).toHaveBeenCalledWith(container.firstChild);
    });

    it('forwards HTML attributes', () => {
      const { container } = render(
        <HeaderAlternative
          {...mockProps}
          data-testid="header-test"
          onClick={() => {}}
        />
      );

      const headerElement = container.firstChild as HTMLElement;
      expect(headerElement).toHaveAttribute('data-testid', 'header-test');
    });
  });

  describe('Long content handling', () => {
    it('renders very long title', () => {
      const longTitleProps = {
        ...mockProps,
        title:
          'Análise Comparativa Abrangente entre os Sistemas Econômicos Capitalista e Socialista no Contexto Histórico da Guerra Fria e suas Implicações Profundas para o Desenvolvimento Socioeconômico Global Contemporâneo',
      };

      render(<HeaderAlternative {...longTitleProps} />);

      expect(screen.getByText(longTitleProps.title)).toBeInTheDocument();
    });

    it('renders very long subtitle', () => {
      const longSubtitleProps = {
        ...mockProps,
        subTitle:
          'Biologia - Fisiologia Vegetal - Processos Bioquímicos - Ciclo de Calvin - Fase Fotoquímica - Fase Química - Pigmentos Fotossintéticos',
      };

      render(<HeaderAlternative {...longSubtitleProps} />);

      expect(screen.getByText(longSubtitleProps.subTitle)).toBeInTheDocument();
    });

    it('renders very long content', () => {
      const longContentProps = {
        ...mockProps,
        content:
          'Elabore uma redação dissertativa-argumentativa sobre o tema "O impacto das redes sociais na formação da opinião pública contemporânea". Sua redação deve ter entre 25 e 30 linhas, apresentar argumentos bem fundamentados, utilizar linguagem formal e adequada ao gênero textual solicitado. Considere aspectos como a velocidade de disseminação de informações, a formação de bolhas de filtro, o papel dos algoritmos na curadoria de conteúdo, a democratização do acesso à informação versus a propagação de fake news, e as implicações para a democracia e o debate público.',
      };

      render(<HeaderAlternative {...longContentProps} />);

      expect(screen.getByText(longContentProps.content)).toBeInTheDocument();
    });
  });

  describe('Short content handling', () => {
    it('renders very short title', () => {
      const shortTitleProps = {
        ...mockProps,
        title: 'Q1',
      };

      render(<HeaderAlternative {...shortTitleProps} />);

      expect(screen.getByText('Q1')).toBeInTheDocument();
    });

    it('renders very short subtitle', () => {
      const shortSubtitleProps = {
        ...mockProps,
        subTitle: 'Teste',
      };

      render(<HeaderAlternative {...shortSubtitleProps} />);

      expect(screen.getByText('Teste')).toBeInTheDocument();
    });

    it('renders very short content', () => {
      const shortContentProps = {
        ...mockProps,
        content: 'Responda sim ou não.',
      };

      render(<HeaderAlternative {...shortContentProps} />);

      expect(screen.getByText('Responda sim ou não.')).toBeInTheDocument();
    });
  });

  describe('Special characters and formatting', () => {
    it('renders content with mathematical symbols', () => {
      const mathProps = {
        ...mockProps,
        content: 'Resolva a equação: x² + 5x + 6 = 0, onde x ∈ ℝ.',
      };

      render(<HeaderAlternative {...mathProps} />);

      expect(
        screen.getByText('Resolva a equação: x² + 5x + 6 = 0, onde x ∈ ℝ.')
      ).toBeInTheDocument();
    });

    it('renders content with special characters', () => {
      const specialCharsProps = {
        ...mockProps,
        content: 'Analise o texto: "O cortiço" de Aluísio Azevedo.',
      };

      render(<HeaderAlternative {...specialCharsProps} />);

      expect(
        screen.getByText('Analise o texto: "O cortiço" de Aluísio Azevedo.')
      ).toBeInTheDocument();
    });

    it('renders content with line breaks and formatting', () => {
      const formattedProps = {
        ...mockProps,
        content: 'Texto com\nquebras de linha\ne formatação especial.',
      };

      render(<HeaderAlternative {...formattedProps} />);

      // Test that the content is rendered (the exact text matching might not work with line breaks)
      expect(screen.getByText(/Texto com/)).toBeInTheDocument();
      expect(screen.getByText(/formatação especial/)).toBeInTheDocument();
    });
  });

  describe('Interactive functionality', () => {
    it('handles click events', () => {
      const handleClick = jest.fn();
      render(<HeaderAlternative {...mockProps} onClick={handleClick} />);

      const headerElement = screen.getByText('Questão 1').closest('div');
      fireEvent.click(headerElement!);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles mouse events', () => {
      const handleMouseEnter = jest.fn();
      const handleMouseLeave = jest.fn();

      render(
        <HeaderAlternative
          {...mockProps}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      );

      const headerElement = screen.getByText('Questão 1').closest('div');

      fireEvent.mouseEnter(headerElement!);
      expect(handleMouseEnter).toHaveBeenCalledTimes(1);

      fireEvent.mouseLeave(headerElement!);
      expect(handleMouseLeave).toHaveBeenCalledTimes(1);
    });

    it('handles keyboard events', () => {
      const handleKeyDown = jest.fn();

      render(<HeaderAlternative {...mockProps} onKeyDown={handleKeyDown} />);

      const headerElement = screen.getByText('Questão 1').closest('div');
      fireEvent.keyDown(headerElement!, { key: 'Enter' });

      expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has semantic HTML structure', () => {
      const { container } = render(<HeaderAlternative {...mockProps} />);

      const headerElement = container.firstChild as HTMLElement;
      expect(headerElement.tagName).toBe('DIV');
    });

    it('supports ARIA attributes', () => {
      render(
        <HeaderAlternative
          {...mockProps}
          role="article"
          aria-label="Questão de matemática"
        />
      );

      const headerElement = screen.getByRole('article');
      expect(headerElement).toHaveAttribute(
        'aria-label',
        'Questão de matemática'
      );
    });

    it('maintains proper text hierarchy', () => {
      render(<HeaderAlternative {...mockProps} />);

      const titleElement = screen.getByText('Questão 1');
      const subtitleElement = screen.getByText('Matemática - Álgebra');
      const contentElement = screen.getByText(
        'Resolva a equação quadrática x² + 5x + 6 = 0.'
      );

      expect(titleElement.tagName).toBe('P');
      expect(subtitleElement.tagName).toBe('P');
      expect(contentElement.tagName).toBe('P');
    });
  });

  describe('Edge cases', () => {
    it('handles empty strings', () => {
      const emptyProps = {
        title: '',
        subTitle: '',
        content: '',
      };

      render(<HeaderAlternative {...emptyProps} />);

      // Should render without errors
      const headerElement = screen.getAllByRole('generic')[0].closest('div');
      expect(headerElement).toBeInTheDocument();
    });

    it('handles whitespace-only strings', () => {
      const whitespaceProps = {
        title: '   ',
        subTitle: '  ',
        content: ' ',
      };

      render(<HeaderAlternative {...whitespaceProps} />);

      // Should render without errors
      const headerElement = screen.getAllByRole('generic')[0].closest('div');
      expect(headerElement).toBeInTheDocument();
    });

    it('handles very long strings without breaking layout', () => {
      const veryLongString = 'A'.repeat(1000);
      const longProps = {
        title: veryLongString,
        subTitle: veryLongString,
        content: veryLongString,
      };

      render(<HeaderAlternative {...longProps} />);

      // Test that the component renders without errors
      const headerElement = screen.getAllByRole('generic')[0].closest('div');
      expect(headerElement).toBeInTheDocument();
    });

    it('handles null and undefined props gracefully', () => {
      // TypeScript would prevent this, but testing for runtime safety
      const { container } = render(
        <HeaderAlternative
          title="Test"
          subTitle=""
          content=""
          className={undefined as unknown as string}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('CSS class combinations', () => {
    it('combines default and custom classes correctly', () => {
      const { container } = render(
        <HeaderAlternative
          {...mockProps}
          className="border-2 border-primary-200 shadow-lg"
        />
      );

      const headerElement = container.firstChild as HTMLElement;
      expect(headerElement).toHaveClass(
        'bg-background',
        'p-4',
        'flex',
        'flex-col',
        'gap-4',
        'rounded-xl',
        'border-2',
        'border-primary-200',
        'shadow-lg'
      );
    });

    it('handles multiple custom classes', () => {
      const { container } = render(
        <HeaderAlternative
          {...mockProps}
          className="custom-class-1 custom-class-2"
        />
      );

      const headerElement = container.firstChild as HTMLElement;
      expect(headerElement).toHaveClass('custom-class-1', 'custom-class-2');
    });

    it('handles empty className prop', () => {
      const { container } = render(
        <HeaderAlternative {...mockProps} className="" />
      );

      const headerElement = container.firstChild as HTMLElement;
      expect(headerElement).toHaveClass(
        'bg-background',
        'p-4',
        'flex',
        'flex-col',
        'gap-4',
        'rounded-xl'
      );
    });
  });

  describe('Real-world scenarios', () => {
    it('renders typical question header', () => {
      const typicalProps = {
        title: 'Questão 15',
        subTitle: 'Física - Mecânica - Cinemática',
        content:
          'Um automóvel parte do repouso e acelera uniformemente durante 10 segundos, atingindo uma velocidade de 20 m/s. Qual é a aceleração média do automóvel durante esse intervalo de tempo?',
      };

      render(<HeaderAlternative {...typicalProps} />);

      expect(screen.getByText('Questão 15')).toBeInTheDocument();
      expect(
        screen.getByText('Física - Mecânica - Cinemática')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Um automóvel parte do repouso e acelera uniformemente durante 10 segundos, atingindo uma velocidade de 20 m/s. Qual é a aceleração média do automóvel durante esse intervalo de tempo?'
        )
      ).toBeInTheDocument();
    });

    it('renders essay question header', () => {
      const essayProps = {
        title: 'Redação Dissertativa',
        subTitle: 'Linguagens - Produção Textual',
        content:
          'Elabore uma redação dissertativa-argumentativa sobre o tema "O impacto das redes sociais na formação da opinião pública contemporânea". Sua redação deve ter entre 25 e 30 linhas.',
      };

      render(<HeaderAlternative {...essayProps} />);

      expect(screen.getByText('Redação Dissertativa')).toBeInTheDocument();
      expect(
        screen.getByText('Linguagens - Produção Textual')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Elabore uma redação dissertativa-argumentativa sobre o tema "O impacto das redes sociais na formação da opinião pública contemporânea". Sua redação deve ter entre 25 e 30 linhas.'
        )
      ).toBeInTheDocument();
    });

    it('renders laboratory activity header', () => {
      const labProps = {
        title: 'Atividade Laboratorial',
        subTitle: 'Química - Análise Qualitativa',
        content:
          'Identifique os íons presentes em uma solução desconhecida utilizando testes específicos. Registre suas observações e escreva as equações químicas balanceadas.',
      };

      render(<HeaderAlternative {...labProps} />);

      expect(screen.getByText('Atividade Laboratorial')).toBeInTheDocument();
      expect(
        screen.getByText('Química - Análise Qualitativa')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Identifique os íons presentes em uma solução desconhecida utilizando testes específicos. Registre suas observações e escreva as equações químicas balanceadas.'
        )
      ).toBeInTheDocument();
    });
  });
});
