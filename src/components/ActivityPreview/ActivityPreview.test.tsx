import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActivityPreview } from './ActivityPreview';
import { QUESTION_TYPE } from '../Quiz/useQuizStore';

jest.mock('../ActivityCardQuestionPreview/ActivityCardQuestionPreview', () => ({
  ActivityCardQuestionPreview: ({
    subjectName,
    position,
    value,
  }: {
    subjectName: string;
    position?: number;
    value?: string;
  }) => (
    <div
      data-testid="question-card"
      data-subject={subjectName}
      data-position={position}
      data-value={value}
    >
      {subjectName} #{position} ({value})
    </div>
  ),
}));

jest.mock('../../index', () => {
  return {
    Button: ({
      children,
      onClick,
      ...rest
    }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
      <button onClick={onClick} {...rest}>
        {children}
      </button>
    ),
    Text: ({ children, ...rest }: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p {...rest}>{children}</p>
    ),
  };
});

jest.mock('phosphor-react', () => ({
  File: () => <span data-testid="icon-file" />,
  DownloadSimple: () => <span data-testid="icon-download" />,
}));

const buildQuestions = () => [
  {
    id: 'q1',
    subjectName: 'Biologia',
    subjectColor: '#00aa00',
    iconName: 'Leaf',
    questionType: QUESTION_TYPE.ALTERNATIVA,
    enunciado: 'Questão 1',
  },
  {
    id: 'q2',
    subjectName: 'História',
    subjectColor: '#0000aa',
    iconName: 'Book',
    questionType: QUESTION_TYPE.DISSERTATIVA,
    enunciado: 'Questão 2',
  },
];

describe('ActivityPreview', () => {
  it('renderiza título, total e cartões com posições normalizadas', () => {
    const onPositionsChange = jest.fn();

    render(
      <ActivityPreview
        title="Minhas questões"
        questions={buildQuestions()}
        onPositionsChange={onPositionsChange}
      />
    );

    expect(screen.getByText('Minhas questões')).toBeInTheDocument();
    expect(screen.getByText('2 questões adicionadas')).toBeInTheDocument();

    const cards = screen.getAllByTestId('question-card');
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveAttribute('data-position', '1');
    expect(cards[1]).toHaveAttribute('data-position', '2');

    expect(onPositionsChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: 'q1', position: 1 }),
        expect.objectContaining({ id: 'q2', position: 2 }),
      ])
    );
  });

  it('dispara onDownloadPdf e onRemoveAll', () => {
    const onDownloadPdf = jest.fn();
    const onRemoveAll = jest.fn();

    render(
      <ActivityPreview
        questions={buildQuestions()}
        onDownloadPdf={onDownloadPdf}
        onRemoveAll={onRemoveAll}
      />
    );

    fireEvent.click(screen.getByText('Baixar pdf'));
    fireEvent.click(screen.getByText('Remover tudo'));

    expect(onDownloadPdf).toHaveBeenCalledTimes(1);
    expect(onRemoveAll).toHaveBeenCalledTimes(1);
  });

  it('reordena itens via drag-and-drop e emite callbacks', () => {
    const onReorder = jest.fn();
    const onPositionsChange = jest.fn();
    const { container } = render(
      <ActivityPreview
        questions={buildQuestions()}
        onReorder={onReorder}
        onPositionsChange={onPositionsChange}
      />
    );

    const draggables = container.querySelectorAll('[data-draggable="true"]');
    const dataTransfer = {
      getData: jest.fn(() => 'q1'),
      setData: jest.fn(),
      setDragImage: jest.fn(),
    } as unknown as DataTransfer;

    fireEvent.drop(draggables[1], {
      preventDefault: () => {},
      dataTransfer,
    });

    expect(onReorder).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'q2', position: 1 }),
      expect.objectContaining({ id: 'q1', position: 2 }),
    ]);

    expect(onPositionsChange).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'q2', position: 1 }),
      expect.objectContaining({ id: 'q1', position: 2 }),
    ]);
  });
});


