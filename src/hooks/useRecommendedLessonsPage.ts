/**
 * useRecommendedLessonsPage Hook Factory
 *
 * Factory function to create a hook for RecommendedLessons, LessonDrafts, and LessonModels pages.
 * Contains all common state, memos, and callbacks.
 */

import { useCallback, useRef, useMemo, useState } from 'react';
import {
  GoalDraftType,
  type GoalHistoryFilters,
  type GoalsHistoryApiResponse,
  type GoalTableItem,
  type GoalHistoryItem,
  type GoalModelFilters,
  type GoalModelsApiResponse,
  type GoalModelTableItem,
} from '../types/recommendedLessons';
import type {
  SendLessonFormData,
  CategoryConfig,
} from '../components/SendLessonModal/types';
import { SubjectEnum } from '../enums/SubjectEnum';

/**
 * API client interface
 */
export interface RecommendedLessonsApiClient {
  get: <T>(
    url: string,
    config?: { params?: Record<string, unknown> }
  ) => Promise<{ data: T }>;
  post: <T>(url: string, data?: unknown) => Promise<{ data: T }>;
  delete: <T>(url: string) => Promise<{ data: T }>;
}

/**
 * User institution data structure
 */
export interface UserInstitution {
  school: { id: string; name: string };
  schoolYear: { id: string; name: string };
  class: { id: string; name: string };
}

/**
 * Subject teacher class data structure
 */
export interface SubTeacherTopicClass {
  subject: { id: string; name: string };
  class: { id: string; name: string };
}

/**
 * User data structure
 */
export interface RecommendedLessonsUserData {
  userInstitutions?: UserInstitution[];
  subTeacherTopicClasses?: SubTeacherTopicClass[];
}

/**
 * Navigation paths configuration
 */
export interface RecommendedLessonsPagePaths {
  /** Path for creating a new lesson */
  createLesson: string;
  /** Path for creating a new model */
  createModel: string;
  /** Base path for lesson details */
  lessonDetails: string;
  /** Base path for editing a lesson */
  editLesson: string;
  /** Path for editing a model (with id parameter) */
  editModel: string;
}

/**
 * API endpoints configuration
 */
export interface RecommendedLessonsPageEndpoints {
  /** Endpoint for fetching goals history */
  goalsHistory: string;
  /** Endpoint for fetching goal models/drafts */
  goalDrafts: string;
  /** Endpoint for submitting a goal */
  submitGoal: string;
}

/**
 * UI text configuration
 */
export interface RecommendedLessonsPageTexts {
  title: string;
  createButtonText: string;
  searchPlaceholder: string;
}

/**
 * Configuration for createUseRecommendedLessonsPage factory
 */
export interface UseRecommendedLessonsPageConfig {
  /** API client for making requests */
  api: RecommendedLessonsApiClient;
  /** Navigation function */
  navigate: (path: string, options?: { state?: unknown }) => void;
  /** User data for filter options */
  userData: RecommendedLessonsUserData | null;
  /** Navigation paths */
  paths: RecommendedLessonsPagePaths;
  /** API endpoints */
  endpoints: RecommendedLessonsPageEndpoints;
  /** UI text */
  texts: RecommendedLessonsPageTexts;
  /** Image for empty state */
  emptyStateImage: string;
  /** Image for no search results */
  noSearchImage: string;
  /** Function to map subject name to SubjectEnum */
  mapSubjectNameToEnum: (subjectName: string) => SubjectEnum | null;
}

/**
 * Return type for the useRecommendedLessonsPage hook
 */
export interface UseRecommendedLessonsPageReturn {
  /** Props for RecommendedLessonsHistory component */
  historyProps: {
    fetchGoalsHistory: (
      filters?: GoalHistoryFilters
    ) => Promise<GoalsHistoryApiResponse>;
    fetchGoalModels: (
      filters?: GoalModelFilters
    ) => Promise<GoalModelsApiResponse>;
    deleteGoalModel: (id: string) => Promise<void>;
    onCreateLesson: () => void;
    onCreateModel: () => void;
    onRowClick: (row: GoalTableItem) => void;
    onEditGoal: (id: string) => void;
    onEditModel: (model: GoalModelTableItem) => void;
    onSendLesson: (model: GoalModelTableItem) => void;
    emptyStateImage: string;
    noSearchImage: string;
    mapSubjectNameToEnum: (subjectName: string) => SubjectEnum | null;
    userFilterData: {
      schools: Array<{ id: string; name: string }>;
      classes: Array<{ id: string; name: string }>;
      subjects: Array<{ id: string; name: string }>;
    };
    subjectsMap: Map<string, string>;
    title: string;
    createButtonText: string;
    searchPlaceholder: string;
  };
  /** Props for SendLessonModal component */
  modalProps: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: SendLessonFormData) => Promise<void>;
    categories: CategoryConfig[];
    onCategoriesChange: (categories: CategoryConfig[]) => void;
    isLoading: boolean;
    modalTitle: string | undefined;
  };
  /** Navigate function for custom tab handlers */
  navigate: (path: string, options?: { state?: unknown }) => void;
}

/**
 * Build query parameters from filter object
 */
const buildQueryParams = (
  filters?: Record<string, unknown>
): Record<string, unknown> => {
  if (!filters) return {};

  const params: Record<string, unknown> = {};
  for (const key in filters) {
    const value = filters[key];
    if (value !== undefined && value !== null) {
      if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      ) {
        params[key] = value;
      }
    }
  }
  return params;
};

/**
 * Get school options from user data
 */
const getSchoolOptions = (
  userData: RecommendedLessonsUserData | null
): Array<{ id: string; name: string }> => {
  if (!userData?.userInstitutions) return [];

  const schoolMap = new Map<string, string>();
  userData.userInstitutions.forEach((inst) => {
    if (inst.school?.id && inst.school?.name) {
      schoolMap.set(inst.school.id, inst.school.name);
    }
  });

  return Array.from(schoolMap.entries()).map(([id, name]) => ({ id, name }));
};

/**
 * Get class options from user data
 */
const getClassOptions = (
  userData: RecommendedLessonsUserData | null
): Array<{ id: string; name: string }> => {
  if (!userData?.userInstitutions) return [];

  const classMap = new Map<string, string>();
  userData.userInstitutions.forEach((inst) => {
    if (inst.class?.id && inst.class?.name) {
      classMap.set(inst.class.id, inst.class.name);
    }
  });

  return Array.from(classMap.entries()).map(([id, name]) => ({ id, name }));
};

/**
 * Get subject options from user data
 */
const getSubjectOptions = (
  userData: RecommendedLessonsUserData | null
): Array<{ id: string; name: string }> => {
  if (!userData?.subTeacherTopicClasses) return [];

  const subjectMap = new Map<string, string>();
  userData.subTeacherTopicClasses.forEach((stc) => {
    if (stc.subject?.id && stc.subject?.name) {
      subjectMap.set(stc.subject.id, stc.subject.name);
    }
  });

  return Array.from(subjectMap.entries()).map(([id, name]) => ({ id, name }));
};

/**
 * Factory function to create useRecommendedLessonsPage hook
 *
 * @param config - Configuration object with API client, navigation, user data, paths, etc.
 * @returns Hook function that returns historyProps, modalProps, and navigate
 *
 * @example
 * ```tsx
 * // In your app setup
 * const useRecommendedLessonsPage = createUseRecommendedLessonsPage({
 *   api,
 *   navigate,
 *   userData,
 *   paths: {
 *     createLesson: '/criar-aula',
 *     createModel: '/criar-aula?mode=model',
 *     lessonDetails: '/aulas-recomendadas',
 *     editLesson: '/aulas-recomendadas',
 *     editModel: '/criar-aula?mode=model&id=',
 *   },
 *   endpoints: {
 *     goalsHistory: '/recommended-class/history',
 *     goalDrafts: '/recommended-class/drafts',
 *     submitGoal: '/goals',
 *   },
 *   texts: {
 *     title: 'Histórico de aulas recomendadas',
 *     createButtonText: 'Criar aula',
 *     searchPlaceholder: 'Buscar aula',
 *   },
 *   emptyStateImage,
 *   noSearchImage,
 *   mapSubjectNameToEnum,
 * });
 *
 * // In your component
 * const { historyProps, modalProps, navigate } = useRecommendedLessonsPage();
 * ```
 */
export const createUseRecommendedLessonsPage = (
  config: UseRecommendedLessonsPageConfig
): (() => UseRecommendedLessonsPageReturn) => {
  const {
    api,
    navigate,
    userData,
    paths,
    endpoints,
    texts,
    emptyStateImage,
    noSearchImage,
    mapSubjectNameToEnum,
  } = config;

  return (): UseRecommendedLessonsPageReturn => {
    // Store original goal data for navigation
    const goalsMapRef = useRef<Map<string, GoalHistoryItem>>(new Map());

    // SendLessonModal state
    const [sendModalOpen, setSendModalOpen] = useState(false);
    const [selectedModel, setSelectedModel] =
      useState<GoalModelTableItem | null>(null);
    const [sendModalLoading, setSendModalLoading] = useState(false);
    const [sendModalCategories, setSendModalCategories] = useState<
      CategoryConfig[]
    >([]);

    // Build user filter data from user data
    const userFilterData = useMemo(
      () => ({
        schools: getSchoolOptions(userData),
        classes: getClassOptions(userData),
        subjects: getSubjectOptions(userData),
      }),
      [userData]
    );

    // Memoized subjects map for models display
    const subjectsMap = useMemo(() => {
      const map = new Map<string, string>();
      const subjects = getSubjectOptions(userData);
      subjects.forEach((s) => map.set(s.id, s.name));
      return map;
    }, [userData]);

    /**
     * Fetch goals history from API
     */
    const fetchGoalsHistory = useCallback(
      async (
        filters?: GoalHistoryFilters
      ): Promise<GoalsHistoryApiResponse> => {
        const params = buildQueryParams(filters as Record<string, unknown>);
        const response = await api.get<GoalsHistoryApiResponse>(
          endpoints.goalsHistory,
          { params }
        );

        // Store original goal data for later use in navigation
        const goals = response.data.data.goals;
        goals.forEach((goal) => {
          goalsMapRef.current.set(goal.goal.id, goal);
        });

        return response.data;
      },
      [api, endpoints.goalsHistory]
    );

    /**
     * Fetch goal models from API
     */
    const fetchGoalModels = useCallback(
      async (filters?: GoalModelFilters): Promise<GoalModelsApiResponse> => {
        const params = buildQueryParams({
          ...filters,
          type: GoalDraftType.MODELO,
        } as Record<string, unknown>);
        const response = await api.get<GoalModelsApiResponse>(
          endpoints.goalDrafts,
          { params }
        );
        return response.data;
      },
      [api, endpoints.goalDrafts]
    );

    /**
     * Delete a goal model
     */
    const deleteGoalModel = useCallback(
      async (id: string): Promise<void> => {
        await api.delete(`${endpoints.goalDrafts}/${id}`);
      },
      [api, endpoints.goalDrafts]
    );

    /**
     * Handle create lesson button click
     */
    const handleCreateLesson = useCallback(() => {
      navigate(paths.createLesson);
    }, []);

    /**
     * Handle create model button click
     */
    const handleCreateModel = useCallback(() => {
      navigate(paths.createModel);
    }, []);

    /**
     * Handle row click - navigate to goal details
     */
    const handleRowClick = useCallback((row: GoalTableItem) => {
      const originalData = goalsMapRef.current.get(row.id);
      navigate(`${paths.lessonDetails}/${row.id}`, {
        state: { goalData: originalData },
      });
    }, []);

    /**
     * Handle edit goal action
     */
    const handleEditGoal = useCallback((id: string) => {
      navigate(`${paths.editLesson}/${id}/editar`);
    }, []);

    /**
     * Handle edit model action
     */
    const handleEditModel = useCallback((model: GoalModelTableItem) => {
      navigate(`${paths.editModel}${model.id}`);
    }, []);

    /**
     * Handle send lesson button click - opens modal
     */
    const handleSendLesson = useCallback(
      (model: GoalModelTableItem) => {
        setSelectedModel(model);

        // Build categories from user data for CheckboxGroup
        const classes = getClassOptions(userData);
        const categories: CategoryConfig[] = [];

        if (classes.length > 0) {
          categories.push({
            key: 'students',
            label: 'Turmas',
            selectedIds: [],
            itens: classes.map((cls) => ({
              id: cls.id,
              name: cls.name,
              studentId: cls.id,
              userInstitutionId: cls.id,
            })),
          });
        }

        setSendModalCategories(categories);
        setSendModalOpen(true);
      },
      [userData]
    );

    /**
     * Handle send lesson modal submit
     */
    const handleSendLessonSubmit = useCallback(
      async (formData: SendLessonFormData) => {
        if (!selectedModel) return;

        setSendModalLoading(true);
        try {
          await api.post(endpoints.submitGoal, {
            draftId: selectedModel.id,
            students: formData.students,
            startDate: `${formData.startDate}T${formData.startTime}:00`,
            finalDate: `${formData.finalDate}T${formData.finalTime}:00`,
          });

          setSendModalOpen(false);
          setSelectedModel(null);
        } finally {
          setSendModalLoading(false);
        }
      },
      [api, endpoints.submitGoal, selectedModel]
    );

    /**
     * Handle send lesson modal close
     */
    const handleSendModalClose = useCallback(() => {
      setSendModalOpen(false);
      setSelectedModel(null);
    }, []);

    /**
     * Handle categories change in send modal
     */
    const handleCategoriesChange = useCallback(
      (categories: CategoryConfig[]) => {
        setSendModalCategories(categories);
      },
      []
    );

    return {
      historyProps: {
        fetchGoalsHistory,
        fetchGoalModels,
        deleteGoalModel,
        onCreateLesson: handleCreateLesson,
        onCreateModel: handleCreateModel,
        onRowClick: handleRowClick,
        onEditGoal: handleEditGoal,
        onEditModel: handleEditModel,
        onSendLesson: handleSendLesson,
        emptyStateImage,
        noSearchImage,
        mapSubjectNameToEnum,
        userFilterData,
        subjectsMap,
        title: texts.title,
        createButtonText: texts.createButtonText,
        searchPlaceholder: texts.searchPlaceholder,
      },
      modalProps: {
        isOpen: sendModalOpen,
        onClose: handleSendModalClose,
        onSubmit: handleSendLessonSubmit,
        categories: sendModalCategories,
        onCategoriesChange: handleCategoriesChange,
        isLoading: sendModalLoading,
        modalTitle: selectedModel?.title,
      },
      navigate,
    };
  };
};

/**
 * Alias for createUseRecommendedLessonsPage
 */
export const createRecommendedLessonsPageHook = createUseRecommendedLessonsPage;
