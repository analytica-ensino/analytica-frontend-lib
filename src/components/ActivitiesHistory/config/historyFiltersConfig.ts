import { getSchoolOptions, getSubjectOptions } from '../utils';
import { ACTIVITY_FILTER_STATUS_OPTIONS } from '../../../types/activitiesHistory';
import type { FilterConfig } from '../../Filter';
import type { ActivityUserFilterData } from '../../../types/activitiesHistory';

/**
 * Create filter configuration for activities history tab
 * @param userData - User data containing schools and subjects for filter options
 * @returns Array of filter configurations for the history table
 */
export const createHistoryFiltersConfig = (
  userData: ActivityUserFilterData | undefined
): FilterConfig[] => [
  {
    key: 'status',
    label: 'STATUS',
    categories: [
      {
        key: 'status',
        label: 'Status da Atividade',
        selectedIds: [],
        itens: ACTIVITY_FILTER_STATUS_OPTIONS,
      },
    ],
  },
  {
    key: 'academic',
    label: 'DADOS ACADÊMICOS',
    categories: [
      {
        key: 'school',
        label: 'Escola',
        selectedIds: [],
        itens: getSchoolOptions(userData),
      },
    ],
  },
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
