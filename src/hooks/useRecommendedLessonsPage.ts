/**
 * useRecommendedLessonsPage Hook Factory
 *
 * Factory function to create a hook for RecommendedLessons, LessonDrafts, and LessonModels pages.
 * Contains all common state, memos, and callbacks.
 */

import { useCallback, useRef, useMemo, useState } from 'react';
import {
  RecommendedClassDraftType,
  type RecommendedClassHistoryFilters,
  type RecommendedClassHistoryApiResponse,
  type RecommendedClassTableItem,
  type RecommendedClassHistoryItem,
  type RecommendedClassModelFilters,
  type RecommendedClassModelsApiResponse,
  type RecommendedClassModelTableItem,
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
  /** Endpoint for fetching recommendedClass history */
  recommendedClassHistory: string;
  /** Endpoint for fetching recommendedClass models/drafts */
  recommendedClassDrafts: string;
  /** Endpoint for submitting a recommendedClass */
  submitRecommendedClass: string;
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
    fetchRecommendedClassHistory: (
      filters?: RecommendedClassHistoryFilters
    ) => Promise<RecommendedClassHistoryApiResponse>;
    fetchRecommendedClassModels: (
      filters?: RecommendedClassModelFilters
    ) => Promise<RecommendedClassModelsApiResponse>;
    deleteRecommendedClassModel: (id: string) => Promise<void>;
    onCreateLesson: () => void;
    onCreateModel: () => void;
    onRowClick: (row: RecommendedClassTableItem) => void;
    onEditRecommendedClass: (id: string) => void;
    onEditModel: (model: RecommendedClassModelTableItem) => void;
    onSendLesson: (model: RecommendedClassModelTableItem) => void;
    fetchRecommendedClassDrafts: (
      filters?: RecommendedClassModelFilters
    ) => Promise<RecommendedClassModelsApiResponse>;
    deleteRecommendedClassDraft: (id: string) => Promise<void>;
    onSendDraft: (draft: RecommendedClassModelTableItem) => void;
    onEditDraft: (draft: RecommendedClassModelTableItem) => void;
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
 *     recommendedClassHistory: '/recommended-class/history',
 *     recommendedClassDrafts: '/recommended-class/drafts',
 *     submitRecommendedClass: '/recommendedClass',
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
    // Store original recommendedClass data for navigation
    const recommendedClassMapRef = useRef<
      Map<string, RecommendedClassHistoryItem>
    >(new Map());

    // SendLessonModal state
    const [sendModalOpen, setSendModalOpen] = useState(false);
    const [selectedModel, setSelectedModel] =
      useState<RecommendedClassModelTableItem | null>(null);
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
     * Fetch recommendedClass history from API
     */
    const fetchRecommendedClassHistory = useCallback(
      async (
        filters?: RecommendedClassHistoryFilters
      ): Promise<RecommendedClassHistoryApiResponse> => {
        const params = buildQueryParams(filters as Record<string, unknown>);
        const response = await api.get<RecommendedClassHistoryApiResponse>(
          endpoints.recommendedClassHistory,
          { params }
        );

        // Store original recommendedClass data for later use in navigation
        const recommendedClass = response.data.data.recommendedClass;
        recommendedClass.forEach((recommendedClass) => {
          recommendedClassMapRef.current.set(
            recommendedClass.recommendedClass.id,
            recommendedClass
          );
        });

        return response.data;
      },
      [api, endpoints.recommendedClassHistory]
    );

    /**
     * Fetch recommendedClass models from API
     */
    const fetchRecommendedClassModels = useCallback(
      async (
        filters?: RecommendedClassModelFilters
      ): Promise<RecommendedClassModelsApiResponse> => {
        const params = buildQueryParams({
          ...filters,
          type: RecommendedClassDraftType.MODELO,
        } as Record<string, unknown>);
        const response = await api.get<RecommendedClassModelsApiResponse>(
          endpoints.recommendedClassDrafts,
          { params }
        );
        return response.data;
      },
      [api, endpoints.recommendedClassDrafts]
    );

    /**
     * Delete a recommendedClass model
     */
    const deleteRecommendedClassModel = useCallback(
      async (id: string): Promise<void> => {
        await api.delete(`${endpoints.recommendedClassDrafts}/${id}`);
      },
      [api, endpoints.recommendedClassDrafts]
    );

    /**
     * Fetch recommendedClass drafts from API
     */
    const fetchRecommendedClassDrafts = useCallback(
      async (
        filters?: RecommendedClassModelFilters
      ): Promise<RecommendedClassModelsApiResponse> => {
        const params = buildQueryParams({
          ...filters,
          type: RecommendedClassDraftType.RASCUNHO,
        } as Record<string, unknown>);
        const response = await api.get<RecommendedClassModelsApiResponse>(
          endpoints.recommendedClassDrafts,
          { params }
        );
        return response.data;
      },
      [api, endpoints.recommendedClassDrafts]
    );

    /**
     * Delete a recommendedClass draft
     */
    const deleteRecommendedClassDraft = useCallback(
      async (id: string): Promise<void> => {
        await api.delete(`${endpoints.recommendedClassDrafts}/${id}`);
      },
      [api, endpoints.recommendedClassDrafts]
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
     * Handle row click - navigate to recommendedClass details
     */
    const handleRowClick = useCallback((row: RecommendedClassTableItem) => {
      const originalData = recommendedClassMapRef.current.get(row.id);
      navigate(`${paths.lessonDetails}/${row.id}`, {
        state: { recommendedClassData: originalData },
      });
    }, []);

    /**
     * Handle edit recommendedClass action
     */
    const handleEditRecommendedClass = useCallback((id: string) => {
      navigate(`${paths.editLesson}/${id}/editar`);
    }, []);

    /**
     * Handle edit model action
     */
    const handleEditModel = useCallback(
      (model: RecommendedClassModelTableItem) => {
        navigate(`${paths.editModel}${model.id}`);
      },
      []
    );

    /**
     * Handle send lesson button click - opens modal
     */
    const handleSendLesson = useCallback(
      (model: RecommendedClassModelTableItem) => {
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
          await api.post(endpoints.submitRecommendedClass, {
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
      [api, endpoints.submitRecommendedClass, selectedModel]
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
        fetchRecommendedClassHistory,
        fetchRecommendedClassModels,
        deleteRecommendedClassModel,
        onCreateLesson: handleCreateLesson,
        onCreateModel: handleCreateModel,
        onRowClick: handleRowClick,
        onEditRecommendedClass: handleEditRecommendedClass,
        onEditModel: handleEditModel,
        onSendLesson: handleSendLesson,
        fetchRecommendedClassDrafts,
        deleteRecommendedClassDraft,
        onSendDraft: handleSendLesson,
        onEditDraft: handleEditModel,
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
