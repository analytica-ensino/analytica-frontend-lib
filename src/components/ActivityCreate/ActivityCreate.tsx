import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
  ActivityFilters,
  ActivityPreview,
  Button,
  Text,
  useQuestionFiltersStore,
  createUseQuestionsList,
  SkeletonText,
  createUseActivityFiltersData,
} from '../..';
import type {
  ActivityFiltersData,
  BaseApiClient,
  PreviewQuestion,
  QuestionActivity as Question,
  QuestionFiltersState,
} from '../..';
import { CaretLeft, PaperPlaneTilt, Funnel } from 'phosphor-react';
import { ActivityListQuestions } from '../ActivityListQuestions/ActivityListQuestions';

/**
 * CreateActivity page component for creating new activities
 * This page does not use the standard Layout (header/sidebar)
 * @returns JSX element representing the create activity page
 */
const CreateActivity = ({
  apiClient,
  institutionId,
  isDark,
  initialQuestionIds,
}: {
  apiClient: BaseApiClient;
  institutionId: string;
  isDark: boolean;
  initialQuestionIds?: string[];
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
  const [draftId, setDraftId] = useState<string | null>(null);
  const [activityType, setActivityType] = useState<'RASCUNHO' | 'MODELO'>(
    'RASCUNHO'
  );
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const hasFirstSaveBeenDone = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const useQuestionsList = createUseQuestionsList(apiClient);
  const { fetchQuestionsByIds } = useQuestionsList();

  // Hook para obter dados dos assuntos (knowledge areas)
  const useActivityFiltersData = createUseActivityFiltersData(apiClient);
  const { knowledgeAreas, loadKnowledgeAreas } = useActivityFiltersData({
    selectedSubjects: [],
    institutionId,
  });

  /**
   * Convert ActivityFiltersData to backend format
   */
  const convertFiltersToBackendFormat = useCallback(
    (filters: ActivityFiltersData | null) => {
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
    // Don't save if no questions (first save only happens when questions.length > 0)
    if (questions.length === 0 && !hasFirstSaveBeenDone.current) {
      return;
    }

    // Don't save if no applied filters (need subjectId)
    if (!appliedFilters || appliedFilters.knowledgeIds.length === 0) {
      return;
    }

    // Don't save during initial loading
    if (loadingInitialQuestions) {
      return;
    }

    // Don't save if already saving
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

      let response;
      if (draftId) {
        // Update existing draft
        response = await apiClient.patch<{ data: { id: string } }>(
          `/activity-drafts/${draftId}`,
          payload
        );
      } else {
        // Create new draft
        response = await apiClient.post<{ data: { id: string } }>(
          '/activity-drafts',
          payload
        );
        setDraftId(response.data.data.id);
        hasFirstSaveBeenDone.current = true;
      }

      setLastSavedAt(new Date());
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
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
  ]);

  /**
   * Handle save model button click
   */
  const handleSaveModel = useCallback(async () => {
    setActivityType('MODELO');
    // The save will be triggered by the useEffect that watches activityType
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
   * Load knowledge areas on mount
   */
  useEffect(() => {
    loadKnowledgeAreas();
  }, [loadKnowledgeAreas]);

  /**
   * Load initial questions by IDs (for drafts or page refresh)
   */
  useEffect(() => {
    if (initialQuestionIds && initialQuestionIds.length > 0) {
      setLoadingInitialQuestions(true);
      fetchQuestionsByIds(initialQuestionIds)
        .then((loadedQuestions) => {
          const previewQuestions = loadedQuestions.map((q) =>
            convertQuestionToPreview(q)
          );
          setQuestions(previewQuestions);
        })
        .catch((error) => {
          console.error('Erro ao carregar questões iniciais:', error);
        })
        .finally(() => {
          setLoadingInitialQuestions(false);
        });
    }
  }, []); // Only run once on mount

  /**
   * Auto-save draft when questions or filters change (with debounce)
   */
  useEffect(() => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Don't save during initial loading
    if (loadingInitialQuestions) {
      return;
    }

    // First save only happens when there's at least one question
    if (questions.length === 0 && !hasFirstSaveBeenDone.current) {
      return;
    }

    // Don't save if no applied filters
    if (!appliedFilters || appliedFilters.knowledgeIds.length === 0) {
      return;
    }

    // Set debounced save
    saveTimeoutRef.current = setTimeout(() => {
      saveDraft();
    }, 500);

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    questions,
    appliedFilters,
    activityType,
    saveDraft,
    loadingInitialQuestions,
  ]);

  /**
   * Save immediately when activityType changes to MODELO
   */
  useEffect(() => {
    if (activityType === 'MODELO' && hasFirstSaveBeenDone.current) {
      // Clear any pending debounced save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveDraft();
    }
  }, [activityType, saveDraft]);

  /**
   * Handle adding a question to the activity
   */
  const handleAddQuestion = useCallback(
    (question: Question) => {
      setQuestions((prev) => {
        // Check if question is already added
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
  const handleReorder = useCallback((orderedQuestions: PreviewQuestion[]) => {
    setQuestions(orderedQuestions);
  }, []);

  const addedQuestionIds = useMemo(
    () => questions.map((q) => q.id),
    [questions]
  );
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
              Criar atividade
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
              <Button size="small" iconLeft={<PaperPlaneTilt />}>
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
    </div>
  );
};

export { CreateActivity };
