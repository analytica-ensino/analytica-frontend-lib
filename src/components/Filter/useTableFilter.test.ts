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
    window.history.replaceState = jest.fn();

    // Reset window.location with proper URL structure
    delete (window as { location?: unknown }).location;
    Object.defineProperty(window, 'location', {
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
      Object.defineProperty(window, 'location', {
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
      Object.defineProperty(window, 'location', {
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
      Object.defineProperty(window, 'location', {
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
      Object.defineProperty(window, 'location', {
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

      expect(window.history.replaceState).not.toHaveBeenCalled();
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

      const lastCall = (window.history.replaceState as jest.Mock).mock.calls[0];
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

      expect(window.history.replaceState).not.toHaveBeenCalled();
    });

    it('should remove URL parameters for cleared categories', () => {
      Object.defineProperty(window, 'location', {
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

      const lastCall = (window.history.replaceState as jest.Mock).mock.calls[0];
      const urlString = lastCall[2] as string;

      expect(urlString).not.toContain('filter_escola');
      expect(urlString).toContain('filter_materia=2');
    });

    it('should preserve other URL parameters', () => {
      Object.defineProperty(window, 'location', {
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

      const lastCall = (window.history.replaceState as jest.Mock).mock.calls[0];
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
      Object.defineProperty(window, 'location', {
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

      const lastCall = (window.history.replaceState as jest.Mock).mock.calls[0];
      const urlString = lastCall[2] as string;

      expect(urlString).not.toContain('filter_escola');
      expect(urlString).not.toContain('filter_materia');
    });

    it('should preserve other URL parameters when clearing', () => {
      Object.defineProperty(window, 'location', {
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

      const lastCall = (window.history.replaceState as jest.Mock).mock.calls[0];
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

  describe('popstate event', () => {
    it('should update state when browser back/forward is used', () => {
      Object.defineProperty(window, 'location', {
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
      Object.defineProperty(window, 'location', {
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
        window.dispatchEvent(new Event('popstate'));
      });

      rerender();

      expect(result.current.filterConfigs[0].categories[0].selectedIds).toEqual(
        []
      );
    });
  });
});
