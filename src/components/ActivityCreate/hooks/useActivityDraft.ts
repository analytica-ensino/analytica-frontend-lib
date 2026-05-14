import { useState, useRef, useCallback, useEffect } from 'react';
import type {
  ActivityFiltersData,
  BaseApiClient,
  PreviewQuestion,
} from '../../..';
import type {
  ActivityData,
  ActivityDraftResponse,
  BackendFiltersFormat,
  ActivityPreFiltersInput,
} from '../ActivityCreate.types';
import { ActivityType } from '../ActivityCreate.types';
import {
  convertFiltersToBackendFormat,
  convertQuestionToPreview,
  formatErrorMessage,
  generateTitle,
  extractDraftFromResponse,
  buildActivityDataFromDraft,
  buildPartialActivityUpdate,
  buildPayloadWithTypeOverride,
  getSubjectIdOrThrow,
  shouldSkipAutoSave,
  hasQuestionsChanged,
  hasRequiredSubjectIds,
} from '../ActivityCreate.utils';
import type { KnowledgeArea } from '../ActivityCreate.utils';
import { areFiltersEqual } from '../../../utils/activityFilters';

interface UseActivityDraftParams {
  apiClient: BaseApiClient;
  idParam: string | undefined;
  typeParam: string | undefined;
  activityCategory: 'ATIVIDADE' | 'PROVA';
  isInPersonExam: boolean;
  knowledgeAreas: KnowledgeArea[];
  appliedFilters: ActivityFiltersData | null;
  onSaveModel?: (response: ActivityDraftResponse) => void;
  addToast: (toast: {
    title: string;
    description?: string;
    variant?: string;
    action: string;
    position: string;
  }) => void;
  getTypeFromUrlString: (type: string | undefined) => ActivityType;
}

const DRAFT_ENDPOINT = '/activity-drafts';

export function useActivityDraft({
  apiClient,
  idParam,
  typeParam,
  activityCategory,
  isInPersonExam,
  knowledgeAreas,
  appliedFilters,
  onSaveModel,
  addToast,
  getTypeFromUrlString,
}: UseActivityDraftParams) {
  // State
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

  // Refs
  const hasFirstSaveBeenDone = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedFiltersRef = useRef<ActivityFiltersData | null>(null);
  const lastSavedQuestionsRef = useRef<PreviewQuestion[]>([]);
  const hasAppliedInitialFiltersRef = useRef(false);
  const lastFetchedActivityIdRef = useRef<string | null>(null);
  const saveDraftRef = useRef<() => Promise<string | undefined>>(
    async () => undefined
  );

  // Fetch activity draft
  useEffect(() => {
    const fetchActivityDraft = async () => {
      if (!idParam || idParam === lastFetchedActivityIdRef.current) return;

      setLoading(true);
      try {
        const response = await apiClient.get<
          { data: ActivityData } | ActivityData
        >(`${DRAFT_ENDPOINT}/${idParam}`);
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
    };

    fetchActivityDraft();
  }, [idParam, apiClient, addToast]);

  // Load initial questions
  useEffect(() => {
    if (!activity?.selectedQuestions?.length) return;

    setLoadingInitialQuestions(true);
    try {
      const previewQuestions = activity.selectedQuestions.map((q) =>
        convertQuestionToPreview(q)
      );
      setQuestions(previewQuestions);
      hasFirstSaveBeenDone.current = true;
      lastSavedQuestionsRef.current = previewQuestions;
    } catch (error) {
      addToast({
        title: 'Erro ao carregar questões',
        description: formatErrorMessage(
          error,
          'Ocorreu um erro ao carregar as questões. Tente novamente.'
        ),
        variant: 'solid',
        action: 'warning',
        position: 'top-right',
      });
    } finally {
      setLoadingInitialQuestions(false);
    }
  }, [activity?.selectedQuestions, addToast]);

  // Validate save conditions
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

  // Create draft payload
  const createDraftPayload = useCallback(() => {
    const subjectId = appliedFilters?.subjectIds?.[0];
    if (!subjectId) {
      throw new Error('Subject ID não encontrado');
    }
    return {
      type: activityType,
      activityType: activityCategory,
      title: generateTitle(activityType, subjectId, knowledgeAreas),
      subjectId,
      filters: convertFiltersToBackendFormat(appliedFilters),
      questionIds: questions.map((q) => q.id),
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

  // Update existing draft
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
        `${DRAFT_ENDPOINT}/${draftId}`,
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
    [draftId, apiClient, questions, appliedFilters, onSaveModel]
  );

  // Save draft
  const saveDraft = useCallback(
    async (
      typeOverride?: ActivityType,
      customTitle?: string
    ): Promise<string | undefined> => {
      if (!validateSaveConditions()) {
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
          DRAFT_ENDPOINT,
          payload
        );
        hasFirstSaveBeenDone.current = true;

        const savedDraft = extractDraftFromResponse(response);

        // Update state after save
        setDraftId(savedDraft.id);
        setLastSavedAt(
          savedDraft.updatedAt ? new Date(savedDraft.updatedAt) : new Date()
        );
        lastSavedQuestionsRef.current = questions;
        lastSavedFiltersRef.current = appliedFilters!;

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

        if (
          savedDraft.type === ActivityType.MODELO &&
          onSaveModel &&
          response?.data
        ) {
          onSaveModel(response.data);
        }

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
      addToast,
      appliedFilters,
      knowledgeAreas,
      questions,
      onSaveModel,
    ]
  );

  // Update ref
  useEffect(() => {
    saveDraftRef.current = saveDraft;
  }, [saveDraft]);

  // Auto-save effect
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

    if (skipAutoSave) return;

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

  return {
    // State
    activity,
    setActivity,
    preFilters,
    setPreFilters,
    loading,
    questions,
    setQuestions,
    loadingInitialQuestions,
    draftId,
    setDraftId,
    activityType,
    setActivityType,
    lastSavedAt,
    isSaving,
    // Refs
    hasFirstSaveBeenDone,
    saveTimeoutRef,
    lastSavedFiltersRef,
    lastSavedQuestionsRef,
    hasAppliedInitialFiltersRef,
    lastFetchedActivityIdRef,
    saveDraftRef,
    // Functions
    saveDraft,
  };
}
