import type { BaseApiClient } from '../../types/api';
import type { SheetConfig } from '../../utils/exportExcel';
import {
  EBOOK_READING_ROUTE,
  GROUP_LABEL,
  GROUP_ROUTE,
  READING_TIER_LABEL,
  fetchEveryRow,
  postReading,
  readingTier,
} from './readingReport';
import {
  EBOOK_RANKING_DIMENSION,
  EBOOK_RANKING_METRIC,
  EBOOK_READING_GROUP,
  READING_TIER,
  type EbookRankingDimension,
  type EbookRankingItem,
  type EbookRankings,
  type EbookReadingBySubject,
  type EbookReadingDistribution,
  type EbookReadingFilters,
  type EbookReadingGroup,
  type EbookReadingGroupRow,
  type EbookReadingStudentRow,
  type EbookReadingSummaryData,
  type EbookReadingTimeline,
} from './types';

/** Items of each list in the workbook: the most the API ranks. */
const EXPORT_RANKING_SIZE = 20;

/** An empty cell of the workbook. */
const EMPTY_CELL = '-';

/** What the reading workbook holds. */
export interface EbookReadingExport {
  summary: EbookReadingSummaryData;
  timeline: EbookReadingTimeline;
  books: EbookRankings;
  themes: EbookRankings;
  subjects: EbookReadingBySubject;
  distribution: EbookReadingDistribution;
  /** The breakdown table; empty when the report lists the students */
  groups: EbookReadingGroupRow[];
  /** The students; empty unless the report lists them */
  students: EbookReadingStudentRow[];
}

/**
 * Seconds as whole minutes, for the spreadsheet.
 * @param {number} seconds - The time
 * @returns {number} The minutes
 */
const toMinutes = (seconds: number): number => Math.round(seconds / 60);

/**
 * Everything the reading workbook needs, within the filters: the summary,
 * the readings by period, the most and least read books and themes, the
 * curricular components, the students in each tier, and every row of the
 * breakdown table, or every student. The table's pages are asked one at a
 * time (`fetchEveryRow`).
 * @param {BaseApiClient} api - The app's API client
 * @param {EbookReadingFilters} filters - The report's filters
 * @param {EbookReadingGroup} groupBy - What the breakdown lists
 * @returns {Promise<EbookReadingExport>} The data
 */
export const fetchEbookReadingExport = async (
  api: BaseApiClient,
  filters: EbookReadingFilters,
  groupBy: EbookReadingGroup
): Promise<EbookReadingExport> => {
  /** The ranking of one dimension, by readers. */
  const ranking = (dimension: EbookRankingDimension) =>
    postReading<EbookRankings>(api, EBOOK_READING_ROUTE.RANKINGS, {
      ...filters,
      dimension,
      metric: EBOOK_RANKING_METRIC.READERS,
      limit: EXPORT_RANKING_SIZE,
    });
  const listsStudents = groupBy === EBOOK_READING_GROUP.STUDENT;

  const [
    summary,
    timeline,
    books,
    themes,
    subjects,
    distribution,
    groups,
    students,
  ] = await Promise.all([
    postReading<EbookReadingSummaryData>(
      api,
      EBOOK_READING_ROUTE.SUMMARY,
      filters
    ),
    postReading<EbookReadingTimeline>(
      api,
      EBOOK_READING_ROUTE.TIMELINE,
      filters
    ),
    ranking(EBOOK_RANKING_DIMENSION.EBOOK),
    ranking(EBOOK_RANKING_DIMENSION.CATEGORY),
    postReading<EbookReadingBySubject>(
      api,
      EBOOK_READING_ROUTE.BY_SUBJECT,
      filters
    ),
    postReading<EbookReadingDistribution>(
      api,
      EBOOK_READING_ROUTE.DISTRIBUTION,
      filters
    ),
    listsStudents
      ? Promise.resolve([])
      : fetchEveryRow<EbookReadingGroupRow>(api, GROUP_ROUTE[groupBy], filters),
    listsStudents
      ? fetchEveryRow<EbookReadingStudentRow>(
          api,
          EBOOK_READING_ROUTE.BY_STUDENT,
          filters
        )
      : Promise.resolve([]),
  ]);
  return {
    summary,
    timeline,
    books,
    themes,
    subjects,
    distribution,
    groups,
    students,
  };
};

/**
 * A ranking sheet: the most read, then the least read.
 * @param {string} name - Sheet name
 * @param {string} itemHeader - "Livro" or "Tema"
 * @param {EbookRankings} rankings - The lists
 * @returns {SheetConfig} The sheet
 */
const rankingSheet = (
  name: string,
  itemHeader: string,
  rankings: EbookRankings
): SheetConfig => {
  /** The rows of one list. */
  const rows = (list: string, items: EbookRankingItem[]) =>
    items.map((item, index) => [
      list,
      index + 1,
      item.name,
      item.readers,
      toMinutes(item.totalTimeSeconds),
    ]);
  return {
    name,
    headers: ['Lista', 'Posição', itemHeader, 'Leitores', 'Tempo total (min)'],
    rows: [
      ...rows('Mais lidos', rankings.mostRead),
      ...rows('Menos lidos', rankings.leastRead),
    ],
  };
};

/**
 * "Componentes curriculares": every book first, then each subject.
 * @param {EbookReadingBySubject} subjects - The counts
 * @returns {SheetConfig} The sheet
 */
const subjectsSheet = (subjects: EbookReadingBySubject): SheetConfig => ({
  name: 'Componentes curriculares',
  headers: [
    'Componente curricular',
    'Área do conhecimento',
    'Total de livros',
    'Lidos',
    'Abertos',
    'Não lidos',
    'Taxa de leitura (%)',
  ],
  rows: [
    { ...subjects.total, name: 'Todos', areaKnowledgeName: EMPTY_CELL },
    ...subjects.rows,
  ].map((row) => [
    row.name,
    row.areaKnowledgeName,
    row.books,
    row.read,
    row.opened,
    row.notRead,
    row.readRate,
  ]),
});

/**
 * "Faixas": the students in each reading tier, best first.
 * @param {EbookReadingDistribution} distribution - The students per tier
 * @returns {SheetConfig} The sheet
 */
const tiersSheet = (distribution: EbookReadingDistribution): SheetConfig => {
  const { totalStudents, tiers } = distribution;
  return {
    name: 'Faixas',
    headers: ['Faixa', 'Estudantes', '% dos estudantes'],
    rows: [
      ...Object.values(READING_TIER).map((tier) => [
        READING_TIER_LABEL[tier],
        tiers[tier],
        totalStudents > 0 ? Math.round((tiers[tier] / totalStudents) * 100) : 0,
      ]),
      ['Total', totalStudents, totalStudents > 0 ? 100 : 0],
    ],
  };
};

/**
 * The breakdown sheet: schools (with their municipality), school years or
 * classes (with their school year).
 * @param {EbookReadingGroupRow[]} groups - The rows
 * @param {EbookReadingGroup} groupBy - What they are
 * @returns {SheetConfig} The sheet
 */
const groupsSheet = (
  groups: EbookReadingGroupRow[],
  groupBy: EbookReadingGroup
): SheetConfig => {
  const label = GROUP_LABEL[groupBy];
  const isClass = groupBy === EBOOK_READING_GROUP.CLASS;
  const isSchool = groupBy === EBOOK_READING_GROUP.SCHOOL;
  return {
    name: label.many.charAt(0).toUpperCase() + label.many.slice(1),
    headers: [
      label.one,
      ...(isSchool ? ['Município'] : []),
      ...(isClass ? ['Série'] : []),
      'Estudantes',
      'Leitores',
      '% de leitura',
      'Leituras realizadas',
      'Tempo total (min)',
      'Progresso médio (%)',
      'Status',
    ],
    rows: groups.map((row) => [
      row.name,
      ...(isSchool ? [row.municipality ?? EMPTY_CELL] : []),
      ...(isClass ? [row.schoolYearName ?? EMPTY_CELL] : []),
      row.totalStudents,
      row.readers,
      row.readerRate,
      row.effectiveReadings,
      toMinutes(row.totalTimeSeconds),
      row.averageProgress,
      READING_TIER_LABEL[readingTier(row.readerRate)],
    ]),
  };
};

/**
 * "Estudantes": each student, with where they are enrolled. The tier follows
 * their average progress, as on the screen.
 * @param {EbookReadingStudentRow[]} students - The rows
 * @returns {SheetConfig} The sheet
 */
const studentsSheet = (students: EbookReadingStudentRow[]): SheetConfig => ({
  name: 'Estudantes',
  headers: [
    'Estudante',
    'Escola',
    'Ano',
    'Turma',
    'Livros lidos',
    'Livros abertos',
    'Acessos',
    'Tempo total (min)',
    'Progresso médio (%)',
    'Desempenho',
  ],
  rows: students.map((row) => [
    row.studentName,
    row.schoolName,
    row.schoolYearName ?? EMPTY_CELL,
    row.className ?? EMPTY_CELL,
    row.effectiveReadings,
    row.ebooksOpened,
    row.accesses,
    toMinutes(row.totalTimeSeconds),
    row.averageProgress,
    READING_TIER_LABEL[readingTier(row.averageProgress)],
  ]),
});

/**
 * The reading workbook: overview, readings by period, books, themes,
 * curricular components, tiers, and the breakdown table or the students.
 * The app adds its filters sheet.
 * @param {EbookReadingExport} data - What the workbook holds
 * @param {EbookReadingGroup} groupBy - What the breakdown lists
 * @returns {SheetConfig[]} The sheets
 */
export const buildEbookReadingSheets = (
  data: EbookReadingExport,
  groupBy: EbookReadingGroup
): SheetConfig[] => {
  const { summary } = data;
  const isNetwork = groupBy === EBOOK_READING_GROUP.SCHOOL;
  return [
    {
      name: 'Visão geral',
      headers: ['Métrica', 'Valor'],
      rows: [
        ['Leituras realizadas', summary.effectiveReadings],
        ...(isNetwork
          ? [
              ['Municípios', summary.municipalities],
              ['Escolas', summary.schools],
            ]
          : []),
        ['Total de estudantes', summary.totalStudents],
        ['Estudantes leitores', summary.readers],
        ['Estudantes leitores (%)', summary.readerRate],
        ['Acessos', summary.accesses],
        ['Tempo em leitura (min)', toMinutes(summary.totalTimeSeconds)],
        ['Tempo médio por leitor (min)', toMinutes(summary.averageTimeSeconds)],
        ['Progresso médio (%)', summary.averageProgress],
      ],
    },
    {
      name: 'Leituras por período',
      headers: ['Período', 'Leituras realizadas'],
      rows: data.timeline.periods.map((period) => [
        period.label,
        period.effectiveReadings,
      ]),
    },
    rankingSheet('Livros', 'Livro', data.books),
    rankingSheet('Temas', 'Tema', data.themes),
    subjectsSheet(data.subjects),
    tiersSheet(data.distribution),
    groupBy === EBOOK_READING_GROUP.STUDENT
      ? studentsSheet(data.students)
      : groupsSheet(data.groups, groupBy),
  ];
};
