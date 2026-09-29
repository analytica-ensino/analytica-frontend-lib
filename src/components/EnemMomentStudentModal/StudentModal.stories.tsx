import { useState } from 'react';
import type { Story } from '@ladle/react';
import Button from '../Button/Button';
import type {
  SimulationDetailData,
  SimulationDetailQuestion,
} from '../../types/simulations';
import type {
  EnemMomentMoment,
  EnemMomentSectionState,
  EnemMomentStudentReport,
} from '../EnemMoment/types';
import { StudentModal } from './StudentModal';

// ============================================================================
// MOCK DATA
// ============================================================================

const moments: EnemMomentMoment[] = [
  { examId: 'day-1', label: 'Momento 1' },
  { examId: 'day-2', label: 'Momento 2' },
];

const report: EnemMomentStudentReport = {
  student: {
    userInstitutionId: 'student-1',
    studentName: 'Ana Beatriz',
    schoolId: 'school-1',
    schoolName: 'Colégio Estadual São José',
    city: 'Curitiba',
    className: 'Turma A',
    schoolYearName: '3ª série',
  },
  momentos: [
    {
      examId: 'day-1',
      examTitle: 'Simulado Momento Enem - 1ª semana',
      participated: true,
      activityId: 'activity-1',
      language: 'INGLES',
      answeredAt: '2026-09-22T14:05:00.000Z',
      elapsedSeconds: 9120,
      score: 9,
    },
    {
      examId: 'day-2',
      examTitle: 'Simulado Momento Enem - 2ª semana',
      participated: true,
      activityId: 'activity-2',
      language: null,
      answeredAt: '2026-09-29T15:40:00.000Z',
      elapsedSeconds: 9960,
      score: 8.6,
    },
  ],
  totalElapsedSeconds: 19080,
  averageSecondsPerQuestion: 106,
  answered: 180,
  correct: 152,
  incorrect: 22,
  blank: 6,
  hitRate: 84.4,
  finalScore: 8.8,
  performance: 'ABOVE_AVERAGE',
  bestSubtopic: null,
  worstSubtopic: null,
};

/** A report of one moment — the modal opened from a Momento tab. */
const oneMomentReport: EnemMomentStudentReport = {
  ...report,
  momentos: [report.momentos[0]],
  totalElapsedSeconds: 9120,
  answered: 90,
  correct: 81,
  incorrect: 7,
  blank: 2,
  finalScore: 9,
  performance: 'HIGHLIGHT',
};

/** A student who took nothing of the cut. */
const absentReport: EnemMomentStudentReport = {
  ...report,
  momentos: report.momentos.map((momento) => ({
    ...momento,
    participated: false,
    language: null,
    answeredAt: null,
    elapsedSeconds: null,
    score: null,
  })),
  totalElapsedSeconds: null,
  averageSecondsPerQuestion: null,
  answered: 0,
  correct: 0,
  incorrect: 0,
  blank: 0,
  hitRate: null,
  finalScore: null,
  performance: 'NO_EXAM',
};

const question = (
  index: number,
  status: SimulationDetailQuestion['status'],
  statement: string,
  options: string[],
  right: number,
  picked: number | null
): SimulationDetailQuestion => {
  const questionId = `question-${index}`;
  return {
    questionId,
    statement: `<p>${statement}</p>`,
    questionType: 'ALTERNATIVA',
    subject: 'Física',
    timeSpent: status === 'BLANK' ? 0 : 60 + index * 23,
    status,
    selectedOptionId: picked === null ? null : `${questionId}-${picked}`,
    answer: null,
    additionalContent: null,
    imageAnswer: null,
    correctPoint: null,
    imageTolerance: null,
    options: options.map((option, position) => ({
      id: `${questionId}-${position}`,
      option,
      isCorrect: position === right,
      isSelected: position === picked,
      selectedValue: null,
    })),
    teacherComment: null,
  };
};

const answers: SimulationDetailData = {
  simulationId: 'activity-1',
  title: 'Simulado Momento Enem - 1ª semana',
  counts: { correct: 2, incorrect: 1, blank: 1, pending: 0 },
  questions: [
    question(
      1,
      'INCORRECT',
      'Um carro inicia do repouso e se desloca em linha reta com uma aceleração constante de 2 m/s². Calcule a distância que o carro percorre após 5 segundos.',
      ['20 metros', '25 metros', '30 metros', '40 metros', '50 metros'],
      1,
      2
    ),
    question(
      2,
      'CORRECT',
      'Qual é a unidade de medida da força no Sistema Internacional?',
      ['Joule', 'Newton', 'Watt', 'Pascal', 'Coulomb'],
      1,
      1
    ),
    question(
      3,
      'CORRECT',
      'A energia cinética de um corpo depende de:',
      [
        'Apenas da massa',
        'Apenas da velocidade',
        'Da massa e da velocidade',
        'Da altura',
        'Do volume',
      ],
      2,
      2
    ),
    question(
      4,
      'BLANK',
      'Qual das grandezas abaixo é vetorial?',
      ['Massa', 'Tempo', 'Temperatura', 'Velocidade', 'Energia'],
      3,
      null
    ),
  ],
};

const ready = <T,>(data: T): EnemMomentSectionState<T> => ({
  data,
  loading: false,
  error: null,
});

/**
 * The modal behind a button, with the answers "fetched" for the moment it
 * picks — the apps fetch them from the simulados endpoint.
 */
function ModalStory({
  studentReport,
}: Readonly<{
  studentReport: EnemMomentSectionState<EnemMomentStudentReport>;
}>) {
  const [open, setOpen] = useState(true);
  const [activityId, setActivityId] = useState<string | null>(null);

  return (
    <div className="p-4">
      <Button onClick={() => setOpen(true)}>Abrir modal</Button>
      <StudentModal
        isOpen={open}
        onClose={() => setOpen(false)}
        studentReport={studentReport}
        moments={moments}
        answers={
          activityId === null
            ? { data: null, loading: false, error: null }
            : ready({ ...answers, simulationId: activityId })
        }
        onAnswersActivityChange={setActivityId}
      />
    </div>
  );
}

// ============================================================================
// STORIES
// ============================================================================

/** On "Geral": both moments, each score, and the answers of the one picked. */
export const TwoMoments: Story = () => (
  <ModalStory studentReport={ready(report)} />
);

/** On a Momento tab: that moment alone. */
export const OneMoment: Story = () => (
  <ModalStory studentReport={ready(oneMomentReport)} />
);

/** A student who took nothing: no badge, "—" and no answers. */
export const NotParticipated: Story = () => (
  <ModalStory studentReport={ready(absentReport)} />
);

export const Loading: Story = () => (
  <ModalStory studentReport={{ data: null, loading: true, error: null }} />
);

export const LoadError: Story = () => (
  <ModalStory
    studentReport={{
      data: null,
      loading: false,
      error: 'Erro ao carregar o desempenho do estudante.',
    }}
  />
);
