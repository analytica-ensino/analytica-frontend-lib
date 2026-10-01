import { useMemo, useState, type ReactNode } from 'react';
import type { Story } from '@ladle/react';
import {
  EnemMomentHeaderFilters,
  EnemMomentPerformanceBadge,
  EnemMomentSummaryCards,
  DailyEvolutionSection,
  KnowledgeAreaSection,
  MomentTabs,
  ParticipationBadge,
  PerformanceDistributionSection,
  StudentsTableSection,
  ToneTile,
  UnitExamDataSection,
  UnitStudentRankings,
  answerTiles,
  buildEnemMomentUnitSummaryCards,
  type EnemMomentDailyEvolution,
  type EnemMomentEducationStage,
  type EnemMomentExamData,
  type EnemMomentFilterOptions,
  type EnemMomentMoment,
  type EnemMomentQuestionsView,
  type EnemMomentRankedStudent,
  type EnemMomentSectionState,
  type EnemMomentStudentRow,
  type EnemMomentStudentsExport,
  type EnemMomentStudentsTableFilters,
  type EnemMomentStudentsTableQuery,
  type EnemMomentSummary,
  type EnemMomentTab,
} from './index';

// ============================================================================
// MOCK DATA — one school of 420 students, two moments
// ============================================================================

const ready = <T,>(data: T): EnemMomentSectionState<T> => ({
  data,
  loading: false,
  error: null,
});

const loading: EnemMomentSectionState<never> = {
  data: null,
  loading: true,
  error: null,
};

const failed = (error: string): EnemMomentSectionState<never> => ({
  data: null,
  loading: false,
  error,
});

const moments: EnemMomentMoment[] = [
  { examId: 'day-1', label: 'Momento 1' },
  { examId: 'day-2', label: 'Momento 2' },
];

const tabs: EnemMomentTab[] = [
  { value: 'geral', label: 'Geral' },
  { value: 'day-1', label: 'Momento 1 · Linguagens e Ciências Humanas' },
  { value: 'day-2', label: 'Momento 2 · Ciências da Natureza e Matemática' },
];

const summary: EnemMomentSummary = {
  exams: [],
  examsCount: 2,
  examsWithParticipation: 2,
  totalSchools: 1,
  municipalitiesCount: 1,
  totalClasses: 14,
  totalStudents: 420,
  schoolsWithParticipation: 1,
  schoolsWithoutParticipation: 0,
  schoolParticipationPercentage: 100,
  participatingStudents: 318,
  studentsWithoutParticipation: 102,
  studentParticipationPercentage: 75.7,
  totalParticipations: 560,
  averageScore: 6.2,
  firstAnsweredAt: '2026-09-21T13:10:00.000Z',
  lastAnsweredAt: '2026-10-02T20:40:00.000Z',
};

const examData: EnemMomentExamData = {
  studentScoreBands: [
    { label: '0 a 2', count: 18 },
    { label: '2 a 4', count: 52 },
    { label: '4 a 6', count: 96 },
    { label: '6 a 8', count: 104 },
    { label: '8 a 10', count: 48 },
  ],
  schoolScoreBands: [
    { label: '0 a 2', count: 0 },
    { label: '2 a 4', count: 0 },
    { label: '4 a 6', count: 0 },
    { label: '6 a 8', count: 1 },
    { label: '8 a 10', count: 0 },
  ],
  studentPerformanceBands: [
    { tag: 'HIGHLIGHT', count: 21 },
    { tag: 'ABOVE_AVERAGE', count: 94 },
    { tag: 'BELOW_AVERAGE', count: 133 },
    { tag: 'ATTENTION_POINT', count: 70 },
    { tag: 'NO_EXAM', count: 102 },
  ],
  studentsWithoutScore: 0,
  language: { ingles: 176, espanhol: 128, withoutChoice: 14 },
  time: {
    averageTotalSeconds: 7860,
    averageSecondsPerQuestion: 87,
    durationSeconds: 10800,
  },
};

/** A day-2 cut: nobody picks a language. */
const dayTwoExamData: EnemMomentExamData = {
  ...examData,
  language: { ingles: 0, espanhol: 0, withoutChoice: 276 },
};

const daily: EnemMomentDailyEvolution = {
  days: [
    ['2026-09-21', 62, 0],
    ['2026-09-22', 71, 0],
    ['2026-09-23', 58, 0],
    ['2026-09-24', 49, 0],
    ['2026-09-25', 44, 0],
    ['2026-09-28', 0, 66],
    ['2026-09-29', 0, 70],
    ['2026-09-30', 0, 51],
    ['2026-10-01', 0, 48],
    ['2026-10-02', 0, 41],
  ].reduce<EnemMomentDailyEvolution['days']>((days, [day, first, second]) => {
    const participations = Number(first) + Number(second);
    const accumulated =
      (days.at(-1)?.accumulatedParticipations ?? 0) + participations;
    return [
      ...days,
      {
        day: String(day),
        byExam: [
          { examId: 'day-1', participations: Number(first) },
          { examId: 'day-2', participations: Number(second) },
        ],
        participations,
        accumulatedParticipations: accumulated,
        accumulatedAverageScore: 6.1,
      },
    ];
  }, []),
};

const subject = (
  subjectId: string,
  subjectName: string,
  areaKnowledgeName: string,
  answered: number,
  correct: number,
  icon: string,
  color: string
) => {
  const blank = Math.round(answered * 0.04);
  return {
    subjectId,
    subjectName,
    areaKnowledgeId: areaKnowledgeName,
    areaKnowledgeName,
    answered,
    correct,
    incorrect: answered - correct - blank,
    blank,
    correctPercentage: Math.round((correct / answered) * 1000) / 10,
    icon,
    color,
  };
};

const LANGUAGES = 'Linguagens, Códigos e suas Tecnologias';
const HUMANITIES = 'Ciências Humanas e suas Tecnologias';
const SCIENCES = 'Ciências da Natureza e suas Tecnologias';
const MATH = 'Matemática e suas Tecnologias';

const subjects = [
  subject('math', 'Matemática', MATH, 12420, 4471, 'MathOperations', '#FFE3C8'),
  subject('physics', 'Física', SCIENCES, 4140, 1780, 'Atom', '#D4F1E4'),
  subject('chemistry', 'Química', SCIENCES, 4140, 1946, 'Flask', '#D4F1E4'),
  subject('biology', 'Biologia', SCIENCES, 4140, 2277, 'Leaf', '#D4F1E4'),
  subject(
    'portuguese',
    'Língua Portuguesa',
    LANGUAGES,
    5472,
    3228,
    'Book',
    '#DCE9FF'
  ),
  subject(
    'history',
    'História',
    HUMANITIES,
    3952,
    2292,
    'CastleTurret',
    '#F3E1FF'
  ),
  subject('geography', 'Geografia', HUMANITIES, 3648, 2152, 'Globe', '#F3E1FF'),
  subject('arts', 'Arte', LANGUAGES, 2432, 1605, 'Palette', '#DCE9FF'),
];

const sum = (key: 'answered' | 'correct' | 'incorrect' | 'blank') =>
  subjects.reduce((total, row) => total + row[key], 0);

const questions: EnemMomentQuestionsView = {
  totals: {
    answered: sum('answered'),
    correct: sum('correct'),
    incorrect: sum('incorrect'),
    blank: sum('blank'),
    correctPercentage: 48.9,
    incorrectPercentage: 47.1,
    blankPercentage: 4,
    averageScore: 4.9,
  },
  areas: [LANGUAGES, HUMANITIES, SCIENCES, MATH].map((area) => {
    const rows = subjects.filter((row) => row.areaKnowledgeName === area);
    const answered = rows.reduce((total, row) => total + row.answered, 0);
    const correct = rows.reduce((total, row) => total + row.correct, 0);
    const blank = rows.reduce((total, row) => total + row.blank, 0);
    const correctPercentage = Math.round((correct / answered) * 1000) / 10;
    return {
      areaKnowledgeId: area,
      areaKnowledgeName: area,
      answered,
      correct,
      incorrect: answered - correct - blank,
      blank,
      correctPercentage,
      averageScore: Math.round(correctPercentage) / 10,
    };
  }),
  subjects,
};

const student = (
  index: number,
  studentName: string,
  className: string,
  averageScore: number | null
): EnemMomentStudentRow => {
  const took = averageScore !== null;
  const correct = took ? Math.round((averageScore / 10) * 170) : 0;
  const blank = took ? index % 6 : 0;
  const tier = (score: number) => {
    if (score >= 9) return 'HIGHLIGHT' as const;
    if (score >= 7) return 'ABOVE_AVERAGE' as const;
    if (score >= 4) return 'BELOW_AVERAGE' as const;
    return 'ATTENTION_POINT' as const;
  };
  return {
    userInstitutionId: `student-${index}`,
    studentName,
    classId: `class-${className}`,
    className,
    schoolId: 'school-1',
    schoolName: 'Colégio Estadual São José',
    city: 'Curitiba',
    participatedExams: took ? 2 - (index % 5 === 0 ? 1 : 0) : 0,
    partialParticipation: took && index % 5 === 0,
    totalElapsedSeconds: took ? 7200 + index * 97 : null,
    answered: took ? 180 : 0,
    correct,
    incorrect: took ? 180 - correct - blank : 0,
    blank,
    hitRate: took ? Math.round((correct / 180) * 1000) / 10 : null,
    averageScore,
    performance: took ? tier(averageScore) : 'NO_EXAM',
  };
};

const students: EnemMomentStudentRow[] = [
  student(1, 'Ana Beatriz', 'Turma A', 9.3),
  student(2, 'Ana Costa', 'Turma A', 7.4),
  student(3, 'Arthur Ribeiro', 'Turma B', 1.2),
  student(4, 'Bruno Costa', 'Turma B', 5.6),
  student(5, 'Camila Lima', 'Turma C', 8.1),
  student(6, 'Davi Martins', 'Turma C', 3.2),
  student(7, 'Eduarda Gomes', 'Turma A', null),
  student(8, 'Enzo Pereira', 'Turma B', 6.4),
  student(9, 'George Santos', 'Turma C', 1.9),
  student(10, 'Helena Oliveira', 'Turma A', 9.0),
  student(11, 'João Rafael', 'Turma B', null),
  student(12, 'Julia Andrade', 'Turma C', 4.7),
  student(13, 'Sofia Andrade', 'Turma A', 2.4),
  student(14, 'Vitor Barbosa', 'Turma B', null),
];

const ranked = (rows: EnemMomentStudentRow[]): EnemMomentRankedStudent[] =>
  rows.map((row, index) => ({
    ...row,
    averageScore: row.averageScore ?? 0,
    position: index + 1,
  }));

const scored = students.filter((row) => row.averageScore !== null);
const byScore = [...scored].sort(
  (a, b) => (b.averageScore ?? 0) - (a.averageScore ?? 0)
);
const highlights = ranked(byScore.slice(0, 3));
const struggling = ranked([...byScore].reverse().slice(0, 3));

const classes: EnemMomentFilterOptions['classes'] = ['A', 'B', 'C'].map(
  (letter) => ({
    classId: `class-Turma ${letter}`,
    className: `Turma ${letter}`,
    schoolYearName: '3ª série',
  })
);

const Frame = ({ children }: { children: ReactNode }) => (
  <div className="max-w-6xl p-4 bg-background-50 flex flex-col gap-6">
    {children}
  </div>
);

// ============================================================================
// STORIES
// ============================================================================

/**
 * The unit report (Gestor de Unidade, professor) from top to bottom, as the
 * apps lay it out.
 */
export const UnitReport: Story = () => {
  const [tab, setTab] = useState('geral');
  return (
    <Frame>
      <MomentTabs tabs={tabs} activeTab={tab} onTabChange={setTab} />
      <EnemMomentSummaryCards
        summary={ready(summary)}
        buildCards={buildEnemMomentUnitSummaryCards}
      />
      <UnitExamDataSection
        summary={ready(summary)}
        examData={ready(examData)}
        hasLanguageChoice
        examDurationSeconds={10800}
      />
      <DailyEvolutionSection daily={ready(daily)} moments={moments} />
      <KnowledgeAreaSection questions={ready(questions)} />
      <UnitStudentRankings
        highlights={ready(highlights)}
        struggling={ready(struggling)}
      />
      <PerformanceDistributionSection examData={ready(examData)} />
      <StudentsTable />
    </Frame>
  );
};

/**
 * The "Tempo de prova" and "Série" picks of the header — in a row that wraps,
 * like the gestor's, where both must stay on one line while there is room.
 */
export const HeaderFilters: Story = () => {
  const [durations, setDurations] = useState<number[]>([60, 90]);
  const [stage, setStage] = useState<EnemMomentEducationStage>('REGULAR');
  return (
    <div className="flex flex-row flex-wrap items-center gap-3 p-4">
      <EnemMomentHeaderFilters
        durations={durations}
        onDurationsChange={setDurations}
        educationStage={stage}
        onEducationStageChange={setStage}
      />
    </div>
  );
};

/** "Geral" and one tab per moment; hidden with a single moment. */
export const Tabs: Story = () => {
  const [tab, setTab] = useState('day-1');
  return (
    <Frame>
      <MomentTabs tabs={tabs} activeTab={tab} onTabChange={setTab} />
    </Frame>
  );
};

/** The four cards, counting students. */
export const SummaryCards: Story = () => (
  <Frame>
    <EnemMomentSummaryCards
      summary={ready(summary)}
      buildCards={buildEnemMomentUnitSummaryCards}
    />
  </Frame>
);

export const SummaryCardsLoading: Story = () => (
  <Frame>
    <EnemMomentSummaryCards
      summary={loading}
      buildCards={buildEnemMomentUnitSummaryCards}
    />
  </Frame>
);

/** "Dados do simulado" on "Geral": score bands, then Participação, Idioma and Tempo. */
export const ExamData: Story = () => (
  <Frame>
    <UnitExamDataSection
      summary={ready(summary)}
      examData={ready(examData)}
      hasLanguageChoice
      examDurationSeconds={10800}
    />
  </Frame>
);

/** A day 2 on its own: no Idioma card, and the other two share the row. */
export const ExamDataDayTwo: Story = () => (
  <Frame>
    <UnitExamDataSection
      summary={ready(summary)}
      examData={ready(dayTwoExamData)}
      hasLanguageChoice={false}
      examDurationSeconds={10800}
    />
  </Frame>
);

export const ExamDataError: Story = () => (
  <Frame>
    <UnitExamDataSection
      summary={ready(summary)}
      examData={failed('Erro ao carregar os dados do simulado.')}
      hasLanguageChoice
      examDurationSeconds={10800}
    />
  </Frame>
);

/** "Evolução por dia": each day in the color of its moment. */
export const DailyEvolution: Story = () => (
  <Frame>
    <DailyEvolutionSection daily={ready(daily)} moments={moments} />
  </Frame>
);

export const DailyEvolutionEmpty: Story = () => (
  <Frame>
    <DailyEvolutionSection daily={ready({ days: [] })} moments={moments} />
  </Frame>
);

/** "Desempenho por área de conhecimento", with the area picker. */
export const KnowledgeAreas: Story = () => (
  <Frame>
    <KnowledgeAreaSection questions={ready(questions)} />
  </Frame>
);

export const KnowledgeAreasLoading: Story = () => (
  <Frame>
    <KnowledgeAreaSection questions={loading} />
  </Frame>
);

/** The top and the bottom three of the cut, side by side. */
export const Rankings: Story = () => (
  <Frame>
    <UnitStudentRankings
      highlights={ready(highlights)}
      struggling={ready(struggling)}
      onStudentClick={() => undefined}
    />
  </Frame>
);

export const RankingsEmpty: Story = () => (
  <Frame>
    <UnitStudentRankings highlights={ready([])} struggling={ready([])} />
  </Frame>
);

export const RankingsLoadingAndError: Story = () => (
  <Frame>
    <UnitStudentRankings
      highlights={loading}
      struggling={failed(
        'Erro ao carregar os estudantes com maior dificuldade.'
      )}
    />
  </Frame>
);

/** "Desempenho por quantidade de estudante", who did not take it included. */
export const PerformanceDistribution: Story = () => (
  <Frame>
    <PerformanceDistributionSection examData={ready(examData)} />
  </Frame>
);

/**
 * The whole list for "Baixar tabela", as the API would hand it: every student,
 * whatever the table is filtering, with a status per moment.
 */
const loadStudentsExport = (): Promise<EnemMomentStudentsExport> =>
  new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          exams: [
            { examId: 'exam-1', title: 'Simulado ENEM — 1º dia' },
            { examId: 'exam-2', title: 'Simulado ENEM — 2º dia' },
          ],
          students: students.map((row) => {
            let statuses: Array<'DONE' | 'PARTIAL' | 'NOT_DONE'>;
            if (row.participatedExams === 0)
              statuses = ['NOT_DONE', 'NOT_DONE'];
            else if (row.partialParticipation) statuses = ['DONE', 'NOT_DONE'];
            else if (row.blank > 0) statuses = ['DONE', 'PARTIAL'];
            else statuses = ['DONE', 'DONE'];
            return {
              userInstitutionId: row.userInstitutionId,
              studentName: row.studentName,
              email: `${row.studentName.toLowerCase().replaceAll(' ', '.')}@escola.pr.gov.br`,
              className: row.className,
              moments: statuses.map((status, index) => ({
                examId: `exam-${index + 1}`,
                status,
              })),
            };
          }),
        }),
      600
    );
  });

/** The students a table filter lets through, the way the API reads it. */
const filterStudents = (filters: EnemMomentStudentsTableFilters | null) =>
  students.filter(
    (row) =>
      (!filters?.search ||
        row.studentName.toLowerCase().includes(filters.search.toLowerCase())) &&
      (!filters?.classIds?.length ||
        filters.classIds.includes(row.classId ?? '')) &&
      (!filters?.performances?.length ||
        (row.performance !== null &&
          filters.performances.includes(row.performance)))
  );

/** Every page the table lists under its filters, for the PDF. */
const loadFilteredStudents = (filters: EnemMomentStudentsTableFilters) =>
  new Promise<EnemMomentStudentRow[]>((resolve) => {
    setTimeout(() => resolve(filterStudents(filters)), 300);
  });

/** The table, paged and filtered here the way the API does it. */
function StudentsTable({
  loadingRows = false,
  withDownload = false,
}: Readonly<{
  loadingRows?: boolean;
  withDownload?: boolean;
}>) {
  const [query, setQuery] = useState<EnemMomentStudentsTableQuery | null>(null);
  const matching = useMemo(() => filterStudents(query), [query]);
  const page = query?.page ?? 1;
  const limit = query?.limit ?? 10;

  return (
    <StudentsTableSection
      rows={matching.slice((page - 1) * limit, page * limit)}
      pagination={{
        page,
        limit,
        total: matching.length,
        totalPages: Math.max(1, Math.ceil(matching.length / limit)),
      }}
      loading={loadingRows}
      error={null}
      classes={classes}
      onQueryChange={setQuery}
      onStudentClick={() => undefined}
      loadExport={withDownload ? loadStudentsExport : undefined}
      loadFilteredStudents={withDownload ? loadFilteredStudents : undefined}
    />
  );
}

/** "Desempenho por estudante" of the unit report: the Desempenho column. */
export const StudentsTableUnit: Story = () => (
  <Frame>
    <StudentsTable />
  </Frame>
);

/**
 * The unit report and the professor's view, with "Baixar tabela": the XLSX
 * carries every student in scope; the PDF, the ones the table lists under its
 * filters.
 */
export const StudentsTableWithDownload: Story = () => (
  <Frame>
    <StudentsTable withDownload />
  </Frame>
);

/** The same table on a school's page: the Participação column. */
export const StudentsTableSchoolPage: Story = () => (
  <Frame>
    <StudentsTable />
  </Frame>
);

export const StudentsTableLoading: Story = () => (
  <Frame>
    <StudentsTable loadingRows />
  </Frame>
);

/** Every badge the tables print. */
export const Badges: Story = () => (
  <div className="flex flex-col gap-4 p-4">
    <div className="flex flex-row flex-wrap gap-2">
      <EnemMomentPerformanceBadge performance="HIGHLIGHT" />
      <EnemMomentPerformanceBadge performance="ABOVE_AVERAGE" />
      <EnemMomentPerformanceBadge performance="BELOW_AVERAGE" />
      <EnemMomentPerformanceBadge performance="ATTENTION_POINT" />
      <EnemMomentPerformanceBadge performance="NO_EXAM" />
    </div>
    <div className="flex flex-row flex-wrap gap-2">
      <ParticipationBadge participation="PARTICIPATED" />
      <ParticipationBadge participation="PARTIAL" />
      <ParticipationBadge participation="NOT_PARTICIPATED" />
    </div>
  </div>
);

/** The colored tiles of "Dados gerais" and of the student's modal. */
export const ToneTiles: Story = () => (
  <div className="grid grid-cols-3 gap-3 max-w-3xl p-4">
    <ToneTile tone="grade" label="Nota 1" value="9,0" />
    <ToneTile tone="grade" label="Nota 2" value="8,5" />
    <ToneTile tone="grade" label="Nota final" value="8,8" />
    {answerTiles({ correct: 152, incorrect: 22, blank: 6 }).map(
      ({ key, ...tile }) => (
        <ToneTile key={key} {...tile} />
      )
    )}
  </div>
);
