import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StudentsTable } from './StudentsTable';
import { DEFAULT_LABELS, type DisplayStudent } from '../types';
import { StudentLessonStatus } from '../../../types/recommendedLessons';

const students: DisplayStudent[] = [
  {
    id: 's1',
    name: 'Ana Souza',
    status: StudentLessonStatus.CONCLUIDO,
    completionPercentage: 80,
    duration: '00:10:00',
  },
];

describe('StudentsTable accessibility', () => {
  it('names the actions column header for screen readers', () => {
    render(<StudentsTable students={students} labels={DEFAULT_LABELS} />);

    expect(
      screen.getByRole('columnheader', { name: 'Ações' })
    ).toBeInTheDocument();
  });

  it('names the completion bar with the student and hides the duplicate value', () => {
    render(<StudentsTable students={students} labels={DEFAULT_LABELS} />);

    expect(
      screen.getByRole('progressbar', { name: 'Conclusão de Ana Souza: 80%' })
    ).toBeInTheDocument();
    expect(screen.getByText('80%')).toHaveAttribute('aria-hidden', 'true');
  });

  it('names the row action with the student name', () => {
    const onCorrectActivity = jest.fn();
    render(
      <StudentsTable
        students={students}
        labels={DEFAULT_LABELS}
        onCorrectActivity={onCorrectActivity}
      />
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Corrigir atividade de Ana Souza' })
    );
    expect(onCorrectActivity).toHaveBeenCalledWith('s1');
  });
});
