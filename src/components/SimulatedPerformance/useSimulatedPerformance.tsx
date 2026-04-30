import { useEffect, useCallback, useState, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Badge from '../Badge/Badge';
import { useGeneralOverview } from '../GeneralOverviewSection';
import { useSimulatedOverview } from '../SimulatedStudentsOverview';
import { useSimulatedContents } from '../SimulatedContentsPerformance';
import { ESSAY_AREA_ID } from '../AreaKnowledgeSelector';
import { SIMULATED_PERFORMANCE_TAG_CONFIG } from '../SimulatedStudentDetailsModal';
import { formatScore } from '../../utils/utils';
import type { ColumnConfig } from '../TableProvider';
import type { StudentsHighlightPeriod } from '../../hooks/useStudentsHighlight';
import { ScoreType } from '../../types/common';
import type { SimulatedFilters } from '../SimulatedFilters/types';
import type { SimulatedStudentItem } from '../SimulatedStudentsOverview/types';
import type { SimulatedContentItem } from '../SimulatedContentsPerformance/types';
import {
  SimulatedViewTab,
  type UseSimulatedPerformanceOptions,
  type UseSimulatedPerformanceReturn,
} from './types';

/**
 * Performance tag cell renderer for simulated exams
 */
function SimulatedPerformanceTagCell({
  row,
}: {
  readonly row: SimulatedStudentItem;
}) {
  const tagConfig = SIMULATED_PERFORMANCE_TAG_CONFIG[row.performance];

  return (
    <Badge variant="solid" action={tagConfig.variant} size="small">
      {tagConfig.label}
    </Badge>
  );
}

/**
 * Performance cell renderer for contents/skills with progress bar
 */
function ContentPerformanceCell({
  percentage,
}: {
  readonly percentage: number;
}) {
  const colorClass =
    percentage >= 70
      ? 'bg-success-500'
      : percentage >= 50
        ? 'bg-warning-500'
        : 'bg-error-500';

  return (
    <div className="flex items-center justify-center gap-2">
      <span className="text-sm text-text-950 min-w-[40px]">
        {Math.round(percentage)}%
      </span>
      <div className="w-16 h-2 bg-background-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Shared defaults for centered columns
 */
const centeredColumn: Partial<ColumnConfig<SimulatedStudentItem>> = {
  sortable: true,
  className: 'py-3 px-4 text-center',
  align: 'center',
};

/**
 * Shared defaults for centered columns (contents table)
 */
const centeredContentsColumn: Partial<ColumnConfig<SimulatedContentItem>> = {
  sortable: true,
  className: 'py-3 px-4 text-center',
  align: 'center',
};

/**
 * Base columns for simulated exams view (without render functions that depend on scoreType)
 */
const simulatedTableColumnsBase: Omit<
  ColumnConfig<SimulatedStudentItem>,
  'render'
>[] = [
  {
    key: 'name',
    label: 'Nome',
    sortable: true,
    className: 'py-3 px-4 text-start',
  },
  {
    key: 'school',
    label: 'Escola',
    sortable: false,
    className: 'py-3 px-4 text-start',
  },
  {
    ...centeredColumn,
    key: 'schoolYear',
    label: 'Ano',
    width: '80px',
    sortable: false,
  },
  {
    ...centeredColumn,
    key: 'class',
    label: 'Turma',
    width: '80px',
    sortable: false,
  },
  {
    ...centeredColumn,
    key: 'average',
    label: 'Média',
    width: '100px',
  },
  {
    ...centeredColumn,
    key: 'performance',
    label: 'Desempenho',
    width: '160px',
  },
];

/**
 * Table columns for simulated contents/skills view
 */
const contentsTableColumns: ColumnConfig<SimulatedContentItem>[] = [
  {
    key: 'contentName',
    label: 'Habilidade',
    sortable: true,
    className: 'py-3 px-4 text-start',
  },
  {
    key: 'subject',
    label: 'Componente',
    sortable: false,
    className: 'py-3 px-4 text-start',
    render: (_value: unknown, row: SimulatedContentItem) => row.subject.name,
  },
  {
    ...centeredContentsColumn,
    key: 'simulatedExamsCount',
    label: 'Simulados',
    width: '100px',
  },
  {
    ...centeredContentsColumn,
    key: 'questionsCount',
    label: 'Questões',
    width: '100px',
  },
  {
    ...centeredContentsColumn,
    key: 'studentsCount',
    label: 'Estudantes',
    width: '100px',
  },
  {
    ...centeredContentsColumn,
    key: 'performance',
    label: 'Desempenho',
    width: '160px',
    render: (_value: unknown, row: SimulatedContentItem) => (
      <ContentPerformanceCell percentage={row.performance.correctPercentage} />
    ),
  },
];

/**
 * Hook de orquestração para a funcionalidade de Simulados.
 * Gerencia estados, query params, carregamento de dados e handlers.
 */
export function useSimulatedPerformance({
  api,
}: UseSimulatedPerformanceOptions): UseSimulatedPerformanceReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  // === Query Params ===
  const period = useMemo((): StudentsHighlightPeriod => {
    const periodParam = searchParams.get('period');
    if (periodParam === '7_DAYS') return '7_DAYS';
    if (periodParam === '1_MONTH') return '1_MONTH';
    if (periodParam === '3_MONTHS') return '3_MONTHS';
    if (periodParam === '6_MONTHS') return '6_MONTHS';
    if (periodParam === '1_YEAR') return '1_YEAR';
    return '1_MONTH';
  }, [searchParams]);

  const scoreType = useMemo((): ScoreType => {
    const scoreTypeParam = searchParams.get('scoreType');
    if (scoreTypeParam === 'tri') return ScoreType.TRI;
    return ScoreType.PERCENTAGE;
  }, [searchParams]);

  // === Estados de Seleção ===
  const [selectedAreaKnowledgeId, setSelectedAreaKnowledgeId] = useState<
    string | null
  >(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null
  );
  const [simulatedViewTab, setSimulatedViewTab] = useState<SimulatedViewTab>(
    SimulatedViewTab.STUDENTS
  );

  // === Estados de Modais ===
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{
    userInstitutionId: string;
    name: string;
  } | null>(null);

  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<{
    contentId: string;
    contentName: string;
  } | null>(null);

  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);

  // === Filtros ===
  const [filters, setFilters] = useState<SimulatedFilters>({
    schoolIds: [],
    schoolYearIds: [],
    classIds: [],
    studentsIds: [],
  });

  // === Refs para evitar closure issues ===
  const selectedAreaKnowledgeIdRef = useRef<string | null>(
    selectedAreaKnowledgeId
  );
  const selectedSubjectIdRef = useRef<string | null>(selectedSubjectId);
  const filtersRef = useRef<SimulatedFilters>(filters);
  const simulatedViewTabRef = useRef<SimulatedViewTab>(simulatedViewTab);
  const scoreTypeRef = useRef<ScoreType>(scoreType);
  const periodRef = useRef<StudentsHighlightPeriod>(period);

  // Keep refs in sync
  useEffect(() => {
    selectedAreaKnowledgeIdRef.current = selectedAreaKnowledgeId;
  }, [selectedAreaKnowledgeId]);

  useEffect(() => {
    selectedSubjectIdRef.current = selectedSubjectId;
  }, [selectedSubjectId]);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    simulatedViewTabRef.current = simulatedViewTab;
  }, [simulatedViewTab]);

  useEffect(() => {
    scoreTypeRef.current = scoreType;
  }, [scoreType]);

  useEffect(() => {
    periodRef.current = period;
  }, [period]);

  // === Hooks de API ===
  const {
    data: generalOverviewData,
    loading: generalOverviewLoading,
    error: generalOverviewError,
    fetchOverview: fetchGeneralOverview,
  } = useGeneralOverview(api);

  const {
    data: simulatedData,
    loading: simulatedLoading,
    isRefreshing: simulatedRefreshing,
    error: simulatedError,
    fetchOverview: fetchSimulatedOverview,
  } = useSimulatedOverview(api);

  const {
    data: contentsData,
    loading: contentsLoading,
    isRefreshing: contentsRefreshing,
    error: contentsError,
    fetchContents,
  } = useSimulatedContents(api);

  // === Valores derivados ===
  const isEssaySelected = selectedAreaKnowledgeId === ESSAY_AREA_ID;

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.schoolIds.length > 0) count++;
    if (filters.schoolYearIds.length > 0) count++;
    if (filters.classIds.length > 0) count++;
    return count;
  }, [filters]);

  // === Colunas das Tabelas (memoizadas) ===
  const studentsTableColumns = useMemo(
    (): ColumnConfig<SimulatedStudentItem>[] =>
      simulatedTableColumnsBase.map((col) => {
        if (col.key === 'average') {
          return {
            ...col,
            render: (_value: unknown, row: SimulatedStudentItem) =>
              formatScore(row.average, scoreType),
          };
        }
        if (col.key === 'performance') {
          return {
            ...col,
            render: (_value: unknown, row: SimulatedStudentItem) => (
              <SimulatedPerformanceTagCell row={row} />
            ),
          };
        }
        return col as ColumnConfig<SimulatedStudentItem>;
      }),
    [scoreType]
  );

  // === Funções de Carregamento ===
  const loadStudentsData = useCallback(
    async (
      areaKnowledgeId: string | null,
      subjectId: string | null,
      page = 1,
      refresh = false,
      periodOverride?: StudentsHighlightPeriod,
      scoreTypeOverride?: ScoreType
    ) => {
      const currentFilters = filtersRef.current;
      const currentPeriod = periodOverride ?? periodRef.current;
      const currentScoreType = scoreTypeOverride ?? scoreTypeRef.current;
      const isEssay = areaKnowledgeId === ESSAY_AREA_ID;

      const effectiveSubjectId =
        !isEssay && subjectId && subjectId !== 'all' ? subjectId : undefined;
      const effectiveAreaKnowledgeId =
        !isEssay && areaKnowledgeId && areaKnowledgeId !== 'all'
          ? areaKnowledgeId
          : undefined;

      await fetchSimulatedOverview(
        {
          simulationType: isEssay ? 'essays' : 'enem-1',
          period: currentPeriod,
          subjectId: effectiveSubjectId,
          areaKnowledgeId: effectiveAreaKnowledgeId,
          schoolIds: currentFilters.schoolIds,
          schoolYearIds: currentFilters.schoolYearIds,
          classIds: currentFilters.classIds,
          studentsIds: currentFilters.studentsIds,
          page,
          limit: 10,
          orderBy: 'name',
          order: 'asc',
          scoreType: currentScoreType,
        },
        refresh
      );
    },
    [fetchSimulatedOverview]
  );

  const loadSkillsData = useCallback(
    async (
      areaKnowledgeId: string | null,
      subjectId: string | null,
      periodOverride?: StudentsHighlightPeriod,
      scoreTypeOverride?: ScoreType
    ) => {
      // Essays não têm conteúdos/habilidades
      if (areaKnowledgeId === ESSAY_AREA_ID) {
        return;
      }

      const currentFilters = filtersRef.current;
      const currentPeriod = periodOverride ?? periodRef.current;
      const currentScoreType = scoreTypeOverride ?? scoreTypeRef.current;

      const effectiveSubjectId =
        subjectId && subjectId !== 'all' ? subjectId : undefined;
      const effectiveAreaKnowledgeId =
        areaKnowledgeId && areaKnowledgeId !== 'all'
          ? areaKnowledgeId
          : undefined;

      await fetchContents({
        simulationType: 'enem-1',
        period: currentPeriod,
        subjectId: effectiveSubjectId,
        areaKnowledgeId: effectiveAreaKnowledgeId,
        schoolIds: currentFilters.schoolIds,
        schoolYearIds: currentFilters.schoolYearIds,
        classIds: currentFilters.classIds,
        studentsIds: currentFilters.studentsIds,
        page: 1,
        limit: 10,
        orderBy: 'correctPercentage',
        order: 'asc',
        scoreType: currentScoreType,
      });
    },
    [fetchContents]
  );

  const loadGeneralOverviewData = useCallback(
    async (
      periodOverride?: StudentsHighlightPeriod,
      scoreTypeOverride?: ScoreType
    ) => {
      const currentFilters = filtersRef.current;
      const currentScoreType = scoreTypeOverride ?? scoreTypeRef.current;

      await fetchGeneralOverview({
        period: periodOverride ?? periodRef.current,
        schoolIds: currentFilters.schoolIds,
        schoolYearIds: currentFilters.schoolYearIds,
        classIds: currentFilters.classIds,
        studentsIds: currentFilters.studentsIds,
        scoreType: currentScoreType,
      });
    },
    [fetchGeneralOverview]
  );

  // === Handlers ===
  const handlePeriodChange = useCallback(
    (value: string) => {
      const newPeriod = value as StudentsHighlightPeriod;
      if (newPeriod === periodRef.current) {
        return;
      }
      const effectiveScoreType = scoreTypeRef.current;

      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        if (newPeriod === '1_MONTH') {
          newParams.delete('period');
        } else {
          newParams.set('period', newPeriod);
        }
        if (effectiveScoreType === 'percentage') {
          newParams.delete('scoreType');
        } else {
          newParams.set('scoreType', effectiveScoreType);
        }
        return newParams;
      });

      // Reload data with new period
      if (simulatedViewTabRef.current === SimulatedViewTab.STUDENTS) {
        loadStudentsData(
          selectedAreaKnowledgeIdRef.current,
          selectedSubjectIdRef.current,
          1,
          false,
          newPeriod,
          effectiveScoreType
        );
      } else {
        loadSkillsData(
          selectedAreaKnowledgeIdRef.current,
          selectedSubjectIdRef.current,
          newPeriod,
          effectiveScoreType
        );
      }
      loadGeneralOverviewData(newPeriod, effectiveScoreType);
    },
    [setSearchParams, loadStudentsData, loadSkillsData, loadGeneralOverviewData]
  );

  const handleScoreTypeChange = useCallback(
    (value: string) => {
      const newScoreType = value as ScoreType;
      if (newScoreType === scoreTypeRef.current) {
        return;
      }
      const effectivePeriod = periodRef.current;
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        if (effectivePeriod === '1_MONTH') {
          newParams.delete('period');
        } else {
          newParams.set('period', effectivePeriod);
        }
        if (newScoreType === 'percentage') {
          newParams.delete('scoreType');
        } else {
          newParams.set('scoreType', newScoreType);
        }
        return newParams;
      });
    },
    [setSearchParams]
  );

  const handleAreaKnowledgeChange = useCallback(
    (areaId: string | null) => {
      if (areaId === selectedAreaKnowledgeIdRef.current) {
        return;
      }

      setSelectedAreaKnowledgeId(areaId);
      setSelectedSubjectId(null);
      setSimulatedViewTab(SimulatedViewTab.STUDENTS);

      loadStudentsData(areaId, null);
    },
    [loadStudentsData]
  );

  const handleSubjectChange = useCallback(
    (subjectId: string | null) => {
      const effectiveSubjectId =
        subjectId === 'all' || subjectId === null ? null : subjectId;
      if (effectiveSubjectId === selectedSubjectIdRef.current) {
        return;
      }

      setSelectedSubjectId(effectiveSubjectId);

      if (simulatedViewTabRef.current === SimulatedViewTab.STUDENTS) {
        loadStudentsData(
          selectedAreaKnowledgeIdRef.current,
          effectiveSubjectId
        );
      } else {
        loadSkillsData(selectedAreaKnowledgeIdRef.current, effectiveSubjectId);
      }
    },
    [loadStudentsData, loadSkillsData]
  );

  const handleViewTabChange = useCallback(
    (value: string) => {
      const newTab = value as SimulatedViewTab;

      if (newTab === simulatedViewTabRef.current) {
        return;
      }

      setSimulatedViewTab(newTab);

      if (newTab === SimulatedViewTab.STUDENTS) {
        loadStudentsData(
          selectedAreaKnowledgeIdRef.current,
          selectedSubjectIdRef.current
        );
      } else {
        loadSkillsData(
          selectedAreaKnowledgeIdRef.current,
          selectedSubjectIdRef.current
        );
      }
    },
    [loadStudentsData, loadSkillsData]
  );

  const handleFiltersApply = useCallback(
    (newFilters: SimulatedFilters) => {
      // Atualizar ref ANTES para que as funções de load usem os novos valores
      filtersRef.current = newFilters;
      setFilters(newFilters);

      if (simulatedViewTabRef.current === SimulatedViewTab.STUDENTS) {
        loadStudentsData(
          selectedAreaKnowledgeIdRef.current,
          selectedSubjectIdRef.current
        );
      } else {
        loadSkillsData(
          selectedAreaKnowledgeIdRef.current,
          selectedSubjectIdRef.current
        );
      }
      loadGeneralOverviewData();
    },
    [loadStudentsData, loadSkillsData, loadGeneralOverviewData]
  );

  const handleContentsParamsChange = useCallback(
    (params: Record<string, unknown>) => {
      if (selectedAreaKnowledgeIdRef.current === ESSAY_AREA_ID) {
        return;
      }

      const newPage = params.page as number;
      const newLimit = params.limit as number;
      const sortBy = params.sortBy as string;
      const sortOrder = params.sortOrder as string;

      const sortByMap: Record<string, string> = {
        contentName: 'contentName',
        simulatedExamsCount: 'simulatedExamsCount',
        questionsCount: 'questionsCount',
        studentsCount: 'studentsCount',
        performance: 'correctPercentage',
      };

      const orderBy = sortBy
        ? (sortByMap[sortBy] ?? 'correctPercentage')
        : 'correctPercentage';
      const order = sortOrder === 'desc' ? 'desc' : 'asc';

      const currentSubjectId = selectedSubjectIdRef.current;
      const currentAreaKnowledgeId = selectedAreaKnowledgeIdRef.current;
      const effectiveSubjectId =
        currentSubjectId && currentSubjectId !== 'all'
          ? currentSubjectId
          : undefined;
      const effectiveAreaKnowledgeId =
        currentAreaKnowledgeId && currentAreaKnowledgeId !== 'all'
          ? currentAreaKnowledgeId
          : undefined;

      fetchContents({
        simulationType: 'enem-1',
        period: periodRef.current,
        subjectId: effectiveSubjectId,
        areaKnowledgeId: effectiveAreaKnowledgeId,
        schoolIds: filtersRef.current.schoolIds,
        schoolYearIds: filtersRef.current.schoolYearIds,
        classIds: filtersRef.current.classIds,
        page: newPage ?? 1,
        limit: newLimit ?? 10,
        orderBy,
        order,
        scoreType: scoreTypeRef.current,
      });
    },
    [fetchContents]
  );

  const handleStudentRowClick = useCallback((row: SimulatedStudentItem) => {
    setSelectedStudent({
      userInstitutionId: row.userInstitutionId,
      name: row.name,
    });
    setIsStudentModalOpen(true);
  }, []);

  const handleContentRowClick = useCallback((row: SimulatedContentItem) => {
    setSelectedContent({
      contentId: row.contentId,
      contentName: row.contentName,
    });
    setIsContentModalOpen(true);
  }, []);

  // === Carregamento inicial ===
  const initialLoadRef = useRef(false);

  useEffect(() => {
    if (initialLoadRef.current) return;
    initialLoadRef.current = true;

    loadStudentsData(null, null);
    loadGeneralOverviewData();
  }, [loadStudentsData, loadGeneralOverviewData]);

  // === Recarregar quando scoreType muda ===
  useEffect(() => {
    if (!initialLoadRef.current) return;

    if (simulatedViewTabRef.current === SimulatedViewTab.STUDENTS) {
      loadStudentsData(
        selectedAreaKnowledgeIdRef.current,
        selectedSubjectIdRef.current
      );
    } else {
      loadSkillsData(
        selectedAreaKnowledgeIdRef.current,
        selectedSubjectIdRef.current
      );
    }
    loadGeneralOverviewData();
  }, [scoreType, loadStudentsData, loadSkillsData, loadGeneralOverviewData]);

  return {
    // Query Params
    period,
    scoreType,

    // Estados de Seleção
    selectedAreaKnowledgeId,
    selectedSubjectId,
    simulatedViewTab,
    isEssaySelected,

    // Filtros
    filters,
    activeFiltersCount,

    // Dados da API
    generalOverview: {
      data: generalOverviewData,
      loading: generalOverviewLoading,
      error: generalOverviewError,
    },
    studentsOverview: {
      data: simulatedData,
      loading: simulatedLoading,
      isRefreshing: simulatedRefreshing,
      error: simulatedError,
    },
    contentsPerformance: {
      data: contentsData,
      loading: contentsLoading,
      isRefreshing: contentsRefreshing,
      error: contentsError,
    },

    // Handlers
    handlePeriodChange,
    handleScoreTypeChange,
    handleAreaKnowledgeChange,
    handleSubjectChange,
    handleViewTabChange,
    handleFiltersApply,
    handleContentsParamsChange,
    handleStudentRowClick,
    handleContentRowClick,

    // Modais
    studentModal: {
      isOpen: isStudentModalOpen,
      student: selectedStudent,
      close: () => {
        setIsStudentModalOpen(false);
        setSelectedStudent(null);
      },
    },
    contentModal: {
      isOpen: isContentModalOpen,
      content: selectedContent,
      close: () => {
        setIsContentModalOpen(false);
        setSelectedContent(null);
      },
    },
    filtersModal: {
      isOpen: isFiltersModalOpen,
      open: () => setIsFiltersModalOpen(true),
      close: () => setIsFiltersModalOpen(false),
    },

    // Colunas das Tabelas
    studentsTableColumns,
    contentsTableColumns,
  };
}
