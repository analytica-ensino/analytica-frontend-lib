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
  QUESTION_TYPE,
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

/**
 * Backend filters format (from API)
 */
export interface BackendFiltersFormat {
  questionTypes?: string[];
  questionBanks?: string[];
  subjects?: string[];
  topics?: string[];
  subtopics?: string[];
  contents?: string[];
}

/**
 * Activity draft response from backend
 */
export interface ActivityDraftResponse {
  message: string;
  data: {
    draft: {
      id: string;
      type: 'RASCUNHO' | 'MODELO';
      title: string;
      creatorUserInstitutionId: string;
      subjectId: string;
      filters: BackendFiltersFormat;
      createdAt: string;
      updatedAt: string;
    };
    questionsLinked: number;
  };
}

/**
 * Activity object interface for creating/editing activities
 */
export interface ActivityData {
  id?: string;
  type: 'RASCUNHO' | 'MODELO';
  title: string;
  subjectId: string;
  filters: BackendFiltersFormat;
  questionIds: string[];
  selectedQuestions?: Question[];
}

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
}: {
  apiClient: BaseApiClient;
  institutionId: string;
  isDark: boolean;
  activity?: ActivityData;
  onActivityChange?: (activity: ActivityData) => void;
  loading?: boolean;
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
  const [activityType, setActivityType] = useState<'RASCUNHO' | 'MODELO'>(
    activity?.type || 'RASCUNHO'
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

  const useActivityFiltersData = createUseActivityFiltersData(apiClient);
  const { knowledgeAreas, loadKnowledgeAreas } = useActivityFiltersData({
    selectedSubjects: [],
    institutionId,
  });

  /**
   * Convert ActivityFiltersData to backend format
   */
  const convertFiltersToBackendFormat = useCallback(
    (filters: ActivityFiltersData | null): BackendFiltersFormat => {
      if (!filters) {
        return {
          questionTypes: [],
          questionBanks: [],
          subjects: [],
          topics: [],
          subtopics: [],
          contents: [],
        };
      }

      return {
        questionTypes: filters.types,
        questionBanks: filters.bankIds,
        subjects: filters.knowledgeIds,
        topics: filters.topicIds,
        subtopics: filters.subtopicIds,
        contents: filters.contentIds,
      };
    },
    []
  );

  /**
   * Convert backend filters format to ActivityFiltersData
   */
  const convertBackendFiltersToActivityFiltersData = useCallback(
    (
      backendFilters: BackendFiltersFormat | null
    ): ActivityFiltersData | null => {
      if (!backendFilters) {
        return null;
      }

      return {
        types: (backendFilters.questionTypes || []) as QUESTION_TYPE[],
        bankIds: backendFilters.questionBanks || [],
        knowledgeIds: backendFilters.subjects || [],
        topicIds: backendFilters.topics || [],
        subtopicIds: backendFilters.subtopics || [],
        contentIds: backendFilters.contents || [],
        yearIds: [],
      };
    },
    []
  );

  /**
   * Get subject name from subjectId
   */
  const getSubjectName = useCallback(
    (subjectId: string | null): string | null => {
      if (!subjectId || !knowledgeAreas.length) {
        return null;
      }
      const subject = knowledgeAreas.find((area) => area.id === subjectId);
      return subject?.name || null;
    },
    [knowledgeAreas]
  );

  /**
   * Generate activity title
   */
  const generateTitle = useCallback(
    (type: 'RASCUNHO' | 'MODELO', subjectId: string | null): string => {
      const typeLabel = type === 'RASCUNHO' ? 'Rascunho' : 'Modelo';
      const subjectName = getSubjectName(subjectId);
      return subjectName ? `${typeLabel} - ${subjectName}` : typeLabel;
    },
    [getSubjectName]
  );

  /**
   * Format time for display (HH:mm)
   */
  const formatTime = useCallback((date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }, []);

  /**
   * Save draft to backend
   */
  const saveDraft = useCallback(async () => {
    if (questions.length === 0 && !hasFirstSaveBeenDone.current) {
      return;
    }

    if (!appliedFilters || appliedFilters.knowledgeIds.length === 0) {
      return;
    }

    if (loadingInitialQuestions) {
      return;
    }

    if (isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const subjectId = appliedFilters.knowledgeIds[0];
      const title = generateTitle(activityType, subjectId);
      const filters = convertFiltersToBackendFormat(appliedFilters);
      const questionIds = questions.map((q) => q.id);

      const payload = {
        type: activityType,
        title,
        subjectId,
        filters,
        questionIds,
      };

      let response: { data: ActivityDraftResponse };
      const idToUse = activity?.id || draftId;
      if (idToUse) {
        await apiClient.patch<ActivityDraftResponse>(
          `/activity-drafts/${idToUse}`,
          payload
        );
        lastSavedQuestionsRef.current = questions;
        lastSavedFiltersRef.current = appliedFilters;
        setLastSavedAt(new Date());
        return;
      }

      response = await apiClient.post<ActivityDraftResponse>(
        '/activity-drafts',
        payload
      );
      hasFirstSaveBeenDone.current = true;

      const savedDraft = response?.data?.data?.draft;
      if (!savedDraft?.id) {
        throw new Error('Invalid response: draft data is missing');
      }
      const savedDraftId = savedDraft.id;

      setDraftId(savedDraftId);

      setLastSavedAt(new Date());
      lastSavedQuestionsRef.current = questions;
      lastSavedFiltersRef.current = appliedFilters;

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
    questions,
    appliedFilters,
    activityType,
    draftId,
    loadingInitialQuestions,
    isSaving,
    apiClient,
    generateTitle,
    convertFiltersToBackendFormat,
    onActivityChange,
    addToast,
  ]);

  /**
   * Handle save model button click
   */
  const handleSaveModel = useCallback(async () => {
    setActivityType('MODELO');
  }, []);

  /**
   * Convert Question to PreviewQuestion format
   */
  const convertQuestionToPreview = useCallback(
    (question: Question): PreviewQuestion => {
      const subjectInfo =
        question.knowledgeMatrix && question.knowledgeMatrix.length > 0
          ? {
              subjectName:
                question.knowledgeMatrix[0].subject?.name || undefined,
              subjectColor:
                question.knowledgeMatrix[0].subject?.color || undefined,
              iconName: question.knowledgeMatrix[0].subject?.icon || undefined,
            }
          : {};

      return {
        id: question.id,
        enunciado: question.statement,
        questionType: question.questionType,
        question: question.options
          ? {
              options: question.options.map(
                (opt: { id: string; option: string }) => ({
                  id: opt.id,
                  option: opt.option,
                })
              ),
              correctOptionIds: [],
            }
          : undefined,
        ...subjectInfo,
      };
    },
    []
  );

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
      const previewQuestions = activity.selectedQuestions.map((q) =>
        convertQuestionToPreview(q)
      );
      setQuestions(previewQuestions);
      hasFirstSaveBeenDone.current = true;
      lastSavedQuestionsRef.current = previewQuestions;
      setLoadingInitialQuestions(false);
    }
  }, [activity?.selectedQuestions, convertQuestionToPreview]);

  /**
   * Initialize filters and applied filters when activity is provided
   */
  useEffect(() => {
    if (activity?.filters) {
      const activityFiltersData = convertBackendFiltersToActivityFiltersData(
        activity.filters
      );
      if (activityFiltersData) {
        setDraftFilters(activityFiltersData);
        applyFilters();
        lastSavedFiltersRef.current = activityFiltersData;
      }
    }
  }, [
    activity?.filters,
    setDraftFilters,
    applyFilters,
    convertBackendFiltersToActivityFiltersData,
  ]);

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
    if (activityType === 'MODELO' && hasFirstSaveBeenDone.current) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveDraftRef.current();
    }
  }, [activityType]);

  /**
   * Handle adding a question to the activity
   */
  const handleAddQuestion = useCallback(
    (question: Question) => {
      setQuestions((prev) => {
        if (prev.some((q) => q.id === question.id)) {
          return prev;
        }

        const previewQuestion = convertQuestionToPreview(question);
        return [...prev, previewQuestion];
      });
    },
    [convertQuestionToPreview]
  );

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
        lastSavedQuestionsRef.current = orderedQuestions;
        saveDraftRef.current();
      }
    },
    [appliedFilters, loadingInitialQuestions, isSaving]
  );

  /**
   * API response interfaces for categories data
   */
  interface School {
    id: string;
    institutionId: string;
    document: string;
    stateRegistration: string;
    companyName: string;
    phone: string;
    email: string;
    active: boolean;
    street: string;
    streetNumber: string;
    neighborhood: string;
    complement: string;
    city: string;
    state: string;
    zipCode: string;
    trailId: string;
    createdAt: string;
    updatedAt: string;
  }

  interface SchoolYear {
    id: string;
    name: string;
    institutionId: string;
    schoolId: string;
    createdAt: string;
    updatedAt: string;
  }

  interface Class {
    id: string;
    name: string;
    shift: string;
    institutionId: string;
    schoolId: string;
    schoolYearId: string;
    createdAt: string;
    updatedAt: string;
  }

  interface Student {
    id: string;
    email: string;
    name: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    userInstitutionId: string;
    institutionId: string;
    schoolId: string;
    schoolYearId: string;
    classId: string;
    profileId: string;
  }

  /**
   * Load categories data from API and transform to CategoryConfig format
   */
  const loadCategoriesData = useCallback(async () => {
    if (categories.length > 0) {
      return;
    }

    try {
      const [
        schoolsResponse,
        schoolYearsResponse,
        classesResponse,
        studentsResponse,
      ] = await Promise.all([
        apiClient.get<{ message: string; data: { schools: School[] } }>(
          '/school'
        ),
        apiClient.get<{
          message: string;
          data: { schoolYears: SchoolYear[] };
        }>('/schoolYear'),
        apiClient.get<{
          message: string;
          data: { classes: Class[] };
        }>('/classes'),
        apiClient.get<{
          message: string;
          data: { students: Student[]; pagination: unknown };
        }>('/students?page=1&limit=100'),
      ]);

      const schools = schoolsResponse.data.data.schools;
      const schoolYears = schoolYearsResponse.data.data.schoolYears;
      const classes = classesResponse.data.data.classes;
      const students = studentsResponse.data.data.students;

      const transformedCategories: CategoryConfig[] = [
        {
          key: 'escola',
          label: 'Escola',
          itens: schools.map((s) => ({ id: s.id, name: s.companyName })),
          selectedIds: [],
        },
        {
          key: 'serie',
          label: 'Série',
          dependsOn: ['escola'],
          filteredBy: [{ key: 'escola', internalField: 'schoolId' }],
          itens: schoolYears.map((sy) => ({
            id: sy.id,
            name: sy.name,
            schoolId: sy.schoolId,
          })),
          selectedIds: [],
        },
        {
          key: 'turma',
          label: 'Turma',
          dependsOn: ['serie'],
          filteredBy: [{ key: 'serie', internalField: 'schoolYearId' }],
          itens: classes.map((c) => ({
            id: c.id,
            name: c.name,
            schoolYearId: c.schoolYearId,
          })),
          selectedIds: [],
        },
        {
          key: 'alunos',
          label: 'Alunos',
          dependsOn: ['turma'],
          filteredBy: [{ key: 'turma', internalField: 'classId' }],
          itens: students.map((s) => ({
            id: s.id,
            name: s.name,
            classId: s.classId,
            studentId: s.id,
            userInstitutionId: s.userInstitutionId,
          })),
          selectedIds: [],
        },
      ];

      setCategories(transformedCategories);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      throw error;
    }
  }, [apiClient, categories.length]);

  /**
   * Handle opening the send activity modal
   */
  const handleOpenSendModal = useCallback(async () => {
    try {
      if (categories.length === 0) {
        await loadCategoriesData();
      }
      setIsSendModalOpen(true);
    } catch (error) {
      console.error('Erro ao abrir modal de envio:', error);
      alert('Erro ao carregar dados. Por favor, tente novamente.');
    }
  }, [questions.length, categories.length, loadCategoriesData]);

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
          status: 'A_VENCER' as const,
          startDate: startDateTime,
          finalDate: finalDateTime,
          canRetry: formData.canRetry,
        };

        await apiClient.post('/activities', activityPayload);

        await apiClient.post('/activities/send-to-students', activityPayload);

        setIsSendModalOpen(false);
        alert('Atividade enviada com sucesso!');
      } catch (error) {
        console.error('Erro ao enviar atividade:', error);
        throw error;
      } finally {
        setIsSendingActivity(false);
      }
    },
    [activity, appliedFilters, questions, apiClient]
  );

  const addedQuestionIds = useMemo(
    () => questions.map((q) => q.id),
    [questions]
  );

  // Render loading skeleton
  if (loading) {
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
  }

  return (
    <div
      data-testid="create-activity-page"
      className="flex flex-col w-full h-screen overflow-hidden p-5 bg-background"
    >
      {/* Header Section */}
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
                <p className="text-sm text-text-600">
                  {activityType === 'RASCUNHO' ? 'Rascunho' : 'Modelo'} salvo às{' '}
                  {formatTime(lastSavedAt)}
                </p>
              ) : (
                <p className="text-sm text-text-600">
                  {isSaving ? 'Salvando...' : 'Nenhum rascunho salvo'}
                </p>
              )}
              <Button size="small" onClick={handleSaveModel}>
                Salvar modelo
              </Button>
              <Button
                size="small"
                iconLeft={<PaperPlaneTilt />}
                onClick={handleOpenSendModal}
                disabled={questions.length === 0}
              >
                Enviar atividade
              </Button>
            </div>
          </div>

          <p className="text-sm text-text-600">
            Crie uma atividade customizada adicionando questões manualmente ou
            automaticamente.
          </p>
        </section>
      </div>

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
          alert('Erro ao enviar atividade. Por favor, tente novamente.');
        }}
      />
    </div>
  );
};

export { CreateActivity };
