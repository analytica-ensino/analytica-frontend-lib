import { renderHook, act, waitFor } from '@testing-library/react';
import { useSendActivity } from './useSendActivity';
import type {
  UseSendActivityConfig,
  SendActivityCategoriesData,
  ActivityModelItem,
} from '../types/sendActivity';
import type { SendActivityFormData } from '../components/SendActivityModal/types';

/**
 * Mock dayjs to return predictable ISO strings in tests
 * This ensures consistent behavior regardless of local timezone
 */
jest.mock('dayjs', () => {
  return (input: string) => ({
    toISOString: () => `${input}:00.000Z`,
  });
});

/**
 * Mock categories data
 */
const mockCategoriesData: SendActivityCategoriesData = {
  schools: [
    { id: 'school-1', name: 'School A', escolaId: 'school-1' },
    { id: 'school-2', name: 'School B', escolaId: 'school-2' },
  ],
  schoolYears: [
    { id: 'year-1', name: '1st Year', escolaId: 'school-1', serieId: 'year-1' },
    { id: 'year-2', name: '2nd Year', escolaId: 'school-2', serieId: 'year-2' },
  ],
  classes: [
    {
      id: 'class-1',
      name: 'Class A',
      escolaId: 'school-1',
      serieId: 'year-1',
      turmaId: 'class-1',
    },
  ],
  students: [
    {
      id: 'student-1',
      name: 'Student A',
      escolaId: 'school-1',
      serieId: 'year-1',
      turmaId: 'class-1',
    },
  ],
};

/**
 * Mock activity model
 */
const mockModel: ActivityModelItem = {
  id: 'model-123',
  title: 'Test Activity',
  subjectId: 'subject-1',
};

/**
 * Mock form data
 */
const mockFormData: SendActivityFormData = {
  title: 'New Activity',
  subtype: 'TAREFA',
  notification: 'true',
  startDate: '2025-01-15',
  startTime: '08:00',
  finalDate: '2025-01-20',
  finalTime: '23:59',
  canRetry: false,
  students: [
    { studentId: 'student-1', userInstitutionId: 'inst-1' },
    { studentId: 'student-2', userInstitutionId: 'inst-2' },
  ],
};

/**
 * Create mock config for useSendActivity
 */
const createMockConfig = (
  overrides?: Partial<UseSendActivityConfig>
): UseSendActivityConfig => ({
  fetchCategories: jest.fn().mockResolvedValue(mockCategoriesData),
  createActivity: jest.fn().mockResolvedValue({ id: 'activity-123' }),
  sendToStudents: jest.fn().mockResolvedValue(undefined),
  fetchQuestionIds: jest.fn().mockResolvedValue(['q1', 'q2', 'q3']),
  onSuccess: jest.fn(),
  onError: jest.fn(),
  ...overrides,
});

describe('useSendActivity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const config = createMockConfig();
      const { result } = renderHook(() => useSendActivity(config));

      expect(result.current.isOpen).toBe(false);
      expect(result.current.selectedModel).toBeNull();
      expect(result.current.initialData).toBeUndefined();
      expect(result.current.categories).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isCategoriesLoading).toBe(false);
    });
  });

  describe('openModal', () => {
    it('should open modal and set selected model', async () => {
      const config = createMockConfig();
      const { result } = renderHook(() => useSendActivity(config));

      await act(async () => {
        result.current.openModal(mockModel);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.selectedModel).toEqual(mockModel);
    });

    it('should load categories when opening modal', async () => {
      const config = createMockConfig();
      const { result } = renderHook(() => useSendActivity(config));

      await act(async () => {
        result.current.openModal(mockModel);
      });

      await waitFor(() => {
        expect(result.current.isCategoriesLoading).toBe(false);
      });

      expect(config.fetchCategories).toHaveBeenCalled();
      expect(result.current.categories).toHaveLength(4);
    });

    it('should transform categories to CategoryConfig format', async () => {
      const config = createMockConfig();
      const { result } = renderHook(() => useSendActivity(config));

      await act(async () => {
        result.current.openModal(mockModel);
      });

      await waitFor(() => {
        expect(result.current.isCategoriesLoading).toBe(false);
      });

      expect(result.current.categories[0].key).toBe('escola');
      expect(result.current.categories[0].label).toBe('Escola');
      expect(result.current.categories[0].itens).toEqual(
        mockCategoriesData.schools
      );

      expect(result.current.categories[1].key).toBe('serie');
      expect(result.current.categories[1].dependsOn).toEqual(['escola']);

      expect(result.current.categories[2].key).toBe('turma');
      expect(result.current.categories[2].dependsOn).toEqual([
        'escola',
        'serie',
      ]);

      expect(result.current.categories[3].key).toBe('alunos');
      expect(result.current.categories[3].dependsOn).toEqual([
        'escola',
        'serie',
        'turma',
      ]);
    });

    it('should not reload categories if already loaded', async () => {
      const config = createMockConfig();
      const { result } = renderHook(() => useSendActivity(config));

      await act(async () => {
        result.current.openModal(mockModel);
      });

      await waitFor(() => {
        expect(result.current.isCategoriesLoading).toBe(false);
      });

      const initialCallCount = (config.fetchCategories as jest.Mock).mock.calls
        .length;

      await act(async () => {
        result.current.closeModal();
      });

      await act(async () => {
        result.current.openModal(mockModel);
      });

      expect(config.fetchCategories).toHaveBeenCalledTimes(initialCallCount);
    });

    it('should handle error when loading categories fails', async () => {
      const config = createMockConfig({
        fetchCategories: jest
          .fn()
          .mockRejectedValue(new Error('Network Error')),
      });
      const { result } = renderHook(() => useSendActivity(config));

      await act(async () => {
        result.current.openModal(mockModel);
      });

      await waitFor(() => {
        expect(result.current.isCategoriesLoading).toBe(false);
      });

      expect(config.onError).toHaveBeenCalledWith(
        'Erro ao carregar destinatários'
      );
      expect(result.current.categories).toEqual([]);
    });

    it('should handle error without onError callback', async () => {
      const config = createMockConfig({
        fetchCategories: jest
          .fn()
          .mockRejectedValue(new Error('Network Error')),
        onError: undefined,
      });
      const { result } = renderHook(() => useSendActivity(config));

      await act(async () => {
        result.current.openModal(mockModel);
      });

      await waitFor(() => {
        expect(result.current.isCategoriesLoading).toBe(false);
      });

      expect(result.current.categories).toEqual([]);
    });
  });

  describe('closeModal', () => {
    it('should close modal and reset selected model', async () => {
      const config = createMockConfig();
      const { result } = renderHook(() => useSendActivity(config));

      await act(async () => {
        result.current.openModal(mockModel);
      });

      expect(result.current.isOpen).toBe(true);

      await act(async () => {
        result.current.closeModal();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.selectedModel).toBeNull();
    });
  });

  describe('initialData', () => {
    it('should return undefined when no model is selected', () => {
      const config = createMockConfig();
      const { result } = renderHook(() => useSendActivity(config));

      expect(result.current.initialData).toBeUndefined();
    });

    it('should return initial data with title from selected model', async () => {
      const config = createMockConfig();
      const { result } = renderHook(() => useSendActivity(config));

      await act(async () => {
        result.current.openModal(mockModel);
      });

      expect(result.current.initialData).toEqual({
        title: 'Test Activity',
      });
    });
  });

  describe('onCategoriesChange', () => {
    it('should update categories when called', async () => {
      const config = createMockConfig();
      const { result } = renderHook(() => useSendActivity(config));

      const newCategories = [
        {
          key: 'escola',
          label: 'Escola',
          itens: mockCategoriesData.schools,
          selectedIds: ['school-1'],
        },
      ];

      await act(async () => {
        result.current.onCategoriesChange(newCategories);
      });

      expect(result.current.categories).toEqual(newCategories);
    });
  });

  describe('handleSubmit', () => {
    it('should not submit if no model is selected', async () => {
      const config = createMockConfig();
      const { result } = renderHook(() => useSendActivity(config));

      await act(async () => {
        await result.current.handleSubmit(mockFormData);
      });

      expect(config.fetchQuestionIds).not.toHaveBeenCalled();
      expect(config.createActivity).not.toHaveBeenCalled();
    });

    it('should successfully submit activity', async () => {
      const config = createMockConfig();
      const { result } = renderHook(() => useSendActivity(config));

      await act(async () => {
        result.current.openModal(mockModel);
      });

      await act(async () => {
        await result.current.handleSubmit(mockFormData);
      });

      expect(config.fetchQuestionIds).toHaveBeenCalledWith('model-123');
      expect(config.createActivity).toHaveBeenCalledWith({
        title: 'New Activity',
        subjectId: 'subject-1',
        questionIds: ['q1', 'q2', 'q3'],
        subtype: 'TAREFA',
        notification: 'true',
        startDate: '2025-01-15T08:00:00.000Z',
        finalDate: '2025-01-20T23:59:00.000Z',
        canRetry: false,
      });
      expect(config.sendToStudents).toHaveBeenCalledWith(
        'activity-123',
        mockFormData.students
      );
      expect(config.onSuccess).toHaveBeenCalledWith(
        'Atividade enviada para 2 aluno(s)'
      );
      expect(result.current.isOpen).toBe(false);
    });

    it('should handle error when fetchQuestionIds returns null', async () => {
      const config = createMockConfig({
        fetchQuestionIds: jest.fn().mockResolvedValue(null),
      });
      const { result } = renderHook(() => useSendActivity(config));

      await act(async () => {
        result.current.openModal(mockModel);
      });

      await act(async () => {
        await result.current.handleSubmit(mockFormData);
      });

      expect(config.createActivity).not.toHaveBeenCalled();
      expect(config.onError).toHaveBeenCalledWith('Erro ao enviar atividade');
    });

    it('should handle error when fetchQuestionIds returns empty array', async () => {
      const config = createMockConfig({
        fetchQuestionIds: jest.fn().mockResolvedValue([]),
      });
      const { result } = renderHook(() => useSendActivity(config));

      await act(async () => {
        result.current.openModal(mockModel);
      });

      await act(async () => {
        await result.current.handleSubmit(mockFormData);
      });

      expect(config.createActivity).not.toHaveBeenCalled();
      expect(config.onError).toHaveBeenCalledWith('Erro ao enviar atividade');
    });

    it('should handle error when createActivity fails', async () => {
      const config = createMockConfig({
        createActivity: jest.fn().mockRejectedValue(new Error('API Error')),
      });
      const { result } = renderHook(() => useSendActivity(config));

      await act(async () => {
        result.current.openModal(mockModel);
      });

      await act(async () => {
        await result.current.handleSubmit(mockFormData);
      });

      expect(config.onError).toHaveBeenCalledWith('Erro ao enviar atividade');
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle error when sendToStudents fails', async () => {
      const config = createMockConfig({
        sendToStudents: jest.fn().mockRejectedValue(new Error('API Error')),
      });
      const { result } = renderHook(() => useSendActivity(config));

      await act(async () => {
        result.current.openModal(mockModel);
      });

      await act(async () => {
        await result.current.handleSubmit(mockFormData);
      });

      expect(config.onError).toHaveBeenCalledWith('Erro ao enviar atividade');
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle error without onError callback', async () => {
      const config = createMockConfig({
        fetchQuestionIds: jest.fn().mockResolvedValue(null),
        onError: undefined,
      });
      const { result } = renderHook(() => useSendActivity(config));

      await act(async () => {
        result.current.openModal(mockModel);
      });

      await act(async () => {
        await result.current.handleSubmit(mockFormData);
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should handle success without onSuccess callback', async () => {
      const config = createMockConfig({
        onSuccess: undefined,
      });
      const { result } = renderHook(() => useSendActivity(config));

      await act(async () => {
        result.current.openModal(mockModel);
      });

      await act(async () => {
        await result.current.handleSubmit(mockFormData);
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('should set isLoading to true during submission', async () => {
      let resolveCreateActivity: (value: { id: string }) => void;
      const createActivityPromise = new Promise<{ id: string }>((resolve) => {
        resolveCreateActivity = resolve;
      });

      const config = createMockConfig({
        createActivity: jest.fn().mockReturnValue(createActivityPromise),
      });
      const { result } = renderHook(() => useSendActivity(config));

      await act(async () => {
        result.current.openModal(mockModel);
      });

      let submitPromise: Promise<void>;
      act(() => {
        submitPromise = result.current.handleSubmit(mockFormData);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await act(async () => {
        resolveCreateActivity!({ id: 'activity-123' });
        await submitPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('toISODateTime helper', () => {
    it('should correctly format date and time to ISO string', async () => {
      const config = createMockConfig();
      const { result } = renderHook(() => useSendActivity(config));

      await act(async () => {
        result.current.openModal(mockModel);
      });

      const formData: SendActivityFormData = {
        ...mockFormData,
        startDate: '2025-03-15',
        startTime: '14:30',
        finalDate: '2025-03-20',
        finalTime: '18:45',
      };

      await act(async () => {
        await result.current.handleSubmit(formData);
      });

      expect(config.createActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: '2025-03-15T14:30:00.000Z',
          finalDate: '2025-03-20T18:45:00.000Z',
        })
      );
    });
  });
});
