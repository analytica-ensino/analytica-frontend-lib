/**
 * useSendActivity Hook
 *
 * Hook for managing the SendActivityModal state and actions.
 * Supports two usage patterns:
 * 1. Direct API instance (recommended): Pass AxiosInstance with optional endpoint config
 * 2. Custom functions: Pass individual API functions for full control
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import dayjs from 'dayjs';
import type { CategoryConfig } from '../components/CheckBoxGroup/CheckBoxGroup';
import {
  ActivityMode,
  type SendActivityFormData,
  type SendActivityModalInitialData,
} from '../components/SendActivityModal/types';
import type {
  UseSendActivityConfig,
  UseSendActivityDirectConfig,
  UseSendActivityReturn,
  SendActivityCategoriesData,
  ActivityModelItem,
  CreateActivityPayload,
  StudentPayload,
} from '../types/sendActivity';

/**
 * Transform categories data to CategoryConfig format for CheckboxGroup
 * @param data - Categories data from API
 * @returns Array of CategoryConfig for CheckboxGroup
 */
function transformToCategoryConfig(
  data: SendActivityCategoriesData
): CategoryConfig[] {
  return [
    {
      key: 'escola',
      label: 'Escola',
      itens: data.schools,
      selectedIds: [],
    },
    {
      key: 'serie',
      label: 'Série',
      dependsOn: ['escola'],
      itens: data.schoolYears,
      filteredBy: [{ key: 'escola', internalField: 'escolaId' }],
      selectedIds: [],
    },
    {
      key: 'turma',
      label: 'Turma',
      dependsOn: ['escola', 'serie'],
      itens: data.classes,
      filteredBy: [
        { key: 'escola', internalField: 'escolaId' },
        { key: 'serie', internalField: 'serieId' },
      ],
      selectedIds: [],
    },
    {
      key: 'students',
      label: 'Aluno',
      dependsOn: ['escola', 'serie', 'turma'],
      itens: data.students,
      filteredBy: [
        { key: 'escola', internalField: 'escolaId' },
        { key: 'serie', internalField: 'serieId' },
        { key: 'turma', internalField: 'turmaId' },
      ],
      selectedIds: [],
    },
  ];
}

/**
 * Convert date and time to ISO datetime string
 * Uses dayjs for proper timezone conversion
 * @param date - Date string in YYYY-MM-DD format
 * @param time - Time string in HH:MM format
 * @returns ISO datetime string in UTC
 */
function toISODateTime(date: string, time: string): string {
  return dayjs(`${date}T${time}`).toISOString();
}

/**
 * Type guard to check if config is direct API config
 */
function isDirectConfig(
  config: UseSendActivityConfig | UseSendActivityDirectConfig
): config is UseSendActivityDirectConfig {
  return 'api' in config;
}

/**
 * Create API functions from Axios instance using backend-monolito endpoints
 * Using any for api to avoid peer dependency issues between different axios versions
 */
function createApiFunctions(api: any) {
  return {
    fetchCategories: async (): Promise<SendActivityCategoriesData> => {
      const [schoolsRes, yearsRes, classesRes, studentsRes] = await Promise.all(
        [
          api.get('/school'),
          api.get('/schoolYear'),
          api.get('/classes'),
          api.get('/students'),
        ]
      );

      return {
        schools: schoolsRes.data.data || [],
        schoolYears: yearsRes.data.data || [],
        classes: classesRes.data.data || [],
        students: studentsRes.data.data || [],
      };
    },

    createActivity: async (
      data: CreateActivityPayload
    ): Promise<{ id: string }> => {
      const response = await api.post('/activities', data);
      return { id: response.data.data.id };
    },

    sendToStudents: async (
      activityId: string,
      students: StudentPayload[]
    ): Promise<void> => {
      await api.post('/activities/send-to-students', {
        activityId,
        students,
      });
    },

    fetchQuestionIds: async (modelId: string): Promise<string[] | null> => {
      try {
        const response = await api.get(`/activity-drafts/${modelId}`);
        const draft = response.data.data;
        return (
          draft.selectedQuestions?.map((q: { id: string }) => q.id) || null
        );
      } catch {
        return null;
      }
    },
  };
}

/**
 * Hook for managing the SendActivityModal state and actions
 *
 * Supports two usage patterns:
 * 1. Direct (recommended): Pass Axios instance and optional callbacks
 * 2. Custom functions: Pass individual API functions for full control
 *
 * @param config - Configuration with either Axios instance or custom functions
 * @returns Object with modal state, categories, and handlers
 *
 * @example Direct usage (recommended)
 * ```tsx
 * import { useSendActivity } from 'analytica-frontend-lib';
 * import api from '@/services/apiService';
 *
 * const sendActivity = useSendActivity({
 *   api,
 *   onSuccess: (msg) => toast.success(msg),
 *   onError: (msg) => toast.error(msg),
 * });
 * ```
 *
 * @example Custom functions (legacy)
 * ```tsx
 * const sendActivity = useSendActivity({
 *   fetchCategories: async () => {
 *     const [schools, years, classes, students] = await Promise.all([
 *       api.get('/schools'),
 *       api.get('/school-years'),
 *       api.get('/classes'),
 *       api.get('/students'),
 *     ]);
 *     return { schools, schoolYears: years, classes, students };
 *   },
 *   createActivity: async (data) => {
 *     const response = await api.post('/activities', data);
 *     return { id: response.data.id };
 *   },
 *   sendToStudents: async (activityId, students) => {
 *     await api.post('/activities/send-to-students', { activityId, students });
 *   },
 *   fetchQuestionIds: async (modelId) => {
 *     const response = await api.get(`/activity-drafts/${modelId}`);
 *     return response.data.selectedQuestions?.map(q => q.id) || null;
 *   },
 *   onSuccess: (msg) => toast.success(msg),
 *   onError: (msg) => toast.error(msg),
 * });
 * ```
 */
export function useSendActivity(
  config: UseSendActivityDirectConfig
): UseSendActivityReturn;
export function useSendActivity(
  config: UseSendActivityConfig
): UseSendActivityReturn;
export function useSendActivity(
  config: UseSendActivityConfig | UseSendActivityDirectConfig
): UseSendActivityReturn {
  // Extract API functions based on config type
  const apiFunctions = useMemo(() => {
    if (isDirectConfig(config)) {
      return createApiFunctions(config.api);
    }
    return {
      fetchCategories: config.fetchCategories,
      createActivity: config.createActivity,
      sendToStudents: config.sendToStudents,
      fetchQuestionIds: config.fetchQuestionIds,
    };
  }, [config]);

  const { fetchCategories, createActivity, sendToStudents, fetchQuestionIds } =
    apiFunctions;
  const { onSuccess, onError } = config;

  const [isOpen, setIsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ActivityModelItem | null>(
    null
  );
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);

  const categoriesLoadedRef = useRef(false);

  /**
   * Initial data for pre-filling the modal form
   */
  const initialData = useMemo<SendActivityModalInitialData | undefined>(() => {
    if (!selectedModel) return undefined;
    return {
      title: selectedModel.title,
    };
  }, [selectedModel]);

  /**
   * Load categories for recipient selection
   */
  const loadCategories = useCallback(async () => {
    if (categoriesLoadedRef.current) return;

    setIsCategoriesLoading(true);
    try {
      const data = await fetchCategories();
      const categoryConfig = transformToCategoryConfig(data);
      setCategories(categoryConfig);
      categoriesLoadedRef.current = true;
    } catch (error) {
      console.error('Error loading categories:', error);
      onError?.('Erro ao carregar destinatários');
    } finally {
      setIsCategoriesLoading(false);
    }
  }, [fetchCategories, onError]);

  /**
   * Open the modal with a selected model
   * @param model - Activity model to send
   */
  const openModal = useCallback(
    (model: ActivityModelItem) => {
      setSelectedModel(model);
      setIsOpen(true);
      void loadCategories();
    },
    [loadCategories]
  );

  /**
   * Close the modal and reset state
   */
  const closeModal = useCallback(() => {
    setIsOpen(false);
    setSelectedModel(null);
  }, []);

  /**
   * Handle categories change from CheckboxGroup
   * @param updatedCategories - Updated categories array
   */
  const onCategoriesChange = useCallback(
    (updatedCategories: CategoryConfig[]) => {
      setCategories(updatedCategories);
    },
    []
  );

  /**
   * Handle form submission
   * @param data - Form data from SendActivityModal
   */
  const handleSubmit = useCallback(
    async (data: SendActivityFormData) => {
      if (!selectedModel) return;

      setIsLoading(true);

      try {
        // 1. Fetch question IDs from draft/model
        const questionIds = await fetchQuestionIds(selectedModel.id);
        if (!questionIds || questionIds.length === 0) {
          throw new Error('Não foi possível obter questões do modelo');
        }

        // 2. Create activity
        const createResponse = await createActivity({
          title: data.title,
          subjectId: selectedModel.subjectId,
          questionIds,
          subtype: data.subtype,
          isDigital:
            data.mode === undefined
              ? undefined
              : data.mode === ActivityMode.ONLINE,
          notification: data.notification,
          startDate: toISODateTime(data.startDate, data.startTime),
          finalDate: toISODateTime(data.finalDate, data.finalTime),
          canRetry: data.canRetry,
        });

        // 3. Send to students
        await sendToStudents(createResponse.id, data.students);

        onSuccess?.(`Atividade enviada para ${data.students.length} aluno(s)`);

        closeModal();
      } catch (error) {
        console.error('Error sending activity:', error);
        onError?.('Erro ao enviar atividade');
      } finally {
        setIsLoading(false);
      }
    },
    [
      selectedModel,
      fetchQuestionIds,
      createActivity,
      sendToStudents,
      onSuccess,
      onError,
      closeModal,
    ]
  );

  return {
    isOpen,
    openModal,
    closeModal,
    selectedModel,
    initialData,
    categories,
    onCategoriesChange,
    isLoading,
    isCategoriesLoading,
    handleSubmit,
  };
}
