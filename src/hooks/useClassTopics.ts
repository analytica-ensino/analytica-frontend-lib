import { useState, useCallback } from 'react';
import type { BaseApiClient } from '../types/api';
import type {
  Topic,
  TopicCategory,
  ClassTopicsData,
  TopicsApiResponse,
} from '../types/lessonsCatalog';

export interface UseClassTopicsState {
  data: ClassTopicsData | null;
  loading: boolean;
  error: string | null;
}

export interface UseClassTopicsReturn extends UseClassTopicsState {
  fetchTopics: (subjectId: string) => Promise<void>;
  searchTopics: (searchTerm: string) => Topic[];
  clearError: () => void;
  resetState: () => void;
}

/**
 * Flatten the API's subject -> topic -> subtopic tree into the category/topic
 * shape the screen renders: each API topic becomes a category heading and each
 * of its subtopics becomes a clickable card.
 *
 * Both levels keep the order the API sent them in: it comes from the trail's
 * `position`, which follows the BNCC sequence. Sorting by name here used to
 * discard that curriculum order.
 */
export function transformTopicsResponse(
  apiData: TopicsApiResponse,
  subjectId: string
): ClassTopicsData {
  if (!apiData.data || apiData.data.length === 0) {
    return {
      subjectId,
      subjectName: '',
      subjectIcon: undefined,
      subjectColor: undefined,
      categories: [],
    };
  }

  const subject = apiData.data[0];
  const categoriesMap = new Map<string, Topic[]>();

  for (const topic of subject.topics || []) {
    const categoryName = topic.name;

    for (const subtopic of topic.subtopics || []) {
      const transformedTopic: Topic = {
        id: subtopic.id,
        name: subtopic.name,
        totalLessons: subtopic.totalLessons || 0,
        completedLessons: subtopic.finishedLessons || 0,
        progress:
          subtopic.totalLessons > 0
            ? Math.round(
                (subtopic.finishedLessons / subtopic.totalLessons) * 100
              )
            : 0,
      };

      if (!categoriesMap.has(categoryName)) {
        categoriesMap.set(categoryName, []);
      }
      categoriesMap.get(categoryName)!.push(transformedTopic);
    }
  }

  const categories: TopicCategory[] = Array.from(categoriesMap.entries()).map(
    ([name, topics], index) => ({
      id: `category-${index}`,
      name,
      topics,
    })
  );

  return {
    subjectId,
    subjectName: subject.name || '',
    subjectIcon: subject.icon || 'BookOpen',
    subjectColor: subject.color || '#B7DFFF',
    categories,
  };
}

/**
 * Build the hook that loads the topics and subtopics of one subject.
 *
 * Backed by `GET /knowledge/by-subject/:subjectId`. For teachers the backend
 * answers 403 when the subject is not one they are assigned to, so callers
 * should surface `error` rather than assume an empty result.
 *
 * @param apiClient - HTTP client used to reach the API
 * @returns A hook exposing the topics data, loading/error state and a local search
 *
 * @example
 * ```typescript
 * const useClassTopics = useMemo(() => createUseClassTopics(api), [api]);
 * const { data, fetchTopics } = useClassTopics();
 * ```
 */
export const createUseClassTopics =
  (apiClient: BaseApiClient) => (): UseClassTopicsReturn => {
    const [data, setData] = useState<ClassTopicsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleError = useCallback((error: unknown) => {
      let errorMessage = 'Erro ao carregar os temas';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as {
          response?: { data?: { message?: string } };
        };
        errorMessage =
          apiError.response?.data?.message || 'Erro ao carregar os temas';
      }

      setError(errorMessage);
      setLoading(false);
    }, []);

    const fetchTopics = useCallback(
      async (subjectId: string) => {
        setLoading(true);
        setError(null);

        try {
          const response = await apiClient.get<TopicsApiResponse>(
            `/knowledge/by-subject/${subjectId}`
          );
          setData(transformTopicsResponse(response.data, subjectId));
        } catch (error) {
          handleError(error);
        } finally {
          setLoading(false);
        }
      },
      [handleError]
    );

    const searchTopics = useCallback(
      (searchTerm: string): Topic[] => {
        if (!data || !searchTerm.trim()) {
          return [];
        }

        const normalizedSearch = searchTerm.toLowerCase().trim();
        const results: Topic[] = [];

        for (const category of data.categories) {
          for (const topic of category.topics) {
            if (topic.name.toLowerCase().includes(normalizedSearch)) {
              results.push(topic);
            }
          }
        }

        return results;
      },
      [data]
    );

    const clearError = useCallback(() => {
      setError(null);
    }, []);

    const resetState = useCallback(() => {
      setData(null);
      setLoading(false);
      setError(null);
    }, []);

    return {
      data,
      loading,
      error,
      fetchTopics,
      searchTopics,
      clearError,
      resetState,
    };
  };
