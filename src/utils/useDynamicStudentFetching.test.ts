import { renderHook } from '@testing-library/react';
import type { SetStateAction } from 'react';
import { useDynamicStudentFetching } from './useDynamicStudentFetching';
import type { CategoryConfig } from '../components/CheckBoxGroup/CheckBoxGroup';
import type { BaseApiClient } from '../types/api';
import type { Class } from './categoryDataUtils';
import type { StudentWithNestedData } from './studentTypes';

// Mock API client
const createMockApiClient = (
  overrides: Partial<BaseApiClient> = {}
): BaseApiClient => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  ...overrides,
});

/**
 * Stateful setCategories mock that supports functional updates, so we can assert
 * the composed final state and prove functional write-backs do not clobber.
 */
function createSetCategories(initial: CategoryConfig[]): {
  fn: jest.Mock;
  getState: () => CategoryConfig[];
} {
  let state = initial;
  const fn = jest.fn((update: SetStateAction<CategoryConfig[]>) => {
    state =
      typeof update === 'function'
        ? (update as (prev: CategoryConfig[]) => CategoryConfig[])(state)
        : update;
  });
  return { fn, getState: () => state };
}

const buildCategories = (
  selected: {
    escola?: string[];
    serie?: string[];
    turma?: string[];
    students?: string[];
  } = {},
  itens: {
    turma?: CategoryConfig['itens'];
    students?: CategoryConfig['itens'];
  } = {}
): CategoryConfig[] => [
  {
    key: 'escola',
    label: 'Escola',
    itens: [{ id: 's1', name: 'Escola 1' }],
    selectedIds: selected.escola ?? [],
  },
  {
    key: 'serie',
    label: 'Série',
    dependsOn: ['escola'],
    filteredBy: [{ key: 'escola', internalField: 'schoolId' }],
    itens: [
      { id: 'y1', name: '1º Ano', schoolId: 's1' },
      { id: 'y2', name: '2º Ano', schoolId: 's1' },
    ],
    selectedIds: selected.serie ?? [],
  },
  {
    key: 'turma',
    label: 'Turma',
    dependsOn: ['serie'],
    filteredBy: [{ key: 'serie', internalField: 'schoolYearId' }],
    itens: itens.turma ?? [],
    selectedIds: selected.turma ?? [],
  },
  {
    key: 'students',
    label: 'Alunos',
    dependsOn: ['turma'],
    filteredBy: [
      { key: 'escola', internalField: 'escolaId' },
      { key: 'serie', internalField: 'serieId' },
      { key: 'turma', internalField: 'turmaId' },
    ],
    itens: itens.students ?? [],
    selectedIds: selected.students ?? [],
  },
];

const sampleClasses: Class[] = [
  { id: 'c1', name: 'Turma A', schoolYearId: 'y1' },
  { id: 'c2', name: 'Turma B', schoolYearId: 'y1' },
];

const sampleStudents: StudentWithNestedData[] = [
  {
    id: 'st1',
    email: 'aluno1@example.com',
    name: 'Aluno 1',
    active: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    userInstitutionId: 'ui1',
    institutionId: 'inst1',
    profileId: 'prof1',
    school: { id: 's1', name: 'Escola 1' },
    schoolYear: { id: 'y1', name: '1º Ano' },
    class: { id: 'c1', name: 'Turma A' },
  },
];

const getCategory = (categories: CategoryConfig[], key: string) =>
  categories.find((c) => c.key === key)!;

describe('useDynamicStudentFetching', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('no fetch function provided', () => {
    it('just updates categories as-is', async () => {
      const { fn: setCategories, getState } = createSetCategories([]);
      const { result } = renderHook(() =>
        useDynamicStudentFetching(setCategories)
      );

      const cats = buildCategories({ escola: ['s1'], serie: ['y1'] });
      await result.current.handleCategoriesChange(cats);

      expect(getState()).toBe(cats);
    });
  });

  describe('no apiClient (consumer-managed turma, e.g. AlertsManager)', () => {
    const preloadedTurma: CategoryConfig['itens'] = [
      { id: 'c1', name: 'Turma A', schoolYearId: 'y1' },
      { id: 'c2', name: 'Turma B', schoolYearId: 'y1' },
    ];

    it('never clears or fetches turma on a série change when there is no apiClient', async () => {
      const fetchStudentsByFilters = jest
        .fn<Promise<StudentWithNestedData[]>, [unknown]>()
        .mockResolvedValue([]);

      const { fn: setCategories, getState } = createSetCategories([]);
      const { result } = renderHook(() =>
        useDynamicStudentFetching(setCategories, { fetchStudentsByFilters })
      );

      // Série selected: without apiClient the hook must leave turma.itens intact.
      await result.current.handleCategoriesChange(
        buildCategories(
          { escola: ['s1'], serie: ['y1'] },
          { turma: preloadedTurma }
        )
      );

      expect(getCategory(getState(), 'turma').itens).toEqual(preloadedTurma);
    });

    it('does not clear turma when the série selection becomes empty', async () => {
      const fetchStudentsByFilters = jest
        .fn<Promise<StudentWithNestedData[]>, [unknown]>()
        .mockResolvedValue([]);

      const { fn: setCategories, getState } = createSetCategories([]);
      const { result } = renderHook(() =>
        useDynamicStudentFetching(setCategories, { fetchStudentsByFilters })
      );

      // Série selected, then deselected: the else/clear branch must be a no-op
      // so AlertsManager's pre-populated turma survives.
      await result.current.handleCategoriesChange(
        buildCategories(
          { escola: ['s1'], serie: ['y1'] },
          { turma: preloadedTurma }
        )
      );
      await result.current.handleCategoriesChange(
        buildCategories({ escola: ['s1'] }, { turma: preloadedTurma })
      );

      expect(getCategory(getState(), 'turma').itens).toEqual(preloadedTurma);
    });

    it('still fetches students via the custom fetcher when a turma is selected', async () => {
      const fetchStudentsByFilters = jest
        .fn<Promise<StudentWithNestedData[]>, [unknown]>()
        .mockResolvedValue(sampleStudents);

      const { fn: setCategories, getState } = createSetCategories([]);
      const { result } = renderHook(() =>
        useDynamicStudentFetching(setCategories, { fetchStudentsByFilters })
      );

      await result.current.handleCategoriesChange(
        buildCategories(
          { escola: ['s1'], serie: ['y1'], turma: ['c1'] },
          { turma: preloadedTurma }
        )
      );

      expect(fetchStudentsByFilters).toHaveBeenCalledWith({
        schoolIds: ['s1'],
        schoolYearIds: ['y1'],
        classIds: ['c1'],
      });
      // Students populated, turma still untouched by the hook.
      expect(getCategory(getState(), 'students').itens).toHaveLength(1);
      expect(getCategory(getState(), 'turma').itens).toEqual(preloadedTurma);
    });
  });

  describe('dynamic turma (class) fetching', () => {
    it('fetches classes on série change and writes them into turma.itens with schoolYearId', async () => {
      const apiClient = createMockApiClient();
      const fetchClassesByFilters = jest
        .fn<Promise<Class[]>, [BaseApiClient, unknown]>()
        .mockResolvedValue(sampleClasses);
      const fetchStudentsByFilters = jest
        .fn<Promise<StudentWithNestedData[]>, [unknown]>()
        .mockResolvedValue([]);

      const { fn: setCategories, getState } = createSetCategories([]);
      const { result } = renderHook(() =>
        useDynamicStudentFetching(setCategories, {
          apiClient,
          fetchClassesByFilters,
          fetchStudentsByFilters,
        })
      );

      await result.current.handleCategoriesChange(
        buildCategories({ escola: ['s1'], serie: ['y1'] })
      );

      expect(fetchClassesByFilters).toHaveBeenCalledWith(apiClient, {
        schoolIds: ['s1'],
        schoolYearIds: ['y1'],
      });

      const turma = getCategory(getState(), 'turma');
      expect(turma.itens).toEqual([
        { id: 'c1', name: 'Turma A', schoolYearId: 'y1' },
        { id: 'c2', name: 'Turma B', schoolYearId: 'y1' },
      ]);
      // Every turma item must carry schoolYearId so `filteredBy` keeps it visible
      expect(turma.itens!.every((i) => 'schoolYearId' in i)).toBe(true);
    });

    it('clears turma.itens when the série selection becomes empty', async () => {
      const apiClient = createMockApiClient();
      const fetchClassesByFilters = jest
        .fn<Promise<Class[]>, [BaseApiClient, unknown]>()
        .mockResolvedValue(sampleClasses);

      const { fn: setCategories, getState } = createSetCategories([]);
      const { result } = renderHook(() =>
        useDynamicStudentFetching(setCategories, {
          apiClient,
          fetchClassesByFilters,
        })
      );

      // Select a série -> populates turma
      await result.current.handleCategoriesChange(
        buildCategories({ escola: ['s1'], serie: ['y1'] })
      );
      expect(getCategory(getState(), 'turma').itens).toHaveLength(2);

      // Deselect all séries -> turma reset to []
      await result.current.handleCategoriesChange(
        buildCategories({ escola: ['s1'], serie: [] })
      );
      expect(getCategory(getState(), 'turma').itens).toEqual([]);
    });

    it('drops a stale class response superseded by a newer change', async () => {
      const apiClient = createMockApiClient();
      let resolveFirst!: (value: Class[]) => void;
      const firstResponse = new Promise<Class[]>((resolve) => {
        resolveFirst = resolve;
      });
      const staleClasses: Class[] = [
        { id: 'stale', name: 'Stale', schoolYearId: 'y1' },
      ];
      const freshClasses: Class[] = [
        { id: 'fresh', name: 'Fresh', schoolYearId: 'y2' },
      ];
      // Resolve by input (not call order) so the test is deterministic under
      // concurrent async: the y1 (older) request stays pending, y2 resolves.
      const fetchClassesByFilters = jest
        .fn<Promise<Class[]>, [BaseApiClient, { schoolYearIds?: string[] }]>()
        .mockImplementation((_api, filters) =>
          filters.schoolYearIds?.includes('y1')
            ? firstResponse
            : Promise.resolve(freshClasses)
        );

      const { fn: setCategories, getState } = createSetCategories([]);
      const { result } = renderHook(() =>
        useDynamicStudentFetching(setCategories, {
          apiClient,
          fetchClassesByFilters,
        })
      );

      // First change starts a fetch that will resolve LATE
      const firstCall = result.current.handleCategoriesChange(
        buildCategories({ escola: ['s1'], serie: ['y1'] })
      );
      // Second change supersedes it and resolves immediately
      await result.current.handleCategoriesChange(
        buildCategories({ escola: ['s1'], serie: ['y2'] })
      );

      // Now let the stale (first) response resolve
      resolveFirst(staleClasses);
      await firstCall;

      const turma = getCategory(getState(), 'turma');
      expect(turma.itens).toEqual([
        { id: 'fresh', name: 'Fresh', schoolYearId: 'y2' },
      ]);
    });

    it('clears turma on class fetch error and reports via onError', async () => {
      const apiClient = createMockApiClient();
      const error = new Error('boom');
      const fetchClassesByFilters = jest
        .fn<Promise<Class[]>, [BaseApiClient, unknown]>()
        .mockRejectedValue(error);
      const onError = jest.fn();

      const { fn: setCategories, getState } = createSetCategories([]);
      const { result } = renderHook(() =>
        useDynamicStudentFetching(setCategories, {
          apiClient,
          fetchClassesByFilters,
          onError,
        })
      );

      await result.current.handleCategoriesChange(
        buildCategories(
          { escola: ['s1'], serie: ['y1'] },
          { turma: [{ id: 'c1', name: 'Turma A', schoolYearId: 'y1' }] }
        )
      );

      expect(onError).toHaveBeenCalledWith(error);
      expect(getCategory(getState(), 'turma').itens).toEqual([]);
    });
  });

  describe('dynamic aluno (student) fetching', () => {
    it('fetches students when a turma is selected and writes them into students.itens', async () => {
      const apiClient = createMockApiClient();
      const fetchClassesByFilters = jest
        .fn<Promise<Class[]>, [BaseApiClient, unknown]>()
        .mockResolvedValue([]);
      const fetchStudentsByFilters = jest
        .fn<Promise<StudentWithNestedData[]>, [unknown]>()
        .mockResolvedValue(sampleStudents);

      const { fn: setCategories, getState } = createSetCategories([]);
      const { result } = renderHook(() =>
        useDynamicStudentFetching(setCategories, {
          apiClient,
          fetchClassesByFilters,
          fetchStudentsByFilters,
        })
      );

      await result.current.handleCategoriesChange(
        buildCategories({ escola: ['s1'], serie: ['y1'], turma: ['c1'] })
      );

      expect(fetchStudentsByFilters).toHaveBeenCalledWith({
        schoolIds: ['s1'],
        schoolYearIds: ['y1'],
        classIds: ['c1'],
      });

      const students = getCategory(getState(), 'students');
      expect(students.itens).toEqual([
        {
          id: 'ui1-c1',
          name: 'Aluno 1',
          classId: 'c1',
          schoolId: 's1',
          schoolYearId: 'y1',
          studentId: 'st1',
          userInstitutionId: 'ui1',
          escolaId: 's1',
          serieId: 'y1',
          turmaId: 'c1',
        },
      ]);
    });

    it('clears students when no turma is selected after a change', async () => {
      const apiClient = createMockApiClient();
      const fetchStudentsByFilters = jest
        .fn<Promise<StudentWithNestedData[]>, [unknown]>()
        .mockResolvedValue(sampleStudents);

      const { fn: setCategories, getState } = createSetCategories([]);
      const { result } = renderHook(() =>
        useDynamicStudentFetching(setCategories, {
          apiClient,
          fetchStudentsByFilters,
        })
      );

      await result.current.handleCategoriesChange(
        buildCategories(
          { escola: ['s1'], serie: ['y1'] },
          { students: [{ id: 'stale-student', name: 'x' }] }
        )
      );

      expect(fetchStudentsByFilters).not.toHaveBeenCalled();
      expect(getCategory(getState(), 'students').itens).toEqual([]);
    });

    it('drops a stale student response superseded by a newer change', async () => {
      const apiClient = createMockApiClient();
      let resolveFirst!: (value: StudentWithNestedData[]) => void;
      const firstResponse = new Promise<StudentWithNestedData[]>((resolve) => {
        resolveFirst = resolve;
      });
      const staleStudents: StudentWithNestedData[] = [
        { ...sampleStudents[0], id: 'stale', userInstitutionId: 'stale-ui' },
      ];
      // Resolve by input (not call order) so the test is deterministic under
      // concurrent async: the c1 (older) request stays pending, c2 resolves.
      const fetchStudentsByFilters = jest
        .fn<Promise<StudentWithNestedData[]>, [{ classIds?: string[] }]>()
        .mockImplementation((filters) =>
          filters.classIds?.includes('c1')
            ? firstResponse
            : Promise.resolve(sampleStudents)
        );
      const fetchClassesByFilters = jest
        .fn<Promise<Class[]>, [BaseApiClient, unknown]>()
        .mockResolvedValue([]);

      const { fn: setCategories, getState } = createSetCategories([]);
      const { result } = renderHook(() =>
        useDynamicStudentFetching(setCategories, {
          apiClient,
          fetchStudentsByFilters,
          fetchClassesByFilters,
        })
      );

      // Prime school/série so the two racing changes only toggle turma and thus
      // never trigger a class fetch (whose await would otherwise reorder the
      // student request ids).
      await result.current.handleCategoriesChange(
        buildCategories({ escola: ['s1'], serie: ['y1'] })
      );

      const firstCall = result.current.handleCategoriesChange(
        buildCategories({ escola: ['s1'], serie: ['y1'], turma: ['c1'] })
      );
      await result.current.handleCategoriesChange(
        buildCategories({ escola: ['s1'], serie: ['y1'], turma: ['c2'] })
      );

      resolveFirst(staleStudents);
      await firstCall;

      expect(getCategory(getState(), 'students').itens).toEqual([
        {
          id: 'ui1-c1',
          name: 'Aluno 1',
          classId: 'c1',
          schoolId: 's1',
          schoolYearId: 'y1',
          studentId: 'st1',
          userInstitutionId: 'ui1',
          escolaId: 's1',
          serieId: 'y1',
          turmaId: 'c1',
        },
      ]);
    });

    it('clears students on fetch error and reports via onError', async () => {
      const apiClient = createMockApiClient();
      const error = new Error('student boom');
      const fetchStudentsByFilters = jest
        .fn<Promise<StudentWithNestedData[]>, [unknown]>()
        .mockRejectedValue(error);
      const onError = jest.fn();

      const { fn: setCategories, getState } = createSetCategories([]);
      const { result } = renderHook(() =>
        useDynamicStudentFetching(setCategories, {
          apiClient,
          fetchStudentsByFilters,
          onError,
        })
      );

      await result.current.handleCategoriesChange(
        buildCategories(
          { escola: ['s1'], serie: ['y1'], turma: ['c1'] },
          { students: [{ id: 'old', name: 'old' }] }
        )
      );

      expect(onError).toHaveBeenCalledWith(error);
      expect(getCategory(getState(), 'students').itens).toEqual([]);
    });
  });

  describe('only-student-toggle changes', () => {
    it('does not refetch classes or students when only student selection changes', async () => {
      const apiClient = createMockApiClient();
      const fetchClassesByFilters = jest
        .fn<Promise<Class[]>, [BaseApiClient, unknown]>()
        .mockResolvedValue(sampleClasses);
      const fetchStudentsByFilters = jest
        .fn<Promise<StudentWithNestedData[]>, [unknown]>()
        .mockResolvedValue(sampleStudents);

      const { fn: setCategories } = createSetCategories([]);
      const { result } = renderHook(() =>
        useDynamicStudentFetching(setCategories, {
          apiClient,
          fetchClassesByFilters,
          fetchStudentsByFilters,
        })
      );

      // First change selects turma -> fetches both classes and students
      await result.current.handleCategoriesChange(
        buildCategories({ escola: ['s1'], serie: ['y1'], turma: ['c1'] })
      );
      fetchClassesByFilters.mockClear();
      fetchStudentsByFilters.mockClear();

      // Second change toggles only the student selection
      await result.current.handleCategoriesChange(
        buildCategories({
          escola: ['s1'],
          serie: ['y1'],
          turma: ['c1'],
          students: ['ui1-c1'],
        })
      );

      expect(fetchClassesByFilters).not.toHaveBeenCalled();
      expect(fetchStudentsByFilters).not.toHaveBeenCalled();
    });
  });

  describe('functional write-backs do not clobber each other', () => {
    it('the class write-back only replaces turma, preserving a concurrent students write', async () => {
      const apiClient = createMockApiClient();
      const fetchClassesByFilters = jest
        .fn<Promise<Class[]>, [BaseApiClient, unknown]>()
        .mockResolvedValue(sampleClasses);

      const { fn: setCategories } = createSetCategories([]);
      const { result } = renderHook(() =>
        useDynamicStudentFetching(setCategories, {
          apiClient,
          fetchClassesByFilters,
        })
      );

      await result.current.handleCategoriesChange(
        buildCategories({ escola: ['s1'], serie: ['y1'] })
      );

      // Find the functional updater that writes classes into turma
      const classUpdater = setCategories.mock.calls
        .map((call) => call[0])
        .filter(
          (arg): arg is (prev: CategoryConfig[]) => CategoryConfig[] =>
            typeof arg === 'function'
        )
        .find((fnArg) => {
          const out = fnArg(buildCategories());
          return getCategory(out, 'turma').itens!.length > 0;
        });
      expect(classUpdater).toBeDefined();

      // Apply it to a state that already has a students write -> students preserved
      const stateWithStudents = buildCategories(
        {},
        { students: [{ id: 'ui1-c1', name: 'Aluno 1' }] }
      );
      const next = classUpdater!(stateWithStudents);

      expect(getCategory(next, 'turma').itens).toEqual([
        { id: 'c1', name: 'Turma A', schoolYearId: 'y1' },
        { id: 'c2', name: 'Turma B', schoolYearId: 'y1' },
      ]);
      expect(getCategory(next, 'students').itens).toEqual([
        { id: 'ui1-c1', name: 'Aluno 1' },
      ]);
    });

    it('the student write-back only replaces students, preserving a concurrent turma write', async () => {
      const apiClient = createMockApiClient();
      const fetchClassesByFilters = jest
        .fn<Promise<Class[]>, [BaseApiClient, unknown]>()
        .mockResolvedValue([]);
      const fetchStudentsByFilters = jest
        .fn<Promise<StudentWithNestedData[]>, [unknown]>()
        .mockResolvedValue(sampleStudents);

      const { fn: setCategories } = createSetCategories([]);
      const { result } = renderHook(() =>
        useDynamicStudentFetching(setCategories, {
          apiClient,
          fetchClassesByFilters,
          fetchStudentsByFilters,
        })
      );

      await result.current.handleCategoriesChange(
        buildCategories({ escola: ['s1'], serie: ['y1'], turma: ['c1'] })
      );

      const studentUpdater = setCategories.mock.calls
        .map((call) => call[0])
        .filter(
          (arg): arg is (prev: CategoryConfig[]) => CategoryConfig[] =>
            typeof arg === 'function'
        )
        .find((fnArg) => {
          const out = fnArg(buildCategories());
          return getCategory(out, 'students').itens!.length > 0;
        });
      expect(studentUpdater).toBeDefined();

      // Apply it to a state that already has a turma write -> turma preserved
      const stateWithTurma = buildCategories(
        {},
        { turma: [{ id: 'c1', name: 'Turma A', schoolYearId: 'y1' }] }
      );
      const next = studentUpdater!(stateWithTurma);

      expect(getCategory(next, 'turma').itens).toEqual([
        { id: 'c1', name: 'Turma A', schoolYearId: 'y1' },
      ]);
      expect(getCategory(next, 'students').itens).toHaveLength(1);
    });

    it('a single cascade with both fetches non-empty ends with BOTH turma and students populated', async () => {
      const apiClient = createMockApiClient();
      const fetchClassesByFilters = jest
        .fn<Promise<Class[]>, [BaseApiClient, unknown]>()
        .mockResolvedValue(sampleClasses);
      const fetchStudentsByFilters = jest
        .fn<Promise<StudentWithNestedData[]>, [unknown]>()
        .mockResolvedValue(sampleStudents);

      const { fn: setCategories, getState } = createSetCategories([]);
      const { result } = renderHook(() =>
        useDynamicStudentFetching(setCategories, {
          apiClient,
          fetchClassesByFilters,
          fetchStudentsByFilters,
        })
      );

      // Selecting escola + série + turma in one change fetches BOTH classes and
      // students; the composed final state must carry both, neither clobbering
      // the other.
      await result.current.handleCategoriesChange(
        buildCategories({ escola: ['s1'], serie: ['y1'], turma: ['c1'] })
      );

      expect(fetchClassesByFilters).toHaveBeenCalledTimes(1);
      expect(fetchStudentsByFilters).toHaveBeenCalledTimes(1);

      expect(getCategory(getState(), 'turma').itens).toEqual([
        { id: 'c1', name: 'Turma A', schoolYearId: 'y1' },
        { id: 'c2', name: 'Turma B', schoolYearId: 'y1' },
      ]);
      expect(getCategory(getState(), 'students').itens).toEqual([
        {
          id: 'ui1-c1',
          name: 'Aluno 1',
          classId: 'c1',
          schoolId: 's1',
          schoolYearId: 'y1',
          studentId: 'st1',
          userInstitutionId: 'ui1',
          escolaId: 's1',
          serieId: 'y1',
          turmaId: 'c1',
        },
      ]);
    });

    it('the eager selection commit preserves async-loaded itens against a later stale snapshot', async () => {
      const apiClient = createMockApiClient();
      const fetchClassesByFilters = jest
        .fn<Promise<Class[]>, [BaseApiClient, unknown]>()
        .mockResolvedValue(sampleClasses);
      const fetchStudentsByFilters = jest
        .fn<Promise<StudentWithNestedData[]>, [unknown]>()
        .mockResolvedValue([]);

      const { fn: setCategories, getState } = createSetCategories([]);
      const { result } = renderHook(() =>
        useDynamicStudentFetching(setCategories, {
          apiClient,
          fetchClassesByFilters,
          fetchStudentsByFilters,
        })
      );

      // Load turmas for série y1
      await result.current.handleCategoriesChange(
        buildCategories({ escola: ['s1'], serie: ['y1'] })
      );
      expect(getCategory(getState(), 'turma').itens).toHaveLength(2);

      // A later change that only toggles a student selection carries a STALE
      // snapshot with empty turma.itens. The eager commit must NOT revert the
      // async-loaded turmas (only its selectedIds should be committed).
      await result.current.handleCategoriesChange(
        buildCategories({
          escola: ['s1'],
          serie: ['y1'],
          students: ['ui1-c1'],
        })
      );

      expect(getCategory(getState(), 'turma').itens).toHaveLength(2);
    });
  });
});
