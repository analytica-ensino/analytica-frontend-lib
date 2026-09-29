import type { ComponentProps } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StudentModal, buildStudentTiles, tookMoment } from './StudentModal';
import type { SimulationDetailData } from '../../types/simulations';
import type {
  EnemMomentStudentMoment,
  EnemMomentStudentReport,
} from '../EnemMoment/types';

const moments = [
  { examId: 'day-1', label: 'Momento 1' },
  { examId: 'day-2', label: 'Momento 2' },
];

const momento = (
  examId: string,
  overrides: Partial<EnemMomentStudentMoment> = {}
): EnemMomentStudentMoment => ({
  examId,
  examTitle: `Prova ${examId}`,
  participated: true,
  activityId: `act-${examId}`,
  language: null,
  answeredAt: '2026-09-25T14:05:00',
  elapsedSeconds: 2400,
  score: 9,
  ...overrides,
});

const report: EnemMomentStudentReport = {
  student: {
    userInstitutionId: 'student-1',
    studentName: 'Ana Beatriz',
    schoolId: 'school-1',
    schoolName: 'Colégio Estadual São José',
    city: 'Curitiba',
    className: 'Turma A',
    schoolYearName: '2025',
  },
  momentos: [
    momento('day-1', {
      language: 'INGLES',
      answeredAt: '2026-09-22T10:00:00',
      score: 9.5,
    }),
    momento('day-2', { answeredAt: '2026-09-25T14:05:00', score: 8.5 }),
  ],
  totalElapsedSeconds: 4805,
  averageSecondsPerQuestion: 89,
  answered: 30,
  correct: 10,
  incorrect: 10,
  blank: 10,
  hitRate: 33.3,
  finalScore: 9,
  performance: 'HIGHLIGHT',
  bestSubtopic: {
    subtopicId: 'st-1',
    subtopicName: 'Ciclo de Calvin e a Fixação do Carbono',
    answered: 4,
    correct: 4,
    hitRate: 100,
  },
  worstSubtopic: {
    subtopicId: 'st-2',
    subtopicName: 'O fenômeno e duas fases principais',
    answered: 4,
    correct: 0,
    hitRate: 0,
  },
};

/** The report of one moment — a Momento tab. */
const onTab: EnemMomentStudentReport = {
  ...report,
  momentos: [report.momentos[0]],
  finalScore: 9.5,
};

const answers: SimulationDetailData = {
  simulationId: 'act-day-1',
  title: 'Dia 1',
  counts: { correct: 1, incorrect: 0, blank: 0, pending: 0 },
  questions: [
    {
      questionId: 'q-1',
      statement: 'Enunciado',
      questionType: 'ALTERNATIVA',
      subject: null,
      timeSpent: 0,
      status: 'CORRECT',
      selectedOptionId: null,
      answer: null,
      additionalContent: null,
      imageAnswer: null,
      correctPoint: null,
      imageTolerance: null,
      options: [],
      teacherComment: null,
    },
  ],
};

const flatten = (data: EnemMomentStudentReport) =>
  buildStudentTiles(data, moments).map((tile) => `${tile.label}|${tile.value}`);

type Props = ComponentProps<typeof StudentModal>;

function renderModal(
  studentReport: Partial<Props['studentReport']> = {},
  overrides: Partial<Props> = {}
) {
  const props: Props = {
    isOpen: true,
    onClose: jest.fn(),
    studentReport: {
      data: report,
      loading: false,
      error: null,
      ...studentReport,
    },
    moments,
    answers: { data: answers, loading: false, error: null },
    onAnswersActivityChange: jest.fn(),
    ...overrides,
  };
  const view = render(<StudentModal {...props} />);
  return { ...view, props };
}

/** What a "Dados de simulados" box reads under its label. */
const metric = (label: string) =>
  screen.getByText(label).nextElementSibling?.textContent;

describe('tookMoment', () => {
  it('reads a moment as taken when it has a submission', () => {
    expect(tookMoment(momento('day-1'))).toBe(true);
    expect(tookMoment(momento('day-1', { participated: false }))).toBe(false);
  });
});

describe('buildStudentTiles', () => {
  it('on Geral: each moment’s score, then the final, then the answers', () => {
    expect(flatten(report)).toEqual([
      'Nota 1|9,5',
      'Nota 2|8,5',
      'Nota final|9,0',
      'Nº de questões corretas|10',
      'Nº de questões incorretas|10',
      'Nº de questões em branco|10',
    ]);
    expect(buildStudentTiles(report, moments).map((tile) => tile.tone)).toEqual(
      ['grade', 'grade', 'grade', 'correct', 'incorrect', 'blank']
    );
  });

  it('marks the moment a student skipped', () => {
    expect(
      flatten({
        ...report,
        momentos: [
          momento('day-1', { score: 7 }),
          momento('day-2', {
            participated: false,
            answeredAt: null,
            score: null,
          }),
        ],
      }).slice(0, 2)
    ).toEqual(['Nota 1|7,0', 'Nota 2|—']);
  });

  it('names a moment the report does not list without a number', () => {
    expect(
      flatten({
        ...report,
        momentos: [momento('day-1'), momento('other', { score: 5 })],
      })[1]
    ).toBe('Nota|5,0');
  });

  it('on a Momento tab: that moment’s score alone', () => {
    expect(flatten(onTab)[0]).toBe('Nota|9,5');
    expect(flatten(onTab)).toHaveLength(4);
  });

  it('marks a final score nobody has', () => {
    expect(flatten({ ...onTab, finalScore: null })[0]).toBe('Nota|—');
    expect(flatten({ ...report, finalScore: null })[2]).toBe('Nota final|—');
  });
});

describe('StudentModal', () => {
  beforeEach(() => {
    globalThis.history.replaceState({}, '', '/');
  });

  it('titles the modal and names the student, school, class and year', () => {
    renderModal();

    expect(
      screen.getByRole('heading', { name: 'Desempenho simulado Momento Enem' })
    ).toBeInTheDocument();
    expect(screen.getByText('Ana Beatriz')).toBeInTheDocument();
    expect(
      screen.getByText('Colégio Estadual São José • Turma A • 2025')
    ).toBeInTheDocument();
    expect(screen.getByText('DESTAQUE')).toBeInTheDocument();
  });

  it('marks a class and a year the student has not got', () => {
    renderModal({
      data: {
        ...report,
        student: { ...report.student, className: null, schoolYearName: null },
      },
    });

    expect(
      screen.getByText('Colégio Estadual São José • — • —')
    ).toBeInTheDocument();
  });

  it('fills "Dados de simulados", on Geral with the last submission', () => {
    renderModal();

    expect(
      screen.getByRole('heading', { level: 3, name: 'Dados de simulados' })
    ).toBeInTheDocument();
    expect(metric('Tempo total do simulado')).toBe('01:20:05');
    expect(metric('Tempo médio em cada questão')).toBe('00:01:29');
    expect(metric('Realizou o simulado')).toBe('25/09/2026 • 14:05h');
    expect(metric('Idioma')).toBe('Inglês');
  });

  it('takes the last submission whatever order the moments come in', () => {
    renderModal({
      data: { ...report, momentos: [...report.momentos].reverse() },
    });

    expect(metric('Realizou o simulado')).toBe('25/09/2026 • 14:05h');
  });

  it('names the language picked, and keeps one it does not know as it came', () => {
    const { unmount } = renderModal({
      data: {
        ...report,
        momentos: [momento('day-1', { language: 'ESPANHOL' })],
      },
    });
    expect(metric('Idioma')).toBe('Espanhol');
    unmount();

    renderModal({
      data: {
        ...report,
        momentos: [momento('day-1', { language: 'FRANCES' })],
      },
    });
    expect(metric('Idioma')).toBe('FRANCES');
  });

  it('marks what the student has not got: times, language, date, performance', () => {
    renderModal({
      data: {
        ...report,
        totalElapsedSeconds: null,
        averageSecondsPerQuestion: null,
        momentos: report.momentos.map((item) => ({
          ...item,
          language: null,
          answeredAt: null,
          participated: false,
          score: null,
        })),
        performance: 'NO_EXAM',
      },
    });

    expect(metric('Tempo total do simulado')).toBe('—');
    expect(metric('Tempo médio em cada questão')).toBe('—');
    expect(metric('Idioma')).toBe('—');
    expect(metric('Realizou o simulado')).toBe('—');
    expect(screen.queryByText('DESTAQUE')).not.toBeInTheDocument();
    expect(screen.queryByText('NÃO PARTICIPOU')).not.toBeInTheDocument();
  });

  it('shows the scores in a grid of three on Geral, four on a tab', () => {
    const { unmount } = renderModal();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Desempenho geral' })
    ).toBeInTheDocument();
    expect(screen.getByText('Nota final').closest('.grid')).toHaveClass(
      'lg:grid-cols-3'
    );
    unmount();

    renderModal({ data: onTab });
    expect(screen.getByText('Nota').closest('.grid')).toHaveClass(
      'lg:grid-cols-4'
    );
  });

  it('names no best or hardest subtema', () => {
    // Removed with QA: the exam spreads 54 questions over ~37 subtemas, most of
    // them with a single question, so "maior dificuldade" was naming the one
    // question the student missed.
    renderModal();

    expect(
      screen.queryByText('Subtema com melhor resultado')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Subtema com maior dificuldade')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Ciclo de Calvin e a Fixação do Carbono')
    ).not.toBeInTheDocument();
  });

  it('closes with the answers of the moments the student took', () => {
    const { props } = renderModal({
      data: {
        ...report,
        momentos: [
          report.momentos[0],
          momento('day-2', {
            participated: false,
            answeredAt: null,
            score: null,
          }),
        ],
      },
    });

    expect(
      screen.getByRole('heading', { level: 3, name: 'Respostas' })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('combobox', { name: /Momento/ }));
    expect(
      screen.getAllByRole('option').map((option) => option.textContent)
    ).toEqual(['Momento 1']);
    expect(props.onAnswersActivityChange).toHaveBeenLastCalledWith('act-day-1');
  });

  it('draws the answers the app hands it', () => {
    renderModal();

    expect(screen.getByText('Questão 1')).toBeInTheDocument();
  });

  it('asks for no answers of a student who took nothing', () => {
    const { props } = renderModal({
      data: {
        ...report,
        momentos: report.momentos.map((item) => ({
          ...item,
          answeredAt: null,
          participated: false,
        })),
      },
    });

    expect(
      screen.getByText('O estudante não respondeu nenhuma prova.')
    ).toBeInTheDocument();
    expect(props.onAnswersActivityChange).toHaveBeenLastCalledWith(null);
  });

  it('shows skeletons while it loads', () => {
    renderModal({ data: null, loading: true });

    // The header, the metrics and the answers, each at its height.
    for (const height of ['.h-16', '.h-24', '.h-64']) {
      expect(
        document.querySelector(height)?.querySelector('.animate-pulse')
      ).toBeInTheDocument();
    }
    expect(screen.queryByText('Ana Beatriz')).not.toBeInTheDocument();
  });

  it('shows the error when it fails', () => {
    renderModal({ data: null, error: 'Erro ao carregar.' });

    expect(screen.getByText('Erro ao carregar.')).toBeInTheDocument();
    expect(screen.queryByText('Ana Beatriz')).not.toBeInTheDocument();
  });

  it('draws only its title before the first answer', () => {
    renderModal({ data: null });

    expect(
      screen.getByRole('heading', { name: 'Desempenho simulado Momento Enem' })
    ).toBeInTheDocument();
    expect(screen.queryByText('Dados de simulados')).not.toBeInTheDocument();
  });

  it('closes on the close button', () => {
    const { props } = renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Fechar modal' }));

    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('draws nothing while closed', () => {
    renderModal({}, { isOpen: false });

    expect(
      screen.queryByText('Desempenho simulado Momento Enem')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Ana Beatriz')).not.toBeInTheDocument();
  });
});
