import { renderHook, act } from '@testing-library/react';
import { useTableFilter } from './useTableFilter';
import type { FilterConfig } from './useTableFilter';

const mockInitialConfigs: FilterConfig[] = [
  {
    key: 'academic',
    label: 'Dados Acadêmicos',
    categories: [
      {
        key: 'escola',
        label: 'Escola',
        selectedIds: [],
        itens: [
          { id: '1', name: 'Escola 1' },
          { id: '2', name: 'Escola 2' },
        ],
      },
      {
        key: 'serie',
        label: 'Série',
        selectedIds: [],
        dependsOn: ['escola'],
        itens: [
          { id: '1', name: 'Série 1', escolaId: '1' },
          { id: '2', name: 'Série 2', escolaId: '1' },
          { id: '3', name: 'Série 3', escolaId: '2' },
        ],
        filteredBy: [{ key: 'escola', internalField: 'escolaId' }],
      },
    ],
  },
  {
    key: 'content',
    label: 'Conteúdo',
    categories: [
      {
        key: 'materia',
        label: 'Matéria',
        selectedIds: [],
        itens: [
          { id: '1', name: 'Matemática' },
          { id: '2', name: 'Português' },
        ],
      },
    ],
  },
];

describe('useTableFilter', () => {
  beforeEach(() => {
    // Mock history.replaceState
    globalThis.history.replaceState = jest.fn();

    // Reset globalThis.location with proper URL structure
    delete (globalThis as { location?: unknown }).location;
    Object.defineProperty(globalThis, 'location', {
      value: {
        href: 'http://localhost/',
        search: '',
        origin: 'http://localhost',
        pathname: '/',
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with provided configs', () => {
      const { result } = renderHook(() => useTableFilter(mockInitialConfigs));

      expect(result.current.filterConfigs).toEqual(mockInitialConfigs);
      expect(result.current.hasActiveFilters).toBe(false);
      expect(result.current.activeFilters).toEqual({});
    });

    it('should initialize with URL state when syncWithUrl is enabled', () => {
      Object.defineProperty(globalThis, 'location', {
        value: {
          href: 'http://localhost/?filter_escola=1,2&filter_materia=1',
          search: '?filter_escola=1,2&filter_materia=1',
          origin: 'http://localhost',
          pathname: '/',
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() =>
        useTableFilter(mockInitialConfigs, { syncWithUrl: true })
      );

      expect(result.current.filterConfigs[0].categories[0].selectedIds).toEqual(
        ['1', '2']
      );
      expect(result.current.filterConfigs[1].categories[0].selectedIds).toEqual(
        ['1']
      );
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should not read URL when syncWithUrl is false', () => {
      Object.defineProperty(globalThis, 'location', {
        value: {
          href: 'http://localhost/?filter_escola=1,2',
          search: '?filter_escola=1,2',
          origin: 'http://localhost',
          pathname: '/',
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() =>
        useTableFilter(mockInitialConfigs, { syncWithUrl: false })
      );

      expect(result.current.filterConfigs[0].categories[0].selectedIds).toEqual(
        []
      );
    });

    it('should handle invalid URL parameters gracefully', () => {
      Object.defineProperty(globalThis, 'location', {
        value: {
          href: 'http://localhost/?filter_nonexistent=1,2',
          search: '?filter_nonexistent=1,2',
          origin: 'http://localhost',
          pathname: '/',
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() =>
        useTableFilter(mockInitialConfigs, { syncWithUrl: true })
      );

      expect(result.current.hasActiveFilters).toBe(false);
    });

    it('should handle empty URL parameter values', () => {
      Object.defineProperty(globalThis, 'location', {
        value: {
          href: 'http://localhost/?filter_escola=',
          search: '?filter_escola=',
          origin: 'http://localhost',
          pathname: '/',
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() =>
        useTableFilter(mockInitialConfigs, { syncWithUrl: true })
      );

      expect(result.current.filterConfigs[0].categories[0].selectedIds).toEqual(
        []
      );
    });
  });

  describe('updateFilters', () => {
    it('should update filter configs', () => {
      const { result } = renderHook(() => useTableFilter(mockInitialConfigs));

      const updatedConfigs = [
        {
          ...mockInitialConfigs[0],
          categories: [
            { ...mockInitialConfigs[0].categories[0], selectedIds: ['1'] },
            mockInitialConfigs[0].categories[1],
          ],
        },
        mockInitialConfigs[1],
      ];

      act(() => {
        result.current.updateFilters(updatedConfigs);
      });

      expect(result.current.filterConfigs[0].categories[0].selectedIds).toEqual(
        ['1']
      );
    });

    it('should not update URL immediately (only on applyFilters)', () => {
      const { result } = renderHook(() =>
        useTableFilter(mockInitialConfigs, { syncWithUrl: true })
      );

      const updatedConfigs = [
        {
          ...mockInitialConfigs[0],
          categories: [
            { ...mockInitialConfigs[0].categories[0], selectedIds: ['1'] },
            mockInitialConfigs[0].categories[1],
          ],
        },
        mockInitialConfigs[1],
      ];

      act(() => {
        result.current.updateFilters(updatedConfigs);
      });

      expect(globalThis.history.replaceState).not.toHaveBeenCalled();
    });
  });

  describe('applyFilters', () => {
    it('should update URL with filter parameters when syncWithUrl is enabled', () => {
      const { result } = renderHook(() =>
        useTableFilter(mockInitialConfigs, { syncWithUrl: true })
      );

      const updatedConfigs = [
        {
          ...mockInitialConfigs[0],
          categories: [
            { ...mockInitialConfigs[0].categories[0], selectedIds: ['1', '2'] },
            { ...mockInitialConfigs[0].categories[1], selectedIds: ['3'] },
          ],
        },
        {
          ...mockInitialConfigs[1],
          categories: [
            { ...mockInitialConfigs[1].categories[0], selectedIds: ['1'] },
          ],
        },
      ];

      act(() => {
        result.current.updateFilters(updatedConfigs);
      });

      act(() => {
        result.current.applyFilters();
      });

      const lastCall = (globalThis.history.replaceState as jest.Mock).mock
        .calls[0];
      const urlString = lastCall[2] as string;

      expect(urlString).toContain('filter_escola=1');
      expect(urlString).toContain('filter_serie=3');
      expect(urlString).toContain('filter_materia=1');
    });

    it('should not update URL when syncWithUrl is false', () => {
      const { result } = renderHook(() =>
        useTableFilter(mockInitialConfigs, { syncWithUrl: false })
      );

      const updatedConfigs = [
        {
          ...mockInitialConfigs[0],
          categories: [
            { ...mockInitialConfigs[0].categories[0], selectedIds: ['1'] },
            mockInitialConfigs[0].categories[1],
          ],
        },
        mockInitialConfigs[1],
      ];

      act(() => {
        result.current.updateFilters(updatedConfigs);
      });

      act(() => {
        result.current.applyFilters();
      });

      expect(globalThis.history.replaceState).not.toHaveBeenCalled();
    });

    it('should remove URL parameters for cleared categories', () => {
      Object.defineProperty(globalThis, 'location', {
        value: {
          href: 'http://localhost/?filter_escola=1&filter_materia=2',
          search: '?filter_escola=1&filter_materia=2',
          origin: 'http://localhost',
          pathname: '/',
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() =>
        useTableFilter(mockInitialConfigs, { syncWithUrl: true })
      );

      const updatedConfigs = [
        {
          ...mockInitialConfigs[0],
          categories: [
            { ...mockInitialConfigs[0].categories[0], selectedIds: [] },
            mockInitialConfigs[0].categories[1],
          ],
        },
        {
          ...mockInitialConfigs[1],
          categories: [
            { ...mockInitialConfigs[1].categories[0], selectedIds: ['2'] },
          ],
        },
      ];

      act(() => {
        result.current.updateFilters(updatedConfigs);
      });

      act(() => {
        result.current.applyFilters();
      });

      const lastCall = (globalThis.history.replaceState as jest.Mock).mock
        .calls[0];
      const urlString = lastCall[2] as string;

      expect(urlString).not.toContain('filter_escola');
      expect(urlString).toContain('filter_materia=2');
    });

    it('should preserve other URL parameters', () => {
      Object.defineProperty(globalThis, 'location', {
        value: {
          href: 'http://localhost/?sortBy=name&sort=ASC&page=2',
          search: '?sortBy=name&sort=ASC&page=2',
          origin: 'http://localhost',
          pathname: '/',
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() =>
        useTableFilter(mockInitialConfigs, { syncWithUrl: true })
      );

      const updatedConfigs = [
        {
          ...mockInitialConfigs[0],
          categories: [
            { ...mockInitialConfigs[0].categories[0], selectedIds: ['1'] },
            mockInitialConfigs[0].categories[1],
          ],
        },
        mockInitialConfigs[1],
      ];

      act(() => {
        result.current.updateFilters(updatedConfigs);
      });

      act(() => {
        result.current.applyFilters();
      });

      const lastCall = (globalThis.history.replaceState as jest.Mock).mock
        .calls[0];
      const urlString = lastCall[2] as string;

      expect(urlString).toContain('sortBy=name');
      expect(urlString).toContain('sort=ASC');
      expect(urlString).toContain('page=2');
      expect(urlString).toContain('filter_escola=1');
    });
  });

  describe('clearFilters', () => {
    it('should clear all selected filters', () => {
      const { result } = renderHook(() => useTableFilter(mockInitialConfigs));

      const updatedConfigs = [
        {
          ...mockInitialConfigs[0],
          categories: [
            { ...mockInitialConfigs[0].categories[0], selectedIds: ['1', '2'] },
            { ...mockInitialConfigs[0].categories[1], selectedIds: ['3'] },
          ],
        },
        {
          ...mockInitialConfigs[1],
          categories: [
            { ...mockInitialConfigs[1].categories[0], selectedIds: ['1'] },
          ],
        },
      ];

      act(() => {
        result.current.updateFilters(updatedConfigs);
      });

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.filterConfigs[0].categories[0].selectedIds).toEqual(
        []
      );
      expect(result.current.filterConfigs[0].categories[1].selectedIds).toEqual(
        []
      );
      expect(result.current.filterConfigs[1].categories[0].selectedIds).toEqual(
        []
      );
      expect(result.current.hasActiveFilters).toBe(false);
    });

    it('should clear URL parameters when syncWithUrl is enabled', () => {
      Object.defineProperty(globalThis, 'location', {
        value: {
          href: 'http://localhost/?filter_escola=1&filter_materia=2',
          search: '?filter_escola=1&filter_materia=2',
          origin: 'http://localhost',
          pathname: '/',
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() =>
        useTableFilter(mockInitialConfigs, { syncWithUrl: true })
      );

      act(() => {
        result.current.clearFilters();
      });

      const lastCall = (globalThis.history.replaceState as jest.Mock).mock
        .calls[0];
      const urlString = lastCall[2] as string;

      expect(urlString).not.toContain('filter_escola');
      expect(urlString).not.toContain('filter_materia');
    });

    it('should preserve other URL parameters when clearing', () => {
      Object.defineProperty(globalThis, 'location', {
        value: {
          href: 'http://localhost/?sortBy=name&filter_escola=1&page=2',
          search: '?sortBy=name&filter_escola=1&page=2',
          origin: 'http://localhost',
          pathname: '/',
        },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() =>
        useTableFilter(mockInitialConfigs, { syncWithUrl: true })
      );

      act(() => {
        result.current.clearFilters();
      });

      const lastCall = (globalThis.history.replaceState as jest.Mock).mock
        .calls[0];
      const urlString = lastCall[2] as string;

      expect(urlString).toContain('sortBy=name');
      expect(urlString).toContain('page=2');
      expect(urlString).not.toContain('filter_escola');
    });
  });

  describe('activeFilters', () => {
    it('should calculate active filters correctly', () => {
      const { result } = renderHook(() => useTableFilter(mockInitialConfigs));

      const updatedConfigs = [
        {
          ...mockInitialConfigs[0],
          categories: [
            { ...mockInitialConfigs[0].categories[0], selectedIds: ['1', '2'] },
            { ...mockInitialConfigs[0].categories[1], selectedIds: [] },
          ],
        },
        {
          ...mockInitialConfigs[1],
          categories: [
            { ...mockInitialConfigs[1].categories[0], selectedIds: ['1'] },
          ],
        },
      ];

      act(() => {
        result.current.updateFilters(updatedConfigs);
      });

      expect(result.current.activeFilters).toEqual({
        escola: ['1', '2'],
        materia: ['1'],
      });
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should return empty object when no filters are active', () => {
      const { result } = renderHook(() => useTableFilter(mockInitialConfigs));

      expect(result.current.activeFilters).toEqual({});
      expect(result.current.hasActiveFilters).toBe(false);
    });
  });

  describe('initialConfigs sync', () => {
    it('should preserve valid selections when initialConfigs items change', () => {
      const { result, rerender } = renderHook(
        ({ configs }) => useTableFilter(configs),
        { initialProps: { configs: mockInitialConfigs } }
      );

      // Set selections
      const updatedConfigs = [
        {
          ...mockInitialConfigs[0],
          categories: [
            { ...mockInitialConfigs[0].categories[0], selectedIds: ['1'] },
            mockInitialConfigs[0].categories[1],
          ],
        },
        mockInitialConfigs[1],
      ];

      act(() => {
        result.current.updateFilters(updatedConfigs);
      });

      expect(result.current.filterConfigs[0].categories[0].selectedIds).toEqual(
        ['1']
      );

      // Rerender with same items - selection should be preserved
      rerender({ configs: mockInitialConfigs });

      expect(result.current.filterConfigs[0].categories[0].selectedIds).toEqual(
        ['1']
      );
    });

    it('should drop stale selections when items are removed from initialConfigs', () => {
      const { result, rerender } = renderHook(
        ({ configs }) => useTableFilter(configs),
        { initialProps: { configs: mockInitialConfigs } }
      );

      // Select id '2' in escola
      const updatedConfigs = [
        {
          ...mockInitialConfigs[0],
          categories: [
            { ...mockInitialConfigs[0].categories[0], selectedIds: ['2'] },
            mockInitialConfigs[0].categories[1],
          ],
        },
        mockInitialConfigs[1],
      ];

      act(() => {
        result.current.updateFilters(updatedConfigs);
      });

      // Now rerender with initialConfigs that no longer have id '2' in escola
      const narrowedConfigs: FilterConfig[] = [
        {
          ...mockInitialConfigs[0],
          categories: [
            {
              ...mockInitialConfigs[0].categories[0],
              itens: [{ id: '1', name: 'Escola 1' }], // removed Escola 2
            },
            mockInitialConfigs[0].categories[1],
          ],
        },
        mockInitialConfigs[1],
      ];

      rerender({ configs: narrowedConfigs });

      // Selection '2' should be dropped because it no longer exists in itens
      expect(result.current.filterConfigs[0].categories[0].selectedIds).toEqual(
        []
      );
    });
  });

  describe('popstate event', () => {
    it('should update state when browser back/forward is used', () => {
      Object.defineProperty(globalThis, 'location', {
        value: {
          href: 'http://localhost/?filter_escola=1',
          search: '?filter_escola=1',
          origin: 'http://localhost',
          pathname: '/',
        },
        writable: true,
        configurable: true,
      });

      const { result, rerender } = renderHook(() =>
        useTableFilter(mockInitialConfigs, { syncWithUrl: true })
      );

      expect(result.current.filterConfigs[0].categories[0].selectedIds).toEqual(
        ['1']
      );

      // Simulate browser back button
      Object.defineProperty(globalThis, 'location', {
        value: {
          href: 'http://localhost/',
          search: '',
          origin: 'http://localhost',
          pathname: '/',
        },
        writable: true,
        configurable: true,
      });

      act(() => {
        globalThis.dispatchEvent(new Event('popstate'));
      });

      rerender();

      expect(result.current.filterConfigs[0].categories[0].selectedIds).toEqual(
        []
      );
    });
  });
});
