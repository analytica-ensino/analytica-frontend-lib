import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ActivityFilters,
  ActivityFiltersPopover,
  ActivityPreview,
  Button,
  SkeletonText,
  useQuestionFiltersStore,
  createUseActivityFiltersData,
  SendActivityModal,
  CategoryConfig,
  useToastStore,
  Modal,
  Text,
} from '../..';
import Menu, { MenuContent, MenuItem } from '../Menu/Menu';
import type {
  ActivityFiltersData,
  BaseApiClient,
  PreviewQuestion,
  QuestionActivity as Question,
  QuestionFiltersState,
  SendActivityFormData,
} from '../..';
import type { Lesson } from '../../types/lessons';
import { Funnel, MonitorPlay } from 'phosphor-react';
import { ActivityListQuestions } from '../ActivityListQuestions/ActivityListQuestions';
import { areFiltersEqual } from '../../utils/activityFilters';
import type {
  ActivityDraftResponse,
  ActivityData,
  BackendFiltersFormat,
  ActivityPreFiltersInput,
  ActivityCreatePayload,
  ActivityCreateResponse,
} from './ActivityCreate.types';
import { ActivityType, ActivityStatus } from './ActivityCreate.types';
import {
  convertFiltersToBackendFormat,
  convertBackendFiltersToActivityFiltersData,
  generateTitle,
  convertQuestionToPreview,
  loadCategoriesData,
  getTypeFromUrl,
  getTypeFromUrlString,
} from './ActivityCreate.utils';
import { ActivityCreateSkeleton } from './components/ActivityCreateSkeleton';
import { ActivityCreateHeader } from './components/ActivityCreateHeader';

/**
 * CreateActivity page component for creating new activities
 * This page does not use the standard Layout (header/sidebar)
 * @returns JSX element representing the create activity page
 */
const CreateActivity = ({
  apiClient,
  institutionId,
  isDark,
  onBack,
  onCreateActivity,
  onSaveModel,
  onAddActivityToLesson,
}: {
  apiClient: BaseApiClient;
  institutionId: string;
  isDark: boolean;
  onBack?: () => void;
  onCreateActivity?: (
    activityId: string,
    activityData: ActivityCreatePayload
  ) => void;
  onSaveModel?: (response: ActivityDraftResponse) => void;
  onAddActivityToLesson?: (activityDraftId: string) => void;
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const typeParam = searchParams.get('type') || undefined;
  const idParam = searchParams.get('id') || undefined;
  const recommendedLessonId =
    searchParams.get('recommended-lesson') || undefined;
  const recommendedLessonDraftId =
    searchParams.get('recommended-lesson-draft') || undefined;
  const onFinishPath = searchParams.get('onFinish') || undefined;

  // Determine if we're in recommended lesson mode
  const isRecommendedLessonMode = !!(
    recommendedLessonId || recommendedLessonDraftId
  );
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

  const clearFilters = useQuestionFiltersStore(
    (state: QuestionFiltersState) => state.clearFilters
  );

  const addToast = useToastStore((state) => state.addToast);

  // Responsive state for screen width <= 1200px
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [selectedView, setSelectedView] = useState<'questions' | 'preview'>(
    'questions'
  );

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth <= 1200);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Estados internos
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [preFilters, setPreFilters] = useState<ActivityPreFiltersInput | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<PreviewQuestion[]>([]);
  const [loadingInitialQuestions, setLoadingInitialQuestions] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(idParam ?? null);
  const [activityType, setActivityType] = useState<ActivityType>(
    getTypeFromUrlString(typeParam)
  );
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [isSendingActivity, setIsSendingActivity] = useState(false);
  const [isLessonPreviewModalOpen, setIsLessonPreviewModalOpen] =
    useState(false);
  const [previewLessons, setPreviewLessons] = useState<Lesson[]>([]);
  const [isLoadingPreviewLessons, setIsLoadingPreviewLessons] = useState(false);
  const hasFirstSaveBeenDone = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedFiltersRef = useRef<ActivityFiltersData | null>(null);
  const lastSavedQuestionsRef = useRef<PreviewQuestion[]>([]);
  const hasAppliedInitialFiltersRef = useRef(false);
  const lastFetchedActivityIdRef = useRef<string | null>(null);

  const handleFiltersChange = useCallback(
    (filters: ActivityFiltersData) => {
      setDraftFilters(filters);
    },
    [setDraftFilters]
  );

  const handleApplyFilters = useCallback(() => {
    applyFilters();
  }, [applyFilters]);

  /**
   * Handle back button click - resets everything before calling onBack
   * If onFinishPath is provided, navigate to that path instead
   */
  const handleBack = useCallback(() => {
    // Clear filters from store
    clearFilters();

    // If onFinishPath is provided, navigate to it
    if (onFinishPath) {
      navigate(`/${onFinishPath}`);
      return;
    }

    // Call original onBack if provided
    if (onBack) {
      onBack();
    }
  }, [clearFilters, onBack, onFinishPath, navigate]);

  /**
   * Handle lesson preview button click - fetches lessons from recommended-lesson-draft and opens modal
   */
  const handleLessonPreview = useCallback(async () => {
    setIsLessonPreviewModalOpen(true);

    // Get the draft ID from URL params
    const draftIdToFetch = recommendedLessonDraftId || recommendedLessonId;
    if (!draftIdToFetch) {
      return;
    }

    setIsLoadingPreviewLessons(true);
    try {
      // Determine endpoint based on which ID we have
      const endpoint = recommendedLessonDraftId
        ? `/recommended-lesson-drafts/${draftIdToFetch}`
        : `/recommended-lessons/${draftIdToFetch}`;

      const response = await apiClient.get<{
        data: {
          draft?: { selectedLessons?: Lesson[] };
          selectedLessons?: Lesson[];
        };
      }>(endpoint);

      // Handle both response formats (draft wrapper or direct)
      const lessons =
        response.data.data.draft?.selectedLessons ||
        response.data.data.selectedLessons ||
        [];
      setPreviewLessons(lessons);
    } catch (error) {
      console.error('Error fetching lesson preview:', error);
      setPreviewLessons([]);
    } finally {
      setIsLoadingPreviewLessons(false);
    }
  }, [recommendedLessonDraftId, recommendedLessonId, apiClient]);

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
   * Busca o rascunho/modelo da atividade quando há um id na URL
   * Só faz a busca se o id mudou para um diferente do que está sendo trabalhado
   */
  useEffect(() => {
    const fetchActivityDraft = async () => {
      // Só busca se há um id e ele é diferente do último buscado
      // Remove a dependência de activity?.id para evitar refetch quando atualizamos activity via PATCH
      if (idParam && idParam !== lastFetchedActivityIdRef.current) {
        setLoading(true);
        try {
          const response = await apiClient.get<
            { data: ActivityData } | ActivityData
          >(`/activity-drafts/${idParam}`);
          const activityData =
            'data' in response.data ? response.data.data : response.data;

          setActivity(activityData);
          setPreFilters(activityData.filters);
          setDraftId(activityData.id || null);
          setActivityType(activityData.type);
          if (activityData.updatedAt) {
            setLastSavedAt(new Date(activityData.updatedAt));
          }
          lastFetchedActivityIdRef.current = idParam;
        } catch (error) {
          console.error('Erro ao buscar rascunho da atividade:', error);
          addToast({
            title: 'Erro ao carregar atividade',
            description:
              error instanceof Error
                ? error.message
                : 'Ocorreu um erro ao carregar a atividade. Tente novamente.',
            variant: 'solid',
            action: 'warning',
            position: 'top-right',
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchActivityDraft();
  }, [idParam, apiClient, addToast]);

  /**
   * Monitora activity.id e activity.type e atualiza a URL quando necessário
   * Se activity.id ou activity.type mudarem, atualiza a URL para refletir o tipo correto
   */
  useEffect(() => {
    if (activity?.id && activity?.type) {
      const urlType = getTypeFromUrl(activity.type);
      const currentUrlType = typeParam;
      const currentUrlId = idParam;

      // Atualiza a URL se o tipo ou id mudaram
      if (
        !currentUrlType ||
        !currentUrlId ||
        currentUrlId !== activity.id ||
        currentUrlType !== urlType
      ) {
        navigate(`/criar-atividade?type=${urlType}&id=${activity.id}`, {
          replace: true,
        });
      }
    }
  }, [activity?.id, activity?.type, typeParam, idParam, navigate]);

  /**
   * Validate if save conditions are met
   *
   * @returns true if save can proceed, false otherwise
   */
  const validateSaveConditions = useCallback((): boolean => {
    if (questions.length === 0 && !hasFirstSaveBeenDone.current) {
      return false;
    }
    if (!appliedFilters?.subjectIds?.length) {
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
    const subjectId = appliedFilters?.subjectIds?.[0];
    if (!subjectId) {
      throw new Error('Subject ID não encontrado');
    }
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
      const response = await apiClient.patch<ActivityDraftResponse>(
        `/activity-drafts/${draftId}`,
        payload
      );
      lastSavedQuestionsRef.current = questions;
      lastSavedFiltersRef.current = appliedFilters!;
      // Use updatedAt from response if available, otherwise use current time
      const savedDraft = response?.data?.data?.draft;
      setLastSavedAt(
        savedDraft?.updatedAt ? new Date(savedDraft.updatedAt) : new Date()
      );

      // Atualiza o estado interno da atividade apenas com campos que mudaram
      // Não atualizamos filters para evitar disparar novas buscas desnecessárias
      if (savedDraft) {
        setActivity((prevActivity) => {
          if (!prevActivity || prevActivity.id !== savedDraft.id) {
            // Se não há atividade anterior ou o ID mudou, atualiza tudo
            return {
              id: savedDraft.id,
              type: savedDraft.type,
              title: savedDraft.title,
              subjectId: savedDraft.subjectId,
              filters: savedDraft.filters,
              questionIds: questions.map((q) => q.id),
              updatedAt: savedDraft.updatedAt,
            };
          }
          // Se é a mesma atividade, só atualiza campos que podem ter mudado
          // Mantém filters do estado anterior para evitar refetch
          return {
            ...prevActivity,
            type: savedDraft.type,
            title: savedDraft.title,
            subjectId: savedDraft.subjectId,
            questionIds: questions.map((q) => q.id),
            updatedAt: savedDraft.updatedAt,
          };
        });
        setActivityType(savedDraft.type);
        // Atualiza o ref para evitar refetch desnecessário
        if (savedDraft.id) {
          lastFetchedActivityIdRef.current = savedDraft.id;
        }
      }

      // Call onSaveModel callback if type is MODELO and callback is provided
      if (
        payload.type === ActivityType.MODELO &&
        onSaveModel &&
        response?.data
      ) {
        onSaveModel(response.data);
      }
    },
    [draftId, apiClient, questions, appliedFilters, onSaveModel]
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
   * @param fullResponse - Full API response (optional, for onSaveModel callback)
   * @param wasNewDraft - Whether this was a new draft creation (to update URL)
   */
  const updateStateAfterSave = useCallback(
    (
      savedDraft: ActivityDraftResponse['data']['draft'],
      fullResponse?: ActivityDraftResponse,
      wasNewDraft = false
    ) => {
      setDraftId(savedDraft.id);
      // Use updatedAt from savedDraft if available, otherwise use current time
      setLastSavedAt(
        savedDraft.updatedAt ? new Date(savedDraft.updatedAt) : new Date()
      );
      lastSavedQuestionsRef.current = questions;
      lastSavedFiltersRef.current = appliedFilters!;

      // Atualiza o estado interno da atividade
      const updatedActivity: ActivityData = {
        id: savedDraft.id,
        type: savedDraft.type,
        title: savedDraft.title,
        subjectId: savedDraft.subjectId,
        filters: savedDraft.filters,
        questionIds: questions.map((q) => q.id),
        updatedAt: savedDraft.updatedAt,
      };
      setActivity(updatedActivity);
      setActivityType(savedDraft.type);
      lastFetchedActivityIdRef.current = savedDraft.id;

      // Se foi um novo rascunho, atualiza a URL
      if (wasNewDraft && savedDraft.id) {
        const urlType = getTypeFromUrl(savedDraft.type);
        navigate(`/criar-atividade?type=${urlType}&id=${savedDraft.id}`, {
          replace: true,
        });
      }

      // Call onSaveModel callback if type is MODELO and callback is provided
      if (
        savedDraft.type === ActivityType.MODELO &&
        onSaveModel &&
        fullResponse
      ) {
        onSaveModel(fullResponse);
      }
    },
    [questions, appliedFilters, onSaveModel, navigate]
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
      updateStateAfterSave(savedDraft, response?.data, true);
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
   * Handle add activity to lesson - saves draft and navigates back or calls callback
   */
  const handleAddActivityToLesson = useCallback(async () => {
    // Ensure draft is saved before adding to lesson
    if (!draftId && questions.length > 0) {
      await saveDraft();
    }

    const activityDraftId = draftId;

    // Call callback if provided
    if (onAddActivityToLesson && activityDraftId) {
      onAddActivityToLesson(activityDraftId);
    }

    // Clear filters
    clearFilters();

    // Navigate to onFinishPath if provided
    if (onFinishPath) {
      navigate(`/${onFinishPath}`);
    } else if (onBack) {
      onBack();
    }
  }, [
    draftId,
    questions.length,
    saveDraft,
    onAddActivityToLesson,
    clearFilters,
    onFinishPath,
    navigate,
    onBack,
  ]);

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

    if (!appliedFilters) {
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

      try {
        const previewQuestion = convertQuestionToPreview(question);
        return [...prev, previewQuestion];
      } catch (error) {
        console.error('Erro ao converter questão para preview:', {
          questionId: question.id,
          questionType: question.questionType,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        // Retorna o estado anterior inalterado em caso de erro
        return prev;
      }
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
      const hasSubjectIds =
        Array.isArray(appliedFilters?.subjectIds) &&
        appliedFilters.subjectIds.length > 0;
      if (
        hasFirstSaveBeenDone.current &&
        hasSubjectIds &&
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
          activity?.subjectId || appliedFilters?.subjectIds?.[0];
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
        const createActivityResponse =
          await apiClient.post<ActivityCreateResponse>(
            '/activities',
            activityPayload
          );

        // Extract activity ID from response
        const activityId = createActivityResponse?.data?.data?.id;
        if (!activityId) {
          throw new Error('ID da atividade não retornado pela API');
        }

        // Call onCreateActivity callback if provided
        if (onCreateActivity) {
          onCreateActivity(activityId, activityPayload);
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
        activity={activity || undefined}
        activityType={activityType}
        lastSavedAt={lastSavedAt}
        isSaving={isSaving}
        questionsCount={questions.length}
        onSaveModel={handleSaveModel}
        onSendActivity={handleOpenSendModal}
        onBack={handleBack}
        isRecommendedLessonMode={isRecommendedLessonMode}
        onLessonPreview={handleLessonPreview}
        onAddActivity={handleAddActivityToLesson}
      />

      {/* Main Content */}
      {isSmallScreen ? (
        /* Small Screen Layout (<= 1200px) */
        <div className="flex flex-col w-full flex-1 overflow-hidden gap-5 min-h-0">
          {/* Filters and Menu Row */}
          <div className="flex flex-row items-center justify-between gap-4 flex-shrink-0">
            <ActivityFiltersPopover
              apiClient={apiClient}
              institutionId={institutionId}
              onFiltersChange={handleFiltersChange}
              initialFilters={initialFiltersData || undefined}
              triggerLabel="Filtro de questões"
              onApplyFilters={handleApplyFilters}
              onClearFilters={clearFilters}
            />
            <div className="flex-shrink-0">
              <Menu
                defaultValue="questions"
                value={selectedView}
                onValueChange={(value) =>
                  setSelectedView(value as 'questions' | 'preview')
                }
                variant="breadcrumb"
              >
                <MenuContent variant="breadcrumb">
                  <MenuItem value="questions" variant="breadcrumb">
                    Banco de questões
                  </MenuItem>
                  <MenuItem value="preview" variant="breadcrumb">
                    Prévia da atividade
                  </MenuItem>
                </MenuContent>
              </Menu>
            </div>
          </div>

          {/* Content Area - Single Column */}
          <div className="flex-1 min-w-0 overflow-hidden h-full">
            {selectedView === 'questions' ? (
              <ActivityListQuestions
                apiClient={apiClient}
                onAddQuestion={handleAddQuestion}
                addedQuestionIds={addedQuestionIds}
              />
            ) : (
              <div className="w-full h-full overflow-hidden min-h-0">
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
            )}
          </div>
        </div>
      ) : (
        /* Desktop Layout (> 1200px) - 3 columns */
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
          <div className="w-[400px] flex-shrink-0 overflow-hidden h-full min-h-0">
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
      )}

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

      {/* Lesson Preview Modal */}
      <Modal
        isOpen={isLessonPreviewModalOpen}
        onClose={() => setIsLessonPreviewModalOpen(false)}
        title="Prévia da aula recomendada"
        size="sm"
        footer={
          <Button onClick={() => setIsLessonPreviewModalOpen(false)}>OK</Button>
        }
      >
        <div className="flex flex-col gap-3">
          {isLoadingPreviewLessons ? (
            <div className="flex flex-col gap-3">
              <SkeletonText className="h-4 w-32" />
              <SkeletonText className="h-14 w-full" />
              <SkeletonText className="h-14 w-full" />
            </div>
          ) : (
            <>
              <Text size="sm" className="text-text-500">
                {previewLessons.length} aula
                {previewLessons.length !== 1 ? 's' : ''} adicionada
                {previewLessons.length !== 1 ? 's' : ''}
              </Text>
              <div className="flex flex-col gap-2">
                {previewLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-4 border border-border-200 rounded-lg"
                  >
                    <Text
                      size="sm"
                      className="text-text-700 truncate flex-1 mr-2"
                    >
                      {lesson.title}
                    </Text>
                    <MonitorPlay
                      size={20}
                      className="text-text-400 flex-shrink-0"
                    />
                  </div>
                ))}
                {previewLessons.length === 0 && (
                  <Text size="sm" className="text-text-500 text-center py-4">
                    Nenhuma aula adicionada ainda.
                  </Text>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>
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
  ActivityCreatePayload,
  ActivityCreateResponse,
  School,
  SchoolYear,
  Class,
  Student,
} from './ActivityCreate.types';
