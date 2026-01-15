import type { FilterConfig } from '../../Filter';
import type {
  RecommendedClassUserFilterData,
  RecommendedClassFilterOption,
} from '../../../types/recommendedLessons';

/**
 * Get subject options from user data
 * @param data - User filter data containing subjects
 * @returns Array of subject options for filter dropdown
 */
const getSubjectOptions = (
  data: RecommendedClassUserFilterData | undefined
): RecommendedClassFilterOption[] => {
  if (!data?.subjects) return [];
  return data.subjects.map((subject) => ({
    id: subject.id,
    name: subject.name,
  }));
};

/**
 * Create filter configuration for goal drafts
 * Simplified filter with only subject selection
 * @param userData - User data for populating filter options
 * @returns Array of filter configurations
 */
export const createRecommendedClassDraftsFiltersConfig = (
  userData: RecommendedClassUserFilterData | undefined
): FilterConfig[] => [
  {
    key: 'content',
    label: 'CONTEÚDO',
    categories: [
      {
        key: 'subject',
        label: 'Matéria',
        selectedIds: [],
        itens: getSubjectOptions(userData),
      },
    ],
  },
];
