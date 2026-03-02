import { PROFILE_ROLES } from '../types/chat';
import { formatHoursToTime } from '../components/TimeReport/TimeReport';
import type { TimeReportData } from '../components/TimeReport/TimeReport';
import type { TimeChartData } from '../components/TimeChart/TimeChart';
import type { RegionData } from '../components/ChoroplethMap/ChoroplethMap.types';
import type {
  PerformanceStudentData,
  PerformanceDefaultData,
} from '../components/PerformanceReport/PerformanceReport';
import type { PerformanceRankingData } from '../components/PerformanceRanking/PerformanceRanking';
import type {
  QuestionsVariantData,
  ContentVariantData,
} from '../components/PerformanceQuestionsData/PerformanceQuestionsData';
import type {
  AccessUserRow,
  PerformanceStudentRow,
  PerformanceProfessionalRow,
  ExcelCell,
  SheetConfig,
} from '../types/report';

/**
 * Build the time summary sheet from access report data.
 */
function buildTimeSummarySheet(
  data: TimeReportData,
  profileTab: PROFILE_ROLES
): SheetConfig {
  const isStudent = profileTab === PROFILE_ROLES.STUDENT;
  const rows: ExcelCell[][] = [
    [
      'Tempo na Plataforma',
      formatHoursToTime(data.total_platform_time.hours),
      data.total_platform_time.hours,
      data.total_platform_time.variation_percent,
    ],
    [
      'Tempo em Atividades',
      formatHoursToTime(data.activity_time.hours),
      data.activity_time.hours,
      data.activity_time.variation_percent,
    ],
  ];

  if (isStudent && data.exam_simulation_time) {
    rows.push([
      'Tempo em Simulados',
      formatHoursToTime(data.exam_simulation_time.hours),
      data.exam_simulation_time.hours,
      data.exam_simulation_time.variation_percent,
    ]);
  }

  if (data.content_time) {
    rows.push([
      'Tempo em Conteúdo',
      formatHoursToTime(data.content_time.hours),
      data.content_time.hours,
      data.content_time.variation_percent,
    ]);
  }

  rows.push([
    isStudent ? 'Tempo em Questionários' : 'Tempo em Aulas Recomendadas',
    formatHoursToTime(data.recommended_classes_time.hours),
    data.recommended_classes_time.hours,
    data.recommended_classes_time.variation_percent,
  ]);

  return {
    name: 'Resumo de Tempo',
    headers: ['Métrica', 'Valor Formatado', 'Horas', 'Variação (%)'],
    rows,
  };
}

/**
 * Build the regional access sheet from map data.
 */
function buildMapSheet(mapData: RegionData[]): SheetConfig {
  const rows: ExcelCell[][] = mapData.map((region) => [
    region.name,
    region.code ?? null,
    region.accessCount,
    region.value,
  ]);

  return {
    name: 'Acesso por Região',
    headers: ['Região', 'Código', 'Total de Acessos', 'Valor'],
    rows,
  };
}

/**
 * Build the time distribution sheet from chart data.
 */
function buildTimeDistributionSheet(data: TimeChartData): SheetConfig {
  const { categories, hoursByPeriod } = data;
  const categoryLabels = categories.map(
    (c: (typeof categories)[number]) => c.label
  );
  const rows: ExcelCell[][] = hoursByPeriod.map(
    (day: (typeof hoursByPeriod)[number]) => [
      day.label,
      ...categories.map(
        (cat: (typeof categories)[number]) => Number(day[cat.key]) || 0
      ),
    ]
  );

  return {
    name: 'Distribuição de Tempo',
    headers: ['Período', ...categoryLabels],
    rows,
  };
}

/**
 * Build the access users table sheet.
 */
function buildAccessUsersSheet(
  users: AccessUserRow[],
  profileTab: PROFILE_ROLES
): SheetConfig {
  const isStudent = profileTab === PROFILE_ROLES.STUDENT;

  const headers = isStudent
    ? [
        'Nome',
        'Escola',
        'Tempo Total',
        'Atividades',
        'Conteúdo',
        'Questionários',
        'Simulados',
        'Total Acessos',
        'Último Acesso',
      ]
    : [
        'Nome',
        'Escola',
        'Tempo Total',
        'Atividades',
        'Conteúdo',
        'Total Acessos',
        'Último Acesso',
      ];

  const rows: ExcelCell[][] = users.map((user) =>
    isStudent
      ? [
          user.name,
          user.schoolName,
          user.totalTimeFormatted,
          user.activitiesTimeFormatted,
          user.contentTimeFormatted,
          user.questionnairesTimeFormatted,
          user.simulationsTimeFormatted,
          user.totalAccess,
          user.lastAccess ?? '-',
        ]
      : [
          user.name,
          user.schoolName,
          user.totalTimeFormatted,
          user.activitiesTimeFormatted,
          user.contentTimeFormatted,
          user.totalAccess,
          user.lastAccess ?? '-',
        ]
  );

  return { name: 'Usuários', headers, rows };
}

/**
 * Build all sheets for the access report.
 *
 * @param summaryData - Time summary metrics
 * @param mapData - Regional access map data
 * @param chartData - Time distribution chart data
 * @param users - All users (unpaginated)
 * @param profileTab - Current profile tab
 * @param isUnitManager - Whether the user is a unit manager (hides map sheet)
 */
export function buildAccessSheets(
  summaryData: TimeReportData | null,
  mapData: RegionData[],
  chartData: TimeChartData | null,
  users: AccessUserRow[],
  profileTab: PROFILE_ROLES,
  isUnitManager: boolean
): SheetConfig[] {
  const sheets: SheetConfig[] = [];

  if (summaryData) {
    sheets.push(buildTimeSummarySheet(summaryData, profileTab));
  }

  if (!isUnitManager && mapData.length > 0) {
    sheets.push(buildMapSheet(mapData));
  }

  if (chartData) {
    sheets.push(buildTimeDistributionSheet(chartData));
  }

  sheets.push(buildAccessUsersSheet(users, profileTab));

  return sheets;
}

/**
 * Build the performance summary sheet.
 */
function buildPerformanceSummarySheet(
  data: PerformanceStudentData | PerformanceDefaultData,
  profileTab: PROFILE_ROLES
): SheetConfig {
  const isStudent = profileTab === PROFILE_ROLES.STUDENT;
  const rows: ExcelCell[][] = [];

  if (isStudent) {
    const studentData = data as PerformanceStudentData;
    rows.push(
      ['Cidades', studentData.cities],
      ['Escolas', studentData.schools],
      ['Turmas', studentData.classes],
      ['Estudantes', studentData.students],
      ['Professores', studentData.teachers]
    );
  } else {
    const defaultData = data as PerformanceDefaultData;
    rows.push(
      ['Atividades', defaultData.activities],
      ['Aulas Recomendadas', defaultData.recommendedLessons]
    );
  }

  return {
    name: 'Resumo',
    headers: ['Métrica', 'Valor'],
    rows,
  };
}

/**
 * Build the ranking sheet from performance ranking data.
 */
function buildRankingSheet(data: PerformanceRankingData): SheetConfig {
  const rows: ExcelCell[][] = [];

  for (const item of data.highlighted) {
    if (item) {
      rows.push([
        'Destaque',
        item.position,
        item.name,
        item.count,
        item.percentage,
        item.trend ?? '-',
      ]);
    }
  }

  for (const item of data.needsAttention) {
    if (item) {
      rows.push([
        'Atenção',
        item.position,
        item.name,
        item.count,
        item.percentage,
        item.trend ?? '-',
      ]);
    }
  }

  return {
    name: 'Ranking',
    headers: ['Categoria', 'Posição', 'Nome', 'Quantidade', '%', 'Tendência'],
    rows,
  };
}

/**
 * Build the questions/content sheet.
 */
function buildQuestionsSheet(
  data: QuestionsVariantData | ContentVariantData,
  profileTab: PROFILE_ROLES
): SheetConfig {
  const isStudent = profileTab === PROFILE_ROLES.STUDENT;

  if (isStudent) {
    const qData = data as QuestionsVariantData;
    return {
      name: 'Questões',
      headers: ['Métrica', 'Valor'],
      rows: [
        ['Total', qData.total],
        ['Corretas', qData.correct],
        ['Incorretas', qData.incorrect],
        ['Em Branco', qData.blank],
      ],
    };
  }

  const cData = data as ContentVariantData;
  return {
    name: 'Conteúdo',
    headers: ['Métrica', 'Valor'],
    rows: [
      ['Total', cData.total],
      ['Atividades', cData.totalActivities],
      ['Aulas Recomendadas', cData.totalRecommendedLessons],
    ],
  };
}

/**
 * Build the performance users table sheet.
 */
function buildPerformanceUsersSheet(
  users: (PerformanceStudentRow | PerformanceProfessionalRow)[],
  profileTab: PROFILE_ROLES
): SheetConfig {
  const isStudent = profileTab === PROFILE_ROLES.STUDENT;

  if (isStudent) {
    return {
      name: 'Usuários',
      headers: [
        'Nome',
        'Ano',
        'Turma',
        'Respondidas',
        'Corretas',
        'Incorretas',
        'Desempenho (%)',
        'Tag',
      ],
      rows: (users as PerformanceStudentRow[]).map((u) => [
        u.studentName,
        u.schoolYearName,
        u.className,
        u.totalAnswered,
        u.correctAnswers,
        u.incorrectAnswers,
        u.correctPercentage,
        u.performanceTag,
      ]),
    };
  }

  return {
    name: 'Usuários',
    headers: ['Nome', 'Escola', 'Total', 'Atividades', 'Aulas Recomendadas'],
    rows: (users as PerformanceProfessionalRow[]).map((u) => [
      u.userName,
      u.schoolName,
      u.total,
      u.activities,
      u.recommendedLessons,
    ]),
  };
}

/**
 * Build all sheets for the performance report.
 *
 * @param summaryData - Performance summary metrics
 * @param questionsData - Questions or content chart data
 * @param rankingData - Performance ranking data
 * @param users - All users (unpaginated)
 * @param profileTab - Current profile tab
 */
export function buildPerformanceSheets(
  summaryData: PerformanceStudentData | PerformanceDefaultData | null,
  questionsData: QuestionsVariantData | ContentVariantData | null,
  rankingData: PerformanceRankingData | null,
  users: (PerformanceStudentRow | PerformanceProfessionalRow)[],
  profileTab: PROFILE_ROLES
): SheetConfig[] {
  const sheets: SheetConfig[] = [];

  if (summaryData) {
    sheets.push(buildPerformanceSummarySheet(summaryData, profileTab));
  }

  if (rankingData) {
    sheets.push(buildRankingSheet(rankingData));
  }

  if (questionsData) {
    sheets.push(buildQuestionsSheet(questionsData, profileTab));
  }

  sheets.push(buildPerformanceUsersSheet(users, profileTab));

  return sheets;
}
