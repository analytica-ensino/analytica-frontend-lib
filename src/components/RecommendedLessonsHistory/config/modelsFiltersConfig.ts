import type { FilterConfig } from '../../Filter';
import type {
  GoalUserFilterData,
  GoalFilterOption,
} from '../../../types/recommendedLessons';

/**
 * Get subject options from user data
 * @param data - User filter data containing subjects
 * @returns Array of subject options for filter dropdown
 */
const getSubjectOptions = (
  data: GoalUserFilterData | undefined
): GoalFilterOption[] => {
  if (!data?.subjects) return [];
  return data.subjects.map((subject) => ({
    id: subject.id,
    name: subject.name,
  }));
};

/**
 * Create filter configuration for goal models
 * Simplified filter with only subject selection
 * @param userData - User data for populating filter options
 * @returns Array of filter configurations
 */
export const createGoalModelsFiltersConfig = (
  userData: GoalUserFilterData | undefined
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
