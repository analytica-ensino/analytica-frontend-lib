import type { BaseApiClient } from '../../types/api';
import type { SheetConfig } from '../../utils/exportExcel';
import {
  EBOOK_READING_ROUTE,
  GROUP_LABEL,
  GROUP_ROUTE,
  READING_TIER_LABEL,
  readingTier,
} from './readingReport';
import {
  EBOOK_RANKING_DIMENSION,
  EBOOK_RANKING_METRIC,
  EBOOK_READING_GROUP,
  type EbookRankingDimension,
  type EbookRankingItem,
  type EbookRankings,
  type EbookReadingFilters,
  type EbookReadingGroup,
  type EbookReadingGroupRow,
  type EbookReadingMetrics,
  type EbookReadingPage,
  type EbookReadingResponse,
} from './types';

/** Items of each list in the workbook: the most the API ranks. */
const EXPORT_RANKING_SIZE = 20;

/** Rows of each page the export asks for: the most the API takes. */
export const EXPORT_PAGE_SIZE = 100;

/** What the reading workbook holds. */
export interface EbookReadingExport {
  summary: EbookReadingMetrics;
  books: EbookRankings;
  themes: EbookRankings;
  groups: EbookReadingGroupRow[];
}

/**
 * Seconds as whole minutes, for the spreadsheet.
 * @param {number} seconds - The time
 * @returns {number} The minutes
 */
const toMinutes = (seconds: number): number => Math.round(seconds / 60);

/**
 * Everything the reading workbook needs, within the filters: the summary,
 * the most and least read books and themes, and every row of the breakdown
 * table (all pages).
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
  /** Posts to a report route and unwraps the answer. */
  const post = async <T>(route: string, body: object): Promise<T> =>
    (await api.post<EbookReadingResponse<T>>(route, body)).data.data;
  /** The ranking of one dimension, by readers. */
  const ranking = (dimension: EbookRankingDimension) =>
    post<EbookRankings>(EBOOK_READING_ROUTE.RANKINGS, {
      ...filters,
      dimension,
      metric: EBOOK_RANKING_METRIC.READERS,
      limit: EXPORT_RANKING_SIZE,
    });

  /**
   * Every row of the breakdown table, one page at a time: the API builds the
   * whole table for each page, so pages asked together would build it that
   * many times at once.
   */
  const allGroups = async (): Promise<EbookReadingGroupRow[]> => {
    const rows: EbookReadingGroupRow[] = [];
    for (let page = 1; ; page += 1) {
      const result = await post<EbookReadingPage<EbookReadingGroupRow>>(
        GROUP_ROUTE[groupBy],
        { ...filters, page, limit: EXPORT_PAGE_SIZE }
      );
      rows.push(...result.rows);
      // A page count that is not a number stops too, instead of looping
      const { totalPages } = result.pagination;
      if (!Number.isFinite(totalPages) || page >= totalPages) return rows;
    }
  };

  const [summary, books, themes, groups] = await Promise.all([
    post<EbookReadingMetrics>(EBOOK_READING_ROUTE.SUMMARY, filters),
    ranking(EBOOK_RANKING_DIMENSION.EBOOK),
    ranking(EBOOK_RANKING_DIMENSION.CATEGORY),
    allGroups(),
  ]);
  return { summary, books, themes, groups };
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
 * The reading workbook: overview, books, themes and the breakdown table.
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
  const label = GROUP_LABEL[groupBy];
  const isClass = groupBy === EBOOK_READING_GROUP.CLASS;
  return [
    {
      name: 'Visão geral',
      headers: ['Métrica', 'Valor'],
      rows: [
        ['Leituras realizadas', summary.effectiveReadings],
        ['Total de estudantes', summary.totalStudents],
        ['Estudantes leitores', summary.readers],
        ['Estudantes leitores (%)', summary.readerRate],
        ['Acessos', summary.accesses],
        ['Tempo em leitura (min)', toMinutes(summary.totalTimeSeconds)],
        ['Tempo médio por leitor (min)', toMinutes(summary.averageTimeSeconds)],
        ['Progresso médio (%)', summary.averageProgress],
      ],
    },
    rankingSheet('Livros', 'Livro', data.books),
    rankingSheet('Temas', 'Tema', data.themes),
    {
      name: label.many.charAt(0).toUpperCase() + label.many.slice(1),
      headers: [
        label.one,
        ...(isClass ? ['Série'] : []),
        'Estudantes',
        'Leitores',
        '% de leitura',
        'Leituras realizadas',
        'Tempo total (min)',
        'Progresso médio (%)',
        'Status',
      ],
      rows: data.groups.map((row) => [
        row.name,
        ...(isClass ? [row.schoolYearName ?? '-'] : []),
        row.totalStudents,
        row.readers,
        row.readerRate,
        row.effectiveReadings,
        toMinutes(row.totalTimeSeconds),
        row.averageProgress,
        READING_TIER_LABEL[readingTier(row.readerRate)],
      ]),
    },
  ];
};
