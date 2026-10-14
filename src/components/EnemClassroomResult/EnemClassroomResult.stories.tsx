import type { Story } from '@ladle/react';
import type { EnemClassroomStudentResult } from '../../types/enemClassroom';
import {
  EnemClassroomResultHits,
  EnemClassroomResultSubjects,
  EnemClassroomResultSummary,
  type EnemClassroomSubjectStyle,
} from './index';

const area = (id: string, name: string, correct: number) => ({
  areaKnowledgeId: id,
  areaKnowledgeName: name,
  answered: 24,
  correct,
  incorrect: 24 - correct,
  correctPercentage: Math.round((correct / 24) * 1000) / 10,
});

const subject = (id: string, name: string, correct: number) => ({
  subjectId: id,
  subjectName: name,
  areaKnowledgeId: 'area',
  areaKnowledgeName: 'Área',
  answered: 30,
  correct,
  incorrect: 30 - correct,
  correctPercentage: Math.round((correct / 30) * 1000) / 10,
});

/** A student who did well: 8,0, above the average. */
const result: EnemClassroomStudentResult = {
  activityId: 'act-1',
  examId: 'exam-1',
  title: 'Simulado Momento Enem',
  language: 'ESPANHOL',
  answeredAt: '2026-09-21T16:00:00.000Z',
  elapsedSeconds: 12600,
  finalScore: 8,
  cohortAverageScore: 6.4,
  aboveAverage: true,
  answered: 90,
  correct: 45,
  incorrect: 40,
  blank: 5,
  correctPercentage: 50,
  bestSubject: {
    subjectId: 'bio',
    subjectName: 'Biologia',
    correctPercentage: 80,
  },
  worstSubject: {
    subjectId: 'fis',
    subjectName: 'Física',
    correctPercentage: 20,
  },
  areas: [
    area('ling', 'Linguagens, Códigos e suas Tecnologias', 12),
    area('hum', 'Ciências Humanas e suas Tecnologias', 15),
    area('nat', 'Ciências da Natureza e suas Tecnologias', 9),
    area('mat', 'Matemática e suas Tecnologias', 18),
  ],
  subjects: [
    subject('arte', 'Arte', 20),
    subject('bio', 'Biologia', 24),
    subject('fis', 'Física', 6),
    subject('mat', 'Matemática', 20),
    subject('soc', 'Sociologia', 12),
  ],
  difficulties: [
    { level: 'FACIL', answered: 30, correct: 28 },
    { level: 'MEDIO', answered: 30, correct: 20 },
    { level: 'DIFICIL', answered: 30, correct: 15 },
  ],
};

/** What the app's subjects endpoint gives; Sociologia is outside the trail. */
const subjectStyles: EnemClassroomSubjectStyle[] = [
  { id: 'arte', icon: 'PaintBrush', color: '#F4C2C2' },
  { id: 'bio', icon: 'Microscope', color: '#C7E8C0' },
  { id: 'fis', icon: 'Atom', color: '#B7DFFF' },
  { id: 'mat', icon: 'MathOperations', color: '#E4D4F4' },
];

const Page = ({ data }: Readonly<{ data: EnemClassroomStudentResult }>) => (
  <div className="flex flex-col gap-6 max-w-[1000px] mx-auto p-6 bg-background-50">
    <EnemClassroomResultSummary result={data} subjectStyles={subjectStyles} />
    <EnemClassroomResultHits result={data} />
    <EnemClassroomResultSubjects
      subjects={data.subjects}
      subjectStyles={subjectStyles}
    />
  </div>
);

/** The whole result page, above the average — as in the Figma. */
export const AboveAverage: Story = () => <Page data={result} />;

/** Below the average: the other message. */
export const BelowAverage: Story = () => (
  <Page
    data={{
      ...result,
      finalScore: 4.2,
      aboveAverage: false,
      correct: 31,
    }}
  />
);

/** Before anyone else is graded: no average, so no message at all. */
export const NoAverageYet: Story = () => (
  <Page data={{ ...result, cohortAverageScore: null, aboveAverage: null }} />
);

/** No component mapped in the block: nothing to name as best or weakest. */
export const NoHighlights: Story = () => (
  <Page data={{ ...result, bestSubject: null, worstSubject: null }} />
);
