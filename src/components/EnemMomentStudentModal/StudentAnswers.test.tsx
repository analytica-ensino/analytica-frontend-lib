import type { ComponentProps } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StudentAnswers } from './StudentAnswers';
import type {
  SimulationDetailData,
  SimulationDetailQuestion,
} from '../../types/simulations';
import type { EnemMomentStudentMoment } from '../EnemMoment/types';

const moments = [
  { examId: 'day-1', label: 'Momento 1' },
  { examId: 'day-2', label: 'Momento 2' },
];

const question = (
  questionId: string,
  statement: string
): SimulationDetailQuestion => ({
  questionId,
  statement,
  questionType: 'ALTERNATIVA',
  subject: null,
  timeSpent: 0,
  status: 'CORRECT',
  selectedOptionId: `${questionId}-a`,
  answer: null,
  additionalContent: null,
  imageAnswer: null,
  correctPoint: null,
  imageTolerance: null,
  options: [
    {
      id: `${questionId}-a`,
      option: 'Alternativa A',
      isCorrect: true,
      isSelected: true,
      selectedValue: null,
    },
  ],
  teacherComment: null,
});

const detail: SimulationDetailData = {
  simulationId: 'act-day-1',
  title: 'Dia 1',
  counts: { correct: 2, incorrect: 0, blank: 0, pending: 0 },
  questions: [
    question('q-1', 'Enunciado da primeira questão'),
    question('q-2', 'Enunciado da segunda questão'),
  ],
};

const taken = (examId: string): EnemMomentStudentMoment => ({
  examId,
  examTitle: examId,
  participated: true,
  activityId: `act-${examId}`,
  language: null,
  answeredAt: '2026-09-25T14:05:00',
  elapsedSeconds: 3600,
  score: 7,
});

type Props = ComponentProps<typeof StudentAnswers>;

function renderAnswers(overrides: Partial<Props> = {}) {
  const props: Props = {
    takenMoments: [taken('day-1'), taken('day-2')],
    moments,
    answers: { data: detail, loading: false, error: null },
    onActivityChange: jest.fn(),
    ...overrides,
  };
  const view = render(<StudentAnswers {...props} />);
  return { ...view, props };
}

const openMoments = () => fireEvent.click(screen.getByRole('combobox'));

describe('StudentAnswers', () => {
  it('opens with the "Respostas" title', () => {
    renderAnswers();

    expect(
      screen.getByRole('heading', { level: 3, name: 'Respostas' })
    ).toBeInTheDocument();
  });

  it('offers the moments the student took, in their order, the first picked', () => {
    const { props } = renderAnswers({
      // Out of order on purpose.
      takenMoments: [taken('day-2'), taken('day-1')],
    });

    expect(screen.getByRole('combobox')).toHaveTextContent('Momento 1');
    openMoments();
    expect(
      screen.getAllByRole('option').map((option) => option.textContent)
    ).toEqual(['Momento 1', 'Momento 2']);
    expect(props.onActivityChange).toHaveBeenLastCalledWith('act-day-1');
  });

  it('asks for the answers of the moment picked', () => {
    const { props } = renderAnswers();

    openMoments();
    fireEvent.click(screen.getByRole('option', { name: 'Momento 2' }));

    expect(props.onActivityChange).toHaveBeenLastCalledWith('act-day-2');
    expect(screen.getByRole('combobox')).toHaveTextContent('Momento 2');
  });

  it('asks once per moment, not on every render', () => {
    const { props, rerender } = renderAnswers();
    rerender(<StudentAnswers {...props} />);

    expect(props.onActivityChange).toHaveBeenCalledTimes(1);
  });

  it('offers a partial student only the moment taken', () => {
    const { props } = renderAnswers({ takenMoments: [taken('day-2')] });

    openMoments();
    expect(
      screen.getAllByRole('option').map((option) => option.textContent)
    ).toEqual(['Momento 2']);
    expect(props.onActivityChange).toHaveBeenLastCalledWith('act-day-2');
  });

  it('leaves out a moment the report does not list', () => {
    renderAnswers({ takenMoments: [taken('day-1'), taken('other')] });

    openMoments();
    expect(
      screen.getAllByRole('option').map((option) => option.textContent)
    ).toEqual(['Momento 1']);
  });

  it('lists every question in order, read-only', () => {
    renderAnswers();

    expect(screen.getByText('Questão 1')).toBeInTheDocument();
    expect(screen.getByText('Questão 2')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Questão 1'));

    expect(
      screen.getByText('Enunciado da primeira questão')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Comentário para o estudante')
    ).not.toBeInTheDocument();
  });

  it('says so when the student took nothing, asking for nothing', () => {
    const { props } = renderAnswers({ takenMoments: [] });

    expect(
      screen.getByText('O estudante não respondeu nenhuma prova.')
    ).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByText('Questão 1')).not.toBeInTheDocument();
    expect(props.onActivityChange).toHaveBeenLastCalledWith(null);
  });

  it('shows a skeleton while it loads', () => {
    const { container } = renderAnswers({
      answers: { data: null, loading: true, error: null },
    });

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    expect(screen.queryByText('Questão 1')).not.toBeInTheDocument();
  });

  it('shows the error when it fails', () => {
    renderAnswers({
      answers: {
        data: null,
        loading: false,
        error: 'Erro ao carregar as respostas.',
      },
    });

    expect(
      screen.getByText('Erro ao carregar as respostas.')
    ).toBeInTheDocument();
  });

  it('lists nothing before the first answer', () => {
    const { container } = renderAnswers({
      answers: { data: null, loading: false, error: null },
    });

    expect(screen.queryByText('Questão 1')).not.toBeInTheDocument();
    expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument();
  });
});
