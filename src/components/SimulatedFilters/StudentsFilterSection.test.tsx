import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { StudentsFilterSection } from './StudentsFilterSection';
import type { StudentGroup } from './types';

const groupedStudents: StudentGroup[] = [
  {
    key: 'school-1-year-1-class-1',
    label: 'Escola 1 > 3 ano > A',
    students: [
      {
        id: 'student-1',
        name: 'Ana',
        schoolId: 'school-1',
        schoolYearId: 'year-1',
        classId: 'class-1',
        schoolName: 'Escola 1',
        schoolYearName: '3 ano',
        className: 'A',
      },
      {
        id: 'student-2',
        name: 'Bruno',
        schoolId: 'school-1',
        schoolYearId: 'year-1',
        classId: 'class-1',
        schoolName: 'Escola 1',
        schoolYearName: '3 ano',
        className: 'A',
      },
    ],
  },
];

function renderSection(
  overrides: Partial<ComponentProps<typeof StudentsFilterSection>> = {}
) {
  const onSearchChange = jest.fn();
  const onSelectionChange = jest.fn();

  render(
    <StudentsFilterSection
      groupedStudents={groupedStudents}
      selectedIds={[]}
      searchQuery=""
      isLoading={false}
      hasFilters={true}
      onSearchChange={onSearchChange}
      onSelectionChange={onSelectionChange}
      {...overrides}
    />
  );

  return { onSearchChange, onSelectionChange };
}

describe('StudentsFilterSection', () => {
  it('renders fixed empty-state message when no filters are selected', () => {
    renderSection({ hasFilters: false });

    expect(screen.getByText('ESTUDANTES')).toBeInTheDocument();
    expect(
      screen.getByText('Selecione uma escola, série ou turma para ver os estudantes')
    ).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Buscar')).not.toBeInTheDocument();
  });

  it('renders fixed no students message when filters are selected and list is empty', () => {
    renderSection({ groupedStudents: [] });

    expect(
      screen.getByText('Nenhum estudante encontrado para os filtros selecionados')
    ).toBeInTheDocument();
  });

  it('calls onSearchChange when typing in fixed search input', () => {
    const { onSearchChange } = renderSection();

    fireEvent.change(screen.getByPlaceholderText('Buscar'), {
      target: { value: 'ana' },
    });

    expect(onSearchChange).toHaveBeenCalledWith('ana');
  });

  it('selects all visible students when clicking "Todos os estudantes"', () => {
    const { onSelectionChange } = renderSection();

    fireEvent.click(screen.getByLabelText('Todos os estudantes'));

    expect(onSelectionChange).toHaveBeenCalledWith(['student-1', 'student-2']);
  });

  it('clears all students when all are already selected and select-all is clicked', () => {
    const { onSelectionChange } = renderSection({
      selectedIds: ['student-1', 'student-2'],
    });

    fireEvent.click(screen.getByLabelText('Todos os estudantes'));

    expect(onSelectionChange).toHaveBeenCalledWith([]);
  });

  it('toggles a single student when checkbox is clicked', () => {
    const { onSelectionChange } = renderSection();

    fireEvent.click(screen.getByLabelText('Ana'));

    expect(onSelectionChange).toHaveBeenCalledWith(['student-1']);
  });

  it('shows search empty state when query has no matches', () => {
    renderSection({ searchQuery: 'carla' });

    expect(
      screen.getByText('Nenhum estudante encontrado para "carla"')
    ).toBeInTheDocument();
  });
});
