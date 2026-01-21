import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useTabletScreen } from '../../hooks/useScreen';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  SkeletonText,
  CategoryConfig,
  useToastStore,
  SendLessonModal,
} from '../..';
import type { ActivityModelTableItem } from '../../types/activitiesHistory';
import { ActivityType } from '../ActivityCreate/ActivityCreate.types';
import Menu, { MenuContent, MenuItem } from '../Menu/Menu';
import type { BaseApiClient } from '../..';
import type { LessonFiltersData } from '../../types/lessonFilters';
import type { Lesson } from '../../types/lessons';
import type { SendLessonFormData } from '../SendLessonModal';
import { Funnel } from 'phosphor-react';
import { LessonFilters } from '../LessonFilters/LessonFilters';
import {
  LessonBank,
  type LessonFilters as LessonBankFilters,
} from '../LessonBank/LessonBank';
import {
  LessonPreview,
  type PreviewLesson,
} from '../LessonPreview/LessonPreview';
import {
  useLessonFiltersStore,
  type LessonFiltersState,
} from '../../store/lessonFiltersStore';
import { areLessonFiltersEqual } from '../../utils/lessonFilters';
import type {
  RecommendedLessonDraftResponse,
  RecommendedLessonData,
  LessonBackendFiltersFormat,
  RecommendedLessonPreFiltersInput,
  RecommendedLessonCreatePayload,
} from './RecommendedLessonCreate.types';
import { RecommendedClassDraftType } from './RecommendedLessonCreate.types';
import {
  convertFiltersToBackendFormat,
  convertBackendFiltersToLessonFiltersData,
  generateTitle,
  getTypeFromUrl,
  getTypeFromUrlString,
  convertLessonToPreview,
} from './RecommendedLessonCreate.utils';
import { RecommendedLessonCreateSkeleton } from './components/RecommendedLessonCreateSkeleton';
import { RecommendedLessonCreateHeader } from './components/RecommendedLessonCreateHeader';
import { loadCategoriesData } from '../../utils/categoryDataUtils';

/**
 * RecommendedLessonCreate page component for creating new recommended lessons
 * This page does not use the standard Layout (header/sidebar)
 * @returns JSX element representing the create recommended lesson page
 */
const RecommendedLessonCreate = ({
  apiClient,
  institutionId,
  onBack,
  onCreateRecommendedLesson,
  onSaveModel,
  preFilters: preFiltersProp,
  onRedirectToActivity,
  onCreateNewActivity,
}: {
  apiClient: BaseApiClient;
  institutionId: string;
  onBack?: () => void;
  onCreateRecommendedLesson?: (
    recommendedLessonId: string,
    recommendedLessonData: RecommendedLessonCreatePayload
  ) => void;
  onSaveModel?: (response: RecommendedLessonDraftResponse) => void;
  /** Pre-filters to apply when creating a new recommended lesson */
  preFilters?: RecommendedLessonPreFiltersInput | null;
  onRedirectToActivity?: ({
    activityId,
    activityType,
    lessonId,
    lessonType,
  }: {
    activityId: string;
    activityType: ActivityType;
    lessonId: string;
    lessonType: RecommendedClassDraftType;
  }) => void;
  /** Callback when create new activity is clicked (without existing activity) */
  onCreateNewActivity?: ({
    lessonId,
    lessonType,
  }: {
    lessonId: string;
    lessonType: RecommendedClassDraftType;
  }) => void;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const typeParam = searchParams.get('type') || undefined;
  const idParam = searchParams.get('id') || undefined;

  const applyFilters = useLessonFiltersStore(
    (state: LessonFiltersState) => state.applyFilters
  );
  const draftFilters = useLessonFiltersStore(
    (state: LessonFiltersState) => state.draftFilters
  );
  const appliedFilters = useLessonFiltersStore(
    (state: LessonFiltersState) => state.appliedFilters
  );
  const setDraftFilters = useLessonFiltersStore(
    (state: LessonFiltersState) => state.setDraftFilters
  );
  const clearFilters = useLessonFiltersStore(
    (state: LessonFiltersState) => state.clearFilters
  );

  const addToast = useToastStore((state) => state.addToast);

  // Responsive state for screen width <= 1200px
  const isSmallScreen = useTabletScreen();
  const [selectedView, setSelectedView] = useState<'lessons' | 'preview'>(
    'lessons'
  );

  // Internal states
  const [recommendedLesson, setRecommendedLesson] =
    useState<RecommendedLessonData | null>(null);
  const [preFilters, setPreFilters] =
    useState<RecommendedLessonPreFiltersInput | null>(preFiltersProp ?? null);
  const [loading, setLoading] = useState(false);
  const [lessons, setLessons] = useState<PreviewLesson[]>([]);
  const [loadingInitialLessons, setLoadingInitialLessons] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(idParam ?? null);
  const [draftType, setDraftType] = useState<RecommendedClassDraftType>(
    getTypeFromUrlString(typeParam)
  );
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [isSendingLesson, setIsSendingLesson] = useState(false);
  const hasFirstSaveBeenDone = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedFiltersRef = useRef<LessonFiltersData | null>(null);
  const lastSavedLessonsRef = useRef<PreviewLesson[]>([]);
  const hasAppliedInitialFiltersRef = useRef(false);
  const lastFetchedLessonIdRef = useRef<string | null>(null);

  // Knowledge areas for title generation
  const [knowledgeAreas, setKnowledgeAreas] = useState<
    { id: string; name: string }[]
  >([]);

  const handleFiltersChange = useCallback(
    (filters: LessonFiltersData) => {
      setDraftFilters(filters);
    },
    [setDraftFilters]
  );

  const handleApplyFilters = useCallback(() => {
    applyFilters();
  }, [applyFilters]);

  const handleClearFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  /**
   * Handle back button click - resets everything before calling onBack
   */
  const handleBack = useCallback(() => {
    // Clear filters from store
    clearFilters();

    // Call original onBack if provided
    if (onBack) {
      onBack();
    }
  }, [clearFilters, onBack]);

  const handleRedirectToActivity = (activity: ActivityModelTableItem) => {
    if (onRedirectToActivity) {
      if (!recommendedLesson?.id || !recommendedLesson?.type) {
        addToast({
          title: 'Erro ao redirecionar para a atividade',
          description: 'A aula recomendada não foi encontrada',
          variant: 'solid',
          action: 'warning',
          position: 'top-right',
        });
        return;
      }

      if (!activity.id || !activity.type) {
        addToast({
          title: 'Erro ao redirecionar para a atividade',
          description: 'A atividade não foi encontrada',
          variant: 'solid',
          action: 'warning',
          position: 'top-right',
        });
        return;
      }

      onRedirectToActivity({
        activityId: activity.id,
        activityType: activity.type,
        lessonId: recommendedLesson?.id,
        lessonType: recommendedLesson?.type,
      });
    }
  };

  const handleActivitySelected = useCallback(
    async (activity: ActivityModelTableItem) => {
      if (!recommendedLesson?.id || !activity.id) {
        addToast({
          title: 'Erro ao adicionar atividade',
          description: 'A aula recomendada ou atividade não foi encontrada',
          variant: 'solid',
          action: 'warning',
          position: 'top-right',
        });
        return;
      }

      try {
        setIsSaving(true);

        // Build the payload with current data + new activity
        const lessonIds = lessons.map((l, index) => ({
          lessonId: l.id,
          sequence: index + 1,
        }));

        const activityDraftIds = [
          {
            activityDraftId: activity.id,
            sequence: 1,
          },
        ];

        const payload = {
          type: draftType,
          title: recommendedLesson.title,
          subjectId: recommendedLesson.subjectId,
          filters: recommendedLesson.filters,
          lessonIds,
          activityDraftIds,
        };

        // Update the draft
        await apiClient.patch(
          `/recommended-class/drafts/${recommendedLesson.id}`,
          payload
        );

        // Update local state
        setRecommendedLesson((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            activityDraftIds: [activity.id],
            activityDrafts: [
              {
                activityDraftId: activity.id,
                sequence: 1,
                title: activity.title,
              },
            ],
          };
        });

        setLastSavedAt(new Date());

        addToast({
          title: 'Atividade adicionada',
          description: 'A atividade foi adicionada à aula recomendada',
          variant: 'solid',
          action: 'success',
          position: 'top-right',
        });
      } catch (error) {
        console.error('Error adding activity to recommended lesson:', error);
        addToast({
          title: 'Erro ao adicionar atividade',
          description:
            'Não foi possível adicionar a atividade à aula recomendada',
          variant: 'solid',
          action: 'warning',
          position: 'top-right',
        });
      } finally {
        setIsSaving(false);
      }
    },
    [recommendedLesson, lessons, draftType, apiClient, addToast]
  );

  const handleRemoveActivity = useCallback(async () => {
    if (!recommendedLesson?.id) {
      addToast({
        title: 'Erro ao remover atividade',
        description: 'A aula recomendada não foi encontrada',
        variant: 'solid',
        action: 'warning',
        position: 'top-right',
      });
      return;
    }

    try {
      setIsSaving(true);

      // Build the payload with current data + empty activityDraftIds
      const lessonIds = lessons.map((l, index) => ({
        lessonId: l.id,
        sequence: index + 1,
      }));

      const payload = {
        type: draftType,
        title: recommendedLesson.title,
        subjectId: recommendedLesson.subjectId,
        filters: recommendedLesson.filters,
        lessonIds,
        activityDraftIds: [], // Empty array to signal removal
      };

      // Update the draft
      await apiClient.patch(
        `/recommended-class/drafts/${recommendedLesson.id}`,
        payload
      );

      // Update local state
      setRecommendedLesson((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          activityDraftIds: [],
          activityDrafts: [],
        };
      });

      setLastSavedAt(new Date());

      addToast({
        title: 'Atividade removida',
        description: 'A atividade foi removida da aula recomendada',
        variant: 'solid',
        action: 'success',
        position: 'top-right',
      });
    } catch (error) {
      console.error('Error removing activity from recommended lesson:', error);
      addToast({
        title: 'Erro ao remover atividade',
        description: 'Não foi possível remover a atividade da aula recomendada',
        variant: 'solid',
        action: 'warning',
        position: 'top-right',
      });
    } finally {
      setIsSaving(false);
    }
  }, [recommendedLesson, lessons, draftType, apiClient, addToast]);

  const handleCreateNewActivity = () => {
    if (onCreateNewActivity) {
      if (!recommendedLesson?.id || !recommendedLesson?.type) {
        addToast({
          title: 'Erro ao criar nova atividade',
          description: 'A aula recomendada não foi encontrada',
          variant: 'solid',
          action: 'warning',
          position: 'top-right',
        });
        return;
      }

      onCreateNewActivity({
        lessonId: recommendedLesson.id,
        lessonType: recommendedLesson.type,
      });
    }
  };

  const resolvedPreFilters = useMemo(() => {
    if (!preFilters) {
      return null;
    }
    if (
      typeof preFilters === 'object' &&
      preFilters !== null &&
      'filters' in preFilters
    ) {
      return (preFilters as { filters?: LessonBackendFiltersFormat | null })
        .filters;
    }
    return preFilters as LessonBackendFiltersFormat;
  }, [preFilters]);

  const initialFiltersData = useMemo(() => {
    if (recommendedLesson?.filters) {
      return convertBackendFiltersToLessonFiltersData(
        recommendedLesson.filters
      );
    }
    if (resolvedPreFilters) {
      return convertBackendFiltersToLessonFiltersData(resolvedPreFilters);
    }
    return null;
  }, [recommendedLesson?.filters, resolvedPreFilters]);

  useEffect(() => {
    hasAppliedInitialFiltersRef.current = false;
  }, [recommendedLesson?.id, recommendedLesson?.filters, resolvedPreFilters]);

  /**
   * Update preFilters when prop changes
   */
  useEffect(() => {
    if (preFiltersProp) {
      setPreFilters(preFiltersProp);
    }
  }, [preFiltersProp]);

  /**
   * Load knowledge areas on mount
   */
  useEffect(() => {
    const loadKnowledgeAreas = async () => {
      try {
        const response = await apiClient.get<{
          message: string;
          data: { subjects: { id: string; name: string }[] };
        }>('knowledge/subjects');
        setKnowledgeAreas(response.data.data.subjects || []);
      } catch (error) {
        console.error('Error loading knowledge areas:', error);
      }
    };
    loadKnowledgeAreas();
  }, [apiClient]);

  /**
   * Fetch the recommended lesson draft when there's an id in the URL
   * Only fetches if the id changed to a different one than the current
   */
  useEffect(() => {
    const fetchRecommendedLessonDraft = async () => {
      if (idParam && idParam !== lastFetchedLessonIdRef.current) {
        setLoading(true);
        try {
          const response = await apiClient.get<RecommendedLessonDraftResponse>(
            `/recommended-class/drafts/${idParam}`
          );
          const draftData = response.data.data;

          // Extract lessons with full data if available
          const selectedLessons =
            draftData.lessons
              ?.map((item) => {
                if ('lesson' in item) {
                  return item.lesson;
                }
                return null;
              })
              .filter((lesson): lesson is Lesson => lesson !== null) || [];

          const lessonData: RecommendedLessonData = {
            id: draftData.id,
            type: draftData.type,
            title: draftData.title,
            description: draftData.description,
            subjectId: draftData.subjectId,
            filters: draftData.filters,
            lessonIds: draftData.lessons?.map((l) => l.lessonId) || [],
            selectedLessons,
            activityDraftIds:
              draftData.activityDrafts?.map((a) => a.activityDraftId) || [],
            activityDrafts: draftData.activityDrafts || [],
            updatedAt: draftData.updatedAt,
            startDate: draftData.startDate,
            finalDate: draftData.finalDate,
          };

          setRecommendedLesson(lessonData);
          setPreFilters(lessonData.filters);
          setDraftId(lessonData.id || null);
          setDraftType(lessonData.type);
          if (lessonData.updatedAt) {
            setLastSavedAt(new Date(lessonData.updatedAt));
          }
          lastFetchedLessonIdRef.current = idParam;
        } catch (error) {
          console.error('Error fetching recommended lesson draft:', error);
          addToast({
            title: 'Erro ao carregar aula recomendada',
            description:
              error instanceof Error
                ? error.message
                : 'Ocorreu um erro ao carregar a aula recomendada. Tente novamente.',
            variant: 'solid',
            action: 'warning',
            position: 'top-right',
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchRecommendedLessonDraft();
  }, [idParam, apiClient, addToast]);

  /**
   * Monitor recommendedLesson.id and recommendedLesson.type and update URL when necessary
   */
  useEffect(() => {
    if (recommendedLesson?.id && recommendedLesson?.type) {
      const urlType = getTypeFromUrl(recommendedLesson.type);
      const currentUrlType = typeParam;
      const currentUrlId = idParam;

      if (
        !currentUrlType ||
        !currentUrlId ||
        currentUrlId !== recommendedLesson.id ||
        currentUrlType !== urlType
      ) {
        setSearchParams(
          {
            type: urlType,
            id: recommendedLesson.id,
          },
          { replace: true }
        );
      }
    }
  }, [
    recommendedLesson?.id,
    recommendedLesson?.type,
    typeParam,
    idParam,
    setSearchParams,
  ]);

  /**
   * Validate if save conditions are met
   */
  const validateSaveConditions = useCallback((): boolean => {
    if (lessons.length === 0 && !hasFirstSaveBeenDone.current) {
      return false;
    }
    if (!appliedFilters?.subjectIds?.length) {
      return false;
    }
    if (loadingInitialLessons || isSaving) {
      return false;
    }
    return true;
  }, [lessons.length, appliedFilters, loadingInitialLessons, isSaving]);

  /**
   * Create draft payload for API request
   */
  const createDraftPayload = useCallback(() => {
    const subjectId = appliedFilters?.subjectIds?.[0];
    if (!subjectId) {
      throw new Error('Subject ID não encontrado');
    }
    const title = generateTitle(draftType, subjectId, knowledgeAreas);
    const filters = convertFiltersToBackendFormat(appliedFilters);
    const lessonIds = lessons.map((l, index) => ({
      lessonId: l.id,
      sequence: index + 1,
    }));

    const activityDraftIds = recommendedLesson?.activityDraftIds
      ? recommendedLesson.activityDraftIds.map((id, index) => ({
          activityDraftId: id,
          sequence: index + 1,
        }))
      : undefined;

    return {
      type: draftType,
      title,
      subjectId,
      filters,
      lessonIds,
      ...(activityDraftIds && { activityDraftIds }),
    };
  }, [appliedFilters, draftType, knowledgeAreas, lessons, recommendedLesson]);

  /**
   * Update existing draft via PATCH
   */
  const updateExistingDraft = useCallback(
    async (payload: {
      type: RecommendedClassDraftType;
      title: string;
      subjectId: string;
      filters: LessonBackendFiltersFormat;
      lessonIds: { lessonId: string; sequence: number }[];
    }) => {
      const response = await apiClient.patch<RecommendedLessonDraftResponse>(
        `/recommended-class/drafts/${draftId}`,
        payload
      );
      lastSavedLessonsRef.current = lessons;
      if (appliedFilters) {
        lastSavedFiltersRef.current = appliedFilters;
      }
      const savedDraft = response?.data?.data;
      setLastSavedAt(
        savedDraft?.updatedAt ? new Date(savedDraft.updatedAt) : new Date()
      );

      if (savedDraft) {
        setRecommendedLesson((prevLesson) => {
          if (!prevLesson || prevLesson.id !== savedDraft.id) {
            return {
              id: savedDraft.id,
              type: savedDraft.type,
              title: savedDraft.title,
              subjectId: savedDraft.subjectId,
              filters: savedDraft.filters,
              lessonIds: lessons.map((l) => l.id),
              updatedAt: savedDraft.updatedAt,
            };
          }
          return {
            ...prevLesson,
            type: savedDraft.type,
            title: savedDraft.title,
            subjectId: savedDraft.subjectId,
            lessonIds: lessons.map((l) => l.id),
            updatedAt: savedDraft.updatedAt,
          };
        });
        setDraftType(savedDraft.type);
        if (savedDraft.id) {
          lastFetchedLessonIdRef.current = savedDraft.id;
        }
      }

      if (
        payload.type === RecommendedClassDraftType.MODELO &&
        onSaveModel &&
        response?.data
      ) {
        onSaveModel(response.data);
      }
    },
    [draftId, apiClient, lessons, appliedFilters, onSaveModel]
  );

  /**
   * Extract draft from API response
   */
  const extractDraftFromResponse = useCallback(
    (response: {
      data: RecommendedLessonDraftResponse;
    }): RecommendedLessonDraftResponse['data'] => {
      if (!response?.data) {
        console.error('Empty response from API when creating draft:', response);
        throw new Error('Invalid response: empty response from API');
      }

      let savedDraft: RecommendedLessonDraftResponse['data'] | undefined;

      if (response.data.data) {
        savedDraft = response.data.data;
      } else if (
        response.data &&
        'id' in response.data &&
        typeof response.data === 'object'
      ) {
        savedDraft =
          response.data as unknown as RecommendedLessonDraftResponse['data'];
      }

      if (!savedDraft?.id) {
        console.error('Invalid API response when creating draft:', {
          response,
          responseData: response?.data,
          responseDataKeys: response?.data ? Object.keys(response.data) : [],
        });
        throw new Error(
          'Invalid response: draft data is missing. Expected structure: response.data.data or response.data'
        );
      }

      return savedDraft;
    },
    []
  );

  /**
   * Update component state after successful draft save
   */
  const updateStateAfterSave = useCallback(
    (
      savedDraft: RecommendedLessonDraftResponse['data'],
      fullResponse?: RecommendedLessonDraftResponse,
      wasNewDraft = false
    ) => {
      setDraftId(savedDraft.id);
      setLastSavedAt(
        savedDraft.updatedAt ? new Date(savedDraft.updatedAt) : new Date()
      );
      lastSavedLessonsRef.current = lessons;
      if (appliedFilters) {
        lastSavedFiltersRef.current = appliedFilters;
      }

      const updatedLesson: RecommendedLessonData = {
        id: savedDraft.id,
        type: savedDraft.type,
        title: savedDraft.title,
        subjectId: savedDraft.subjectId,
        filters: savedDraft.filters,
        lessonIds: lessons.map((l) => l.id),
        updatedAt: savedDraft.updatedAt,
      };
      setRecommendedLesson(updatedLesson);
      setDraftType(savedDraft.type);
      lastFetchedLessonIdRef.current = savedDraft.id;

      if (wasNewDraft && savedDraft.id) {
        const urlType = getTypeFromUrl(savedDraft.type);
        setSearchParams(
          {
            type: urlType,
            id: savedDraft.id,
          },
          { replace: true }
        );
      }

      if (
        savedDraft.type === RecommendedClassDraftType.MODELO &&
        onSaveModel &&
        fullResponse
      ) {
        onSaveModel(fullResponse);
      }
    },
    [lessons, appliedFilters, onSaveModel, setSearchParams]
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

      const response = await apiClient.post<RecommendedLessonDraftResponse>(
        '/recommended-class/drafts',
        payload
      );
      hasFirstSaveBeenDone.current = true;

      const savedDraft = extractDraftFromResponse(response);
      updateStateAfterSave(savedDraft, response?.data, true);
    } catch (error) {
      console.error('Error saving draft:', error);

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
    setDraftType(RecommendedClassDraftType.MODELO);
  }, []);

  /**
   * Load initial lessons
   */
  useEffect(() => {
    if (
      recommendedLesson?.selectedLessons &&
      recommendedLesson.selectedLessons.length > 0
    ) {
      setLoadingInitialLessons(true);
      try {
        const previewLessons = recommendedLesson.selectedLessons.map((l) =>
          convertLessonToPreview(l)
        );
        setLessons(previewLessons);
        hasFirstSaveBeenDone.current = true;
        lastSavedLessonsRef.current = previewLessons;
      } catch (error) {
        console.error('Error converting lessons:', error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Ocorreu um erro ao carregar as aulas. Tente novamente.';
        addToast({
          title: 'Erro ao carregar aulas',
          description: errorMessage,
          variant: 'solid',
          action: 'warning',
          position: 'top-right',
        });
      } finally {
        setLoadingInitialLessons(false);
      }
    }
  }, [recommendedLesson?.selectedLessons, addToast]);

  /**
   * Initialize filters from recommended lesson (edit mode) or preFilters (create mode)
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
   * Auto-save draft when lessons or filters change (with debounce)
   */
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (loadingInitialLessons) {
      return;
    }

    if (lessons.length === 0 && !hasFirstSaveBeenDone.current) {
      return;
    }

    if (!appliedFilters) {
      return;
    }

    const lessonIds = lessons.map((l) => l.id).join(',');
    const lastSavedLessonIds = lastSavedLessonsRef.current
      .map((l) => l.id)
      .join(',');
    const lessonsChanged = lessonIds !== lastSavedLessonIds;

    const filtersChanged = !areLessonFiltersEqual(
      lastSavedFiltersRef.current,
      appliedFilters
    );

    if (!lessonsChanged && !filtersChanged && hasFirstSaveBeenDone.current) {
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
  }, [lessons, appliedFilters, draftType, loadingInitialLessons]);

  /**
   * Save immediately when draftType changes to MODELO
   */
  useEffect(() => {
    if (
      draftType === RecommendedClassDraftType.MODELO &&
      hasFirstSaveBeenDone.current
    ) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveDraftRef.current();
    }
  }, [draftType]);

  /**
   * Handle adding a lesson to the recommended lesson
   */
  const handleAddLesson = useCallback((lesson: Lesson) => {
    setLessons((prev) => {
      if (prev.some((l) => l.id === lesson.id)) {
        return prev;
      }

      try {
        const previewLesson = convertLessonToPreview(lesson);
        return [...prev, previewLesson];
      } catch (error) {
        console.error('Error converting lesson to preview:', {
          lessonId: lesson.id,
          error: error instanceof Error ? error.message : String(error),
        });
        return prev;
      }
    });
  }, []);

  /**
   * Handle removing all lessons
   */
  const handleRemoveAll = useCallback(() => {
    setLessons([]);
  }, []);

  /**
   * Handle removing a single lesson
   */
  const handleRemoveLesson = useCallback((lessonId: string) => {
    setLessons((prev) => prev.filter((l) => l.id !== lessonId));
  }, []);

  /**
   * Handle reordering lessons
   */
  const handleReorder = useCallback(
    (orderedLessons: PreviewLesson[]) => {
      setLessons(orderedLessons);
      const hasSubjectIds =
        Array.isArray(appliedFilters?.subjectIds) &&
        appliedFilters.subjectIds.length > 0;
      if (
        hasFirstSaveBeenDone.current &&
        hasSubjectIds &&
        !loadingInitialLessons &&
        !isSaving
      ) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveDraftRef.current();
      }
    },
    [appliedFilters, loadingInitialLessons, isSaving]
  );

  /**
   * Load categories data from API
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
      console.error('Error loading categories:', error);
      throw error;
    }
  }, [apiClient, categories]);

  /**
   * Handle opening the send lesson modal
   */
  const handleOpenSendModal = useCallback(async () => {
    try {
      if (categories.length === 0) {
        await handleLoadCategoriesData();
      }
      setIsSendModalOpen(true);
    } catch (error) {
      console.error('Error opening send modal:', error);
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
  }, [categories.length, handleLoadCategoriesData, addToast]);

  /**
   * Handle sending recommended lesson to students
   */
  const handleSendLesson = useCallback(
    async (formData: SendLessonFormData) => {
      setIsSendingLesson(true);
      try {
        const subjectId =
          recommendedLesson?.subjectId || appliedFilters?.subjectIds?.[0];

        const startDateTime = new Date(
          `${formData.startDate}T${formData.startTime}`
        ).toISOString();
        const finalDateTime = new Date(
          `${formData.finalDate}T${formData.finalTime}`
        ).toISOString();

        const activityDraftIds = recommendedLesson?.activityDraftIds
          ? recommendedLesson.activityDraftIds.map((id, index) => ({
              activityDraftId: id,
              sequence: index + 1,
            }))
          : undefined;

        const lessonPayload: RecommendedLessonCreatePayload = {
          title: recommendedLesson?.title || 'Aula Recomendada',
          subjectId: subjectId || null,
          lessonIds: lessons.map((l, index) => ({
            lessonId: l.id,
            sequence: index + 1,
          })),
          ...(activityDraftIds && { activityDraftIds }),
          startDate: startDateTime,
          finalDate: finalDateTime,
          targetStudentIds: formData.students.map((s) => s.studentId),
        };

        // POST: Create recommended lesson
        const createResponse = await apiClient.post<{
          message: string;
          data: { id?: string; recommendedClass?: { id?: string } };
        }>('/recommended-class', lessonPayload);

        const lessonId =
          createResponse?.data?.data?.id ||
          createResponse?.data?.data?.recommendedClass?.id;
        if (!lessonId) {
          throw new Error('ID da aula recomendada não retornado pela API');
        }

        addToast({
          title: 'Aula enviada com sucesso!',
          description: `Alunos afetados: ${formData.students.length}`,
          variant: 'solid',
          action: 'success',
          position: 'top-right',
        });
        // Call callback if provided
        if (onCreateRecommendedLesson) {
          onCreateRecommendedLesson(lessonId, lessonPayload);
        }

        // Success: close modal, notify and return to previous screen
        setIsSendModalOpen(false);
        handleBack();
        addToast({
          title: 'Meta criada com sucesso!',
          description: `Alunos afetados: ${formData.students.length}`,
          variant: 'solid',
          action: 'success',
          position: 'top-right',
        });
      } catch (error) {
        console.error('Error sending recommended lesson:', error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Ocorreu um erro ao enviar a aula. Tente novamente.';
        addToast({
          title: 'Erro ao enviar aula',
          description: errorMessage,
          variant: 'solid',
          action: 'warning',
          position: 'top-right',
        });
        throw error;
      } finally {
        setIsSendingLesson(false);
      }
    },
    [
      recommendedLesson,
      appliedFilters,
      lessons,
      apiClient,
      addToast,
      onCreateRecommendedLesson,
      handleBack,
    ]
  );

  const addedLessonIds = useMemo(() => lessons.map((l) => l.id), [lessons]);

  // Convert activityDrafts to ActivityModelTableItem format for LessonPreview
  const selectedActivityForPreview =
    useMemo((): ActivityModelTableItem | null => {
      const activityDraft = recommendedLesson?.activityDrafts?.[0];
      if (!activityDraft) return null;

      return {
        id: activityDraft.activityDraftId,
        title: activityDraft.title || 'Atividade sem título',
        type: ActivityType.MODELO,
        savedAt: new Date().toISOString(),
        subject: null,
        subjectId: null,
      };
    }, [recommendedLesson?.activityDrafts]);

  // Convert appliedFilters to LessonBankFilters format
  const lessonBankFilters: LessonBankFilters | undefined = useMemo(() => {
    if (!appliedFilters) return undefined;
    return {
      subjectId: appliedFilters.subjectIds,
      topicIds: appliedFilters.topicIds,
      subtopicIds: appliedFilters.subtopicIds,
      contentIds: appliedFilters.contentIds,
      selectedIds: addedLessonIds,
    };
  }, [appliedFilters, addedLessonIds]);

  // Render loading skeleton
  if (loading) {
    return <RecommendedLessonCreateSkeleton />;
  }

  return (
    <div
      data-testid="create-recommended-class-page"
      className="flex flex-col w-full h-screen overflow-hidden p-5 bg-background"
    >
      {/* Header Section */}
      <RecommendedLessonCreateHeader
        recommendedLesson={recommendedLesson || undefined}
        draftType={draftType}
        lastSavedAt={lastSavedAt}
        isSaving={isSaving}
        lessonsCount={lessons.length}
        onSaveModel={handleSaveModel}
        onSendLesson={handleOpenSendModal}
        onBack={handleBack}
      />

      {/* Main Content */}
      {isSmallScreen ? (
        /* Small Screen Layout (<= 1200px) */
        <div className="flex flex-col w-full flex-1 overflow-hidden gap-5 min-h-0">
          {/* Filters and Menu Row */}
          <div className="flex flex-row items-center justify-between gap-4 flex-shrink-0">
            <div className="flex-shrink-0">
              <Menu
                defaultValue="lessons"
                value={selectedView}
                onValueChange={(value) =>
                  setSelectedView(value as 'lessons' | 'preview')
                }
                variant="breadcrumb"
              >
                <MenuContent variant="breadcrumb">
                  <MenuItem value="lessons" variant="breadcrumb">
                    Banco de aulas
                  </MenuItem>
                  <MenuItem value="preview" variant="breadcrumb">
                    Prévia da aula
                  </MenuItem>
                </MenuContent>
              </Menu>
            </div>
          </div>

          {/* Content Area - Single Column */}
          <div className="flex-1 min-w-0 overflow-hidden h-full">
            {selectedView === 'lessons' ? (
              <LessonBank
                apiClient={apiClient}
                onAddLesson={handleAddLesson}
                addedLessonIds={addedLessonIds}
                filters={lessonBankFilters}
              />
            ) : (
              <div className="w-full h-full overflow-hidden min-h-0">
                {loadingInitialLessons ? (
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
                  <LessonPreview
                    lessons={lessons}
                    onRemoveAll={handleRemoveAll}
                    onRemoveLesson={handleRemoveLesson}
                    onReorder={handleReorder}
                    apiClient={apiClient}
                    selectedActivity={selectedActivityForPreview}
                    onActivitySelected={handleActivitySelected}
                    onRemoveActivity={handleRemoveActivity}
                    onEditActivity={handleRedirectToActivity}
                    onCreateNewActivity={handleCreateNewActivity}
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
              <LessonFilters
                apiClient={apiClient}
                institutionId={institutionId}
                variant={'default'}
                onFiltersChange={handleFiltersChange}
                initialFilters={initialFiltersData || undefined}
                onClearFilters={handleClearFilters}
                onApplyFilters={handleApplyFilters}
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
            <LessonBank
              apiClient={apiClient}
              onAddLesson={handleAddLesson}
              addedLessonIds={addedLessonIds}
              filters={lessonBankFilters}
            />
          </div>

          {/* Third Column - Lesson Preview */}
          <div className="w-[400px] flex-shrink-0 overflow-hidden h-full min-h-0">
            {loadingInitialLessons ? (
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
              <LessonPreview
                lessons={lessons}
                onRemoveAll={handleRemoveAll}
                onRemoveLesson={handleRemoveLesson}
                onReorder={handleReorder}
                apiClient={apiClient}
                selectedActivity={selectedActivityForPreview}
                onActivitySelected={handleActivitySelected}
                onRemoveActivity={handleRemoveActivity}
                onEditActivity={handleRedirectToActivity}
                onCreateNewActivity={handleCreateNewActivity}
                className="h-full overflow-y-auto"
              />
            )}
          </div>
        </div>
      )}

      {/* Send Lesson Modal */}
      <SendLessonModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        onSubmit={handleSendLesson}
        categories={categories}
        isLoading={isSendingLesson}
        onError={(error) => {
          console.error('Error sending lesson:', error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Erro ao enviar aula. Por favor, tente novamente.';
          addToast({
            title: 'Erro ao enviar aula',
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

export { RecommendedLessonCreate };
export { RecommendedClassDraftType } from './RecommendedLessonCreate.types';
export type {
  LessonBackendFiltersFormat,
  RecommendedLessonDraftResponse,
  RecommendedLessonData,
  RecommendedLessonPreFiltersInput,
  RecommendedLessonCreatePayload,
  RecommendedLessonCreateResponse,
  School,
  SchoolYear,
  Class,
  Student,
} from './RecommendedLessonCreate.types';
