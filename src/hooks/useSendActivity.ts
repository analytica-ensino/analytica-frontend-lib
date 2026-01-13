/**
 * useSendActivity Hook
 *
 * Hook for managing the SendActivityModal state and actions.
 * Uses the API injection pattern (like ActivityDetails) for flexibility.
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import dayjs from 'dayjs';
import type { CategoryConfig } from '../components/CheckBoxGroup/CheckBoxGroup';
import type {
  SendActivityFormData,
  SendActivityModalInitialData,
} from '../components/SendActivityModal/types';
import type {
  UseSendActivityConfig,
  UseSendActivityReturn,
  SendActivityCategoriesData,
  ActivityModelItem,
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
 * Hook for managing the SendActivityModal state and actions
 *
 * Uses the API injection pattern - receives functions for API calls
 * instead of making calls directly. This allows the hook to be used
 * in different projects with different API configurations.
 *
 * @param config - Configuration with API functions and callbacks
 * @returns Object with modal state, categories, and handlers
 *
 * @example
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
  config: UseSendActivityConfig
): UseSendActivityReturn {
  const {
    fetchCategories,
    createActivity,
    sendToStudents,
    fetchQuestionIds,
    onSuccess,
    onError,
  } = config;

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
