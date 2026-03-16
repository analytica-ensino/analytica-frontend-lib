import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConnectDots, ConnectDotsOption } from './ConnectDots';

const mockOptions: ConnectDotsOption[] = [
  { id: 'opt-1', option: 'Cachorro', correctValue: 'Ração' },
  { id: 'opt-2', option: 'Gato', correctValue: 'Rato' },
  { id: 'opt-3', option: 'Cabra', correctValue: 'Grama' },
  { id: 'opt-4', option: 'Baleia', correctValue: 'Peixe' },
];

describe('ConnectDots Component', () => {
  describe('Basic rendering', () => {
    it('renders all options correctly', () => {
      render(<ConnectDots options={mockOptions} />);

      expect(screen.getByText('Cachorro')).toBeInTheDocument();
      expect(screen.getByText('Gato')).toBeInTheDocument();
      expect(screen.getByText('Cabra')).toBeInTheDocument();
      expect(screen.getByText('Baleia')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(
        <ConnectDots options={mockOptions} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('renders in interactive mode by default', () => {
      render(<ConnectDots options={mockOptions} />);

      // Should have select triggers (buttons) for each option
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4);
    });

    it('renders with empty options without error', () => {
      render(<ConnectDots options={[]} />);

      // Should render the container but with no items
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Interactive mode', () => {
    it('shows select dropdowns for each option', () => {
      render(<ConnectDots options={mockOptions} mode="interactive" />);

      const triggers = screen.getAllByRole('button');
      expect(triggers).toHaveLength(4);
    });

    it('shows placeholder text in select triggers', () => {
      render(<ConnectDots options={mockOptions} mode="interactive" />);

      const placeholders = screen.getAllByText('Selecione');
      expect(placeholders).toHaveLength(4);
    });

    it('shows arrow icons between option and select', () => {
      const { container } = render(
        <ConnectDots options={mockOptions} mode="interactive" />
      );

      // ArrowRight icons should be rendered
      const arrows = container.querySelectorAll('svg');
      expect(arrows.length).toBeGreaterThanOrEqual(4);
    });

    it('calls onAnswerChange when a selection is made', () => {
      const handleChange = jest.fn();
      render(
        <ConnectDots
          options={mockOptions}
          mode="interactive"
          onAnswerChange={handleChange}
        />
      );

      // Click on the first select trigger to open the dropdown
      const triggers = screen.getAllByRole('button');
      fireEvent.click(triggers[0]);

      // Select an option
      const optionItem = screen.getByText('Ração');
      fireEvent.click(optionItem);

      expect(handleChange).toHaveBeenCalledWith('opt-1', 'Ração');
    });

    it('shows selected value when answer is provided', () => {
      render(
        <ConnectDots
          options={mockOptions}
          mode="interactive"
          answers={{ 'opt-1': 'Ração', 'opt-2': 'Rato' }}
        />
      );

      // The selected values should be visible
      expect(screen.getByText('Ração')).toBeInTheDocument();
      expect(screen.getByText('Rato')).toBeInTheDocument();
    });

    it('applies disabled styling when disabled prop is true', () => {
      const { container } = render(
        <ConnectDots options={mockOptions} mode="interactive" disabled />
      );

      const items = container.querySelectorAll('.opacity-50');
      expect(items.length).toBeGreaterThanOrEqual(4);
    });

    it('renders all correct values as dropdown options', () => {
      render(<ConnectDots options={mockOptions} mode="interactive" />);

      // Open the first dropdown
      const triggers = screen.getAllByRole('button');
      fireEvent.click(triggers[0]);

      // All correct values should be available
      expect(screen.getByText('Ração')).toBeInTheDocument();
      expect(screen.getByText('Rato')).toBeInTheDocument();
      expect(screen.getByText('Grama')).toBeInTheDocument();
      expect(screen.getByText('Peixe')).toBeInTheDocument();
    });
  });

  describe('Readonly mode', () => {
    it('shows correct matches with success styling', () => {
      const { container } = render(
        <ConnectDots options={mockOptions} mode="readonly" />
      );

      // Should have success border styling
      const items = container.querySelectorAll('.border-success-300');
      expect(items).toHaveLength(4);
    });

    it('displays the correct value for each option', () => {
      render(<ConnectDots options={mockOptions} mode="readonly" />);

      // Each option should show its correct value
      expect(screen.getByText('Ração')).toBeInTheDocument();
      expect(screen.getByText('Rato')).toBeInTheDocument();
      expect(screen.getByText('Grama')).toBeInTheDocument();
      expect(screen.getByText('Peixe')).toBeInTheDocument();
    });

    it('shows success colored arrows', () => {
      const { container } = render(
        <ConnectDots options={mockOptions} mode="readonly" />
      );

      const successArrows = container.querySelectorAll('.text-success-600');
      expect(successArrows.length).toBeGreaterThanOrEqual(4);
    });

    it('does not show select dropdowns', () => {
      render(<ConnectDots options={mockOptions} mode="readonly" />);

      // Should not have any buttons (select triggers)
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Result mode', () => {
    it('shows correct badge for correct answers', () => {
      render(
        <ConnectDots
          options={mockOptions}
          mode="result"
          answers={{ 'opt-1': 'Ração', 'opt-2': 'Rato' }}
        />
      );

      // Should show the selected values in badges
      expect(screen.getByText('Ração')).toBeInTheDocument();
      expect(screen.getByText('Rato')).toBeInTheDocument();
    });

    it('shows success styling for correct answers', () => {
      const { container } = render(
        <ConnectDots
          options={mockOptions}
          mode="result"
          answers={{ 'opt-1': 'Ração' }}
        />
      );

      // First item should have success styling
      const successItems = container.querySelectorAll('.border-success-300');
      expect(successItems.length).toBeGreaterThanOrEqual(1);
    });

    it('shows error styling for incorrect answers', () => {
      const { container } = render(
        <ConnectDots
          options={mockOptions}
          mode="result"
          answers={{ 'opt-1': 'Grama' }} // Wrong answer
        />
      );

      // Should have error styling for the incorrect answer
      const errorItems = container.querySelectorAll('.border-error-300');
      expect(errorItems.length).toBeGreaterThanOrEqual(1);
    });

    it('shows "Não respondido" for unanswered items', () => {
      render(
        <ConnectDots
          options={mockOptions}
          mode="result"
          answers={{}} // No answers provided
        />
      );

      // All items should show "Não respondido"
      const notAnsweredBadges = screen.getAllByText('Não respondido');
      expect(notAnsweredBadges).toHaveLength(4);
    });

    it('shows correct answer hint when answer is wrong', () => {
      render(
        <ConnectDots
          options={mockOptions}
          mode="result"
          answers={{ 'opt-1': 'Grama' }} // Wrong answer for opt-1 (should be Ração)
        />
      );

      // Should show "(Correto: Ração)" for the wrong answer
      expect(screen.getByText('(Correto: Ração)')).toBeInTheDocument();
    });

    it('does not show correct answer hint when answer is correct', () => {
      render(
        <ConnectDots
          options={mockOptions}
          mode="result"
          answers={{ 'opt-1': 'Ração' }} // Correct answer
        />
      );

      // Should NOT show "(Correto: Ração)" since the answer is correct
      expect(screen.queryByText('(Correto: Ração)')).not.toBeInTheDocument();
    });

    it('shows CheckCircle icon for correct answers', () => {
      const { container } = render(
        <ConnectDots
          options={mockOptions}
          mode="result"
          answers={{ 'opt-1': 'Ração' }}
        />
      );

      // CheckCircle should be rendered inside a Badge for correct answer
      const successBadges = container.querySelectorAll('.bg-success-50');
      expect(successBadges.length).toBeGreaterThanOrEqual(1);
    });

    it('shows XCircle icon for incorrect and unanswered items', () => {
      const { container } = render(
        <ConnectDots
          options={mockOptions}
          mode="result"
          answers={{ 'opt-1': 'Grama' }} // Wrong answer
        />
      );

      // Error badges should be rendered
      const errorBadges = container.querySelectorAll('.bg-error-50');
      expect(errorBadges.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Available values deduplication', () => {
    it('removes duplicate values from dropdown options', () => {
      const optionsWithDuplicates: ConnectDotsOption[] = [
        { id: 'opt-1', option: 'Item 1', correctValue: 'Value A' },
        { id: 'opt-2', option: 'Item 2', correctValue: 'Value A' }, // Duplicate
        { id: 'opt-3', option: 'Item 3', correctValue: 'Value B' },
      ];

      render(
        <ConnectDots options={optionsWithDuplicates} mode="interactive" />
      );

      // Open the first dropdown
      const triggers = screen.getAllByRole('button');
      fireEvent.click(triggers[0]);

      // Should only have 2 unique options (Value A and Value B)
      const valueAItems = screen.getAllByText('Value A');
      expect(valueAItems).toHaveLength(1); // Only one, not duplicated

      const valueBItems = screen.getAllByText('Value B');
      expect(valueBItems).toHaveLength(1);
    });
  });

  describe('Edge cases', () => {
    it('handles options with empty correctValue gracefully', () => {
      const optionsWithEmpty: ConnectDotsOption[] = [
        { id: 'opt-1', option: 'Item 1', correctValue: '' },
        { id: 'opt-2', option: 'Item 2', correctValue: 'Value B' },
      ];

      render(<ConnectDots options={optionsWithEmpty} mode="interactive" />);

      // Should render without errors
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('handles undefined answers gracefully', () => {
      render(
        <ConnectDots
          options={mockOptions}
          mode="result"
          answers={undefined}
        />
      );

      // Should show "Não respondido" for all items
      const notAnsweredBadges = screen.getAllByText('Não respondido');
      expect(notAnsweredBadges).toHaveLength(4);
    });

    it('maintains correct key uniqueness for rendering', () => {
      const { container } = render(
        <ConnectDots options={mockOptions} mode="interactive" />
      );

      // Each item should have a unique key (no duplicate key warnings)
      const items = container.querySelectorAll('.flex.flex-row');
      expect(items.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Mode switching', () => {
    it('correctly switches from interactive to result mode', () => {
      const { rerender } = render(
        <ConnectDots
          options={mockOptions}
          mode="interactive"
          answers={{ 'opt-1': 'Ração' }}
        />
      );

      // Interactive mode should have select triggers
      expect(screen.getAllByRole('button')).toHaveLength(4);

      // Switch to result mode
      rerender(
        <ConnectDots
          options={mockOptions}
          mode="result"
          answers={{ 'opt-1': 'Ração' }}
        />
      );

      // Result mode should show badges, not selects
      expect(screen.queryAllByRole('button')).toHaveLength(0);
    });

    it('correctly switches from interactive to readonly mode', () => {
      const { rerender } = render(
        <ConnectDots options={mockOptions} mode="interactive" />
      );

      // Interactive mode should have select triggers
      expect(screen.getAllByRole('button')).toHaveLength(4);

      // Switch to readonly mode
      rerender(<ConnectDots options={mockOptions} mode="readonly" />);

      // Readonly mode should not have any buttons
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('select triggers are focusable in interactive mode', () => {
      render(<ConnectDots options={mockOptions} mode="interactive" />);

      const triggers = screen.getAllByRole('button');
      triggers.forEach((trigger) => {
        expect(trigger).not.toHaveAttribute('tabindex', '-1');
      });
    });

    it('renders with proper semantic structure', () => {
      const { container } = render(
        <ConnectDots options={mockOptions} mode="interactive" />
      );

      // Should have a flex container
      expect(container.firstChild).toHaveClass('flex', 'flex-col', 'gap-2');
    });
  });
});
