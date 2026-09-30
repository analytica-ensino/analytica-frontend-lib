import * as entry from './index';
import { StudentsTableSection } from './StudentsTable';
import { formatScore } from './utils';
import { EXAM_DURATION_OPTIONS } from './constants';

describe('enem-moment entry', () => {
  it('exposes every section, badge and helper the apps draw the report with', () => {
    const functions = [
      'SectionContent',
      'EnemMomentPerformanceBadge',
      'EnemMomentTierBadge',
      'ParticipationBadge',
      'readableTextColor',
      'ExamCardsRow',
      'LanguageCard',
      'ParticipationCard',
      'ScoreBandChart',
      'TimeCard',
      'schools',
      'showsLanguageCard',
      'students',
      'UnitExamDataSection',
      'DailyEvolutionSection',
      'KnowledgeAreaSection',
      'EnemMomentRankingCard',
      'ScoreBadge',
      'UnitStudentRankings',
      'EnemMomentSummaryCards',
      'buildEnemMomentUnitSummaryCards',
      'MomentTabs',
      'EnemMomentHeaderFilters',
      'ToneTile',
      'answerTiles',
      'numberedExamScores',
      'scoreText',
      'StudentsTableSection',
      'createStudentColumns',
      'participationOf',
      'toStudentsTableQuery',
      'tookAnyExam',
      'StudentsTableDownload',
      'studentsExportFileName',
      'studentsExportHeaders',
      'studentsExportRows',
      'studentsExportSheet',
      'classOptionLabel',
      'listFilter',
      'pickedValue',
      'PerformanceDistributionSection',
      'toPerformanceCounters',
      'formatCount',
      'formatScore',
      'formatPercentage',
      'formatHoursMinutes',
      'formatDateTime',
      'formatClock',
      'formatMinutesSeconds',
    ];

    for (const name of functions) {
      expect(typeof entry[name as keyof typeof entry]).toBe('function');
    }
  });

  it('exposes the constants of the report', () => {
    expect(entry.RANKING_ROWS).toBe(3);
    expect(entry.EMPTY_RANKING_TEXT).toBe(
      'Nenhum estudante finalizou o simulado neste recorte.'
    );
    expect(entry.MISSING_VALUE).toBe('—');
    expect(entry.DEFAULT_EDUCATION_STAGE).toBe('REGULAR');
    expect(entry.COLLAPSED_DAY_ROWS).toBe(6);
    expect(entry.MOMENT_COLORS).toHaveLength(4);
    expect(entry.EDUCATION_STAGE_OPTIONS).toHaveLength(3);
    expect(entry.ENEM_MOMENT_PERFORMANCE_ORDER).toHaveLength(5);
    expect(entry.ENEM_MOMENT_PERFORMANCE_LABELS.NO_EXAM).toBe('NÃO PARTICIPOU');
  });

  it('re-exports the modules themselves, not copies', () => {
    expect(entry.StudentsTableSection).toBe(StudentsTableSection);
    expect(entry.formatScore).toBe(formatScore);
    expect(entry.EXAM_DURATION_OPTIONS).toBe(EXAM_DURATION_OPTIONS);
  });
});
