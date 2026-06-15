import type { ColumnConfig } from '../TableProvider';
import type { StudentsHighlightPeriod } from '../../hooks/useStudentsHighlight';
import type { SimulatedFilters } from '../SimulatedFilters/types';
import type { ScoreType } from '../../types/common';
import type { GeneralOverviewData } from '../GeneralOverviewSection/types';
import type {
  SimulatedOverviewData,
  SimulatedStudentItem,
  AggregatedOverviewData,
  OverviewAggregationType,
} from '../SimulatedStudentsOverview/types';
import type {
  ContentsPerformanceData,
  SimulatedContentItem,
} from '../SimulatedContentsPerformance/types';
import type { BaseApiClient } from '../../types/api';

/**
 * View tabs for simulated exams (students vs skills)
 */
export enum SimulatedViewTab {
  STUDENTS = 'students',
  SKILLS = 'skills',
}

export interface UseSimulatedPerformanceOptions {
  api: BaseApiClient;
  /**
   * User's profile name to determine aggregation type.
   * - UNIT_MANAGER: aggregates by classes
   * - REGIONAL_MANAGER: aggregates by municipalities
   * - GENERAL_MANAGER, TEACHER, others: shows students (default)
   */
  profileName?: string;
}

export interface UseSimulatedPerformanceReturn {
  // === Query Params (gerenciados internamente) ===
  period: StudentsHighlightPeriod;
  scoreType: ScoreType;

  // === Estados de Seleção ===
  selectedAreaKnowledgeId: string | null;
  /** Related IDs for merged areas (includes all IDs when area was deduplicated) */
  selectedAreaRelatedIds: string[];
  selectedSubjectId: string | null;
  simulatedViewTab: SimulatedViewTab;
  isEssaySelected: boolean;

  // === Filtros ===
  filters: SimulatedFilters;
  activeFiltersCount: number;

  // === Aggregation Type ===
  aggregationType: OverviewAggregationType;

  // === Dados da API ===
  generalOverview: {
    data: GeneralOverviewData | null;
    loading: boolean;
    error: string | null;
  };
  /**
   * Aggregated overview data based on profile.
   * - students: contains StudentsOnlyOverviewData
   * - classes: contains ClassesOverviewData
   * - municipalities: contains MunicipalitiesOverviewData
   */
  aggregatedOverview: {
    data: AggregatedOverviewData | null;
    loading: boolean;
    isRefreshing: boolean;
    error: string | null;
  };
  /**
   * Paginated students list for the table (legacy endpoint).
   * Still used for drilling into individual student details.
   */
  studentsOverview: {
    data: SimulatedOverviewData | null;
    loading: boolean;
    isRefreshing: boolean;
    error: string | null;
  };
  contentsPerformance: {
    data: ContentsPerformanceData | null;
    loading: boolean;
    isRefreshing: boolean;
    error: string | null;
  };

  // === Handlers ===
  handlePeriodChange: (period: string) => void;
  handleScoreTypeChange: (scoreType: string) => void;
  handleAreaKnowledgeChange: (areaId: string | null) => void;
  handleSubjectChange: (subjectId: string | null) => void;
  handleViewTabChange: (tab: string) => void;
  handleFiltersApply: (filters: SimulatedFilters) => void;
  handleStudentsParamsChange: (params: Record<string, unknown>) => void;
  handleContentsParamsChange: (params: Record<string, unknown>) => void;
  handleStudentRowClick: (row: SimulatedStudentItem) => void;
  handleContentRowClick: (row: SimulatedContentItem) => void;

  // === Modais ===
  studentModal: {
    isOpen: boolean;
    student: { userInstitutionId: string; name: string } | null;
    close: () => void;
  };
  contentModal: {
    isOpen: boolean;
    content: { contentId: string; contentName: string } | null;
    close: () => void;
  };
  filtersModal: {
    isOpen: boolean;
    open: () => void;
    close: () => void;
  };

  // === Colunas das Tabelas ===
  studentsTableColumns: ColumnConfig<SimulatedStudentItem>[];
  contentsTableColumns: ColumnConfig<SimulatedContentItem>[];
}

export interface SimulatedPerformanceViewProps extends UseSimulatedPerformanceReturn {
  api: BaseApiClient;
  noSearchImage?: string;
}
