import { renderHook, act, waitFor } from '@testing-library/react';
import { useActivityDraftModelPage } from './useActivityDraftModelPage';
import type {
  UseActivityDraftModelPageOptions,
  UseActivityDraftModelPageReturn,
} from './useActivityDraftModelPage';
import type { ActivityModelTableItem } from '../types/activitiesHistory';
import type { TypeRoutes } from '../components/TypeSelector/TypeSelector.types';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('useActivityDraftModelPage', () => {
  const mockFetchFn = jest.fn();
  const mockDeleteFn = jest.fn();
  const mockOpenSendModal = jest.fn();

  const mockRoutes: TypeRoutes = {
    base: '/atividades',
    create: '/atividades/criar',
    details: (id: string) => `/atividades/${id}`,
    editDraft: (id: string) => `/atividades/rascunhos/${id}`,
    editModel: (id: string) => `/atividades/modelos/${id}`,
  };

  const baseOptions: UseActivityDraftModelPageOptions = {
    activityCategory: 'ATIVIDADE',
    fetchFn: mockFetchFn,
    deleteFn: mockDeleteFn,
    userData: null,
    apiSubjectOptions: [],
    openSendModal: mockOpenSendModal,
    editUrlType: 'rascunho',
    errorLogLabel: 'rascunho',
    routes: mockRoutes,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useActivityDraftModelPage(baseOptions));

    expect(result.current.isDeleteDialogOpen).toBe(false);
    expect(result.current.itemToDeleteTitle).toBe('');
    expect(result.current.initialFilterConfigs).toEqual([
      {
        key: 'content',
        label: 'CONTEÚDO',
        categories: [
          {
            key: 'subject',
            label: 'Matéria',
            selectedIds: [],
            itens: [],
          },
        ],
      },
    ]);
    expect(result.current.tableColumns).toBeDefined();
    expect(result.current.handleSend).toBeDefined();
    expect(result.current.handleDelete).toBeDefined();
    expect(result.current.handleEdit).toBeDefined();
    expect(result.current.handleConfirmDelete).toBeDefined();
    expect(result.current.handleParamsChange).toBeDefined();
    expect(result.current.handleCreateActivity).toBeDefined();
    expect(result.current.handleRowClick).toBeDefined();
  });

  it('should call fetchFn on mount', () => {
    renderHook(() => useActivityDraftModelPage(baseOptions));

    expect(mockFetchFn).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });

  it('should merge userData subjects with apiSubjectOptions', () => {
    const options: UseActivityDraftModelPageOptions = {
      ...baseOptions,
      userData: {
        subTeacherTopicClasses: [
          {
            subject: { id: '1', name: 'Matemática' },
          },
        ],
      },
      apiSubjectOptions: [{ id: '2', name: 'Português' }],
    };

    const { result } = renderHook(() => useActivityDraftModelPage(options));

    expect(result.current.initialFilterConfigs[0].categories[0].itens).toEqual([
      { id: '1', name: 'Matemática' },
      { id: '2', name: 'Português' },
    ]);
  });

  describe('handleSend', () => {
    it('should call openSendModal with row data', () => {
      const { result } = renderHook(() =>
        useActivityDraftModelPage(baseOptions)
      );

      const mockRow: ActivityModelTableItem = {
        id: '1',
        title: 'Test Activity',
        savedAt: '2024-01-01',
        subject: { name: 'Matemática', color: 'blue' },
        subjectId: 'sub-1',
      };

      act(() => {
        result.current.handleSend(mockRow);
      });

      expect(mockOpenSendModal).toHaveBeenCalledWith(mockRow);
    });
  });

  describe('handleDelete', () => {
    it('should open delete dialog with correct data', () => {
      const { result } = renderHook(() =>
        useActivityDraftModelPage(baseOptions)
      );

      const mockRow: ActivityModelTableItem = {
        id: '1',
        title: 'Test Activity',
        savedAt: '2024-01-01',
        subject: { name: 'Matemática', color: 'blue' },
        subjectId: 'sub-1',
      };

      act(() => {
        result.current.handleDelete(mockRow);
      });

      expect(result.current.isDeleteDialogOpen).toBe(true);
      expect(result.current.itemToDeleteTitle).toBe('Test Activity');
    });
  });

  describe('handleEdit', () => {
    it('should navigate to editDraft route when available', () => {
      const { result } = renderHook(() =>
        useActivityDraftModelPage(baseOptions)
      );

      const mockRow: ActivityModelTableItem = {
        id: '1',
        title: 'Test Activity',
        savedAt: '2024-01-01',
        subject: { name: 'Matemática', color: 'blue' },
        subjectId: 'sub-1',
      };

      act(() => {
        result.current.handleEdit(mockRow);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/atividades/rascunhos/1');
    });

    it('should navigate to editModel route when editDraft is not available', () => {
      const routesWithoutEditDraft: TypeRoutes = {
        ...mockRoutes,
        editDraft: undefined as any,
      };

      const { result } = renderHook(() =>
        useActivityDraftModelPage({
          ...baseOptions,
          routes: routesWithoutEditDraft,
        })
      );

      const mockRow: ActivityModelTableItem = {
        id: '1',
        title: 'Test Activity',
        savedAt: '2024-01-01',
        subject: { name: 'Matemática', color: 'blue' },
        subjectId: 'sub-1',
      };

      act(() => {
        result.current.handleEdit(mockRow);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/atividades/modelos/1');
    });

    it('should navigate to create with query params when no edit routes available', () => {
      const routesWithoutEdit: TypeRoutes = {
        ...mockRoutes,
        editDraft: undefined as any,
        editModel: undefined as any,
      };

      const { result } = renderHook(() =>
        useActivityDraftModelPage({
          ...baseOptions,
          routes: routesWithoutEdit,
        })
      );

      const mockRow: ActivityModelTableItem = {
        id: '1',
        title: 'Test Activity',
        savedAt: '2024-01-01',
        subject: { name: 'Matemática', color: 'blue' },
        subjectId: 'sub-1',
      };

      act(() => {
        result.current.handleEdit(mockRow);
      });

      expect(mockNavigate).toHaveBeenCalledWith(
        '/atividades/criar?type=rascunho&id=1'
      );
    });
  });

  describe('handleConfirmDelete', () => {
    it('should call deleteFn and fetchFn on confirm', async () => {
      mockDeleteFn.mockResolvedValue(true);

      const { result } = renderHook(() =>
        useActivityDraftModelPage(baseOptions)
      );

      const mockRow: ActivityModelTableItem = {
        id: '1',
        title: 'Test Activity',
        savedAt: '2024-01-01',
        subject: { name: 'Matemática', color: 'blue' },
        subjectId: 'sub-1',
      };

      act(() => {
        result.current.handleDelete(mockRow);
      });

      await act(async () => {
        await result.current.handleConfirmDelete();
      });

      expect(mockDeleteFn).toHaveBeenCalledWith('1');
      expect(mockFetchFn).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });

    it('should not call deleteFn if no item is selected', async () => {
      const { result } = renderHook(() =>
        useActivityDraftModelPage(baseOptions)
      );

      await act(async () => {
        await result.current.handleConfirmDelete();
      });

      expect(mockDeleteFn).not.toHaveBeenCalled();
    });

    it('should handle delete error', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      mockDeleteFn.mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() =>
        useActivityDraftModelPage(baseOptions)
      );

      const mockRow: ActivityModelTableItem = {
        id: '1',
        title: 'Test Activity',
        savedAt: '2024-01-01',
        subject: { name: 'Matemática', color: 'blue' },
        subjectId: 'sub-1',
      };

      act(() => {
        result.current.handleDelete(mockRow);
      });

      await act(async () => {
        await result.current.handleConfirmDelete();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erro ao deletar rascunho:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('handleParamsChange', () => {
    it('should call fetchFn with updated params', () => {
      const { result } = renderHook(() =>
        useActivityDraftModelPage(baseOptions)
      );

      act(() => {
        result.current.handleParamsChange({
          page: 2,
          limit: 20,
          search: 'test',
        });
      });

      expect(mockFetchFn).toHaveBeenCalledWith({
        page: 2,
        limit: 20,
        search: 'test',
      });
    });

    it('should use default values for missing params', () => {
      const { result } = renderHook(() =>
        useActivityDraftModelPage(baseOptions)
      );

      act(() => {
        result.current.handleParamsChange({});
      });

      expect(mockFetchFn).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined,
      });
    });
  });

  describe('handleCreateActivity', () => {
    it('should navigate to create route', () => {
      const { result } = renderHook(() =>
        useActivityDraftModelPage(baseOptions)
      );

      act(() => {
        result.current.handleCreateActivity();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/atividades/criar');
    });
  });

  describe('handleRowClick', () => {
    it('should navigate to editDraft route when available', () => {
      const { result } = renderHook(() =>
        useActivityDraftModelPage(baseOptions)
      );

      const mockRow: ActivityModelTableItem = {
        id: '1',
        title: 'Test Activity',
        savedAt: '2024-01-01',
        subject: { name: 'Matemática', color: 'blue' },
        subjectId: 'sub-1',
      };

      act(() => {
        result.current.handleRowClick(mockRow);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/atividades/rascunhos/1');
    });

    it('should navigate to editModel route when editDraft is not available', () => {
      const routesWithoutEditDraft: TypeRoutes = {
        ...mockRoutes,
        editDraft: undefined as any,
      };

      const { result } = renderHook(() =>
        useActivityDraftModelPage({
          ...baseOptions,
          routes: routesWithoutEditDraft,
        })
      );

      const mockRow: ActivityModelTableItem = {
        id: '1',
        title: 'Test Activity',
        savedAt: '2024-01-01',
        subject: { name: 'Matemática', color: 'blue' },
        subjectId: 'sub-1',
      };

      act(() => {
        result.current.handleRowClick(mockRow);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/atividades/modelos/1');
    });
  });

  describe('setIsDeleteDialogOpen', () => {
    it('should update delete dialog state', () => {
      const { result } = renderHook(() =>
        useActivityDraftModelPage(baseOptions)
      );

      expect(result.current.isDeleteDialogOpen).toBe(false);

      act(() => {
        result.current.setIsDeleteDialogOpen(true);
      });

      expect(result.current.isDeleteDialogOpen).toBe(true);

      act(() => {
        result.current.setIsDeleteDialogOpen(false);
      });

      expect(result.current.isDeleteDialogOpen).toBe(false);
    });
  });

  describe('tableColumns', () => {
    it('should create table columns with callbacks', () => {
      const { result } = renderHook(() =>
        useActivityDraftModelPage(baseOptions)
      );

      expect(result.current.tableColumns).toBeDefined();
      expect(Array.isArray(result.current.tableColumns)).toBe(true);
      expect(result.current.tableColumns.length).toBeGreaterThan(0);
    });

    it('should memoize table columns', () => {
      const { result, rerender } = renderHook(() =>
        useActivityDraftModelPage(baseOptions)
      );

      const firstColumns = result.current.tableColumns;
      rerender();
      const secondColumns = result.current.tableColumns;

      expect(firstColumns).toBe(secondColumns);
    });
  });

  describe('with PROVA activity category', () => {
    const provaRoutes: TypeRoutes = {
      base: '/provas',
      create: '/provas/criar',
      details: (id: string) => `/provas/${id}`,
      editDraft: (id: string) => `/provas/rascunhos/${id}`,
      editModel: (id: string) => `/provas/modelos/${id}`,
    };

    const provaOptions: UseActivityDraftModelPageOptions = {
      ...baseOptions,
      activityCategory: 'PROVA',
      routes: provaRoutes,
    };

    it('should navigate to prova routes', () => {
      const { result } = renderHook(() =>
        useActivityDraftModelPage(provaOptions)
      );

      act(() => {
        result.current.handleCreateActivity();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/provas/criar');
    });
  });
});
