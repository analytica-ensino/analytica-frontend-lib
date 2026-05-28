/**
 * useSendActivity Hook
 *
 * Hook for managing the SendActivityModal state and actions.
 * Uses BaseApiClient for type-safe API calls to backend-monolito endpoints.
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import dayjs from 'dayjs';
import type { CategoryConfig } from '../components/CheckBoxGroup/CheckBoxGroup';
import {
  ActivityMode,
  ActivitySubtype,
  type SendActivityFormData,
  type SendActivityModalInitialData,
} from '../components/SendActivityModal/types';
import type {
  UseSendActivityConfig,
  UseSendActivityReturn,
  ActivityModelItem,
} from '../types/sendActivity';
import { loadCategoriesData } from '../utils/categoryDataUtils';
import { useDynamicStudentFetching } from '../utils/useDynamicStudentFetching';

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
 * Pass a BaseApiClient instance and the hook will handle all API calls internally
 * using the backend-monolito endpoints.
 *
 * @param config - Configuration with BaseApiClient instance and optional callbacks
 * @returns Object with modal state, categories, and handlers
 *
 * @example
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
 */
export function useSendActivity(
  config: UseSendActivityConfig
): UseSendActivityReturn {
  const { api, onSuccess, onError } = config;

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
      const categoryConfig = await loadCategoriesData(api, []);
      setCategories(categoryConfig);
      categoriesLoadedRef.current = true;
    } catch (error) {
      console.error('Error loading categories:', error);
      onError?.('Erro ao carregar destinatários');
    } finally {
      setIsCategoriesLoading(false);
    }
  }, [api, onError]);

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
   * Handle categories change from CheckboxGroup.
   * Fetches students dynamically via POST /students/filters when the
   * school/série/turma selections change, mirroring the activity creation flow.
   */
  const { handleCategoriesChange: onCategoriesChange } =
    useDynamicStudentFetching(setCategories, { apiClient: api });

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
        let questionIds: string[] | null = null;
        try {
          const response = await api.get<{
            data: { selectedQuestions?: { id: string }[] };
          }>(`/activity-drafts/${selectedModel.id}`);
          questionIds =
            response.data.data.selectedQuestions?.map((q) => q.id) || null;
        } catch {
          questionIds = null;
        }

        if (!questionIds || questionIds.length === 0) {
          throw new Error('Não foi possível obter questões do modelo');
        }

        // 2. Create activity
        const createResponse = await api.post<{ data: { id: string } }>(
          '/activities',
          {
            title: data.title,
            subjectId: selectedModel.subjectId,
            questionIds,
            subtype: data.subtype,
            isDigital:
              data.subtype === ActivitySubtype.PROVA
                ? data.mode !== ActivityMode.PRESENCIAL
                : true,
            notification: data.notification,
            startDate: toISODateTime(data.startDate, data.startTime),
            finalDate: toISODateTime(data.finalDate, data.finalTime),
            canRetry: data.canRetry,
          }
        );

        // 3. Send to students
        await api.post('/activities/send-to-students', {
          activityId: createResponse.data.data.id,
          students: data.students,
        });

        onSuccess?.(`Atividade enviada para ${data.students.length} aluno(s)`);

        closeModal();
      } catch (error) {
        console.error('Error sending activity:', error);
        onError?.('Erro ao enviar atividade');
      } finally {
        setIsLoading(false);
      }
    },
    [selectedModel, api, onSuccess, onError, closeModal]
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
