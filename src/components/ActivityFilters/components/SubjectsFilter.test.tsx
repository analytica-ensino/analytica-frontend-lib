import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import type { KnowledgeArea } from '../../../types/activityFilters';

// Mock the barrel export that SubjectsFilter imports from
jest.mock('../../..', () => {
  const React = jest.requireActual('react');

  return {
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
    IconRender: ({
      iconName,
      size,
    }: {
      iconName: string;
      size: number;
      color: string;
    }) => (
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
    useTheme: () => ({ isDark: false }),
    getSubjectColorWithOpacity: (color: string) => `${color}20`,
  };
});

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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('renders all knowledge areas as radio buttons', () => {
      render(<SubjectsFilter {...defaultProps} />);

      expect(screen.getByText('Matemática')).toBeInTheDocument();
      expect(screen.getByText('Física')).toBeInTheDocument();
      expect(screen.getByText('Química')).toBeInTheDocument();
    });

    it('renders in a 3-column grid layout', () => {
      const { container } = render(<SubjectsFilter {...defaultProps} />);

      const gridContainer = container.querySelector('.grid.grid-cols-3.gap-3');
      expect(gridContainer).toBeInTheDocument();
    });

    it('renders with empty knowledge areas array', () => {
      render(<SubjectsFilter {...defaultProps} knowledgeAreas={[]} />);

      const radios = screen.queryAllByRole('radio', { hidden: true });
      expect(radios).toHaveLength(0);
    });

    it('renders subject icons', () => {
      const { container } = render(<SubjectsFilter {...defaultProps} />);

      // Check for icon containers (they have specific styling)
      const iconContainers = container.querySelectorAll('.size-4.rounded-sm');
      expect(iconContainers).toHaveLength(3);
    });
  });

  describe('Loading state', () => {
    it('renders loading message when loading is true', () => {
      render(<SubjectsFilter {...defaultProps} loading={true} />);

      expect(screen.getByText('Carregando matérias...')).toBeInTheDocument();
    });

    it('does not render knowledge areas when loading', () => {
      render(<SubjectsFilter {...defaultProps} loading={true} />);

      expect(screen.queryByText('Matemática')).not.toBeInTheDocument();
      expect(screen.queryByText('Física')).not.toBeInTheDocument();
      expect(screen.queryByText('Química')).not.toBeInTheDocument();
    });
  });

  describe('Error state', () => {
    it('renders error message when error is provided', () => {
      const errorMessage = 'Erro ao carregar matérias';
      render(<SubjectsFilter {...defaultProps} error={errorMessage} />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('does not render knowledge areas when error exists', () => {
      render(<SubjectsFilter {...defaultProps} error="Some error" />);

      expect(screen.queryByText('Matemática')).not.toBeInTheDocument();
      expect(screen.queryByText('Física')).not.toBeInTheDocument();
      expect(screen.queryByText('Química')).not.toBeInTheDocument();
    });

    it('renders error with custom error message', () => {
      const customError = 'Falha na conexão com o servidor';
      render(<SubjectsFilter {...defaultProps} error={customError} />);

      expect(screen.getByText(customError)).toBeInTheDocument();
    });
  });

  describe('Selection state', () => {
    it('renders with no selection when selectedSubject is null', () => {
      render(<SubjectsFilter {...defaultProps} selectedSubject={null} />);

      const radios = screen.getAllByRole('radio', { hidden: true });
      radios.forEach((radio) => {
        expect(radio).not.toBeChecked();
      });
    });

    it('marks correct radio as checked when selectedSubject is set', () => {
      render(<SubjectsFilter {...defaultProps} selectedSubject="math-1" />);

      const radios = screen.getAllByRole('radio', { hidden: true });

      // Find the radio with value "math-1"
      const mathRadio = radios.find(
        (radio) => (radio as HTMLInputElement).value === 'math-1'
      );
      expect(mathRadio).toBeChecked();

      // Other radios should not be checked
      const otherRadios = radios.filter(
        (radio) => (radio as HTMLInputElement).value !== 'math-1'
      );
      otherRadios.forEach((radio) => {
        expect(radio).not.toBeChecked();
      });
    });

    it('updates selection when different subject is selected', () => {
      const { rerender } = render(
        <SubjectsFilter {...defaultProps} selectedSubject="math-1" />
      );

      let radios = screen.getAllByRole('radio', { hidden: true });
      let mathRadio = radios.find(
        (radio) => (radio as HTMLInputElement).value === 'math-1'
      );
      expect(mathRadio).toBeChecked();

      rerender(
        <SubjectsFilter {...defaultProps} selectedSubject="physics-1" />
      );

      radios = screen.getAllByRole('radio', { hidden: true });
      const physicsRadio = radios.find(
        (radio) => (radio as HTMLInputElement).value === 'physics-1'
      );
      expect(physicsRadio).toBeChecked();

      mathRadio = radios.find(
        (radio) => (radio as HTMLInputElement).value === 'math-1'
      );
      expect(mathRadio).not.toBeChecked();
    });
  });

  describe('User interactions', () => {
    it('calls onSubjectChange when a subject is clicked', async () => {
      const onSubjectChange = jest.fn();
      const user = userEvent.setup();

      render(
        <SubjectsFilter {...defaultProps} onSubjectChange={onSubjectChange} />
      );

      const mathLabel = screen.getByText('Matemática');
      await user.click(mathLabel);

      expect(onSubjectChange).toHaveBeenCalledWith('math-1');
    });

    it('calls onSubjectChange with correct id for each subject', async () => {
      const onSubjectChange = jest.fn();
      const user = userEvent.setup();

      render(
        <SubjectsFilter {...defaultProps} onSubjectChange={onSubjectChange} />
      );

      // Click Physics
      await user.click(screen.getByText('Física'));
      expect(onSubjectChange).toHaveBeenLastCalledWith('physics-1');

      // Click Chemistry
      await user.click(screen.getByText('Química'));
      expect(onSubjectChange).toHaveBeenLastCalledWith('chemistry-1');

      // Click Math
      await user.click(screen.getByText('Matemática'));
      expect(onSubjectChange).toHaveBeenLastCalledWith('math-1');

      expect(onSubjectChange).toHaveBeenCalledTimes(3);
    });

    it('calls onSubjectChange when clicking directly on radio input', () => {
      const onSubjectChange = jest.fn();

      render(
        <SubjectsFilter {...defaultProps} onSubjectChange={onSubjectChange} />
      );

      const radios = screen.getAllByRole('radio', { hidden: true });
      const mathRadio = radios.find(
        (radio) => (radio as HTMLInputElement).value === 'math-1'
      );

      fireEvent.click(mathRadio!);

      expect(onSubjectChange).toHaveBeenCalledWith('math-1');
    });
  });

  describe('Subject styling', () => {
    it('applies background color with opacity to icon container', () => {
      const { container } = render(<SubjectsFilter {...defaultProps} />);

      const iconContainers = container.querySelectorAll('.size-4.rounded-sm');

      // Each icon container should have inline style with backgroundColor
      iconContainers.forEach((iconContainer) => {
        expect(iconContainer).toHaveStyle({
          backgroundColor: expect.any(String),
        });
      });
    });

    it('renders subject name with truncation class', () => {
      const { container } = render(<SubjectsFilter {...defaultProps} />);

      const truncateElements = container.querySelectorAll('.truncate.flex-1');
      expect(truncateElements).toHaveLength(3);
    });
  });

  describe('Default props', () => {
    it('defaults loading to false', () => {
      render(
        <SubjectsFilter
          knowledgeAreas={mockKnowledgeAreas}
          selectedSubject={null}
          onSubjectChange={jest.fn()}
        />
      );

      expect(
        screen.queryByText('Carregando matérias...')
      ).not.toBeInTheDocument();
      expect(screen.getByText('Matemática')).toBeInTheDocument();
    });

    it('defaults error to null', () => {
      render(
        <SubjectsFilter
          knowledgeAreas={mockKnowledgeAreas}
          selectedSubject={null}
          onSubjectChange={jest.fn()}
        />
      );

      expect(screen.getByText('Matemática')).toBeInTheDocument();
    });
  });

  describe('Knowledge area without icon', () => {
    it('renders default BookOpen icon when icon is not provided', () => {
      const areasWithoutIcon: KnowledgeArea[] = [
        { id: 'test-1', name: 'Test Subject', color: '#000000' },
      ];

      render(
        <SubjectsFilter {...defaultProps} knowledgeAreas={areasWithoutIcon} />
      );

      expect(screen.getByText('Test Subject')).toBeInTheDocument();
      // Should render default BookOpen icon
      expect(screen.getByTestId('icon-BookOpen')).toBeInTheDocument();
    });

    it('renders provided icon when available', () => {
      const areasWithIcon: KnowledgeArea[] = [
        { id: 'test-1', name: 'Test Subject', color: '#000000', icon: 'Star' },
      ];

      render(
        <SubjectsFilter {...defaultProps} knowledgeAreas={areasWithIcon} />
      );

      expect(screen.getByText('Test Subject')).toBeInTheDocument();
      expect(screen.getByTestId('icon-Star')).toBeInTheDocument();
    });
  });

  describe('Multiple subjects', () => {
    it('renders many subjects correctly', () => {
      const manySubjects: KnowledgeArea[] = Array.from(
        { length: 9 },
        (_, i) => ({
          id: `subject-${i + 1}`,
          name: `Subject ${i + 1}`,
          color: `#${String(i).padStart(6, '0')}`,
          icon: 'Book',
        })
      );

      render(
        <SubjectsFilter {...defaultProps} knowledgeAreas={manySubjects} />
      );

      manySubjects.forEach((subject) => {
        expect(screen.getByText(subject.name)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('renders radio inputs for each knowledge area', () => {
      render(<SubjectsFilter {...defaultProps} />);

      const radios = screen.getAllByRole('radio', { hidden: true });
      expect(radios).toHaveLength(3);
    });

    it('associates labels with radio inputs', () => {
      render(<SubjectsFilter {...defaultProps} />);

      // Each subject name should be clickable and toggle its radio
      const mathLabel = screen.getByText('Matemática');
      expect(mathLabel).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles subject with very long name', () => {
      const longNameAreas: KnowledgeArea[] = [
        {
          id: 'long-1',
          name: 'Esta é uma matéria com um nome extremamente longo para testar truncamento',
          color: '#FF0000',
          icon: 'Book',
        },
      ];

      render(
        <SubjectsFilter {...defaultProps} knowledgeAreas={longNameAreas} />
      );

      expect(
        screen.getByText(
          'Esta é uma matéria com um nome extremamente longo para testar truncamento'
        )
      ).toBeInTheDocument();
    });

    it('handles subject with special characters in name', () => {
      const specialCharsAreas: KnowledgeArea[] = [
        {
          id: 'special-1',
          name: 'Ciências & Tecnologia (C&T)',
          color: '#FF0000',
          icon: 'Book',
        },
      ];

      render(
        <SubjectsFilter {...defaultProps} knowledgeAreas={specialCharsAreas} />
      );

      expect(
        screen.getByText('Ciências & Tecnologia (C&T)')
      ).toBeInTheDocument();
    });

    it('handles re-render with same props without issues', () => {
      const { rerender } = render(<SubjectsFilter {...defaultProps} />);

      expect(screen.getByText('Matemática')).toBeInTheDocument();

      rerender(<SubjectsFilter {...defaultProps} />);

      expect(screen.getByText('Matemática')).toBeInTheDocument();
    });

    it('handles switching from loading to loaded state', () => {
      const { rerender } = render(
        <SubjectsFilter {...defaultProps} loading={true} />
      );

      expect(screen.getByText('Carregando matérias...')).toBeInTheDocument();
      expect(screen.queryByText('Matemática')).not.toBeInTheDocument();

      rerender(<SubjectsFilter {...defaultProps} loading={false} />);

      expect(
        screen.queryByText('Carregando matérias...')
      ).not.toBeInTheDocument();
      expect(screen.getByText('Matemática')).toBeInTheDocument();
    });

    it('handles switching from error to success state', () => {
      const { rerender } = render(
        <SubjectsFilter {...defaultProps} error="Error message" />
      );

      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Matemática')).not.toBeInTheDocument();

      rerender(<SubjectsFilter {...defaultProps} error={null} />);

      expect(screen.queryByText('Error message')).not.toBeInTheDocument();
      expect(screen.getByText('Matemática')).toBeInTheDocument();
    });
  });
});
