import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { FillInBlanks } from './FillInBlanks';

// Mock the Select component
jest.mock('../Select/Select', () => ({
  __esModule: true,
  default: ({ children, value }: { children: ReactNode; value: string }) => (
    <div data-testid="select-root" data-value={value}>
      {children}
    </div>
  ),
  SelectTrigger: ({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) => (
    <button data-testid="select-trigger" className={className}>
      {children}
    </button>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span data-testid="select-value">{placeholder}</span>
  ),
  SelectContent: ({ children }: { children: ReactNode }) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({ children, value }: { children: ReactNode; value: string }) => (
    <div data-testid={`select-item-${value}`} data-value={value}>
      {children}
    </div>
  ),
}));

// Mock phosphor-react icons
jest.mock('phosphor-react', () => ({
  CheckCircle: () => <span data-testid="check-circle-icon" />,
  XCircle: () => <span data-testid="x-circle-icon" />,
}));

const mockOptions = [
  { id: 'uuid-1', option: 'Terra' },
  { id: 'uuid-2', option: 'planeta' },
  { id: 'uuid-3', option: 'Sol' },
  { id: 'uuid-4', option: 'estrela' },
];

const contentWithPlaceholders =
  'A {uuid-1} é um {uuid-2}. O {uuid-3} é uma {uuid-4}.';

describe('FillInBlanks', () => {
  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(
        <FillInBlanks content={contentWithPlaceholders} options={mockOptions} />
      );
      expect(screen.getByText(/A/)).toBeInTheDocument();
    });

    it('renders text parts correctly', () => {
      render(
        <FillInBlanks
          content="O céu é {uuid-1}."
          options={[{ id: 'uuid-1', option: 'azul' }]}
          mode="readonly"
        />
      );
      expect(screen.getByText(/O céu é/)).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <FillInBlanks
          content={contentWithPlaceholders}
          options={mockOptions}
          className="custom-class"
        />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('passes through HTML attributes', () => {
      const { container } = render(
        <FillInBlanks
          content={contentWithPlaceholders}
          options={mockOptions}
          data-testid="fill-blanks"
        />
      );
      expect(
        container.querySelector('[data-testid="fill-blanks"]')
      ).toBeInTheDocument();
    });

    it('defaults to interactive mode', () => {
      render(
        <FillInBlanks
          content="Test {uuid-1}"
          options={[{ id: 'uuid-1', option: 'value' }]}
        />
      );
      expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
    });
  });

  describe('Interactive Mode', () => {
    it('renders select dropdowns for each placeholder', () => {
      render(
        <FillInBlanks
          content={contentWithPlaceholders}
          options={mockOptions}
          mode="interactive"
        />
      );
      const triggers = screen.getAllByTestId('select-trigger');
      expect(triggers).toHaveLength(4);
    });

    it('shows placeholder text in selects', () => {
      render(
        <FillInBlanks
          content="Test {uuid-1}"
          options={[{ id: 'uuid-1', option: 'value' }]}
          mode="interactive"
        />
      );
      expect(screen.getByTestId('select-value')).toHaveTextContent('Selecione');
    });

    it('renders all options in select dropdown', () => {
      render(
        <FillInBlanks
          content="Test {uuid-1}"
          options={mockOptions}
          mode="interactive"
        />
      );
      mockOptions.forEach((option) => {
        expect(
          screen.getByTestId(`select-item-${option.id}`)
        ).toBeInTheDocument();
        expect(
          screen.getByTestId(`select-item-${option.id}`)
        ).toHaveTextContent(option.option);
      });
    });

    it('applies disabled styling when disabled', () => {
      render(
        <FillInBlanks
          content="Test {uuid-1}"
          options={[{ id: 'uuid-1', option: 'value' }]}
          mode="interactive"
          disabled={true}
        />
      );
      const selectWrapper = screen
        .getByTestId('select-trigger')
        .closest('span');
      expect(selectWrapper).toHaveClass('opacity-50');
      expect(selectWrapper).toHaveClass('pointer-events-none');
    });

    it('does not apply disabled styling when not disabled', () => {
      render(
        <FillInBlanks
          content="Test {uuid-1}"
          options={[{ id: 'uuid-1', option: 'value' }]}
          mode="interactive"
          disabled={false}
        />
      );
      const selectWrapper = screen
        .getByTestId('select-trigger')
        .closest('span');
      expect(selectWrapper).not.toHaveClass('opacity-50');
    });

    it('renders with pre-selected answers', () => {
      render(
        <FillInBlanks
          content="Test {uuid-1}"
          options={mockOptions}
          mode="interactive"
          answers={{ 'uuid-1': 'uuid-1' }}
        />
      );
      const selectRoot = screen.getByTestId('select-root');
      expect(selectRoot).toHaveAttribute('data-value', 'uuid-1');
    });
  });

  describe('Readonly Mode', () => {
    it('displays correct answers with styling', () => {
      render(
        <FillInBlanks
          content="A {uuid-1} é um {uuid-2}."
          options={mockOptions}
          mode="readonly"
        />
      );
      expect(screen.getByText('Terra')).toBeInTheDocument();
      expect(screen.getByText('planeta')).toBeInTheDocument();
    });

    it('applies success styling to correct answers', () => {
      render(
        <FillInBlanks
          content="A {uuid-1}."
          options={[{ id: 'uuid-1', option: 'Terra' }]}
          mode="readonly"
        />
      );
      const answer = screen.getByText('Terra');
      expect(answer).toHaveClass('text-success-600');
      expect(answer).toHaveClass('underline');
      expect(answer).toHaveClass('font-medium');
    });

    it('does not render select dropdowns', () => {
      render(
        <FillInBlanks
          content="A {uuid-1}."
          options={[{ id: 'uuid-1', option: 'Terra' }]}
          mode="readonly"
        />
      );
      expect(screen.queryByTestId('select-trigger')).not.toBeInTheDocument();
    });

    it('handles empty option text gracefully', () => {
      render(
        <FillInBlanks
          content="Test {uuid-unknown}."
          options={mockOptions}
          mode="readonly"
        />
      );
      // Should render without crashing, just with empty text for unknown placeholder
      expect(screen.getByText(/Test/)).toBeInTheDocument();
    });
  });

  describe('Result Mode', () => {
    it('renders correct answer with success badge', () => {
      render(
        <FillInBlanks
          content="A {uuid-1}."
          options={[{ id: 'uuid-1', option: 'Terra' }]}
          mode="result"
          answers={{ 'uuid-1': 'uuid-1' }}
        />
      );
      expect(screen.getByText('Terra')).toBeInTheDocument();
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
    });

    it('renders incorrect answer with error badge', () => {
      render(
        <FillInBlanks
          content="A {uuid-1}."
          options={[
            { id: 'uuid-1', option: 'Terra' },
            { id: 'uuid-2', option: 'Lua' },
          ]}
          mode="result"
          answers={{ 'uuid-1': 'uuid-2' }}
        />
      );
      expect(screen.getByText('Lua')).toBeInTheDocument();
      expect(screen.getByTestId('x-circle-icon')).toBeInTheDocument();
    });

    it('renders "Não respondido" for unanswered placeholders', () => {
      render(
        <FillInBlanks
          content="A {uuid-1}."
          options={[{ id: 'uuid-1', option: 'Terra' }]}
          mode="result"
          answers={{}}
        />
      );
      expect(screen.getByText('Não respondido')).toBeInTheDocument();
      expect(screen.getByTestId('x-circle-icon')).toBeInTheDocument();
    });

    it('handles multiple placeholders with mixed results', () => {
      render(
        <FillInBlanks
          content="A {uuid-1} e o {uuid-2}."
          options={[
            { id: 'uuid-1', option: 'Terra' },
            { id: 'uuid-2', option: 'Sol' },
          ]}
          mode="result"
          answers={{
            'uuid-1': 'uuid-1', // correct
            'uuid-2': 'uuid-1', // incorrect (selected Terra instead of Sol)
          }}
        />
      );
      const checkIcons = screen.getAllByTestId('check-circle-icon');
      const xIcons = screen.getAllByTestId('x-circle-icon');
      expect(checkIcons).toHaveLength(1);
      expect(xIcons).toHaveLength(1);
    });

    it('renders badges inline with text', () => {
      const { container } = render(
        <FillInBlanks
          content="A {uuid-1}."
          options={[{ id: 'uuid-1', option: 'Terra' }]}
          mode="result"
          answers={{ 'uuid-1': 'uuid-1' }}
        />
      );
      const badgeWrapper = container.querySelector(
        '.inline-block.align-middle'
      );
      expect(badgeWrapper).toBeInTheDocument();
    });
  });

  describe('Content Parsing', () => {
    it('handles content with no placeholders', () => {
      render(
        <FillInBlanks
          content="Just plain text without any placeholders."
          options={[]}
          mode="readonly"
        />
      );
      expect(
        screen.getByText('Just plain text without any placeholders.')
      ).toBeInTheDocument();
    });

    it('handles content with HTML tags', () => {
      render(
        <FillInBlanks
          content="<p>A <strong>{uuid-1}</strong> é um planeta.</p>"
          options={[{ id: 'uuid-1', option: 'Terra' }]}
          mode="readonly"
        />
      );
      // HTML should be stripped and text displayed
      expect(screen.getByText('Terra')).toBeInTheDocument();
    });

    it('handles content with consecutive placeholders', () => {
      render(
        <FillInBlanks
          content="{uuid-1}{uuid-2}"
          options={[
            { id: 'uuid-1', option: 'Hello' },
            { id: 'uuid-2', option: 'World' },
          ]}
          mode="readonly"
        />
      );
      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('World')).toBeInTheDocument();
    });

    it('handles placeholder at the start of content', () => {
      render(
        <FillInBlanks
          content="{uuid-1} is great"
          options={[{ id: 'uuid-1', option: 'React' }]}
          mode="readonly"
        />
      );
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText(/is great/)).toBeInTheDocument();
    });

    it('handles placeholder at the end of content', () => {
      render(
        <FillInBlanks
          content="I love {uuid-1}"
          options={[{ id: 'uuid-1', option: 'coding' }]}
          mode="readonly"
        />
      );
      expect(screen.getByText('coding')).toBeInTheDocument();
      expect(screen.getByText(/I love/)).toBeInTheDocument();
    });

    it('handles UUIDs with hyphens', () => {
      render(
        <FillInBlanks
          content="Test {abc-123-def-456}"
          options={[{ id: 'abc-123-def-456', option: 'value' }]}
          mode="readonly"
        />
      );
      expect(screen.getByText('value')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty content', () => {
      const { container } = render(<FillInBlanks content="" options={[]} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles empty options array', () => {
      render(
        <FillInBlanks
          content="Some content with {uuid-1}"
          options={[]}
          mode="readonly"
        />
      );
      // Should render without crashing
      expect(screen.getByText(/Some content with/)).toBeInTheDocument();
    });

    it('handles undefined answers gracefully', () => {
      render(
        <FillInBlanks
          content="Test {uuid-1}"
          options={[{ id: 'uuid-1', option: 'value' }]}
          mode="result"
          answers={undefined}
        />
      );
      expect(screen.getByText('Não respondido')).toBeInTheDocument();
    });

    it('handles special characters in options', () => {
      render(
        <FillInBlanks
          content="Test {uuid-1}"
          options={[{ id: 'uuid-1', option: 'Special <>&"' }]}
          mode="readonly"
        />
      );
      expect(screen.getByText('Special <>&"')).toBeInTheDocument();
    });

    it('handles very long content', () => {
      const longContent = 'A '.repeat(100) + '{uuid-1}' + ' B'.repeat(100);
      render(
        <FillInBlanks
          content={longContent}
          options={[{ id: 'uuid-1', option: 'placeholder' }]}
          mode="readonly"
        />
      );
      expect(screen.getByText('placeholder')).toBeInTheDocument();
    });
  });

  describe('Mode Switching', () => {
    it('correctly transitions from interactive to result mode', () => {
      const { rerender } = render(
        <FillInBlanks
          content="Test {uuid-1}"
          options={[{ id: 'uuid-1', option: 'value' }]}
          mode="interactive"
          answers={{ 'uuid-1': 'uuid-1' }}
        />
      );
      expect(screen.getByTestId('select-trigger')).toBeInTheDocument();

      rerender(
        <FillInBlanks
          content="Test {uuid-1}"
          options={[{ id: 'uuid-1', option: 'value' }]}
          mode="result"
          answers={{ 'uuid-1': 'uuid-1' }}
        />
      );
      expect(screen.queryByTestId('select-trigger')).not.toBeInTheDocument();
      expect(screen.getByText('value')).toBeInTheDocument();
    });

    it('correctly transitions from readonly to interactive mode', () => {
      const { rerender } = render(
        <FillInBlanks
          content="Test {uuid-1}"
          options={[{ id: 'uuid-1', option: 'value' }]}
          mode="readonly"
        />
      );
      expect(screen.queryByTestId('select-trigger')).not.toBeInTheDocument();

      rerender(
        <FillInBlanks
          content="Test {uuid-1}"
          options={[{ id: 'uuid-1', option: 'value' }]}
          mode="interactive"
        />
      );
      expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('uses semantic text wrapper', () => {
      const { container } = render(
        <FillInBlanks
          content="Test {uuid-1}"
          options={[{ id: 'uuid-1', option: 'value' }]}
          mode="readonly"
        />
      );
      // Component uses Text component which should render appropriate semantic element
      expect(container.querySelector('.text-text-900')).toBeInTheDocument();
    });

    it('maintains content readability with leading-relaxed class', () => {
      const { container } = render(
        <FillInBlanks
          content="Test {uuid-1}"
          options={[{ id: 'uuid-1', option: 'value' }]}
        />
      );
      expect(container.firstChild).toHaveClass('leading-relaxed');
    });
  });
});
