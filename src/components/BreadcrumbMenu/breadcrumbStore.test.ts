import { renderHook, act } from '@testing-library/react';
import { useBreadcrumbStore, useBreadcrumb } from './breadcrumbStore';
import type { BreadcrumbItem } from './breadcrumbStore';

describe('breadcrumbStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useBreadcrumbStore.setState({ breadcrumbs: {} });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have empty breadcrumbs object initially', () => {
      const state = useBreadcrumbStore.getState();
      expect(state.breadcrumbs).toEqual({});
    });
  });

  describe('setBreadcrumbs', () => {
    it('should set breadcrumbs for a namespace', () => {
      const items: BreadcrumbItem[] = [
        { id: 'home', name: 'Home', url: '/' },
        { id: 'page', name: 'Page', url: '/page' },
      ];

      act(() => {
        useBreadcrumbStore.getState().setBreadcrumbs('test', items);
      });

      const state = useBreadcrumbStore.getState();
      expect(state.breadcrumbs['test']).toEqual(items);
    });

    it('should replace existing breadcrumbs for the same namespace', () => {
      const initialItems: BreadcrumbItem[] = [
        { id: 'home', name: 'Home', url: '/' },
      ];
      const newItems: BreadcrumbItem[] = [
        { id: 'about', name: 'About', url: '/about' },
      ];

      act(() => {
        useBreadcrumbStore.getState().setBreadcrumbs('test', initialItems);
        useBreadcrumbStore.getState().setBreadcrumbs('test', newItems);
      });

      const state = useBreadcrumbStore.getState();
      expect(state.breadcrumbs['test']).toEqual(newItems);
    });

    it('should not affect breadcrumbs in different namespaces', () => {
      const items1: BreadcrumbItem[] = [{ id: 'home', name: 'Home', url: '/' }];
      const items2: BreadcrumbItem[] = [
        { id: 'about', name: 'About', url: '/about' },
      ];

      act(() => {
        useBreadcrumbStore.getState().setBreadcrumbs('namespace1', items1);
        useBreadcrumbStore.getState().setBreadcrumbs('namespace2', items2);
      });

      const state = useBreadcrumbStore.getState();
      expect(state.breadcrumbs['namespace1']).toEqual(items1);
      expect(state.breadcrumbs['namespace2']).toEqual(items2);
    });
  });

  describe('addBreadcrumb', () => {
    it('should add a breadcrumb to the end of the list', () => {
      const initial: BreadcrumbItem[] = [
        { id: 'home', name: 'Home', url: '/' },
      ];
      const newItem: BreadcrumbItem = {
        id: 'page',
        name: 'Page',
        url: '/page',
      };

      act(() => {
        useBreadcrumbStore.getState().setBreadcrumbs('test', initial);
        useBreadcrumbStore.getState().addBreadcrumb('test', newItem);
      });

      const state = useBreadcrumbStore.getState();
      expect(state.breadcrumbs['test']).toEqual([...initial, newItem]);
    });

    it('should create new array if namespace does not exist', () => {
      const newItem: BreadcrumbItem = { id: 'home', name: 'Home', url: '/' };

      act(() => {
        useBreadcrumbStore.getState().addBreadcrumb('test', newItem);
      });

      const state = useBreadcrumbStore.getState();
      expect(state.breadcrumbs['test']).toEqual([newItem]);
    });
  });

  describe('updateBreadcrumb', () => {
    it('should update specific breadcrumb fields', () => {
      const items: BreadcrumbItem[] = [
        { id: 'home', name: 'Home', url: '/' },
        { id: 'page', name: 'Page', url: '/page' },
      ];

      act(() => {
        useBreadcrumbStore.getState().setBreadcrumbs('test', items);
        useBreadcrumbStore.getState().updateBreadcrumb('test', 'page', {
          name: 'Updated Page',
        });
      });

      const state = useBreadcrumbStore.getState();
      expect(state.breadcrumbs['test'][1]).toEqual({
        id: 'page',
        name: 'Updated Page',
        url: '/page',
      });
    });

    it('should update multiple fields at once', () => {
      const items: BreadcrumbItem[] = [{ id: 'home', name: 'Home', url: '/' }];

      act(() => {
        useBreadcrumbStore.getState().setBreadcrumbs('test', items);
        useBreadcrumbStore.getState().updateBreadcrumb('test', 'home', {
          name: 'New Home',
          url: '/new-home',
        });
      });

      const state = useBreadcrumbStore.getState();
      expect(state.breadcrumbs['test'][0]).toEqual({
        id: 'home',
        name: 'New Home',
        url: '/new-home',
      });
    });

    it('should not update breadcrumbs if id is not found', () => {
      const items: BreadcrumbItem[] = [{ id: 'home', name: 'Home', url: '/' }];

      act(() => {
        useBreadcrumbStore.getState().setBreadcrumbs('test', items);
        useBreadcrumbStore.getState().updateBreadcrumb('test', 'nonexistent', {
          name: 'Updated',
        });
      });

      const state = useBreadcrumbStore.getState();
      expect(state.breadcrumbs['test']).toEqual(items);
    });
  });

  describe('removeBreadcrumbFrom', () => {
    it('should remove breadcrumb and all following breadcrumbs', () => {
      const items: BreadcrumbItem[] = [
        { id: 'home', name: 'Home', url: '/' },
        { id: 'page1', name: 'Page 1', url: '/page1' },
        { id: 'page2', name: 'Page 2', url: '/page2' },
        { id: 'page3', name: 'Page 3', url: '/page3' },
      ];

      act(() => {
        useBreadcrumbStore.getState().setBreadcrumbs('test', items);
        useBreadcrumbStore.getState().removeBreadcrumbFrom('test', 'page2');
      });

      const state = useBreadcrumbStore.getState();
      expect(state.breadcrumbs['test']).toEqual([
        { id: 'home', name: 'Home', url: '/' },
        { id: 'page1', name: 'Page 1', url: '/page1' },
      ]);
    });

    it('should not change state if id is not found', () => {
      const items: BreadcrumbItem[] = [{ id: 'home', name: 'Home', url: '/' }];

      act(() => {
        useBreadcrumbStore.getState().setBreadcrumbs('test', items);
        useBreadcrumbStore
          .getState()
          .removeBreadcrumbFrom('test', 'nonexistent');
      });

      const state = useBreadcrumbStore.getState();
      expect(state.breadcrumbs['test']).toEqual(items);
    });

    it('should handle removing the first breadcrumb', () => {
      const items: BreadcrumbItem[] = [
        { id: 'home', name: 'Home', url: '/' },
        { id: 'page', name: 'Page', url: '/page' },
      ];

      act(() => {
        useBreadcrumbStore.getState().setBreadcrumbs('test', items);
        useBreadcrumbStore.getState().removeBreadcrumbFrom('test', 'home');
      });

      const state = useBreadcrumbStore.getState();
      expect(state.breadcrumbs['test']).toEqual([]);
    });
  });

  describe('sliceBreadcrumbs', () => {
    it('should keep breadcrumbs up to and including the specified index', () => {
      const items: BreadcrumbItem[] = [
        { id: 'home', name: 'Home', url: '/' },
        { id: 'page1', name: 'Page 1', url: '/page1' },
        { id: 'page2', name: 'Page 2', url: '/page2' },
        { id: 'page3', name: 'Page 3', url: '/page3' },
      ];

      act(() => {
        useBreadcrumbStore.getState().setBreadcrumbs('test', items);
        useBreadcrumbStore.getState().sliceBreadcrumbs('test', 1);
      });

      const state = useBreadcrumbStore.getState();
      expect(state.breadcrumbs['test']).toEqual([
        { id: 'home', name: 'Home', url: '/' },
        { id: 'page1', name: 'Page 1', url: '/page1' },
      ]);
    });

    it('should keep all breadcrumbs when index is last element', () => {
      const items: BreadcrumbItem[] = [
        { id: 'home', name: 'Home', url: '/' },
        { id: 'page', name: 'Page', url: '/page' },
      ];

      act(() => {
        useBreadcrumbStore.getState().setBreadcrumbs('test', items);
        useBreadcrumbStore.getState().sliceBreadcrumbs('test', 1);
      });

      const state = useBreadcrumbStore.getState();
      expect(state.breadcrumbs['test']).toEqual(items);
    });

    it('should keep only first breadcrumb when index is 0', () => {
      const items: BreadcrumbItem[] = [
        { id: 'home', name: 'Home', url: '/' },
        { id: 'page', name: 'Page', url: '/page' },
      ];

      act(() => {
        useBreadcrumbStore.getState().setBreadcrumbs('test', items);
        useBreadcrumbStore.getState().sliceBreadcrumbs('test', 0);
      });

      const state = useBreadcrumbStore.getState();
      expect(state.breadcrumbs['test']).toEqual([
        { id: 'home', name: 'Home', url: '/' },
      ]);
    });
  });

  describe('clearBreadcrumbs', () => {
    it('should remove all breadcrumbs for a namespace', () => {
      const items: BreadcrumbItem[] = [{ id: 'home', name: 'Home', url: '/' }];

      act(() => {
        useBreadcrumbStore.getState().setBreadcrumbs('test', items);
        useBreadcrumbStore.getState().clearBreadcrumbs('test');
      });

      const state = useBreadcrumbStore.getState();
      expect(state.breadcrumbs['test']).toBeUndefined();
    });

    it('should not affect other namespaces', () => {
      const items1: BreadcrumbItem[] = [{ id: 'home', name: 'Home', url: '/' }];
      const items2: BreadcrumbItem[] = [
        { id: 'about', name: 'About', url: '/about' },
      ];

      act(() => {
        useBreadcrumbStore.getState().setBreadcrumbs('namespace1', items1);
        useBreadcrumbStore.getState().setBreadcrumbs('namespace2', items2);
        useBreadcrumbStore.getState().clearBreadcrumbs('namespace1');
      });

      const state = useBreadcrumbStore.getState();
      expect(state.breadcrumbs['namespace1']).toBeUndefined();
      expect(state.breadcrumbs['namespace2']).toEqual(items2);
    });
  });

  describe('getBreadcrumbs', () => {
    it('should return breadcrumbs for a namespace', () => {
      const items: BreadcrumbItem[] = [{ id: 'home', name: 'Home', url: '/' }];

      act(() => {
        useBreadcrumbStore.getState().setBreadcrumbs('test', items);
      });

      const breadcrumbs = useBreadcrumbStore.getState().getBreadcrumbs('test');
      expect(breadcrumbs).toEqual(items);
    });

    it('should return empty array if namespace does not exist', () => {
      const breadcrumbs = useBreadcrumbStore
        .getState()
        .getBreadcrumbs('nonexistent');
      expect(breadcrumbs).toEqual([]);
    });
  });

  describe('useBreadcrumb hook', () => {
    it('should return breadcrumbs for specific namespace', () => {
      const items: BreadcrumbItem[] = [{ id: 'home', name: 'Home', url: '/' }];

      const { result } = renderHook(() => useBreadcrumb('test'));

      act(() => {
        result.current.setBreadcrumbs(items);
      });

      expect(result.current.breadcrumbs).toEqual(items);
    });

    it('should provide wrapped methods for namespace', () => {
      const { result } = renderHook(() => useBreadcrumb('test'));

      expect(typeof result.current.setBreadcrumbs).toBe('function');
      expect(typeof result.current.addBreadcrumb).toBe('function');
      expect(typeof result.current.updateBreadcrumb).toBe('function');
      expect(typeof result.current.removeBreadcrumbFrom).toBe('function');
      expect(typeof result.current.sliceBreadcrumbs).toBe('function');
      expect(typeof result.current.clearBreadcrumbs).toBe('function');
    });

    it('should add breadcrumb through hook', () => {
      const { result } = renderHook(() => useBreadcrumb('test'));
      const newItem: BreadcrumbItem = { id: 'home', name: 'Home', url: '/' };

      act(() => {
        result.current.addBreadcrumb(newItem);
      });

      expect(result.current.breadcrumbs).toEqual([newItem]);
    });

    it('should update breadcrumb through hook', () => {
      const { result } = renderHook(() => useBreadcrumb('test'));
      const items: BreadcrumbItem[] = [{ id: 'home', name: 'Home', url: '/' }];

      act(() => {
        result.current.setBreadcrumbs(items);
        result.current.updateBreadcrumb('home', { name: 'Updated Home' });
      });

      expect(result.current.breadcrumbs[0].name).toBe('Updated Home');
    });

    it('should remove breadcrumb through hook', () => {
      const { result } = renderHook(() => useBreadcrumb('test'));
      const items: BreadcrumbItem[] = [
        { id: 'home', name: 'Home', url: '/' },
        { id: 'page', name: 'Page', url: '/page' },
      ];

      act(() => {
        result.current.setBreadcrumbs(items);
        result.current.removeBreadcrumbFrom('page');
      });

      expect(result.current.breadcrumbs).toEqual([
        { id: 'home', name: 'Home', url: '/' },
      ]);
    });

    it('should slice breadcrumbs through hook', () => {
      const { result } = renderHook(() => useBreadcrumb('test'));
      const items: BreadcrumbItem[] = [
        { id: 'home', name: 'Home', url: '/' },
        { id: 'page1', name: 'Page 1', url: '/page1' },
        { id: 'page2', name: 'Page 2', url: '/page2' },
      ];

      act(() => {
        result.current.setBreadcrumbs(items);
        result.current.sliceBreadcrumbs(1);
      });

      expect(result.current.breadcrumbs).toEqual([
        { id: 'home', name: 'Home', url: '/' },
        { id: 'page1', name: 'Page 1', url: '/page1' },
      ]);
    });

    it('should clear breadcrumbs through hook', () => {
      const { result } = renderHook(() => useBreadcrumb('test'));
      const items: BreadcrumbItem[] = [{ id: 'home', name: 'Home', url: '/' }];

      act(() => {
        result.current.setBreadcrumbs(items);
        result.current.clearBreadcrumbs();
      });

      expect(result.current.breadcrumbs).toEqual([]);
    });

    it('should return empty array for non-existent namespace', () => {
      const { result } = renderHook(() => useBreadcrumb('nonexistent'));

      expect(result.current.breadcrumbs).toEqual([]);
    });

    it('should isolate different namespace instances', () => {
      const { result: result1 } = renderHook(() => useBreadcrumb('namespace1'));
      const { result: result2 } = renderHook(() => useBreadcrumb('namespace2'));

      const items1: BreadcrumbItem[] = [
        { id: 'home1', name: 'Home 1', url: '/1' },
      ];
      const items2: BreadcrumbItem[] = [
        { id: 'home2', name: 'Home 2', url: '/2' },
      ];

      act(() => {
        result1.current.setBreadcrumbs(items1);
        result2.current.setBreadcrumbs(items2);
      });

      expect(result1.current.breadcrumbs).toEqual(items1);
      expect(result2.current.breadcrumbs).toEqual(items2);
    });
  });
});
