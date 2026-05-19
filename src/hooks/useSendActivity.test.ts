import { renderHook, act, waitFor } from '@testing-library/react';
import dayjs from 'dayjs';
import { useSendActivity } from './useSendActivity';
import type {
  UseSendActivityConfig,
  SendActivityCategoriesData,
  ActivityModelItem,
} from '../types/sendActivity';
import type { BaseApiClient } from '../types/api';
import { ActivitySubtype } from '../components/SendActivityModal/types';
import type { SendActivityFormData } from '../components/SendActivityModal/types';

/**
 * Helper function to compute expected ISO datetime using real dayjs
 * This mirrors the toISODateTime function in useSendActivity
 * @param date - Date string in YYYY-MM-DD format
 * @param time - Time string in HH:MM format
 * @returns ISO datetime string
 */
function expectedISODateTime(date: string, time: string): string {
  return dayjs(`${date}T${time}`).toISOString();
}

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
  subtype: ActivitySubtype.TAREFA,
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
 * Type for mockable BaseApiClient
 */
interface MockableApiClient extends BaseApiClient {
  get: jest.Mock;
  post: jest.Mock;
  patch: jest.Mock;
  delete: jest.Mock;
}

/**
 * Create mock API client that implements BaseApiClient
 */
const createMockApiClient = (): MockableApiClient => {
  const mockApi: MockableApiClient = {
    get: jest.fn((url: string) => {
      if (url === '/school') {
        return Promise.resolve({
          data: { data: mockCategoriesData.schools },
        });
      }
      if (url === '/schoolYear') {
        return Promise.resolve({
          data: { data: mockCategoriesData.schoolYears },
        });
      }
      if (url === '/classes') {
        return Promise.resolve({
          data: { data: mockCategoriesData.classes },
        });
      }
      if (url === '/students') {
        return Promise.resolve({
          data: { data: mockCategoriesData.students },
        });
      }
      if (url.includes('/activity-drafts/')) {
        return Promise.resolve({
          data: {
            data: {
              selectedQuestions: [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }],
            },
          },
        });
      }
      return Promise.reject(new Error('Not found'));
    }),
    post: jest.fn((url: string) => {
      if (url === '/activities') {
        return Promise.resolve({
          data: { data: { id: 'activity-123' } },
        });
      }
      if (url === '/activities/send-to-students') {
        return Promise.resolve({
          data: { data: {} },
        });
      }
      return Promise.reject(new Error('Not found'));
    }),
    patch: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
  };

  return mockApi;
};

/**
 * Create mock config for useSendActivity
 */
const createMockConfig = (
  overrides?: Partial<UseSendActivityConfig>
): UseSendActivityConfig => ({
  api: createMockApiClient(),
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

      expect(config.api.get).toHaveBeenCalledWith('/school');
      expect(config.api.get).toHaveBeenCalledWith('/schoolYear');
      expect(config.api.get).toHaveBeenCalledWith('/classes');
      expect(config.api.get).toHaveBeenCalledWith('/students');
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

      expect(result.current.categories[3].key).toBe('students');
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

      const initialCallCount = (config.api.get as jest.Mock).mock.calls.length;

      await act(async () => {
        result.current.closeModal();
      });

      await act(async () => {
        result.current.openModal(mockModel);
      });

      expect(config.api.get).toHaveBeenCalledTimes(initialCallCount);
    });

    it('should handle error when loading categories fails', async () => {
      const mockApi = createMockApiClient();
      mockApi.get = jest.fn().mockRejectedValue(new Error('Network Error'));

      const config = createMockConfig({
        api: mockApi,
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
      const mockApi = createMockApiClient();
      mockApi.get = jest.fn().mockRejectedValue(new Error('Network Error'));

      const config = createMockConfig({
        api: mockApi,
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

      expect(config.api.get).not.toHaveBeenCalledWith(
        expect.stringContaining('/activity-drafts/')
      );
      expect(config.api.post).not.toHaveBeenCalledWith(
        '/activities',
        expect.anything()
      );
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

      expect(config.api.get).toHaveBeenCalledWith('/activity-drafts/model-123');
      // Verify exact UTC conversion using dayjs (same timezone as the hook)
      expect(config.api.post).toHaveBeenCalledWith('/activities', {
        title: 'New Activity',
        subjectId: 'subject-1',
        questionIds: ['q1', 'q2', 'q3'],
        subtype: ActivitySubtype.TAREFA,
        notification: 'true',
        startDate: expectedISODateTime('2025-01-15', '08:00'),
        finalDate: expectedISODateTime('2025-01-20', '23:59'),
        canRetry: false,
      });
      expect(config.api.post).toHaveBeenCalledWith(
        '/activities/send-to-students',
        {
          activityId: 'activity-123',
          students: mockFormData.students,
        }
      );
      expect(config.onSuccess).toHaveBeenCalledWith(
        'Atividade enviada para 2 aluno(s)'
      );
      expect(result.current.isOpen).toBe(false);
    });

    it('should handle error when fetchQuestionIds returns null', async () => {
      const defaultMockApi = createMockApiClient();
      const mockApi = createMockApiClient();
      mockApi.get = jest.fn((url: string) => {
        if (url.includes('/activity-drafts/')) {
          return Promise.resolve({
            data: { data: { selectedQuestions: null } },
          });
        }
        return defaultMockApi.get(url);
      });

      const config = createMockConfig({
        api: mockApi,
      });
      const { result } = renderHook(() => useSendActivity(config));

      await act(async () => {
        result.current.openModal(mockModel);
      });

      await act(async () => {
        await result.current.handleSubmit(mockFormData);
      });

      expect(config.api.post).not.toHaveBeenCalledWith(
        '/activities',
        expect.anything()
      );
      expect(config.onError).toHaveBeenCalledWith('Erro ao enviar atividade');
    });

    it('should handle error when fetchQuestionIds returns empty array', async () => {
      const defaultMockApi = createMockApiClient();
      const mockApi = createMockApiClient();
      mockApi.get = jest.fn((url: string) => {
        if (url.includes('/activity-drafts/')) {
          return Promise.resolve({
            data: { data: { selectedQuestions: [] } },
          });
        }
        return defaultMockApi.get(url);
      });

      const config = createMockConfig({
        api: mockApi,
      });
      const { result } = renderHook(() => useSendActivity(config));

      await act(async () => {
        result.current.openModal(mockModel);
      });

      await act(async () => {
        await result.current.handleSubmit(mockFormData);
      });

      expect(config.api.post).not.toHaveBeenCalledWith(
        '/activities',
        expect.anything()
      );
      expect(config.onError).toHaveBeenCalledWith('Erro ao enviar atividade');
    });

    it('should handle error when createActivity fails', async () => {
      const defaultMockApi = createMockApiClient();
      const mockApi = createMockApiClient();
      mockApi.post = jest.fn((url: string) => {
        if (url === '/activities') {
          return Promise.reject(new Error('API Error'));
        }
        return defaultMockApi.post(url);
      });

      const config = createMockConfig({
        api: mockApi,
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
      const defaultMockApi = createMockApiClient();
      const mockApi = createMockApiClient();
      mockApi.post = jest.fn((url: string) => {
        if (url === '/activities/send-to-students') {
          return Promise.reject(new Error('API Error'));
        }
        return defaultMockApi.post(url);
      });

      const config = createMockConfig({
        api: mockApi,
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
      const defaultMockApi = createMockApiClient();
      const mockApi = createMockApiClient();
      mockApi.get = jest.fn((url: string) => {
        if (url.includes('/activity-drafts/')) {
          return Promise.resolve({
            data: { data: { selectedQuestions: null } },
          });
        }
        return defaultMockApi.get(url);
      });

      const config = createMockConfig({
        api: mockApi,
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
      let resolveCreateActivity: (value: {
        data: { data: { id: string } };
      }) => void;
      const createActivityPromise = new Promise<{
        data: { data: { id: string } };
      }>((resolve) => {
        resolveCreateActivity = resolve;
      });

      const defaultMockApi = createMockApiClient();
      const mockApi = createMockApiClient();
      mockApi.post = jest.fn((url: string) => {
        if (url === '/activities') {
          return createActivityPromise;
        }
        return defaultMockApi.post(url);
      });

      const config = createMockConfig({
        api: mockApi,
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
        resolveCreateActivity!({ data: { data: { id: 'activity-123' } } });
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

      // Verify exact UTC conversion using dayjs (same timezone as the hook)
      expect(config.api.post).toHaveBeenCalledWith(
        '/activities',
        expect.objectContaining({
          startDate: expectedISODateTime('2025-03-15', '14:30'),
          finalDate: expectedISODateTime('2025-03-20', '18:45'),
        })
      );
    });
  });
});
