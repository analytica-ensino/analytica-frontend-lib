import { renderHook, act, waitFor } from '@testing-library/react';
import { useBreadcrumbBuilder } from './useBreadcrumbBuilder';
import { useBreadcrumbStore } from './breadcrumbStore';
import type { BreadcrumbItem } from './breadcrumbStore';

describe('useBreadcrumbBuilder', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useBreadcrumbStore.setState({ breadcrumbs: {} });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('should initialize with root breadcrumb only', () => {
      const root: BreadcrumbItem = {
        id: 'home',
        name: 'Home',
        url: '/',
      };

      const { result } = renderHook(() =>
        useBreadcrumbBuilder({
          namespace: 'test',
          root,
          levels: [],
        })
      );

      expect(result.current.breadcrumbs).toEqual([root]);
    });

    it('should provide sliceBreadcrumbs function', () => {
      const root: BreadcrumbItem = {
        id: 'home',
        name: 'Home',
        url: '/',
      };

      const { result } = renderHook(() =>
        useBreadcrumbBuilder({
          namespace: 'test',
          root,
          levels: [],
        })
      );

      expect(typeof result.current.sliceBreadcrumbs).toBe('function');
    });
  });

  describe('dynamic breadcrumb with data', () => {
    it('should add dynamic breadcrumb when data is present', async () => {
      const root: BreadcrumbItem = {
        id: 'home',
        name: 'Home',
        url: '/',
      };

      const subjectData = {
        subjectId: '123',
        subjectName: 'Matemática',
      };

      const { result } = renderHook(() =>
        useBreadcrumbBuilder({
          namespace: 'test',
          root,
          levels: [
            {
              data: subjectData,
              urlId: '123',
              getId: (data) => data.subjectId,
              getName: (data) => data.subjectName,
              getUrl: (data) => `/subjects/${data.subjectId}`,
            },
          ],
        })
      );

      await waitFor(() => {
        expect(result.current.breadcrumbs).toHaveLength(2);
      });

      expect(result.current.breadcrumbs[1]).toEqual({
        id: '123',
        name: 'Matemática',
        url: '/subjects/123',
      });
    });

    it('should not add breadcrumb when data is null', async () => {
      const root: BreadcrumbItem = {
        id: 'home',
        name: 'Home',
        url: '/',
      };

      const { result } = renderHook(() =>
        useBreadcrumbBuilder({
          namespace: 'test',
          root,
          levels: [
            {
              data: null,
              urlId: '123',
              getId: (data) => data.subjectId,
              getName: (data) => data.subjectName,
              getUrl: (data) => `/subjects/${data.subjectId}`,
            },
          ],
        })
      );

      await waitFor(() => {
        expect(result.current.breadcrumbs).toHaveLength(1);
      });

      expect(result.current.breadcrumbs).toEqual([root]);
    });

    it('should not add breadcrumb when urlId does not match dataId', async () => {
      const root: BreadcrumbItem = {
        id: 'home',
        name: 'Home',
        url: '/',
      };

      const subjectData = {
        subjectId: '123',
        subjectName: 'Matemática',
      };

      const { result } = renderHook(() =>
        useBreadcrumbBuilder({
          namespace: 'test',
          root,
          levels: [
            {
              data: subjectData,
              urlId: '456', // Different from dataId
              getId: (data) => data.subjectId,
              getName: (data) => data.subjectName,
              getUrl: (data) => `/subjects/${data.subjectId}`,
            },
          ],
        })
      );

      await waitFor(() => {
        expect(result.current.breadcrumbs).toHaveLength(1);
      });

      expect(result.current.breadcrumbs).toEqual([root]);
    });

    it('should not add breadcrumb when urlId is undefined', async () => {
      const root: BreadcrumbItem = {
        id: 'home',
        name: 'Home',
        url: '/',
      };

      const subjectData = {
        subjectId: '123',
        subjectName: 'Matemática',
      };

      const { result } = renderHook(() =>
        useBreadcrumbBuilder({
          namespace: 'test',
          root,
          levels: [
            {
              data: subjectData,
              urlId: undefined,
              getId: (data) => data.subjectId,
              getName: (data) => data.subjectName,
              getUrl: (data) => `/subjects/${data.subjectId}`,
            },
          ],
        })
      );

      await waitFor(() => {
        expect(result.current.breadcrumbs).toHaveLength(1);
      });

      expect(result.current.breadcrumbs).toEqual([root]);
    });
  });

  describe('static breadcrumb', () => {
    it('should add static breadcrumb when urlId is defined', async () => {
      const root: BreadcrumbItem = {
        id: 'home',
        name: 'Home',
        url: '/',
      };

      const staticBreadcrumb: BreadcrumbItem = {
        id: 'settings',
        name: 'Configurações',
        url: '/settings',
      };

      const { result } = renderHook(() =>
        useBreadcrumbBuilder({
          namespace: 'test',
          root,
          levels: [
            {
              breadcrumb: staticBreadcrumb,
              urlId: 'settings',
            },
          ],
        })
      );

      await waitFor(() => {
        expect(result.current.breadcrumbs).toHaveLength(2);
      });

      expect(result.current.breadcrumbs[1]).toEqual(staticBreadcrumb);
    });

    it('should not add static breadcrumb when urlId is undefined', async () => {
      const root: BreadcrumbItem = {
        id: 'home',
        name: 'Home',
        url: '/',
      };

      const staticBreadcrumb: BreadcrumbItem = {
        id: 'settings',
        name: 'Configurações',
        url: '/settings',
      };

      const { result } = renderHook(() =>
        useBreadcrumbBuilder({
          namespace: 'test',
          root,
          levels: [
            {
              breadcrumb: staticBreadcrumb,
              urlId: undefined,
            },
          ],
        })
      );

      await waitFor(() => {
        expect(result.current.breadcrumbs).toHaveLength(1);
      });

      expect(result.current.breadcrumbs).toEqual([root]);
    });
  });

  describe('hierarchical breadcrumbs', () => {
    it('should build three-level hierarchy with dynamic breadcrumbs', async () => {
      const root: BreadcrumbItem = {
        id: 'home',
        name: 'Home',
        url: '/',
      };

      const subjectData = {
        subjectId: '123',
        subjectName: 'Matemática',
      };

      const topicData = {
        topicId: '456',
        topicName: 'Álgebra',
      };

      const { result } = renderHook(() =>
        useBreadcrumbBuilder({
          namespace: 'test',
          root,
          levels: [
            {
              data: subjectData,
              urlId: '123',
              getId: (data) => data.subjectId,
              getName: (data) => data.subjectName,
              getUrl: (data) => `/subjects/${data.subjectId}`,
            },
            {
              data: topicData,
              urlId: '456',
              getId: (data) => data.topicId,
              getName: (data) => data.topicName,
              getUrl: (data, [subjectId]) =>
                `/subjects/${subjectId}/topics/${data.topicId}`,
            },
          ],
        })
      );

      await waitFor(() => {
        expect(result.current.breadcrumbs).toHaveLength(3);
      });

      expect(result.current.breadcrumbs[0]).toEqual(root);
      expect(result.current.breadcrumbs[1]).toEqual({
        id: '123',
        name: 'Matemática',
        url: '/subjects/123',
      });
      expect(result.current.breadcrumbs[2]).toEqual({
        id: '456',
        name: 'Álgebra',
        url: '/subjects/123/topics/456',
      });
    });

    it('should stop hierarchy when middle level data is missing', async () => {
      const root: BreadcrumbItem = {
        id: 'home',
        name: 'Home',
        url: '/',
      };

      const subjectData = {
        subjectId: '123',
        subjectName: 'Matemática',
      };

      const { result } = renderHook(() =>
        useBreadcrumbBuilder({
          namespace: 'test',
          root,
          levels: [
            {
              data: subjectData,
              urlId: '123',
              getId: (data) => data.subjectId,
              getName: (data) => data.subjectName,
              getUrl: (data) => `/subjects/${data.subjectId}`,
            },
            {
              data: null, // Middle level missing
              urlId: '456',
              getId: (data) => data.topicId,
              getName: (data) => data.topicName,
              getUrl: (data) => `/topics/${data.topicId}`,
            },
          ],
        })
      );

      await waitFor(() => {
        expect(result.current.breadcrumbs).toHaveLength(2);
      });

      expect(result.current.breadcrumbs[1].id).toBe('123');
    });
  });

  describe('mixed static and dynamic breadcrumbs', () => {
    it('should build hierarchy with mixed breadcrumb types', async () => {
      const root: BreadcrumbItem = {
        id: 'home',
        name: 'Home',
        url: '/',
      };

      const staticBreadcrumb: BreadcrumbItem = {
        id: 'products',
        name: 'Produtos',
        url: '/products',
      };

      const categoryData = {
        id: '123',
        name: 'Eletrônicos',
      };

      const { result } = renderHook(() =>
        useBreadcrumbBuilder({
          namespace: 'test',
          root,
          levels: [
            {
              breadcrumb: staticBreadcrumb,
              urlId: 'products',
            },
            {
              data: categoryData,
              urlId: '123',
              getId: (data) => data.id,
              getName: (data) => data.name,
              getUrl: (data) => `/products/${data.id}`,
            },
          ],
        })
      );

      await waitFor(() => {
        expect(result.current.breadcrumbs).toHaveLength(3);
      });

      expect(result.current.breadcrumbs[0]).toEqual(root);
      expect(result.current.breadcrumbs[1]).toEqual(staticBreadcrumb);
      expect(result.current.breadcrumbs[2]).toEqual({
        id: '123',
        name: 'Eletrônicos',
        url: '/products/123',
      });
    });
  });

  describe('URL generation with previousIds', () => {
    it('should pass previousIds to getUrl function', async () => {
      const root: BreadcrumbItem = {
        id: 'home',
        name: 'Home',
        url: '/',
      };

      const subjectData = {
        subjectId: '123',
        subjectName: 'Matemática',
      };

      const topicData = {
        topicId: '456',
        topicName: 'Álgebra',
      };

      const subtopicData = {
        subtopicId: '789',
        subtopicName: 'Matrizes',
      };

      const { result } = renderHook(() =>
        useBreadcrumbBuilder({
          namespace: 'test',
          root,
          levels: [
            {
              data: subjectData,
              urlId: '123',
              getId: (data) => data.subjectId,
              getName: (data) => data.subjectName,
              getUrl: (data) => `/subjects/${data.subjectId}`,
            },
            {
              data: topicData,
              urlId: '456',
              getId: (data) => data.topicId,
              getName: (data) => data.topicName,
              getUrl: (data, [subjectId]) =>
                `/subjects/${subjectId}/topics/${data.topicId}`,
            },
            {
              data: subtopicData,
              urlId: '789',
              getId: (data) => data.subtopicId,
              getName: (data) => data.subtopicName,
              getUrl: (data, [subjectId, topicId]) =>
                `/subjects/${subjectId}/topics/${topicId}/subtopics/${data.subtopicId}`,
            },
          ],
        })
      );

      await waitFor(() => {
        expect(result.current.breadcrumbs).toHaveLength(4);
      });

      expect(result.current.breadcrumbs[3].url).toBe(
        '/subjects/123/topics/456/subtopics/789'
      );
    });
  });

  describe('sliceBreadcrumbs functionality', () => {
    it('should slice breadcrumbs to specified index', async () => {
      const root: BreadcrumbItem = {
        id: 'home',
        name: 'Home',
        url: '/',
      };

      const { result } = renderHook(() =>
        useBreadcrumbBuilder({
          namespace: 'test',
          root,
          levels: [
            {
              breadcrumb: { id: 'level1', name: 'Level 1', url: '/level1' },
              urlId: 'level1',
            },
            {
              breadcrumb: { id: 'level2', name: 'Level 2', url: '/level2' },
              urlId: 'level2',
            },
          ],
        })
      );

      await waitFor(() => {
        expect(result.current.breadcrumbs).toHaveLength(3);
      });

      act(() => {
        result.current.sliceBreadcrumbs(1);
      });

      expect(result.current.breadcrumbs).toHaveLength(2);
      expect(result.current.breadcrumbs[0].id).toBe('home');
      expect(result.current.breadcrumbs[1].id).toBe('level1');
    });
  });

  describe('reactivity to data changes', () => {
    it('should update breadcrumbs when data changes', async () => {
      const root: BreadcrumbItem = {
        id: 'home',
        name: 'Home',
        url: '/',
      };

      let subjectData = {
        subjectId: '123',
        subjectName: 'Matemática',
      };

      const { result, rerender } = renderHook(
        ({ data }) =>
          useBreadcrumbBuilder({
            namespace: 'test',
            root,
            levels: [
              {
                data,
                urlId: '123',
                getId: (d) => d.subjectId,
                getName: (d) => d.subjectName,
                getUrl: (d) => `/subjects/${d.subjectId}`,
              },
            ],
          }),
        { initialProps: { data: subjectData } }
      );

      await waitFor(() => {
        expect(result.current.breadcrumbs).toHaveLength(2);
      });

      expect(result.current.breadcrumbs[1].name).toBe('Matemática');

      // Update data
      subjectData = {
        subjectId: '123',
        subjectName: 'Física',
      };

      rerender({ data: subjectData });

      await waitFor(() => {
        expect(result.current.breadcrumbs[1].name).toBe('Física');
      });
    });

    it('should update breadcrumbs when urlId changes', async () => {
      const root: BreadcrumbItem = {
        id: 'home',
        name: 'Home',
        url: '/',
      };

      const subjectData = {
        subjectId: '123',
        subjectName: 'Matemática',
      };

      const { result, rerender } = renderHook(
        ({ urlId }) =>
          useBreadcrumbBuilder({
            namespace: 'test',
            root,
            levels: [
              {
                data: subjectData,
                urlId,
                getId: (d) => d.subjectId,
                getName: (d) => d.subjectName,
                getUrl: (d) => `/subjects/${d.subjectId}`,
              },
            ],
          }),
        { initialProps: { urlId: '123' } }
      );

      await waitFor(() => {
        expect(result.current.breadcrumbs).toHaveLength(2);
      });

      // Change urlId to not match
      rerender({ urlId: '456' });

      await waitFor(() => {
        expect(result.current.breadcrumbs).toHaveLength(1);
      });
    });
  });

  describe('namespace isolation', () => {
    it('should isolate breadcrumbs by namespace', async () => {
      const root1: BreadcrumbItem = {
        id: 'home1',
        name: 'Home 1',
        url: '/1',
      };

      const root2: BreadcrumbItem = {
        id: 'home2',
        name: 'Home 2',
        url: '/2',
      };

      const { result: result1 } = renderHook(() =>
        useBreadcrumbBuilder({
          namespace: 'namespace1',
          root: root1,
          levels: [],
        })
      );

      const { result: result2 } = renderHook(() =>
        useBreadcrumbBuilder({
          namespace: 'namespace2',
          root: root2,
          levels: [],
        })
      );

      await waitFor(() => {
        expect(result1.current.breadcrumbs).toEqual([root1]);
        expect(result2.current.breadcrumbs).toEqual([root2]);
      });
    });
  });

  describe('complex real-world scenario', () => {
    it('should build complete performance navigation breadcrumbs', async () => {
      const root: BreadcrumbItem = {
        id: 'performance',
        name: 'Desempenho',
        url: '/desempenho',
      };

      const subjectData = {
        subjectId: '123',
        subjectName: 'Matemática',
      };

      const topicData = {
        topicId: '456',
        topicName: 'Álgebra Linear',
      };

      const subtopicData = {
        subtopicId: '789',
        subtopicName: 'Matrizes e Determinantes',
      };

      const { result } = renderHook(() =>
        useBreadcrumbBuilder({
          namespace: 'performance',
          root,
          levels: [
            {
              data: subjectData,
              urlId: '123',
              getId: (data) => data.subjectId,
              getName: (data) => data.subjectName,
              getUrl: (data) => `/desempenho/lista-temas/${data.subjectId}`,
            },
            {
              data: topicData,
              urlId: '456',
              getId: (data) => data.topicId,
              getName: (data) => data.topicName,
              getUrl: (data, [subjectId]) =>
                `/desempenho/lista-temas/${subjectId}/subtemas/${data.topicId}`,
            },
            {
              data: subtopicData,
              urlId: '789',
              getId: (data) => data.subtopicId,
              getName: (data) => data.subtopicName,
              getUrl: (data, [subjectId, topicId]) =>
                `/desempenho/lista-temas/${subjectId}/subtemas/${topicId}/aulas/${data.subtopicId}`,
            },
          ],
        })
      );

      await waitFor(() => {
        expect(result.current.breadcrumbs).toHaveLength(4);
      });

      expect(result.current.breadcrumbs).toEqual([
        {
          id: 'performance',
          name: 'Desempenho',
          url: '/desempenho',
        },
        {
          id: '123',
          name: 'Matemática',
          url: '/desempenho/lista-temas/123',
        },
        {
          id: '456',
          name: 'Álgebra Linear',
          url: '/desempenho/lista-temas/123/subtemas/456',
        },
        {
          id: '789',
          name: 'Matrizes e Determinantes',
          url: '/desempenho/lista-temas/123/subtemas/456/aulas/789',
        },
      ]);
    });
  });
});
