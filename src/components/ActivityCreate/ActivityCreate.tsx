import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
  ActivityFilters,
  ActivityPreview,
  Button,
  Text,
  useQuestionFiltersStore,
  SkeletonText,
  Skeleton,
  SkeletonCard,
  createUseActivityFiltersData,
  SendActivityModal,
  CategoryConfig,
  useToastStore,
} from '../..';
import type {
  ActivityFiltersData,
  BaseApiClient,
  PreviewQuestion,
  QuestionActivity as Question,
  QuestionFiltersState,
  SendActivityFormData,
} from '../..';
import { CaretLeft, PaperPlaneTilt, Funnel } from 'phosphor-react';
import { ActivityListQuestions } from '../ActivityListQuestions/ActivityListQuestions';
import { areFiltersEqual } from '../../utils/activityFilters';
import type {
  ActivityDraftResponse,
  ActivityData,
  BackendFiltersFormat,
  ActivityPreFiltersInput,
} from './ActivityCreate.types';
import { ActivityType, ActivityStatus } from './ActivityCreate.types';
import {
  convertFiltersToBackendFormat,
  convertBackendFiltersToActivityFiltersData,
  generateTitle,
  formatTime,
  convertQuestionToPreview,
  loadCategoriesData,
  getActivityTypeLabel,
} from './ActivityCreate.utils';

/**
 * Loading skeleton component for ActivityCreate page
 *
 * @returns Skeleton JSX element
 */
const ActivityCreateSkeleton = () => {
  return (
    <div
      data-testid="create-activity-page"
      className="flex flex-col w-full h-screen overflow-hidden p-5 bg-background"
    >
      {/* Header Section Skeleton */}
      <div className="w-full h-[80px] flex flex-row items-center justify-between px-6 gap-3 flex-shrink-0">
        <section className="text-text-950">
          <Skeleton variant="rectangular" width={32} height={32} />
        </section>

        <section className="flex flex-col gap-0.5 w-full">
          <div className="flex flex-row items-center justify-between w-full text-text-950">
            <SkeletonText width={180} height={24} />
            <div className="flex flex-row gap-4 items-center">
              <SkeletonText width={150} height={16} />
              <Skeleton variant="rounded" width={120} height={32} />
              <Skeleton variant="rounded" width={140} height={32} />
            </div>
          </div>
          <SkeletonText width={400} height={16} />
        </section>
      </div>

      {/* Main Content with 3 columns - Skeleton */}
      <div className="flex flex-row w-full flex-1 overflow-hidden gap-5 min-h-0">
        {/* First Column - Filters Skeleton */}
        <div className="flex flex-col gap-3 overflow-hidden h-full min-h-0 max-h-full relative w-[400px] flex-shrink-0 p-4 bg-background">
          <SkeletonText width={150} height={20} />
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-3">
              <SkeletonText width={120} height={16} />
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton
                    variant="rounded"
                    key={i}
                    width="100%"
                    height={32}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <SkeletonText width={140} height={16} />
              <div className="flex flex-col gap-2">
                {[1, 2].map((i) => (
                  <Skeleton
                    variant="rounded"
                    key={i}
                    width="100%"
                    height={40}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <SkeletonText width={80} height={16} />
              <div className="grid grid-cols-3 gap-3">
                {[1, 2].map((i) => (
                  <Skeleton
                    variant="rounded"
                    key={i}
                    width="100%"
                    height={60}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="mt-auto">
            <Skeleton variant="rounded" width="100%" height={40} />
          </div>
        </div>

        {/* Second Column - Question List Skeleton */}
        <div className="flex-1 min-w-0 overflow-hidden h-full p-4">
          <div className="flex flex-col gap-4 h-full">
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-row items-center gap-2">
                <Skeleton variant="rectangular" width={24} height={24} />
                <SkeletonText width={150} height={20} />
              </div>
              <Skeleton variant="rounded" width={180} height={32} />
            </div>
            <div className="flex flex-col gap-3 flex-1 overflow-auto">
              {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonCard key={i} lines={3} />
              ))}
            </div>
          </div>
        </div>

        {/* Third Column - Activity Preview Skeleton */}
        <div className="w-[470px] flex-shrink-0 overflow-hidden h-full min-h-0 p-4">
          <div className="flex flex-col gap-4 h-full">
            <div className="flex flex-col gap-2">
              <SkeletonText width={200} height={20} />
              <SkeletonText width={150} height={16} />
            </div>
            <div className="flex flex-col gap-3 flex-1 overflow-auto">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-4 border border-border-200 rounded-lg"
                >
                  <SkeletonText lines={2} spacing="small" />
                  <div className="mt-3 flex gap-2">
                    <Skeleton variant="rounded" width={60} height={24} />
                    <Skeleton variant="rounded" width={80} height={24} />
                  </div>
                </div>
              ))}
            </div>
            <Skeleton variant="rounded" width="100%" height={36} />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Header component for ActivityCreate page
 * Displays title, save status, and action buttons
 *
 * @param props - Component props
 * @returns Header JSX element
 */
const ActivityCreateHeader = ({
  activity,
  activityType,
  lastSavedAt,
  isSaving,
  questionsCount,
  onSaveModel,
  onSendActivity,
}: {
  activity?: ActivityData;
  activityType: ActivityType;
  lastSavedAt: Date | null;
  isSaving: boolean;
  questionsCount: number;
  onSaveModel: () => void;
  onSendActivity: () => void;
}) => {
  const activityTypeLabel = getActivityTypeLabel(activityType);

  return (
    <div className="w-full h-[80px] flex flex-row items-center justify-between px-6 gap-3 flex-shrink-0">
      <section className="text-text-950">
        <CaretLeft size={32} />
      </section>

      <section className="flex flex-col gap-0.5 w-full">
        <div className="flex flex-row items-center justify-between w-full text-text-950">
          <Text size="lg" weight="bold">
            {activity ? 'Editar atividade' : 'Criar atividade'}
          </Text>

          <div className="flex flex-row gap-4 items-center">
            {lastSavedAt ? (
              <Text size="sm">
                {activityTypeLabel} salvo às {formatTime(lastSavedAt)}
              </Text>
            ) : (
              <Text size="sm">
                {isSaving ? 'Salvando...' : 'Nenhum rascunho salvo'}
              </Text>
            )}
            <Button size="small" onClick={onSaveModel}>
              Salvar modelo
            </Button>
            <Button
              size="small"
              iconLeft={<PaperPlaneTilt />}
              onClick={onSendActivity}
              disabled={questionsCount === 0}
            >
              Enviar atividade
            </Button>
          </div>
        </div>

        <Text size="sm">
          Crie uma atividade customizada adicionando questões manualmente ou
          automaticamente.
        </Text>
      </section>
    </div>
  );
};

/**
 * CreateActivity page component for creating new activities
 * This page does not use the standard Layout (header/sidebar)
 * @returns JSX element representing the create activity page
 */
const CreateActivity = ({
  apiClient,
  institutionId,
  isDark,
  activity,
  onActivityChange,
  loading = false,
  preFilters,
}: {
  apiClient: BaseApiClient;
  institutionId: string;
  isDark: boolean;
  activity?: ActivityData;
  onActivityChange?: (activity: ActivityData) => void;
  loading?: boolean;
  preFilters?: ActivityPreFiltersInput | null;
}) => {
  const applyFilters = useQuestionFiltersStore(
    (state: QuestionFiltersState) => state.applyFilters
  );
  const draftFilters = useQuestionFiltersStore(
    (state: QuestionFiltersState) => state.draftFilters
  );
  const appliedFilters = useQuestionFiltersStore(
    (state: QuestionFiltersState) => state.appliedFilters
  );

  const setDraftFilters = useQuestionFiltersStore(
    (state: QuestionFiltersState) => state.setDraftFilters
  );

  const addToast = useToastStore((state) => state.addToast);

  const handleFiltersChange = useCallback(
    (filters: ActivityFiltersData) => {
      setDraftFilters(filters);
    },
    [setDraftFilters]
  );

  const handleApplyFilters = useCallback(() => {
    applyFilters();
  }, [applyFilters]);

  const [questions, setQuestions] = useState<PreviewQuestion[]>([]);
  const [loadingInitialQuestions, setLoadingInitialQuestions] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(
    activity?.id ? activity.id : null
  );
  const [activityType, setActivityType] = useState<ActivityType>(
    (activity?.type as ActivityType) || ActivityType.RASCUNHO
  );
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [isSendingActivity, setIsSendingActivity] = useState(false);
  const hasFirstSaveBeenDone = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedFiltersRef = useRef<ActivityFiltersData | null>(null);
  const lastSavedQuestionsRef = useRef<PreviewQuestion[]>([]);
  const hasAppliedInitialFiltersRef = useRef(false);

  const useActivityFiltersData = createUseActivityFiltersData(apiClient);
  const { knowledgeAreas, loadKnowledgeAreas } = useActivityFiltersData({
    selectedSubjects: [],
    institutionId,
  });

  const resolvedPreFilters = useMemo(() => {
    if (!preFilters) {
      return null;
    }
    if (
      typeof preFilters === 'object' &&
      preFilters !== null &&
      'filters' in preFilters
    ) {
      return (preFilters as { filters?: BackendFiltersFormat | null }).filters;
    }
    return preFilters as BackendFiltersFormat;
  }, [preFilters]);

  const initialFiltersData = useMemo(() => {
    if (activity?.filters) {
      return convertBackendFiltersToActivityFiltersData(activity.filters);
    }
    if (resolvedPreFilters) {
      return convertBackendFiltersToActivityFiltersData(resolvedPreFilters);
    }
    return null;
  }, [activity?.filters, resolvedPreFilters]);

  useEffect(() => {
    hasAppliedInitialFiltersRef.current = false;
  }, [activity?.id, activity?.filters, resolvedPreFilters]);

  /**
   * Validate if save conditions are met
   *
   * @returns true if save can proceed, false otherwise
   */
  const validateSaveConditions = useCallback((): boolean => {
    if (questions.length === 0 && !hasFirstSaveBeenDone.current) {
      return false;
    }
    if (!appliedFilters || appliedFilters.knowledgeIds.length === 0) {
      return false;
    }
    if (loadingInitialQuestions || isSaving) {
      return false;
    }
    return true;
  }, [questions.length, appliedFilters, loadingInitialQuestions, isSaving]);

  /**
   * Create draft payload for API request
   *
   * @returns Draft payload object
   */
  const createDraftPayload = useCallback(() => {
    const subjectId = appliedFilters!.knowledgeIds[0];
    const title = generateTitle(activityType, subjectId, knowledgeAreas);
    const filters = convertFiltersToBackendFormat(appliedFilters);
    const questionIds = questions.map((q) => q.id);

    return {
      type: activityType,
      title,
      subjectId,
      filters,
      questionIds,
    };
  }, [appliedFilters, activityType, knowledgeAreas, questions]);

  /**
   * Update existing draft via PATCH
   *
   * @param payload - Draft payload to send
   */
  const updateExistingDraft = useCallback(
    async (payload: {
      type: ActivityType;
      title: string;
      subjectId: string;
      filters: BackendFiltersFormat;
      questionIds: string[];
    }) => {
      await apiClient.patch<ActivityDraftResponse>(
        `/activity-drafts/${draftId}`,
        payload
      );
      lastSavedQuestionsRef.current = questions;
      lastSavedFiltersRef.current = appliedFilters!;
      setLastSavedAt(new Date());
    },
    [draftId, apiClient, questions, appliedFilters]
  );

  /**
   * Extract draft from API response
   *
   * @param response - API response object
   * @returns Extracted draft object
   * @throws Error if draft cannot be extracted
   */
  const extractDraftFromResponse = useCallback(
    (response: {
      data: ActivityDraftResponse;
    }): ActivityDraftResponse['data']['draft'] => {
      if (!response?.data) {
        console.error('❌ Resposta vazia da API ao criar rascunho:', response);
        throw new Error('Invalid response: empty response from API');
      }

      let savedDraft: ActivityDraftResponse['data']['draft'] | undefined;

      if (response.data.data?.draft) {
        savedDraft = response.data.data.draft;
      } else if (
        response.data &&
        'draft' in response.data &&
        typeof response.data === 'object'
      ) {
        savedDraft = (
          response.data as unknown as {
            draft: ActivityDraftResponse['data']['draft'];
          }
        )?.draft;
      }

      if (!savedDraft?.id) {
        console.error('❌ Resposta inválida da API ao criar rascunho:', {
          response,
          responseData: response?.data,
          responseDataData: response?.data?.data,
          responseKeys: response?.data ? Object.keys(response.data) : [],
          responseDataKeys: response?.data?.data
            ? Object.keys(response.data.data)
            : [],
        });
        throw new Error(
          'Invalid response: draft data is missing. Expected structure: response.data.data.draft'
        );
      }

      return savedDraft;
    },
    []
  );

  /**
   * Update component state after successful draft save
   *
   * @param savedDraft - Saved draft object from API
   */
  const updateStateAfterSave = useCallback(
    (savedDraft: ActivityDraftResponse['data']['draft']) => {
      setDraftId(savedDraft.id);
      setLastSavedAt(new Date());
      lastSavedQuestionsRef.current = questions;
      lastSavedFiltersRef.current = appliedFilters!;

      if (onActivityChange) {
        const updatedActivity: ActivityData = {
          id: savedDraft.id,
          type: savedDraft.type,
          title: savedDraft.title,
          subjectId: savedDraft.subjectId,
          filters: savedDraft.filters,
          questionIds: questions.map((q) => q.id),
        };
        onActivityChange(updatedActivity);
      }
    },
    [questions, appliedFilters, onActivityChange]
  );

  /**
   * Save draft to backend
   */
  const saveDraft = useCallback(async () => {
    if (!validateSaveConditions()) {
      return;
    }

    setIsSaving(true);

    try {
      const payload = createDraftPayload();

      if (draftId) {
        await updateExistingDraft(payload);
        return;
      }

      const response = await apiClient.post<ActivityDraftResponse>(
        '/activity-drafts',
        payload
      );
      hasFirstSaveBeenDone.current = true;

      const savedDraft = extractDraftFromResponse(response);
      updateStateAfterSave(savedDraft);
    } catch (error) {
      console.error('❌ Erro ao salvar rascunho:', error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Ocorreu um erro ao salvar o rascunho. Tente novamente.';

      addToast({
        title: 'Erro ao salvar rascunho',
        description: errorMessage,
        variant: 'solid',
        action: 'warning',
        position: 'top-right',
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    validateSaveConditions,
    createDraftPayload,
    draftId,
    updateExistingDraft,
    apiClient,
    extractDraftFromResponse,
    updateStateAfterSave,
    addToast,
  ]);

  /**
   * Handle save model button click
   */
  const handleSaveModel = useCallback(async () => {
    setActivityType(ActivityType.MODELO);
  }, []);

  /**
   * Update draftId when activity.id changes
   */
  useEffect(() => {
    if (activity?.id) {
      setDraftId(activity.id);
    }
  }, [activity?.id]);

  /**
   * Load knowledge areas on mount
   */
  useEffect(() => {
    loadKnowledgeAreas();
  }, [loadKnowledgeAreas]);

  /**
   * Load initial questions
   * If activity has selectedQuestions, use them directly
   * Questions should come from ListBankQuestions or via activity.selectedQuestions prop
   */
  useEffect(() => {
    if (activity?.selectedQuestions && activity.selectedQuestions.length > 0) {
      setLoadingInitialQuestions(true);
      try {
        const previewQuestions = activity.selectedQuestions.map((q) =>
          convertQuestionToPreview(q)
        );
        setQuestions(previewQuestions);
        hasFirstSaveBeenDone.current = true;
        lastSavedQuestionsRef.current = previewQuestions;
      } catch (error) {
        console.error('❌ Erro ao converter questões:', error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Ocorreu um erro ao carregar as questões. Tente novamente.';
        addToast({
          title: 'Erro ao carregar questões',
          description: errorMessage,
          variant: 'solid',
          action: 'warning',
          position: 'top-right',
        });
      } finally {
        setLoadingInitialQuestions(false);
      }
    }
  }, [activity?.selectedQuestions, addToast]);

  /**
   * Initialize filters from activity (edit mode) or preFilters (create mode)
   */
  useEffect(() => {
    if (hasAppliedInitialFiltersRef.current) {
      return;
    }

    if (!initialFiltersData) {
      return;
    }

    setDraftFilters(initialFiltersData);
    applyFilters();
    lastSavedFiltersRef.current = initialFiltersData;
    hasAppliedInitialFiltersRef.current = true;
  }, [initialFiltersData, setDraftFilters, applyFilters]);

  const saveDraftRef = useRef(saveDraft);
  useEffect(() => {
    saveDraftRef.current = saveDraft;
  }, [saveDraft]);

  /**
   * Auto-save draft when questions or filters change (with debounce)
   */
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (loadingInitialQuestions) {
      return;
    }

    if (questions.length === 0 && !hasFirstSaveBeenDone.current) {
      return;
    }

    if (!appliedFilters || appliedFilters.knowledgeIds.length === 0) {
      return;
    }

    const questionIds = questions.map((q) => q.id).join(',');
    const lastSavedQuestionIds = lastSavedQuestionsRef.current
      .map((q) => q.id)
      .join(',');
    const questionsChanged = questionIds !== lastSavedQuestionIds;

    const filtersChanged = !areFiltersEqual(
      lastSavedFiltersRef.current,
      appliedFilters
    );

    if (!questionsChanged && !filtersChanged && hasFirstSaveBeenDone.current) {
      return;
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveDraftRef.current();
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [questions, appliedFilters, activityType, loadingInitialQuestions]);

  /**
   * Save immediately when activityType changes to MODELO
   */
  useEffect(() => {
    if (activityType === ActivityType.MODELO && hasFirstSaveBeenDone.current) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveDraftRef.current();
    }
  }, [activityType]);

  /**
   * Handle adding a question to the activity
   */
  const handleAddQuestion = useCallback((question: Question) => {
    setQuestions((prev) => {
      if (prev.some((q) => q.id === question.id)) {
        return prev;
      }

      const previewQuestion = convertQuestionToPreview(question);
      return [...prev, previewQuestion];
    });
  }, []);

  /**
   * Handle removing all questions
   */
  const handleRemoveAll = useCallback(() => {
    setQuestions([]);
  }, []);

  /**
   * Handle removing a single question
   */
  const handleRemoveQuestion = useCallback((questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  }, []);

  /**
   * Handle reordering questions
   */
  const handleReorder = useCallback(
    (orderedQuestions: PreviewQuestion[]) => {
      setQuestions(orderedQuestions);
      if (
        hasFirstSaveBeenDone.current &&
        appliedFilters &&
        appliedFilters.knowledgeIds.length > 0 &&
        !loadingInitialQuestions &&
        !isSaving
      ) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveDraftRef.current();
      }
    },
    [appliedFilters, loadingInitialQuestions, isSaving]
  );

  /**
   * Load categories data from API and transform to CategoryConfig format
   */
  const handleLoadCategoriesData = useCallback(async () => {
    if (categories.length > 0) {
      return;
    }

    try {
      const transformedCategories = await loadCategoriesData(
        apiClient,
        categories
      );
      setCategories(transformedCategories);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      throw error;
    }
  }, [apiClient, categories]);

  /**
   * Handle opening the send activity modal
   */
  const handleOpenSendModal = useCallback(async () => {
    try {
      if (categories.length === 0) {
        await handleLoadCategoriesData();
      }
      setIsSendModalOpen(true);
    } catch (error) {
      console.error('Erro ao abrir modal de envio:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erro ao carregar dados. Por favor, tente novamente.';
      addToast({
        title: 'Erro ao carregar dados',
        description: errorMessage,
        variant: 'solid',
        action: 'warning',
        position: 'top-right',
      });
    }
  }, [questions.length, categories.length, handleLoadCategoriesData, addToast]);

  /**
   * Handle sending activity to students
   */
  const handleSendActivity = useCallback(
    async (formData: SendActivityFormData) => {
      setIsSendingActivity(true);
      try {
        const subjectId =
          activity?.subjectId || appliedFilters?.knowledgeIds[0];
        if (!subjectId) {
          throw new Error('Subject ID não encontrado');
        }

        const startDateTime = new Date(
          `${formData.startDate}T${formData.startTime}`
        ).toISOString();
        const finalDateTime = new Date(
          `${formData.finalDate}T${formData.finalTime}`
        ).toISOString();

        const activityPayload = {
          createdBySys: false,
          title: formData.title,
          subjectId: subjectId,
          questionIds: questions.map((q) => q.id),
          subtype: formData.subtype,
          difficulty: '',
          notification: formData.notification || '',
          status: ActivityStatus.A_VENCER,
          startDate: startDateTime,
          finalDate: finalDateTime,
          canRetry: formData.canRetry,
        };

        // First POST: Create activity and capture response
        const createActivityResponse = await apiClient.post<{
          message: string;
          data: {
            activity: {
              id: string;
            };
          };
        }>('/activities', activityPayload);

        // Extract activity ID from response
        const activityId = createActivityResponse?.data?.data?.activity?.id;
        if (!activityId) {
          throw new Error('ID da atividade não retornado pela API');
        }

        // Second POST: Send activity to students with activityId and students
        const sendToStudentsPayload = {
          activityId: activityId,
          students: formData.students,
        };

        const sendToStudentsResponse = await apiClient.post<{
          message: string;
          data: unknown;
        }>('/activities/send-to-students', sendToStudentsPayload);

        // Validate both responses
        if (!createActivityResponse?.data) {
          throw new Error('Resposta inválida ao criar atividade');
        }
        if (!sendToStudentsResponse?.data) {
          throw new Error(
            'Resposta inválida ao enviar atividade para estudantes'
          );
        }

        // Only close modal and show success after both succeed
        setIsSendModalOpen(false);
        addToast({
          title: 'Atividade enviada com sucesso!',
          description:
            'A atividade foi criada e enviada para os estudantes selecionados.',
          variant: 'solid',
          action: 'success',
          position: 'top-right',
        });
      } catch (error) {
        console.error('Erro ao enviar atividade:', error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Ocorreu um erro ao enviar a atividade. Tente novamente.';
        addToast({
          title: 'Erro ao enviar atividade',
          description: errorMessage,
          variant: 'solid',
          action: 'warning',
          position: 'top-right',
        });
        throw error;
      } finally {
        setIsSendingActivity(false);
      }
    },
    [activity, appliedFilters, questions, apiClient, addToast]
  );

  const addedQuestionIds = useMemo(
    () => questions.map((q) => q.id),
    [questions]
  );

  // Render loading skeleton
  if (loading) {
    return <ActivityCreateSkeleton />;
  }

  return (
    <div
      data-testid="create-activity-page"
      className="flex flex-col w-full h-screen overflow-hidden p-5 bg-background"
    >
      {/* Header Section */}
      <ActivityCreateHeader
        activity={activity}
        activityType={activityType}
        lastSavedAt={lastSavedAt}
        isSaving={isSaving}
        questionsCount={questions.length}
        onSaveModel={handleSaveModel}
        onSendActivity={handleOpenSendModal}
      />

      {/* Main Content with 3 columns */}
      <div className="flex flex-row w-full flex-1 overflow-hidden gap-5 min-h-0">
        {/* First Column - Filters */}
        <div className="flex flex-col gap-3 overflow-hidden h-full min-h-0 max-h-full relative w-[400px] flex-shrink-0">
          <div className="flex flex-col overflow-y-auto overflow-x-hidden flex-1 min-h-0 max-h-full">
            <ActivityFilters
              apiClient={apiClient}
              institutionId={institutionId}
              variant={'default'}
              onFiltersChange={handleFiltersChange}
              initialFilters={initialFiltersData || undefined}
            />
          </div>
          <div className="flex-shrink-0">
            <Button
              size="medium"
              iconLeft={<Funnel />}
              onClick={handleApplyFilters}
              disabled={!draftFilters}
              className="w-full"
            >
              Filtrar
            </Button>
          </div>
        </div>

        {/* Second Column - Center, fills remaining space */}
        <div className="flex-1 min-w-0 overflow-hidden h-full">
          <ActivityListQuestions
            apiClient={apiClient}
            onAddQuestion={handleAddQuestion}
            addedQuestionIds={addedQuestionIds}
          />
        </div>

        {/* Third Column - Activity Preview */}
        <div className="w-[470px] flex-shrink-0 overflow-hidden h-full min-h-0">
          {loadingInitialQuestions ? (
            <div className="flex flex-col gap-4 p-4">
              <div className="flex flex-col gap-2">
                <SkeletonText lines={1} width={200} />
                <SkeletonText lines={1} width={150} />
              </div>
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border rounded">
                    <SkeletonText lines={2} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <ActivityPreview
              questions={questions}
              onRemoveAll={handleRemoveAll}
              onRemoveQuestion={handleRemoveQuestion}
              onReorder={handleReorder}
              isDark={isDark}
              className="h-full overflow-y-auto"
            />
          )}
        </div>
      </div>

      {/* Send Activity Modal */}
      <SendActivityModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        onSubmit={handleSendActivity}
        categories={categories}
        isLoading={isSendingActivity}
        onError={(error) => {
          console.error('Erro ao enviar atividade:', error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Erro ao enviar atividade. Por favor, tente novamente.';
          addToast({
            title: 'Erro ao enviar atividade',
            description: errorMessage,
            variant: 'solid',
            action: 'warning',
            position: 'top-right',
          });
        }}
      />
    </div>
  );
};

export { CreateActivity };
export { ActivityType, ActivityStatus } from './ActivityCreate.types';
export type {
  BackendFiltersFormat,
  ActivityDraftResponse,
  ActivityData,
  ActivityPreFiltersInput,
} from './ActivityCreate.types';
