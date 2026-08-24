import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  TrueFalseStatementList,
  type TrueFalseStatement,
} from './TrueFalseStatementList';
import { TrueFalseEnum } from '../../enums/Quiz';

describe('TrueFalseStatementList', () => {
  const statements: TrueFalseStatement[] = [
    {
      id: 'st-1',
      statement: 'A água ferve a 100°C',
      studentMark: TrueFalseEnum.VERDADEIRO,
      isTrue: true,
    },
    {
      id: 'st-2',
      statement: 'O Sol gira em torno da Terra',
      studentMark: TrueFalseEnum.VERDADEIRO,
      isTrue: false,
    },
    {
      id: 'st-3',
      statement: 'A Lua é um satélite',
      studentMark: null,
      isTrue: true,
    },
  ];

  it('should letter the statements in order', () => {
    render(<TrueFalseStatementList statements={statements} />);

    expect(screen.getByText(/a\)/)).toBeInTheDocument();
    expect(screen.getByText(/b\)/)).toBeInTheDocument();
    expect(screen.getByText(/c\)/)).toBeInTheDocument();
  });

  it('should show only the mark when the student got it right', () => {
    render(<TrueFalseStatementList statements={[statements[0]]} />);

    expect(screen.getByText('Resposta selecionada: V')).toBeInTheDocument();
    expect(screen.queryByText(/Resposta correta:/)).not.toBeInTheDocument();
  });

  it('should show the answer key when the student got it wrong', () => {
    render(<TrueFalseStatementList statements={[statements[1]]} />);

    expect(screen.getByText('Resposta selecionada: V')).toBeInTheDocument();
    expect(screen.getByText('| Resposta correta: F')).toBeInTheDocument();
  });

  it('should flag a statement the student left blank', () => {
    render(<TrueFalseStatementList statements={[statements[2]]} />);

    expect(
      screen.getByText('Não respondida | Resposta correta: V')
    ).toBeInTheDocument();
  });

  it('should treat a mark of F against a false statement as correct', () => {
    render(
      <TrueFalseStatementList
        statements={[
          {
            id: 'st-4',
            statement: 'O Sol gira em torno da Terra',
            studentMark: TrueFalseEnum.FALSO,
            isTrue: false,
          },
        ]}
      />
    );

    expect(screen.getByText('Resposta selecionada: F')).toBeInTheDocument();
    expect(screen.queryByText(/Resposta correta:/)).not.toBeInTheDocument();
  });

  it('should hide correctness while the answer is still pending', () => {
    render(
      <TrueFalseStatementList statements={statements} showCorrectness={false} />
    );

    expect(screen.queryByText(/Resposta selecionada:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Resposta correta:/)).not.toBeInTheDocument();
    // The statements themselves stay visible.
    expect(screen.getByText(/A água ferve a 100°C/)).toBeInTheDocument();
  });

  it('should hide correctness for a statement with no answer key', () => {
    render(
      <TrueFalseStatementList
        statements={[
          {
            id: 'st-5',
            statement: 'Sem gabarito',
            studentMark: TrueFalseEnum.VERDADEIRO,
            isTrue: null,
          },
        ]}
      />
    );

    expect(screen.getByText(/Sem gabarito/)).toBeInTheDocument();
    expect(screen.queryByText(/Resposta selecionada:/)).not.toBeInTheDocument();
  });

  it('should render nothing for an empty list', () => {
    const { container } = render(<TrueFalseStatementList statements={[]} />);

    expect(container.querySelectorAll('section')).toHaveLength(0);
  });

  it('should fall back to the index when a statement has no id', () => {
    render(
      <TrueFalseStatementList
        statements={[
          {
            id: '',
            statement: 'Sem id',
            studentMark: null,
            isTrue: true,
          },
        ]}
      />
    );

    expect(screen.getByText(/Sem id/)).toBeInTheDocument();
  });
});
