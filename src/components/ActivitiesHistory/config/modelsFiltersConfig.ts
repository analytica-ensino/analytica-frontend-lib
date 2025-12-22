import { getSubjectOptions } from '../utils';
import type { FilterConfig } from '../../Filter';
import type { ActivityUserFilterData } from '../../../types/activitiesHistory';

/**
 * Create filter configuration for activity models tab
 * @param userData - User data containing subjects for filter options
 * @returns Array of filter configurations for the models table
 */
export const createModelsFiltersConfig = (
  userData: ActivityUserFilterData | undefined
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
