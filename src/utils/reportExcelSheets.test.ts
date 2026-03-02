import type { PROFILE_ROLES } from '../types/chat';
import type { RegionData } from '../components/ChoroplethMap/ChoroplethMap.types';
import type { TimeChartData } from '../components/TimeChart/TimeChart';
import type {
  AccessUserRow,
  PerformanceStudentRow,
  PerformanceProfessionalRow,
  SheetConfig,
} from '../types/report';

const mockFormatHoursToTime = jest.fn((hours: number) => `${hours}h00`);

jest.mock('../components/TimeReport/TimeReport', () => ({
  formatHoursToTime: mockFormatHoursToTime,
}));

const mockPROFILE_ROLES = {
  STUDENT: 'STUDENT' as PROFILE_ROLES,
  TEACHER: 'TEACHER' as PROFILE_ROLES,
  UNIT_MANAGER: 'UNIT_MANAGER' as PROFILE_ROLES,
  REGIONAL_MANAGER: 'REGIONAL_MANAGER' as PROFILE_ROLES,
} as const;

jest.mock('../types/chat', () => ({
  PROFILE_ROLES: mockPROFILE_ROLES,
}));

import { buildAccessSheets, buildPerformanceSheets } from './reportExcelSheets';

/** Helper to build a TimeMetric-like object */
function makeTimeMetric(hours: number, variation: number | null) {
  return { hours, variation_percent: variation };
}

/** Helper to build a minimal TimeReportData */
function makeTimeReportData(options?: {
  examSimulation?: boolean;
  content?: boolean;
}) {
  return {
    total_platform_time: makeTimeMetric(10, 5),
    activity_time: makeTimeMetric(4, -2),
    ...(options?.examSimulation && {
      exam_simulation_time: makeTimeMetric(2, 1),
    }),
    ...(options?.content && {
      content_time: makeTimeMetric(3, 0),
    }),
    recommended_classes_time: makeTimeMetric(1, null),
  };
}

/** Helper to build a RegionData entry */
function makeRegion(
  name: string,
  code: string | null,
  accessCount: number,
  value: number
): RegionData {
  return {
    id: `region-${name}`,
    name,
    code,
    accessCount,
    value,
  } as unknown as RegionData;
}

/** Helper to build a TimeChartData object */
function makeTimeChartData(): TimeChartData {
  return {
    categories: [
      { key: 'activities', label: 'Atividades', colorClass: 'bg-success-700' },
      { key: 'content', label: 'Conteúdo', colorClass: 'bg-success-300' },
    ],
    hoursByPeriod: [
      { label: 'Seg', activities: 3, content: 2 },
      { label: 'Ter', activities: 0, content: 1 },
    ],
  } as unknown as TimeChartData;
}

/** Helper to build an AccessUserRow */
function makeAccessUser(overrides?: Partial<AccessUserRow>): AccessUserRow {
  return {
    userId: 'u1',
    name: 'Alice',
    schoolName: 'Escola A',
    totalTime: 100,
    totalTimeFormatted: '1h40',
    activitiesTime: 50,
    activitiesTimeFormatted: '0h50',
    contentTime: 30,
    contentTimeFormatted: '0h30',
    questionnairesTime: 10,
    questionnairesTimeFormatted: '0h10',
    simulationsTime: 10,
    simulationsTimeFormatted: '0h10',
    totalAccess: 5,
    lastAccess: '2024-01-01',
    ...overrides,
  };
}

/** Helper to build a PerformanceStudentRow */
function makeStudentRow(
  overrides?: Partial<PerformanceStudentRow>
): PerformanceStudentRow {
  return {
    studentId: 's1',
    studentName: 'Bob',
    schoolName: 'Escola B',
    className: 'Turma A',
    schoolYearName: '2024',
    totalAnswered: 100,
    correctAnswers: 80,
    incorrectAnswers: 20,
    correctPercentage: 80,
    performanceTag: 'Bom',
    ...overrides,
  };
}

/** Helper to build a PerformanceProfessionalRow */
function makeProfessionalRow(
  overrides?: Partial<PerformanceProfessionalRow>
): PerformanceProfessionalRow {
  return {
    userId: 'p1',
    userName: 'Carol',
    schoolName: 'Escola C',
    total: 50,
    activities: 30,
    recommendedLessons: 20,
    ...overrides,
  };
}

describe('reportExcelSheets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('buildAccessSheets', () => {
    describe('buildTimeSummarySheet', () => {
      it('should include exam simulation row for STUDENT when exam_simulation_time exists', () => {
        const data = makeTimeReportData({
          examSimulation: true,
          content: true,
        });
        const sheets = buildAccessSheets(
          data,
          [],
          null,
          [],
          mockPROFILE_ROLES.STUDENT,
          false
        );
        const summarySheet = sheets.find(
          (s) => s.name === 'Resumo de Tempo'
        ) as SheetConfig;

        expect(summarySheet).toBeDefined();
        expect(summarySheet.headers).toEqual([
          'Métrica',
          'Valor Formatado',
          'Horas',
          'Variação (%)',
        ]);
        const rowLabels = summarySheet.rows.map((r) => r[0]);
        expect(rowLabels).toContain('Tempo na Plataforma');
        expect(rowLabels).toContain('Tempo em Atividades');
        expect(rowLabels).toContain('Tempo em Simulados');
        expect(rowLabels).toContain('Tempo em Conteúdo');
        expect(rowLabels).toContain('Tempo em Questionários');
      });

      it('should NOT include exam simulation for STUDENT when exam_simulation_time is undefined', () => {
        const data = makeTimeReportData({ content: true });
        const sheets = buildAccessSheets(
          data,
          [],
          null,
          [],
          mockPROFILE_ROLES.STUDENT,
          false
        );
        const summarySheet = sheets.find(
          (s) => s.name === 'Resumo de Tempo'
        ) as SheetConfig;
        const rowLabels = summarySheet.rows.map((r) => r[0]);
        expect(rowLabels).not.toContain('Tempo em Simulados');
        expect(rowLabels).toContain('Tempo em Questionários');
      });

      it('should NOT include exam simulation for non-STUDENT even when exam_simulation_time exists', () => {
        const data = makeTimeReportData({
          examSimulation: true,
          content: true,
        });
        const sheets = buildAccessSheets(
          data,
          [],
          null,
          [],
          mockPROFILE_ROLES.TEACHER,
          false
        );
        const summarySheet = sheets.find(
          (s) => s.name === 'Resumo de Tempo'
        ) as SheetConfig;
        const rowLabels = summarySheet.rows.map((r) => r[0]);
        expect(rowLabels).not.toContain('Tempo em Simulados');
        expect(rowLabels).toContain('Tempo em Aulas Recomendadas');
      });

      it('should include content_time row when content_time exists', () => {
        const data = makeTimeReportData({ content: true });
        const sheets = buildAccessSheets(
          data,
          [],
          null,
          [],
          mockPROFILE_ROLES.TEACHER,
          false
        );
        const summarySheet = sheets.find(
          (s) => s.name === 'Resumo de Tempo'
        ) as SheetConfig;
        const rowLabels = summarySheet.rows.map((r) => r[0]);
        expect(rowLabels).toContain('Tempo em Conteúdo');
      });

      it('should NOT include content_time row when content_time is undefined', () => {
        const data = makeTimeReportData();
        const sheets = buildAccessSheets(
          data,
          [],
          null,
          [],
          mockPROFILE_ROLES.TEACHER,
          false
        );
        const summarySheet = sheets.find(
          (s) => s.name === 'Resumo de Tempo'
        ) as SheetConfig;
        const rowLabels = summarySheet.rows.map((r) => r[0]);
        expect(rowLabels).not.toContain('Tempo em Conteúdo');
      });

      it('should call formatHoursToTime for each metric', () => {
        const data = makeTimeReportData({
          examSimulation: true,
          content: true,
        });
        buildAccessSheets(data, [], null, [], mockPROFILE_ROLES.STUDENT, false);
        expect(mockFormatHoursToTime).toHaveBeenCalledWith(10);
        expect(mockFormatHoursToTime).toHaveBeenCalledWith(4);
        expect(mockFormatHoursToTime).toHaveBeenCalledWith(2);
        expect(mockFormatHoursToTime).toHaveBeenCalledWith(3);
        expect(mockFormatHoursToTime).toHaveBeenCalledWith(1);
      });

      it('should include variation_percent values in rows', () => {
        const data = makeTimeReportData();
        const sheets = buildAccessSheets(
          data,
          [],
          null,
          [],
          mockPROFILE_ROLES.STUDENT,
          false
        );
        const summarySheet = sheets.find(
          (s) => s.name === 'Resumo de Tempo'
        ) as SheetConfig;
        expect(summarySheet.rows[0][3]).toBe(5);
        expect(summarySheet.rows[1][3]).toBe(-2);
      });
    });

    describe('buildMapSheet', () => {
      it('should include map sheet when not unit manager and mapData has items', () => {
        const regions = [makeRegion('SP', 'SP', 100, 0.8)];
        const sheets = buildAccessSheets(
          null,
          regions,
          null,
          [],
          mockPROFILE_ROLES.REGIONAL_MANAGER,
          false
        );
        const mapSheet = sheets.find(
          (s) => s.name === 'Acesso por Região'
        ) as SheetConfig;
        expect(mapSheet).toBeDefined();
        expect(mapSheet.headers).toEqual([
          'Região',
          'Código',
          'Total de Acessos',
          'Valor',
        ]);
        expect(mapSheet.rows).toEqual([['SP', 'SP', 100, 0.8]]);
      });

      it('should handle region with null code', () => {
        const regions = [makeRegion('MG', null, 50, 0.5)];
        const sheets = buildAccessSheets(
          null,
          regions,
          null,
          [],
          mockPROFILE_ROLES.REGIONAL_MANAGER,
          false
        );
        const mapSheet = sheets.find(
          (s) => s.name === 'Acesso por Região'
        ) as SheetConfig;
        expect(mapSheet.rows[0][1]).toBeNull();
      });

      it('should handle region without code (falls back to null via ??)', () => {
        const regions = [
          { id: 'region-RJ', name: 'RJ', accessCount: 30, value: 0.3 },
        ] as unknown as RegionData[];
        const sheets = buildAccessSheets(
          null,
          regions,
          null,
          [],
          mockPROFILE_ROLES.REGIONAL_MANAGER,
          false
        );
        const mapSheet = sheets.find(
          (s) => s.name === 'Acesso por Região'
        ) as SheetConfig;
        expect(mapSheet.rows[0][1]).toBeNull();
      });

      it('should NOT include map sheet when isUnitManager is true', () => {
        const regions = [makeRegion('SP', 'SP', 100, 0.8)];
        const sheets = buildAccessSheets(
          null,
          regions,
          null,
          [],
          mockPROFILE_ROLES.UNIT_MANAGER,
          true
        );
        expect(
          sheets.find((s) => s.name === 'Acesso por Região')
        ).toBeUndefined();
      });

      it('should NOT include map sheet when mapData is empty', () => {
        const sheets = buildAccessSheets(
          null,
          [],
          null,
          [],
          mockPROFILE_ROLES.REGIONAL_MANAGER,
          false
        );
        expect(
          sheets.find((s) => s.name === 'Acesso por Região')
        ).toBeUndefined();
      });
    });

    describe('buildTimeDistributionSheet', () => {
      it('should build time distribution sheet with correct headers and rows', () => {
        const chartData = makeTimeChartData();
        const sheets = buildAccessSheets(
          null,
          [],
          chartData,
          [],
          mockPROFILE_ROLES.STUDENT,
          false
        );
        const chartSheet = sheets.find(
          (s) => s.name === 'Distribuição de Tempo'
        ) as SheetConfig;
        expect(chartSheet).toBeDefined();
        expect(chartSheet.headers).toEqual([
          'Período',
          'Atividades',
          'Conteúdo',
        ]);
        expect(chartSheet.rows).toEqual([
          ['Seg', 3, 2],
          ['Ter', 0, 1],
        ]);
      });

      it('should default to 0 when category key value is falsy', () => {
        const chartData = {
          categories: [
            {
              key: 'activities',
              label: 'Atividades',
              colorClass: 'bg-success-700',
            },
          ],
          hoursByPeriod: [{ label: 'Qua', activities: 0 }],
        } as unknown as TimeChartData;
        const sheets = buildAccessSheets(
          null,
          [],
          chartData,
          [],
          mockPROFILE_ROLES.STUDENT,
          false
        );
        const chartSheet = sheets.find(
          (s) => s.name === 'Distribuição de Tempo'
        ) as SheetConfig;
        expect(chartSheet.rows[0]).toEqual(['Qua', 0]);
      });

      it('should NOT include chart sheet when chartData is null', () => {
        const sheets = buildAccessSheets(
          null,
          [],
          null,
          [],
          mockPROFILE_ROLES.STUDENT,
          false
        );
        expect(
          sheets.find((s) => s.name === 'Distribuição de Tempo')
        ).toBeUndefined();
      });
    });

    describe('buildAccessUsersSheet', () => {
      it('should build 9-column student user sheet with correct data', () => {
        const user = makeAccessUser();
        const sheets = buildAccessSheets(
          null,
          [],
          null,
          [user],
          mockPROFILE_ROLES.STUDENT,
          false
        );
        const usersSheet = sheets.find(
          (s) => s.name === 'Usuários'
        ) as SheetConfig;
        expect(usersSheet.headers).toEqual([
          'Nome',
          'Escola',
          'Tempo Total',
          'Atividades',
          'Conteúdo',
          'Questionários',
          'Simulados',
          'Total Acessos',
          'Último Acesso',
        ]);
        expect(usersSheet.rows[0]).toEqual([
          'Alice',
          'Escola A',
          '1h40',
          '0h50',
          '0h30',
          '0h10',
          '0h10',
          5,
          '2024-01-01',
        ]);
      });

      it('should build 7-column non-student user sheet', () => {
        const user = makeAccessUser();
        const sheets = buildAccessSheets(
          null,
          [],
          null,
          [user],
          mockPROFILE_ROLES.TEACHER,
          false
        );
        const usersSheet = sheets.find(
          (s) => s.name === 'Usuários'
        ) as SheetConfig;
        expect(usersSheet.headers).toEqual([
          'Nome',
          'Escola',
          'Tempo Total',
          'Atividades',
          'Conteúdo',
          'Total Acessos',
          'Último Acesso',
        ]);
        expect(usersSheet.rows[0]).toEqual([
          'Alice',
          'Escola A',
          '1h40',
          '0h50',
          '0h30',
          5,
          '2024-01-01',
        ]);
      });

      it('should show "-" when lastAccess is null for STUDENT', () => {
        const user = makeAccessUser({ lastAccess: null });
        const sheets = buildAccessSheets(
          null,
          [],
          null,
          [user],
          mockPROFILE_ROLES.STUDENT,
          false
        );
        const usersSheet = sheets.find(
          (s) => s.name === 'Usuários'
        ) as SheetConfig;
        expect(usersSheet.rows[0][8]).toBe('-');
      });

      it('should show "-" when lastAccess is null for non-STUDENT', () => {
        const user = makeAccessUser({ lastAccess: null });
        const sheets = buildAccessSheets(
          null,
          [],
          null,
          [user],
          mockPROFILE_ROLES.TEACHER,
          false
        );
        const usersSheet = sheets.find(
          (s) => s.name === 'Usuários'
        ) as SheetConfig;
        expect(usersSheet.rows[0][6]).toBe('-');
      });

      it('should always include users sheet even with empty users array', () => {
        const sheets = buildAccessSheets(
          null,
          [],
          null,
          [],
          mockPROFILE_ROLES.STUDENT,
          false
        );
        const usersSheet = sheets.find((s) => s.name === 'Usuários');
        expect(usersSheet).toBeDefined();
        expect(usersSheet?.rows).toEqual([]);
      });
    });

    describe('sheet ordering and conditional inclusion', () => {
      it('should include all sheets when all data is provided and not unit manager', () => {
        const data = makeTimeReportData({ content: true });
        const regions = [makeRegion('SP', 'SP', 100, 0.8)];
        const chartData = makeTimeChartData();
        const user = makeAccessUser();
        const sheets = buildAccessSheets(
          data,
          regions,
          chartData,
          [user],
          mockPROFILE_ROLES.STUDENT,
          false
        );
        expect(sheets).toHaveLength(4);
        expect(sheets[0].name).toBe('Resumo de Tempo');
        expect(sheets[1].name).toBe('Acesso por Região');
        expect(sheets[2].name).toBe('Distribuição de Tempo');
        expect(sheets[3].name).toBe('Usuários');
      });

      it('should skip summary when summaryData is null', () => {
        const sheets = buildAccessSheets(
          null,
          [],
          null,
          [],
          mockPROFILE_ROLES.STUDENT,
          false
        );
        expect(sheets).toHaveLength(1);
        expect(sheets[0].name).toBe('Usuários');
      });

      it('should skip map sheet when isUnitManager even with mapData', () => {
        const data = makeTimeReportData();
        const regions = [makeRegion('SP', 'SP', 100, 0.8)];
        const chartData = makeTimeChartData();
        const sheets = buildAccessSheets(
          data,
          regions,
          chartData,
          [],
          mockPROFILE_ROLES.UNIT_MANAGER,
          true
        );
        expect(sheets.map((s) => s.name)).not.toContain('Acesso por Região');
      });
    });
  });

  describe('buildPerformanceSheets', () => {
    describe('buildPerformanceSummarySheet', () => {
      it('should build student summary with cities, schools, classes, students, teachers', () => {
        const summaryData = {
          cities: 5,
          schools: 10,
          classes: 20,
          students: 200,
          teachers: 30,
        };
        const sheets = buildPerformanceSheets(
          summaryData,
          null,
          null,
          [],
          mockPROFILE_ROLES.STUDENT
        );
        const summarySheet = sheets.find(
          (s) => s.name === 'Resumo'
        ) as SheetConfig;
        expect(summarySheet).toBeDefined();
        expect(summarySheet.headers).toEqual(['Métrica', 'Valor']);
        expect(summarySheet.rows).toEqual([
          ['Cidades', 5],
          ['Escolas', 10],
          ['Turmas', 20],
          ['Estudantes', 200],
          ['Professores', 30],
        ]);
      });

      it('should build non-student summary with activities and recommendedLessons', () => {
        const summaryData = { activities: 15, recommendedLessons: 8 };
        const sheets = buildPerformanceSheets(
          summaryData,
          null,
          null,
          [],
          mockPROFILE_ROLES.TEACHER
        );
        const summarySheet = sheets.find(
          (s) => s.name === 'Resumo'
        ) as SheetConfig;
        expect(summarySheet).toBeDefined();
        expect(summarySheet.rows).toEqual([
          ['Atividades', 15],
          ['Aulas Recomendadas', 8],
        ]);
      });

      it('should NOT include summary sheet when summaryData is null', () => {
        const sheets = buildPerformanceSheets(
          null,
          null,
          null,
          [],
          mockPROFILE_ROLES.STUDENT
        );
        expect(sheets.find((s) => s.name === 'Resumo')).toBeUndefined();
      });
    });

    describe('buildRankingSheet', () => {
      it('should build ranking sheet with highlighted and needsAttention items', () => {
        const rankingData = {
          groupedBy: 'state' as const,
          highlighted: [
            {
              position: 1,
              name: 'Top School',
              count: 100,
              percentage: 95,
              trend: 'up' as const,
            },
          ],
          needsAttention: [
            {
              position: 5,
              name: 'Low School',
              count: 10,
              percentage: 20,
              trend: 'down' as const,
            },
          ],
        };
        const sheets = buildPerformanceSheets(
          null,
          null,
          rankingData,
          [],
          mockPROFILE_ROLES.STUDENT
        );
        const rankingSheet = sheets.find(
          (s) => s.name === 'Ranking'
        ) as SheetConfig;
        expect(rankingSheet).toBeDefined();
        expect(rankingSheet.headers).toEqual([
          'Categoria',
          'Posição',
          'Nome',
          'Quantidade',
          '%',
          'Tendência',
        ]);
        expect(rankingSheet.rows).toEqual([
          ['Destaque', 1, 'Top School', 100, 95, 'up'],
          ['Atenção', 5, 'Low School', 10, 20, 'down'],
        ]);
      });

      it('should use "-" when trend is null', () => {
        const rankingData = {
          groupedBy: 'municipality' as const,
          highlighted: [
            {
              position: 1,
              name: 'Neutral',
              count: 50,
              percentage: 50,
              trend: null,
            },
          ],
          needsAttention: [
            {
              position: 3,
              name: 'No Trend',
              count: 20,
              percentage: 30,
              trend: null,
            },
          ],
        };
        const sheets = buildPerformanceSheets(
          null,
          null,
          rankingData,
          [],
          mockPROFILE_ROLES.STUDENT
        );
        const rankingSheet = sheets.find(
          (s) => s.name === 'Ranking'
        ) as SheetConfig;
        expect(rankingSheet.rows[0][5]).toBe('-');
        expect(rankingSheet.rows[1][5]).toBe('-');
      });

      it('should skip null items in highlighted array', () => {
        const rankingData = {
          groupedBy: 'class' as const,
          highlighted: [
            null,
            {
              position: 2,
              name: 'Valid',
              count: 40,
              percentage: 60,
              trend: 'up' as const,
            },
          ],
          needsAttention: [],
        };
        const sheets = buildPerformanceSheets(
          null,
          null,
          rankingData,
          [],
          mockPROFILE_ROLES.STUDENT
        );
        const rankingSheet = sheets.find(
          (s) => s.name === 'Ranking'
        ) as SheetConfig;
        expect(rankingSheet.rows).toHaveLength(1);
        expect(rankingSheet.rows[0][2]).toBe('Valid');
      });

      it('should skip null items in needsAttention array', () => {
        const rankingData = {
          groupedBy: 'state' as const,
          highlighted: [],
          needsAttention: [
            null,
            {
              position: 4,
              name: 'AttentionItem',
              count: 15,
              percentage: 25,
              trend: 'down' as const,
            },
            null,
          ],
        };
        const sheets = buildPerformanceSheets(
          null,
          null,
          rankingData,
          [],
          mockPROFILE_ROLES.STUDENT
        );
        const rankingSheet = sheets.find(
          (s) => s.name === 'Ranking'
        ) as SheetConfig;
        expect(rankingSheet.rows).toHaveLength(1);
        expect(rankingSheet.rows[0][2]).toBe('AttentionItem');
      });

      it('should produce empty rows when both arrays only have nulls', () => {
        const rankingData = {
          groupedBy: 'state' as const,
          highlighted: [null, null],
          needsAttention: [null],
        };
        const sheets = buildPerformanceSheets(
          null,
          null,
          rankingData,
          [],
          mockPROFILE_ROLES.STUDENT
        );
        const rankingSheet = sheets.find(
          (s) => s.name === 'Ranking'
        ) as SheetConfig;
        expect(rankingSheet.rows).toHaveLength(0);
      });

      it('should NOT include ranking sheet when rankingData is null', () => {
        const sheets = buildPerformanceSheets(
          null,
          null,
          null,
          [],
          mockPROFILE_ROLES.STUDENT
        );
        expect(sheets.find((s) => s.name === 'Ranking')).toBeUndefined();
      });
    });

    describe('buildQuestionsSheet', () => {
      it('should build student questions sheet with total, correct, incorrect, blank', () => {
        const questionsData = {
          total: 100,
          correct: 70,
          incorrect: 20,
          blank: 10,
        };
        const sheets = buildPerformanceSheets(
          null,
          questionsData,
          null,
          [],
          mockPROFILE_ROLES.STUDENT
        );
        const questionsSheet = sheets.find(
          (s) => s.name === 'Questões'
        ) as SheetConfig;
        expect(questionsSheet).toBeDefined();
        expect(questionsSheet.headers).toEqual(['Métrica', 'Valor']);
        expect(questionsSheet.rows).toEqual([
          ['Total', 100],
          ['Corretas', 70],
          ['Incorretas', 20],
          ['Em Branco', 10],
        ]);
      });

      it('should build non-student content sheet', () => {
        const contentData = {
          total: 50,
          totalActivities: 30,
          totalRecommendedLessons: 20,
        };
        const sheets = buildPerformanceSheets(
          null,
          contentData,
          null,
          [],
          mockPROFILE_ROLES.TEACHER
        );
        const contentSheet = sheets.find(
          (s) => s.name === 'Conteúdo'
        ) as SheetConfig;
        expect(contentSheet).toBeDefined();
        expect(contentSheet.rows).toEqual([
          ['Total', 50],
          ['Atividades', 30],
          ['Aulas Recomendadas', 20],
        ]);
      });

      it('should NOT include questions sheet when questionsData is null', () => {
        const sheets = buildPerformanceSheets(
          null,
          null,
          null,
          [],
          mockPROFILE_ROLES.STUDENT
        );
        expect(sheets.find((s) => s.name === 'Questões')).toBeUndefined();
        expect(sheets.find((s) => s.name === 'Conteúdo')).toBeUndefined();
      });
    });

    describe('buildPerformanceUsersSheet', () => {
      it('should build 8-column student users sheet', () => {
        const student = makeStudentRow();
        const sheets = buildPerformanceSheets(
          null,
          null,
          null,
          [student],
          mockPROFILE_ROLES.STUDENT
        );
        const usersSheet = sheets.find(
          (s) => s.name === 'Usuários'
        ) as SheetConfig;
        expect(usersSheet.headers).toEqual([
          'Nome',
          'Ano',
          'Turma',
          'Respondidas',
          'Corretas',
          'Incorretas',
          'Desempenho (%)',
          'Tag',
        ]);
        expect(usersSheet.rows[0]).toEqual([
          'Bob',
          '2024',
          'Turma A',
          100,
          80,
          20,
          80,
          'Bom',
        ]);
      });

      it('should build 5-column professional users sheet', () => {
        const professional = makeProfessionalRow();
        const sheets = buildPerformanceSheets(
          null,
          null,
          null,
          [professional],
          mockPROFILE_ROLES.TEACHER
        );
        const usersSheet = sheets.find(
          (s) => s.name === 'Usuários'
        ) as SheetConfig;
        expect(usersSheet.headers).toEqual([
          'Nome',
          'Escola',
          'Total',
          'Atividades',
          'Aulas Recomendadas',
        ]);
        expect(usersSheet.rows[0]).toEqual(['Carol', 'Escola C', 50, 30, 20]);
      });

      it('should always include users sheet even with empty array', () => {
        const sheets = buildPerformanceSheets(
          null,
          null,
          null,
          [],
          mockPROFILE_ROLES.STUDENT
        );
        const usersSheet = sheets.find((s) => s.name === 'Usuários');
        expect(usersSheet).toBeDefined();
        expect(usersSheet?.rows).toEqual([]);
      });

      it('should handle multiple student rows', () => {
        const students = [
          makeStudentRow({ studentName: 'Alice', correctPercentage: 90 }),
          makeStudentRow({ studentName: 'Bob', correctPercentage: 70 }),
        ];
        const sheets = buildPerformanceSheets(
          null,
          null,
          null,
          students,
          mockPROFILE_ROLES.STUDENT
        );
        const usersSheet = sheets.find(
          (s) => s.name === 'Usuários'
        ) as SheetConfig;
        expect(usersSheet.rows).toHaveLength(2);
        expect(usersSheet.rows[0][0]).toBe('Alice');
        expect(usersSheet.rows[1][0]).toBe('Bob');
      });

      it('should handle multiple professional rows', () => {
        const professionals = [
          makeProfessionalRow({ userName: 'Dan', total: 100 }),
          makeProfessionalRow({ userName: 'Eve', total: 200 }),
        ];
        const sheets = buildPerformanceSheets(
          null,
          null,
          null,
          professionals,
          mockPROFILE_ROLES.TEACHER
        );
        const usersSheet = sheets.find(
          (s) => s.name === 'Usuários'
        ) as SheetConfig;
        expect(usersSheet.rows).toHaveLength(2);
        expect(usersSheet.rows[0][0]).toBe('Dan');
        expect(usersSheet.rows[1][0]).toBe('Eve');
      });
    });

    describe('sheet ordering and conditional inclusion', () => {
      it('should include all sheets when all data is provided', () => {
        const summaryData = {
          cities: 1,
          schools: 2,
          classes: 3,
          students: 4,
          teachers: 5,
        };
        const questionsData = {
          total: 10,
          correct: 7,
          incorrect: 2,
          blank: 1,
        };
        const rankingData = {
          groupedBy: 'state' as const,
          highlighted: [
            {
              position: 1,
              name: 'A',
              count: 10,
              percentage: 90,
              trend: 'up' as const,
            },
          ],
          needsAttention: [],
        };
        const sheets = buildPerformanceSheets(
          summaryData,
          questionsData,
          rankingData,
          [makeStudentRow()],
          mockPROFILE_ROLES.STUDENT
        );
        expect(sheets).toHaveLength(4);
        expect(sheets[0].name).toBe('Resumo');
        expect(sheets[1].name).toBe('Ranking');
        expect(sheets[2].name).toBe('Questões');
        expect(sheets[3].name).toBe('Usuários');
      });

      it('should only include users sheet when all optional data is null', () => {
        const sheets = buildPerformanceSheets(
          null,
          null,
          null,
          [],
          mockPROFILE_ROLES.STUDENT
        );
        expect(sheets).toHaveLength(1);
        expect(sheets[0].name).toBe('Usuários');
      });

      it('should include content sheet name for non-student questions data', () => {
        const contentData = {
          total: 20,
          totalActivities: 12,
          totalRecommendedLessons: 8,
        };
        const sheets = buildPerformanceSheets(
          null,
          contentData,
          null,
          [makeProfessionalRow()],
          mockPROFILE_ROLES.TEACHER
        );
        expect(sheets).toHaveLength(2);
        expect(sheets[0].name).toBe('Conteúdo');
        expect(sheets[1].name).toBe('Usuários');
      });
    });
  });
});
