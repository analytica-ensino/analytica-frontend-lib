import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExamDetailsHeader } from './ExamDetailsHeader';

const baseProps = {
  examTitle: 'Prova de Matemática',
  examDate: '10/10/2026',
  school: 'Escola A',
  classroomName: 'Turma 1',
  createdAt: '01/10/2026',
  onBack: jest.fn(),
  onDownloadExam: jest.fn(),
};

describe('ExamDetailsHeader', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renderiza a trilha de navegação com a página atual marcada', () => {
    render(<ExamDetailsHeader {...baseProps} />);

    const nav = screen.getByRole('navigation', {
      name: 'Trilha de navegação',
    });
    expect(nav.querySelector('ol')).not.toBeNull();

    const current = nav.querySelector('[aria-current="page"]');
    expect(current).toHaveTextContent('Prova de Matemática');
  });

  it('volta pela trilha com um botão de verdade', () => {
    render(<ExamDetailsHeader {...baseProps} backLabel="Minhas provas" />);

    fireEvent.click(screen.getByRole('button', { name: 'Minhas provas' }));

    expect(baseProps.onBack).toHaveBeenCalledTimes(1);
  });

  it('baixa a prova pelo botão de download', () => {
    render(<ExamDetailsHeader {...baseProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Baixar prova' }));

    expect(baseProps.onDownloadExam).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole('heading', { name: 'Prova de Matemática' })
    ).toBeInTheDocument();
  });
});
