import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useTabletScreen } from '../../hooks/useScreen';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Button,
  SkeletonText,
  useQuestionFiltersStore,
  createUseActivityFiltersData,
  SendActivityModal,
  SaveActivityModelModal,
  CategoryConfig,
  useToastStore,
  Modal,
  Text,
  QUESTION_TYPE,
} from '../..';
import type {
  ActivityFiltersData,
  BaseApiClient,
  PreviewQuestion,
  QuestionActivity as Question,
  QuestionFiltersState,
  SendActivityFormData,
} from '../..';
import type { Lesson } from '../../types/lessons';
import { MonitorPlay } from 'phosphor-react';
import { areFiltersEqual } from '../../utils/activityFilters';
import type {
  ActivityDraftResponse,
  ActivityData,
  BackendFiltersFormat,
  ActivityPreFiltersInput,
  ActivityCreateResponse,
  RecommendedClassDraftResponse,
} from './ActivityCreate.types';
import { ActivityType } from './ActivityCreate.types';
import type { CreateActivityPayload } from '../../types/sendActivity';
import {
  convertFiltersToBackendFormat,
  generateTitle,
  convertQuestionToPreview,
  getTypeFromUrl,
  getTypeFromUrlString,
  buildSendActivityPayload,
  extractLessonsFromResponse,
  hasQuestionsChanged,
  shouldSkipAutoSave,
  extractDraftFromResponse,
  buildISODateTime,
  buildFinalDateTime,
  buildUrlWithParams,
  getRecommendedClassEndpoint,
  buildLessonDraftUpdatePayload,
  formatNavigatePath,
  getSubjectIdOrThrow,
  extractActivityIdFromResponse,
  validateSendActivityResponses,
  formatErrorMessage,
  buildActivityDataFromDraft,
  buildPartialActivityUpdate,
  buildPayloadWithTypeOverride,
  shouldUpdateUrl,
  resolvePreFilters,
  getInitialFiltersData,
  shouldTriggerSaveOnReorder,
  hasRequiredSubjectIds,
  shouldSaveDraftBeforeAddingToLesson,
  shouldUseCustomAddActivityCallback,
  shouldAddActivityToLessonDraft,
} from './ActivityCreate.utils';
import { ActivityCreateSkeleton } from './components/ActivityCreateSkeleton';
import { ActivityCreateHeader } from './components/ActivityCreateHeader';
import {
  SmallScreenLayout,
  DesktopLayout,
} from './components/ActivityCreateContent';
import { loadCategoriesData } from '../../utils/categoryDataUtils';
import { useDynamicStudentFetching } from '../../utils/useDynamicStudentFetching';

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
  enableExamMode = false,
  isInPersonExam = false,
  basePath = '/criar-atividade',
  activityCategory = 'ATIVIDADE',
}: {
  apiClient: BaseApiClient;
  institutionId: string;
  isDark: boolean;
  onBack?: () => void;
  onCreateActivity?: (
    activityId: string,
    activityData: CreateActivityPayload
  ) => void;
  onSaveModel?: (response: ActivityDraftResponse) => void;
  onAddActivityToLesson?: (activityDraftId: string) => void;
  enableExamMode?: boolean;
  /** Force in-person exam mode: auto-selects PROVA subtype and PRESENCIAL mode */
  isInPersonExam?: boolean;
  /** Base path for URL navigation (default: '/criar-atividade') */
  basePath?: string;
  /** Activity category: 'ATIVIDADE' or 'PROVA' - sent in draft payloads */
  activityCategory?: 'ATIVIDADE' | 'PROVA';
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const typeParam = searchParams.get('type') || undefined;
  const idParam = searchParams.get('id') || undefined;
  const recommendedLessonId =
    searchParams.get('recommended-class') || undefined;
  const recommendedLessonDraftId =
    searchParams.get('recommended-class-draft') || undefined;
  const onFinishPath = searchParams.get('onFinish') || undefined;
  const classTypeParam = searchParams.get('classType') || undefined;

  /**
   * Build URL preserving existing query parameters
   * Used when updating URL after saving draft to maintain context for navigation
   */
  const buildActivityUrl = useCallback(
    (newType: string, newId: string) =>
      buildUrlWithParams({
        newType,
        newId,
        basePath,
        recommendedLessonDraftId,
        recommendedLessonId,
        classTypeParam,
        onFinishPath,
      }),
    [
      recommendedLessonDraftId,
      recommendedLessonId,
      classTypeParam,
      onFinishPath,
      basePath,
    ]
  );

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
  const isSmallScreen = useTabletScreen();
  const [selectedView, setSelectedView] = useState<'questions' | 'preview'>(
    'questions'
  );

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
  const [isSaveModelModalOpen, setIsSaveModelModalOpen] = useState(false);
  const [isSavingModel, setIsSavingModel] = useState(false);
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
    if (!hasRequiredSubjectIds(draftFilters?.subjectIds)) {
      addToast({
        title: 'Selecione ao menos uma matéria para pesquisar',
        action: 'warning',
        position: 'top-right',
      });
      return;
    }
    applyFilters();
  }, [applyFilters, draftFilters, addToast]);

  /**
   * Handle back button click - resets everything before calling onBack
   * If onFinishPath is provided, navigate to that path instead
   */
  const handleBack = useCallback(() => {
    clearFilters();

    if (onFinishPath) {
      navigate(formatNavigatePath(onFinishPath));
      return;
    }

    if (onBack) {
      onBack();
    }
  }, [clearFilters, onBack, onFinishPath, navigate]);

  /**
   * Handle lesson preview button click - fetches lessons from recommended-class-draft and opens modal
   */
  const handleLessonPreview = useCallback(async () => {
    setIsLessonPreviewModalOpen(true);

    const draftIdToFetch = recommendedLessonDraftId || recommendedLessonId;
    if (!draftIdToFetch) {
      return;
    }

    setIsLoadingPreviewLessons(true);
    try {
      const endpoint = recommendedLessonDraftId
        ? `/recommended-class/drafts/${draftIdToFetch}`
        : `/recommended-class/${draftIdToFetch}`;

      const response = await apiClient.get<{
        message?: string;
        data: Parameters<typeof extractLessonsFromResponse>[0];
      }>(endpoint);

      const responseData =
        'data' in response.data ? response.data.data : response.data;
      const lessons = extractLessonsFromResponse(responseData);
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

  const resolvedPreFilters = useMemo(
    () => resolvePreFilters(preFilters),
    [preFilters]
  );

  const initialFiltersData = useMemo(
    () => getInitialFiltersData(activity?.filters, resolvedPreFilters),
    [activity?.filters, resolvedPreFilters]
  );

  useEffect(() => {
    hasAppliedInitialFiltersRef.current = false;
  }, [activity?.id, activity?.filters, resolvedPreFilters]);

  // Use unified /activity-drafts and /activities endpoints
  // For exams, we add activityType=PROVA query param instead of using separate endpoints
  const draftEndpoint = '/activity-drafts';
  const activityEndpoint = '/activities';

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
          >(`${draftEndpoint}/${idParam}`);
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
            description: formatErrorMessage(
              error,
              'Ocorreu um erro ao carregar a atividade. Tente novamente.'
            ),
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
  }, [idParam, apiClient, addToast, draftEndpoint]);

  /**
   * Monitora activity.id e activity.type e atualiza a URL quando necessário
   */
  useEffect(() => {
    if (shouldUpdateUrl(activity?.id, activity?.type, typeParam, idParam)) {
      const urlType = getTypeFromUrl(activity!.type);
      navigate(buildActivityUrl(urlType, activity!.id!), {
        replace: true,
      });
    }
  }, [
    activity?.id,
    activity?.type,
    typeParam,
    idParam,
    navigate,
    buildActivityUrl,
  ]);

  /**
   * Validate if save conditions are met
   *
   * @returns true if save can proceed, false otherwise
   */
  const validateSaveConditions = useCallback((): boolean => {
    if (isSaving || !hasRequiredSubjectIds(appliedFilters?.subjectIds)) {
      return false;
    }
    return !shouldSkipAutoSave({
      loadingInitialQuestions,
      questionsCount: questions.length,
      hasFirstSaveBeenDone: hasFirstSaveBeenDone.current,
      appliedFilters,
    });
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
      activityType: activityCategory,
      title,
      subjectId,
      filters,
      questionIds,
      isDigital: !isInPersonExam,
    };
  }, [
    appliedFilters,
    activityType,
    knowledgeAreas,
    questions,
    isInPersonExam,
    activityCategory,
  ]);

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
      isDigital: boolean;
    }) => {
      const response = await apiClient.patch<ActivityDraftResponse>(
        `${draftEndpoint}/${draftId}`,
        payload
      );
      lastSavedQuestionsRef.current = questions;
      lastSavedFiltersRef.current = appliedFilters!;

      const savedDraft = response?.data?.data?.draft;
      setLastSavedAt(
        savedDraft?.updatedAt ? new Date(savedDraft.updatedAt) : new Date()
      );

      if (savedDraft) {
        const questionIds = questions.map((q) => q.id);
        setActivity((prevActivity) => {
          if (prevActivity?.id !== savedDraft.id) {
            return buildActivityDataFromDraft(savedDraft, questionIds);
          }
          return buildPartialActivityUpdate(
            prevActivity,
            savedDraft,
            questionIds
          );
        });
        setActivityType(savedDraft.type);
        if (savedDraft.id) {
          lastFetchedActivityIdRef.current = savedDraft.id;
        }
      }

      if (
        payload.type === ActivityType.MODELO &&
        onSaveModel &&
        response?.data
      ) {
        onSaveModel(response.data);
      }
    },
    [draftId, apiClient, questions, appliedFilters, onSaveModel, draftEndpoint]
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
        navigate(buildActivityUrl(urlType, savedDraft.id), {
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
    [questions, appliedFilters, onSaveModel, navigate, buildUrlWithParams]
  );

  /**
   * Save draft to backend
   * @param typeOverride - Override the activity type for this save
   * @param customTitle - Optional user-provided title; falls back to auto-generated when empty
   * @returns The persisted draft ID (existing or newly created) on success.
   *   Returns undefined when no persistence happened — either because the save
   *   failed or because validateSaveConditions skipped it. Callers triggering
   *   an explicit override (e.g. "save as MODELO") rely on this to gate
   *   success feedback so they don't show a toast for a save that never ran.
   */
  const saveDraft = useCallback(
    async (
      typeOverride?: ActivityType,
      customTitle?: string
    ): Promise<string | undefined> => {
      if (!validateSaveConditions()) {
        // For explicit override flows, skipped saves must not signal success.
        return typeOverride ? undefined : draftId || undefined;
      }

      setIsSaving(true);

      try {
        let payload = createDraftPayload();

        if (typeOverride) {
          const subjectId = getSubjectIdOrThrow(
            undefined,
            appliedFilters?.subjectIds
          );
          payload = buildPayloadWithTypeOverride(
            payload,
            typeOverride,
            customTitle,
            subjectId,
            knowledgeAreas
          );
        }

        if (draftId) {
          await updateExistingDraft(payload);
          return draftId;
        }

        const response = await apiClient.post<ActivityDraftResponse>(
          draftEndpoint,
          payload
        );
        hasFirstSaveBeenDone.current = true;

        const savedDraft = extractDraftFromResponse(response);
        updateStateAfterSave(savedDraft, response?.data, true);
        return savedDraft.id;
      } catch (error) {
        console.error('❌ Erro ao salvar rascunho:', error);
        addToast({
          title: 'Erro ao salvar rascunho',
          description: formatErrorMessage(
            error,
            'Ocorreu um erro ao salvar o rascunho. Tente novamente.'
          ),
          variant: 'solid',
          action: 'warning',
          position: 'top-right',
        });
        return undefined;
      } finally {
        setIsSaving(false);
      }
    },
    [
      validateSaveConditions,
      createDraftPayload,
      draftId,
      updateExistingDraft,
      apiClient,
      updateStateAfterSave,
      addToast,
      appliedFilters,
      knowledgeAreas,
    ]
  );

  /**
   * Open the "save as model" modal so the user can provide a custom title
   */
  const handleSaveModel = useCallback(() => {
    setIsSaveModelModalOpen(true);
  }, []);

  /**
   * Persist the draft as MODELO using the title provided by the user.
   * activityType is updated by the save helpers (updateExistingDraft /
   * updateStateAfterSave) only after the backend confirms the save, keeping
   * UI state consistent with persisted state on failure.
   */
  const handleConfirmSaveModel = useCallback(
    async (title: string) => {
      setIsSavingModel(true);
      try {
        setIsSaveModelModalOpen(false);
        const savedId = await saveDraft(ActivityType.MODELO, title);
        if (savedId) {
          addToast({
            title: 'Modelo salvo com sucesso',
            description:
              'O modelo da atividade está disponível para reutilização.',
            variant: 'solid',
            action: 'success',
            position: 'top-right',
          });
        }
      } finally {
        setIsSavingModel(false);
      }
    },
    [saveDraft, addToast]
  );

  /**
   * Add activity to lesson draft via API
   */
  const addActivityToLessonDraft = useCallback(
    async (activityDraftId: string, lessonDraftId: string) => {
      const endpoint = getRecommendedClassEndpoint(
        lessonDraftId,
        classTypeParam
      );

      // Get current lesson draft data
      const response =
        await apiClient.get<RecommendedClassDraftResponse>(endpoint);
      const currentLesson = response.data.data;

      // Build update payload using utility function
      const updatePayload = buildLessonDraftUpdatePayload(
        currentLesson,
        activityDraftId
      );

      await apiClient.patch(endpoint, updatePayload);
    },
    [classTypeParam, apiClient]
  );

  /**
   * Navigate after adding activity
   */
  const navigateAfterAddActivity = useCallback(() => {
    clearFilters();

    if (onFinishPath) {
      navigate(formatNavigatePath(onFinishPath));
    } else if (onBack) {
      onBack();
    }
  }, [clearFilters, onFinishPath, navigate, onBack]);

  /**
   * Handle add activity to lesson - saves draft and navigates back or calls callback
   */
  const handleAddActivityToLesson = useCallback(async () => {
    let activityDraftId: string | null | undefined = draftId;

    if (
      shouldSaveDraftBeforeAddingToLesson(questions.length, activityDraftId)
    ) {
      activityDraftId = await saveDraft(ActivityType.MODELO);
    }

    setActivityType(ActivityType.MODELO);

    if (
      shouldUseCustomAddActivityCallback(onAddActivityToLesson, activityDraftId)
    ) {
      onAddActivityToLesson!(activityDraftId!);
      return;
    }

    if (
      shouldAddActivityToLessonDraft(activityDraftId, recommendedLessonDraftId)
    ) {
      try {
        await addActivityToLessonDraft(
          activityDraftId!,
          recommendedLessonDraftId!
        );
        addToast({
          title: 'Atividade adicionada à aula com sucesso',
          action: 'success',
          position: 'top-right',
        });
      } catch (error) {
        console.error('Error adding activity to lesson:', error);
        addToast({
          title: 'Erro ao adicionar atividade à aula',
          action: 'warning',
          position: 'top-right',
        });
        return;
      }
    }

    navigateAfterAddActivity();
  }, [
    draftId,
    questions.length,
    saveDraft,
    onAddActivityToLesson,
    recommendedLessonDraftId,
    addActivityToLessonDraft,
    addToast,
    navigateAfterAddActivity,
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

  /**
   * Force ALTERNATIVA question type filter for in-person exams
   * In-person exams only support multiple choice questions
   */
  useEffect(() => {
    if (isInPersonExam) {
      setDraftFilters({
        types: [QUESTION_TYPE.ALTERNATIVA],
        bankIds: draftFilters?.bankIds || [],
        yearIds: draftFilters?.yearIds || [],
        subjectIds: draftFilters?.subjectIds || [],
        topicIds: draftFilters?.topicIds || [],
        subtopicIds: draftFilters?.subtopicIds || [],
        contentIds: draftFilters?.contentIds || [],
      });
      applyFilters();
    }
  }, [isInPersonExam]);

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

    const skipAutoSave = shouldSkipAutoSave({
      loadingInitialQuestions,
      questionsCount: questions.length,
      hasFirstSaveBeenDone: hasFirstSaveBeenDone.current,
      appliedFilters,
    });

    if (skipAutoSave) {
      return;
    }

    const questionsChanged = hasQuestionsChanged(
      questions,
      lastSavedQuestionsRef.current
    );
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
      const shouldSave = shouldTriggerSaveOnReorder({
        hasFirstSaveBeenDone: hasFirstSaveBeenDone.current,
        subjectIds: appliedFilters?.subjectIds,
        loadingInitialQuestions,
        isSaving,
      });
      if (shouldSave) {
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
   * Handle categories change and fetch students dynamically
   */
  const { handleCategoriesChange } = useDynamicStudentFetching(setCategories, {
    apiClient,
  });

  /**
   * Handle opening the send activity modal
   */
  const handleOpenSendModal = useCallback(async () => {
    if (!hasRequiredSubjectIds(draftFilters?.subjectIds)) {
      addToast({
        title: 'Selecione ao menos uma matéria para pesquisar',
        action: 'warning',
        position: 'top-right',
      });
      return;
    }

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
  }, [draftFilters, categories.length, handleLoadCategoriesData, addToast]);

  /**
   * Handle sending activity to students
   */
  const handleSendActivity = useCallback(
    async (formData: SendActivityFormData) => {
      setIsSendingActivity(true);
      try {
        const subjectId = getSubjectIdOrThrow(
          activity?.subjectId,
          appliedFilters?.subjectIds
        );

        const startDateTime = buildISODateTime(
          formData.startDate,
          formData.startTime
        );
        const finalDateTime = buildFinalDateTime(
          formData.finalDate,
          formData.finalTime,
          enableExamMode || isInPersonExam
        );

        const activityPayload = buildSendActivityPayload(
          formData,
          subjectId,
          questions.map((q) => q.id),
          startDateTime,
          finalDateTime,
          activityCategory
        );

        // Create activity/exam
        const createActivityResponse =
          await apiClient.post<ActivityCreateResponse>(
            activityEndpoint,
            activityPayload
          );

        const activityId = extractActivityIdFromResponse(
          createActivityResponse
        );

        if (onCreateActivity) {
          onCreateActivity(activityId, activityPayload);
        }

        // Send activity to students
        const sendToStudentsPayload = {
          activityId,
          students: formData.students,
        };

        const sendToStudentsResponse = await apiClient.post<{
          message: string;
          data: unknown;
        }>(`${activityEndpoint}/send-to-students`, sendToStudentsPayload);

        validateSendActivityResponses(
          createActivityResponse,
          sendToStudentsResponse
        );

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
        addToast({
          title: 'Erro ao enviar atividade',
          description: formatErrorMessage(
            error,
            'Ocorreu um erro ao enviar a atividade. Tente novamente.'
          ),
          variant: 'solid',
          action: 'warning',
          position: 'top-right',
        });
        throw error;
      } finally {
        setIsSendingActivity(false);
      }
    },
    [activity, appliedFilters, questions, apiClient, addToast, activityEndpoint]
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
      className="flex flex-col w-full h-full overflow-hidden p-5 bg-background"
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
        enableExamMode={enableExamMode || isInPersonExam}
      />

      {/* Main Content */}
      {isSmallScreen ? (
        <SmallScreenLayout
          apiClient={apiClient}
          institutionId={institutionId}
          isDark={isDark}
          selectedView={selectedView}
          onViewChange={setSelectedView}
          initialFiltersData={initialFiltersData}
          onFiltersChange={handleFiltersChange}
          onApplyFilters={handleApplyFilters}
          onClearFilters={clearFilters}
          onAddQuestion={handleAddQuestion}
          addedQuestionIds={addedQuestionIds}
          enableExamMode={enableExamMode || isInPersonExam}
          isInPersonExam={isInPersonExam}
          loadingInitialQuestions={loadingInitialQuestions}
          questions={questions}
          onRemoveAll={handleRemoveAll}
          onRemoveQuestion={handleRemoveQuestion}
          onReorder={handleReorder}
        />
      ) : (
        <DesktopLayout
          apiClient={apiClient}
          institutionId={institutionId}
          isDark={isDark}
          initialFiltersData={initialFiltersData}
          draftFilters={draftFilters}
          onFiltersChange={handleFiltersChange}
          onApplyFilters={handleApplyFilters}
          onAddQuestion={handleAddQuestion}
          addedQuestionIds={addedQuestionIds}
          enableExamMode={enableExamMode || isInPersonExam}
          isInPersonExam={isInPersonExam}
          loadingInitialQuestions={loadingInitialQuestions}
          questions={questions}
          onRemoveAll={handleRemoveAll}
          onRemoveQuestion={handleRemoveQuestion}
          onReorder={handleReorder}
        />
      )}

      {/* Save Activity Model Modal */}
      <SaveActivityModelModal
        isOpen={isSaveModelModalOpen}
        onClose={() => setIsSaveModelModalOpen(false)}
        onConfirm={handleConfirmSaveModel}
        isLoading={isSavingModel}
      />

      {/* Send Activity Modal */}
      <SendActivityModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        onSubmit={handleSendActivity}
        categories={categories}
        onCategoriesChange={handleCategoriesChange}
        isLoading={isSendingActivity}
        enableExamMode={enableExamMode || isInPersonExam}
        isInPersonExam={isInPersonExam}
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
                {previewLessons.length === 1 ? '' : 's'} adicionada
                {previewLessons.length === 1 ? '' : 's'}
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
                      {lesson.videoTitle || lesson.title || 'Aula sem título'}
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
