import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import type { KnowledgeArea } from '../../../types/activityFilters';

// Mock the barrel export that SubjectsFilter imports from. Only the leaf
// presentational pieces are stubbed — the selection behaviour under test lives
// in SubjectsFilter itself.
jest.mock('../../..', () => ({
  Radio: ({
    value,
    checked,
    onChange,
    label,
  }: {
    value: string;
    checked: boolean;
    onChange: () => void;
    label: React.ReactNode;
  }) => (
    <label>
      <input
        type="radio"
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      {label}
    </label>
  ),
  IconRender: ({ iconName, size }: { iconName: string; size: number }) => (
    <span data-testid={`icon-${iconName}`} data-size={size}>
      {iconName}
    </span>
  ),
  Text: ({
    children,
    size,
    className,
  }: {
    children: React.ReactNode;
    size: string;
    className: string;
  }) => (
    <span data-size={size} className={className}>
      {children}
    </span>
  ),
  TruncatedText: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="truncated-text">{children}</span>
  ),
  useTheme: () => ({ isDark: false }),
  getSubjectColorWithOpacity: (color: string) => `${color}20`,
}));

// Import after mocks
import { SubjectsFilter } from './SubjectsFilter';

describe('SubjectsFilter', () => {
  const mockKnowledgeAreas: KnowledgeArea[] = [
    { id: 'math-1', name: 'Matemática', color: '#FF5733', icon: 'Calculator' },
    { id: 'physics-1', name: 'Física', color: '#3357FF', icon: 'Atom' },
    { id: 'chemistry-1', name: 'Química', color: '#33FF57', icon: 'Flask' },
  ];

  const defaultProps = {
    knowledgeAreas: mockKnowledgeAreas,
    selectedSubject: null,
    onSubjectChange: jest.fn(),
  };

  const getRadios = () =>
    screen.getAllByRole('radio', { hidden: true }) as HTMLInputElement[];

  const getRadio = (id: string) =>
    getRadios().find((radio) => radio.value === id);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders one radio per knowledge area', () => {
      render(<SubjectsFilter {...defaultProps} />);

      expect(getRadios()).toHaveLength(3);
      expect(screen.getByText('Matemática')).toBeInTheDocument();
      expect(screen.getByText('Física')).toBeInTheDocument();
      expect(screen.getByText('Química')).toBeInTheDocument();
    });

    it('renders in a 3-column grid', () => {
      const { container } = render(<SubjectsFilter {...defaultProps} />);

      expect(
        container.querySelector('.grid.grid-cols-3.gap-3')
      ).toBeInTheDocument();
    });

    it('does not render a select-all option', () => {
      render(<SubjectsFilter {...defaultProps} />);

      expect(
        screen.queryByText('Todos os componentes curriculares')
      ).not.toBeInTheDocument();
      expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    });

    it('renders each subject icon', () => {
      render(<SubjectsFilter {...defaultProps} />);

      expect(screen.getByTestId('icon-Calculator')).toBeInTheDocument();
      expect(screen.getByTestId('icon-Atom')).toBeInTheDocument();
      expect(screen.getByTestId('icon-Flask')).toBeInTheDocument();
    });

    it('falls back to the BookOpen icon when a subject has none', () => {
      render(
        <SubjectsFilter
          {...defaultProps}
          knowledgeAreas={[{ id: 'no-icon', name: 'Sem ícone', color: '#000' }]}
        />
      );

      expect(screen.getByTestId('icon-BookOpen')).toBeInTheDocument();
    });

    it('paints the icon chip with the subject color', () => {
      const { container } = render(<SubjectsFilter {...defaultProps} />);

      const chips = container.querySelectorAll('.size-4.rounded-sm');
      expect(chips).toHaveLength(3);
      expect(chips[0]).toHaveStyle({ backgroundColor: '#FF573320' });
    });

    it('renders nothing when there are no knowledge areas', () => {
      render(<SubjectsFilter {...defaultProps} knowledgeAreas={[]} />);

      expect(screen.queryAllByRole('radio', { hidden: true })).toHaveLength(0);
    });
  });

  describe('Selection state', () => {
    it('leaves every radio unchecked when nothing is selected', () => {
      render(<SubjectsFilter {...defaultProps} selectedSubject={null} />);

      getRadios().forEach((radio) => expect(radio).not.toBeChecked());
    });

    it('checks only the selected subject', () => {
      render(<SubjectsFilter {...defaultProps} selectedSubject="math-1" />);

      expect(getRadio('math-1')).toBeChecked();
      expect(getRadio('physics-1')).not.toBeChecked();
      expect(getRadio('chemistry-1')).not.toBeChecked();
    });

    it('moves the check when the parent changes the selection', () => {
      const { rerender } = render(
        <SubjectsFilter {...defaultProps} selectedSubject="math-1" />
      );
      expect(getRadio('math-1')).toBeChecked();

      rerender(
        <SubjectsFilter {...defaultProps} selectedSubject="physics-1" />
      );

      expect(getRadio('physics-1')).toBeChecked();
      expect(getRadio('math-1')).not.toBeChecked();
    });
  });

  describe('User interactions', () => {
    it('calls onSubjectChange with the picked subject id', async () => {
      const onSubjectChange = jest.fn();
      const user = userEvent.setup();
      render(
        <SubjectsFilter {...defaultProps} onSubjectChange={onSubjectChange} />
      );

      await user.click(screen.getByText('Matemática'));

      expect(onSubjectChange).toHaveBeenCalledTimes(1);
      expect(onSubjectChange).toHaveBeenCalledWith('math-1');
    });

    it('reports the id of whichever subject was clicked', async () => {
      const onSubjectChange = jest.fn();
      const user = userEvent.setup();
      render(
        <SubjectsFilter {...defaultProps} onSubjectChange={onSubjectChange} />
      );

      await user.click(screen.getByText('Física'));
      expect(onSubjectChange).toHaveBeenLastCalledWith('physics-1');

      await user.click(screen.getByText('Química'));
      expect(onSubjectChange).toHaveBeenLastCalledWith('chemistry-1');
    });

    it('fires when the radio input itself is clicked', () => {
      const onSubjectChange = jest.fn();
      render(
        <SubjectsFilter {...defaultProps} onSubjectChange={onSubjectChange} />
      );

      fireEvent.click(getRadio('math-1') as HTMLInputElement);

      expect(onSubjectChange).toHaveBeenCalledWith('math-1');
    });

    it('keeps the previous subject checked when the parent vetoes the pick', async () => {
      // A vetoing parent resolves false and never updates `selectedSubject`.
      const onSubjectChange = jest.fn().mockResolvedValue(false);
      render(
        <SubjectsFilter
          {...defaultProps}
          selectedSubject="math-1"
          onSubjectChange={onSubjectChange}
        />
      );

      fireEvent.click(getRadio('physics-1') as HTMLInputElement);

      expect(onSubjectChange).toHaveBeenCalledWith('physics-1');
      await waitFor(() => expect(getRadio('math-1')).toBeChecked());
      expect(getRadio('physics-1')).not.toBeChecked();
    });

    it('logs instead of leaving an unhandled rejection when the handler throws', async () => {
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const onSubjectChange = jest.fn().mockRejectedValue(new Error('boom'));
      render(
        <SubjectsFilter
          {...defaultProps}
          selectedSubject="math-1"
          onSubjectChange={onSubjectChange}
        />
      );

      fireEvent.click(getRadio('physics-1') as HTMLInputElement);

      await waitFor(() => expect(consoleError).toHaveBeenCalled());
      expect(consoleError.mock.calls[0][0]).toBe(
        'Erro ao trocar de componente curricular:'
      );
      consoleError.mockRestore();
    });

    it('does not blow up without an onSubjectChange handler', () => {
      render(
        <SubjectsFilter
          knowledgeAreas={mockKnowledgeAreas}
          selectedSubject={null}
        />
      );

      expect(() =>
        fireEvent.click(getRadio('math-1') as HTMLInputElement)
      ).not.toThrow();
    });
  });

  describe('Loading and error states', () => {
    it('renders the loading message instead of the grid', () => {
      render(<SubjectsFilter {...defaultProps} loading />);

      expect(
        screen.getByText('Carregando componentes curriculares...')
      ).toBeInTheDocument();
      expect(screen.queryByText('Matemática')).not.toBeInTheDocument();
    });

    it('renders the error message instead of the grid', () => {
      render(<SubjectsFilter {...defaultProps} error="Erro ao carregar" />);

      expect(screen.getByText('Erro ao carregar')).toBeInTheDocument();
      expect(screen.queryByText('Matemática')).not.toBeInTheDocument();
    });

    it('prefers the loading state over the error state', () => {
      render(<SubjectsFilter {...defaultProps} loading error="Erro" />);

      expect(
        screen.getByText('Carregando componentes curriculares...')
      ).toBeInTheDocument();
      expect(screen.queryByText('Erro')).not.toBeInTheDocument();
    });

    it('shows the grid once loading finishes', () => {
      const { rerender } = render(<SubjectsFilter {...defaultProps} loading />);

      rerender(<SubjectsFilter {...defaultProps} loading={false} />);

      expect(screen.getByText('Matemática')).toBeInTheDocument();
      expect(
        screen.queryByText('Carregando componentes curriculares...')
      ).not.toBeInTheDocument();
    });

    it('shows the grid once the error clears', () => {
      const { rerender } = render(
        <SubjectsFilter {...defaultProps} error="Erro ao carregar" />
      );

      rerender(<SubjectsFilter {...defaultProps} error={null} />);

      expect(screen.queryByText('Erro ao carregar')).not.toBeInTheDocument();
      expect(screen.getByText('Matemática')).toBeInTheDocument();
    });

    it('defaults loading and error to a rendered grid', () => {
      render(
        <SubjectsFilter
          knowledgeAreas={mockKnowledgeAreas}
          selectedSubject={null}
          onSubjectChange={jest.fn()}
        />
      );

      expect(
        screen.queryByText('Carregando componentes curriculares...')
      ).not.toBeInTheDocument();
      expect(screen.getByText('Matemática')).toBeInTheDocument();
    });
  });
});
