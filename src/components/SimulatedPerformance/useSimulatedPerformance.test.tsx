import { renderHook, act, waitFor } from '@testing-library/react';
import { useSimulatedPerformance } from './useSimulatedPerformance';
import { SimulatedViewTab } from './types';
import { SimulatedPerformanceTag } from '../SimulatedStudentDetailsModal/types';
import type { BaseApiClient } from '../../types/api';

// Mock react-router-dom
const mockSearchParams = new URLSearchParams();
const mockSetSearchParams = jest.fn();

jest.mock('react-router-dom', () => ({
  useSearchParams: () => [mockSearchParams, mockSetSearchParams],
}));

// Mock API hooks
const mockFetchGeneralOverview = jest.fn().mockResolvedValue(undefined);
const mockFetchSimulatedOverview = jest.fn().mockResolvedValue(undefined);
const mockFetchContents = jest.fn().mockResolvedValue(undefined);

jest.mock('../GeneralOverviewSection', () => ({
  useGeneralOverview: () => ({
    data: null,
    loading: false,
    error: null,
    fetchOverview: mockFetchGeneralOverview,
  }),
}));

jest.mock('../SimulatedStudentsOverview', () => ({
  useSimulatedOverview: () => ({
    data: null,
    loading: false,
    isRefreshing: false,
    error: null,
    fetchOverview: mockFetchSimulatedOverview,
  }),
  useAggregatedOverview: () => ({
    data: null,
    loading: false,
    isRefreshing: false,
    error: null,
    fetchOverview: jest.fn(),
    reset: jest.fn(),
  }),
}));

jest.mock('../SimulatedContentsPerformance', () => ({
  useSimulatedContents: () => ({
    data: null,
    loading: false,
    isRefreshing: false,
    error: null,
    fetchContents: mockFetchContents,
  }),
}));

jest.mock('../AreaKnowledgeSelector', () => ({
  ESSAY_AREA_ID: 'essay-area-id',
}));

jest.mock('../SimulatedStudentDetailsModal', () => ({
  SIMULATED_PERFORMANCE_TAG_CONFIG: {
    ABOVE_AVERAGE: { label: 'Acima da média', variant: 'success' },
    AVERAGE: { label: 'Na média', variant: 'warning' },
    BELOW_AVERAGE: { label: 'Abaixo da média', variant: 'error' },
  },
}));

jest.mock('../../utils/utils', () => ({
  formatScore: (value: number, type: string) =>
    type === 'tri' ? Math.round(value).toString() : `${value.toFixed(1)}%`,
}));

const createMockApi = (): BaseApiClient => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
});

describe('useSimulatedPerformance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.delete('period');
    mockSearchParams.delete('scoreType');
  });

  describe('initialization', () => {
    it('returns default values on initial render', () => {
      const api = createMockApi();
      const { result } = renderHook(() => useSimulatedPerformance({ api }));

      expect(result.current.period).toBe('1_MONTH');
      expect(result.current.scoreType).toBe('percentage');
      expect(result.current.selectedAreaKnowledgeId).toBeNull();
      expect(result.current.selectedSubjectId).toBeNull();
      expect(result.current.simulatedViewTab).toBe(SimulatedViewTab.STUDENTS);
      expect(result.current.isEssaySelected).toBe(false);
      expect(result.current.activeFiltersCount).toBe(0);
    });

    it('reads period from URL params', () => {
      mockSearchParams.set('period', '7_DAYS');

      const api = createMockApi();
      const { result } = renderHook(() => useSimulatedPerformance({ api }));

      expect(result.current.period).toBe('7_DAYS');
    });

    it('reads scoreType from URL params', () => {
      mockSearchParams.set('scoreType', 'tri');

      const api = createMockApi();
      const { result } = renderHook(() => useSimulatedPerformance({ api }));

      expect(result.current.scoreType).toBe('tri');
    });

    it('loads initial data on mount', async () => {
      const api = createMockApi();
      renderHook(() => useSimulatedPerformance({ api }));

      await waitFor(() => {
        expect(mockFetchSimulatedOverview).toHaveBeenCalled();
        expect(mockFetchGeneralOverview).toHaveBeenCalled();
      });
    });
  });

  describe('handlePeriodChange', () => {
    it('updates URL and reloads data when period changes', async () => {
      const api = createMockApi();
      const { result } = renderHook(() => useSimulatedPerformance({ api }));

      await act(async () => {
        result.current.handlePeriodChange('6_MONTHS');
      });

      expect(mockSetSearchParams).toHaveBeenCalled();
      expect(mockFetchSimulatedOverview).toHaveBeenCalled();
      expect(mockFetchGeneralOverview).toHaveBeenCalled();
    });

    it('does not reload when same period is selected', async () => {
      const api = createMockApi();
      const { result } = renderHook(() => useSimulatedPerformance({ api }));

      // Clear mocks after initial load
      jest.clearAllMocks();

      await act(async () => {
        result.current.handlePeriodChange('1_MONTH');
      });

      expect(mockSetSearchParams).not.toHaveBeenCalled();
    });
  });

  describe('handleScoreTypeChange', () => {
    it('updates URL when score type changes', async () => {
      const api = createMockApi();
      const { result } = renderHook(() => useSimulatedPerformance({ api }));

      await act(async () => {
        result.current.handleScoreTypeChange('tri');
      });

      expect(mockSetSearchParams).toHaveBeenCalled();
    });
  });

  describe('handleAreaKnowledgeChange', () => {
    it('updates selected area and resets subject', async () => {
      const api = createMockApi();
      const { result } = renderHook(() => useSimulatedPerformance({ api }));

      await act(async () => {
        result.current.handleAreaKnowledgeChange('area-1');
      });

      expect(result.current.selectedAreaKnowledgeId).toBe('area-1');
      expect(result.current.selectedSubjectId).toBeNull();
      expect(result.current.simulatedViewTab).toBe(SimulatedViewTab.STUDENTS);
    });

    it('sets isEssaySelected when essay area is selected', async () => {
      const api = createMockApi();
      const { result } = renderHook(() => useSimulatedPerformance({ api }));

      await act(async () => {
        result.current.handleAreaKnowledgeChange('essay-area-id');
      });

      expect(result.current.isEssaySelected).toBe(true);
    });

    it('reloads students data when area changes', async () => {
      const api = createMockApi();
      const { result } = renderHook(() => useSimulatedPerformance({ api }));

      jest.clearAllMocks();

      await act(async () => {
        result.current.handleAreaKnowledgeChange('area-1');
      });

      expect(mockFetchSimulatedOverview).toHaveBeenCalled();
    });
  });

  describe('handleSubjectChange', () => {
    it('updates selected subject', async () => {
      const api = createMockApi();
      const { result } = renderHook(() => useSimulatedPerformance({ api }));

      await act(async () => {
        result.current.handleSubjectChange('subject-1');
      });

      expect(result.current.selectedSubjectId).toBe('subject-1');
    });

    it('sets subject to null when "all" is selected', async () => {
      const api = createMockApi();
      const { result } = renderHook(() => useSimulatedPerformance({ api }));

      await act(async () => {
        result.current.handleSubjectChange('subject-1');
      });

      await act(async () => {
        result.current.handleSubjectChange('all');
      });

      expect(result.current.selectedSubjectId).toBeNull();
    });
  });

  describe('handleViewTabChange', () => {
    it('updates view tab and loads appropriate data', async () => {
      const api = createMockApi();
      const { result } = renderHook(() => useSimulatedPerformance({ api }));

      jest.clearAllMocks();

      await act(async () => {
        result.current.handleViewTabChange(SimulatedViewTab.SKILLS);
      });

      expect(result.current.simulatedViewTab).toBe(SimulatedViewTab.SKILLS);
      expect(mockFetchContents).toHaveBeenCalled();
    });

    it('loads students data when switching to students tab', async () => {
      const api = createMockApi();
      const { result } = renderHook(() => useSimulatedPerformance({ api }));

      // Switch to skills first
      await act(async () => {
        result.current.handleViewTabChange(SimulatedViewTab.SKILLS);
      });

      jest.clearAllMocks();

      // Switch back to students
      await act(async () => {
        result.current.handleViewTabChange(SimulatedViewTab.STUDENTS);
      });

      expect(mockFetchSimulatedOverview).toHaveBeenCalled();
    });
  });

  describe('handleFiltersApply', () => {
    it('updates filters and reloads data', async () => {
      const api = createMockApi();
      const { result } = renderHook(() => useSimulatedPerformance({ api }));

      const newFilters = {
        schoolIds: ['school-1'],
        schoolYearIds: ['year-1'],
        classIds: ['class-1'],
        studentsIds: [],
      };

      jest.clearAllMocks();

      await act(async () => {
        result.current.handleFiltersApply(newFilters);
      });

      expect(result.current.filters).toEqual(newFilters);
      expect(mockFetchSimulatedOverview).toHaveBeenCalled();
      expect(mockFetchGeneralOverview).toHaveBeenCalled();
    });

    it('calculates active filters count correctly', async () => {
      const api = createMockApi();
      const { result } = renderHook(() => useSimulatedPerformance({ api }));

      await act(async () => {
        result.current.handleFiltersApply({
          schoolIds: ['school-1'],
          schoolYearIds: ['year-1'],
          classIds: [],
          studentsIds: [],
        });
      });

      expect(result.current.activeFiltersCount).toBe(2);
    });
  });

  describe('modals', () => {
    it('manages student modal state correctly', async () => {
      const api = createMockApi();
      const { result } = renderHook(() => useSimulatedPerformance({ api }));

      expect(result.current.studentModal.isOpen).toBe(false);
      expect(result.current.studentModal.student).toBeNull();

      await act(async () => {
        result.current.handleStudentRowClick({
          studentId: 'student-1',
          institutionId: 'inst-1',
          userInstitutionId: 'user-inst-1',
          name: 'João Silva',
          school: 'Escola A',
          schoolYear: '3º Ano',
          class: 'Turma A',
          average: 75,
          performance: SimulatedPerformanceTag.ABOVE_AVERAGE,
        });
      });

      expect(result.current.studentModal.isOpen).toBe(true);
      expect(result.current.studentModal.student).toEqual({
        userInstitutionId: 'user-inst-1',
        name: 'João Silva',
      });

      await act(async () => {
        result.current.studentModal.close();
      });

      expect(result.current.studentModal.isOpen).toBe(false);
      expect(result.current.studentModal.student).toBeNull();
    });

    it('manages content modal state correctly', async () => {
      const api = createMockApi();
      const { result } = renderHook(() => useSimulatedPerformance({ api }));

      expect(result.current.contentModal.isOpen).toBe(false);

      await act(async () => {
        result.current.handleContentRowClick({
          contentId: 'content-1',
          contentName: 'Geometria',
          bnccCode: 'EM13MAT01',
          subject: { id: 'subj-1', name: 'Matemática' },
          simulatedExamsCount: 5,
          questionsCount: 20,
          studentsCount: 100,
          performance: {
            correct: 15,
            incorrect: 5,
            correctPercentage: 75,
          },
        });
      });

      expect(result.current.contentModal.isOpen).toBe(true);
      expect(result.current.contentModal.content).toEqual({
        contentId: 'content-1',
        contentName: 'Geometria',
      });

      await act(async () => {
        result.current.contentModal.close();
      });

      expect(result.current.contentModal.isOpen).toBe(false);
    });

    it('manages filters modal state correctly', async () => {
      const api = createMockApi();
      const { result } = renderHook(() => useSimulatedPerformance({ api }));

      expect(result.current.filtersModal.isOpen).toBe(false);

      await act(async () => {
        result.current.filtersModal.open();
      });

      expect(result.current.filtersModal.isOpen).toBe(true);

      await act(async () => {
        result.current.filtersModal.close();
      });

      expect(result.current.filtersModal.isOpen).toBe(false);
    });
  });

  describe('table columns', () => {
    it('provides students table columns', () => {
      const api = createMockApi();
      const { result } = renderHook(() => useSimulatedPerformance({ api }));

      expect(result.current.studentsTableColumns).toBeDefined();
      expect(result.current.studentsTableColumns.length).toBeGreaterThan(0);

      const columnKeys = result.current.studentsTableColumns.map((c) => c.key);
      expect(columnKeys).toContain('name');
      expect(columnKeys).toContain('average');
      expect(columnKeys).toContain('performance');
    });

    it('provides contents table columns', () => {
      const api = createMockApi();
      const { result } = renderHook(() => useSimulatedPerformance({ api }));

      expect(result.current.contentsTableColumns).toBeDefined();
      expect(result.current.contentsTableColumns.length).toBeGreaterThan(0);

      const columnKeys = result.current.contentsTableColumns.map((c) => c.key);
      expect(columnKeys).toContain('contentName');
      expect(columnKeys).toContain('performance');
    });
  });
});
