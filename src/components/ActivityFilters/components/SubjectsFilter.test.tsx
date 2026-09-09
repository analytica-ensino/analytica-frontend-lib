import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import type { KnowledgeArea } from '../../../types/activityFilters';

// Mock the barrel export that SubjectsFilter imports from. Only the leaf
// presentational pieces are stubbed — the selection behaviour under test lives
// in SubjectsFilter itself.
jest.mock('../../..', () => ({
  CheckBox: ({
    id,
    checked,
    indeterminate,
    onChange,
  }: {
    id: string;
    checked: boolean;
    indeterminate?: boolean;
    onChange: () => void;
  }) => (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      data-indeterminate={indeterminate ? 'true' : 'false'}
    />
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

jest.mock('@phosphor-icons/react/dist/csr/GridFour', () => ({
  GridFourIcon: () => <span data-testid="icon-GridFour" />,
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
    selectedSubjectIds: [],
    onToggleSubject: jest.fn(),
  };

  const getSubjectCheckBox = (id: string) =>
    document.getElementById(`subject-${id}`) as HTMLInputElement;

  const getAllCheckBox = () =>
    document.getElementById('subject-all') as HTMLInputElement;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders one checkbox per knowledge area', () => {
      render(<SubjectsFilter {...defaultProps} />);

      expect(screen.getAllByRole('checkbox')).toHaveLength(3);
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

      expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    });
  });

  describe('Selection state', () => {
    it('leaves every checkbox unchecked when nothing is selected', () => {
      render(<SubjectsFilter {...defaultProps} selectedSubjectIds={[]} />);

      screen
        .getAllByRole('checkbox')
        .forEach((box) => expect(box).not.toBeChecked());
    });

    it('checks every selected subject at once', () => {
      render(
        <SubjectsFilter
          {...defaultProps}
          selectedSubjectIds={['math-1', 'physics-1']}
        />
      );

      expect(getSubjectCheckBox('math-1')).toBeChecked();
      expect(getSubjectCheckBox('physics-1')).toBeChecked();
      expect(getSubjectCheckBox('chemistry-1')).not.toBeChecked();
    });

    it('follows the selection when the parent changes it', () => {
      const { rerender } = render(
        <SubjectsFilter {...defaultProps} selectedSubjectIds={['math-1']} />
      );
      expect(getSubjectCheckBox('math-1')).toBeChecked();

      rerender(
        <SubjectsFilter
          {...defaultProps}
          selectedSubjectIds={['physics-1', 'chemistry-1']}
        />
      );

      expect(getSubjectCheckBox('math-1')).not.toBeChecked();
      expect(getSubjectCheckBox('physics-1')).toBeChecked();
      expect(getSubjectCheckBox('chemistry-1')).toBeChecked();
    });
  });

  describe('Select-all card', () => {
    it('is hidden unless asked for', () => {
      render(<SubjectsFilter {...defaultProps} />);

      expect(
        screen.queryByText('Todos os componentes curriculares')
      ).not.toBeInTheDocument();
    });

    it('renders alongside the subjects when asked for', () => {
      render(<SubjectsFilter {...defaultProps} showAllSubjectsOption />);

      expect(
        screen.getByText('Todos os componentes curriculares')
      ).toBeInTheDocument();
      expect(screen.getAllByRole('checkbox')).toHaveLength(4);
    });

    it('is checked when every subject is selected', () => {
      render(
        <SubjectsFilter
          {...defaultProps}
          showAllSubjectsOption
          allSubjectsSelected
          selectedSubjectIds={['math-1', 'physics-1', 'chemistry-1']}
        />
      );

      expect(getAllCheckBox()).toBeChecked();
      expect(getAllCheckBox()).toHaveAttribute('data-indeterminate', 'false');
    });

    it('is indeterminate when only some subjects are selected', () => {
      render(
        <SubjectsFilter
          {...defaultProps}
          showAllSubjectsOption
          selectedSubjectIds={['math-1']}
        />
      );

      expect(getAllCheckBox()).not.toBeChecked();
      expect(getAllCheckBox()).toHaveAttribute('data-indeterminate', 'true');
    });

    it('is neither checked nor indeterminate when nothing is selected', () => {
      render(
        <SubjectsFilter
          {...defaultProps}
          showAllSubjectsOption
          selectedSubjectIds={[]}
        />
      );

      expect(getAllCheckBox()).not.toBeChecked();
      expect(getAllCheckBox()).toHaveAttribute('data-indeterminate', 'false');
    });

    it('calls onToggleAllSubjects when clicked', () => {
      const onToggleAllSubjects = jest.fn();
      render(
        <SubjectsFilter
          {...defaultProps}
          showAllSubjectsOption
          onToggleAllSubjects={onToggleAllSubjects}
        />
      );

      fireEvent.click(getAllCheckBox());

      expect(onToggleAllSubjects).toHaveBeenCalledTimes(1);
    });

    it('does not blow up without an onToggleAllSubjects handler', () => {
      render(<SubjectsFilter {...defaultProps} showAllSubjectsOption />);

      expect(() => fireEvent.click(getAllCheckBox())).not.toThrow();
    });
  });

  describe('User interactions', () => {
    it('calls onToggleSubject with the picked subject id', async () => {
      const onToggleSubject = jest.fn();
      const user = userEvent.setup();
      render(
        <SubjectsFilter {...defaultProps} onToggleSubject={onToggleSubject} />
      );

      await user.click(screen.getByText('Matemática'));

      expect(onToggleSubject).toHaveBeenCalledTimes(1);
      expect(onToggleSubject).toHaveBeenCalledWith('math-1');
    });

    it('reports the id of whichever subject was clicked', async () => {
      const onToggleSubject = jest.fn();
      const user = userEvent.setup();
      render(
        <SubjectsFilter {...defaultProps} onToggleSubject={onToggleSubject} />
      );

      await user.click(screen.getByText('Física'));
      expect(onToggleSubject).toHaveBeenLastCalledWith('physics-1');

      await user.click(screen.getByText('Química'));
      expect(onToggleSubject).toHaveBeenLastCalledWith('chemistry-1');
    });

    // Unlike the radio it replaced, a checked checkbox still reports the click —
    // that is what lets the user drop one subject out of a multi selection.
    it('still reports a click on an already selected subject', () => {
      const onToggleSubject = jest.fn();
      render(
        <SubjectsFilter
          {...defaultProps}
          selectedSubjectIds={['math-1']}
          onToggleSubject={onToggleSubject}
        />
      );

      fireEvent.click(getSubjectCheckBox('math-1'));

      expect(onToggleSubject).toHaveBeenCalledWith('math-1');
    });

    it('does not blow up without an onToggleSubject handler', () => {
      render(
        <SubjectsFilter
          knowledgeAreas={mockKnowledgeAreas}
          selectedSubjectIds={[]}
        />
      );

      expect(() => fireEvent.click(getSubjectCheckBox('math-1'))).not.toThrow();
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
          selectedSubjectIds={[]}
          onToggleSubject={jest.fn()}
        />
      );

      expect(
        screen.queryByText('Carregando componentes curriculares...')
      ).not.toBeInTheDocument();
      expect(screen.getByText('Matemática')).toBeInTheDocument();
    });
  });
});
