import type { FilterConfig } from '../components/Filter';
import type { ActivityFilterOption } from '../types/activitiesHistory';

/**
 * Create filter configuration for drafts/models pages
 * Shared utility used by both UnifiedDraftModelPage component and useActivityDraftModelPage hook
 */
export const createDraftsModelsFiltersConfig = (
  subjectOptions: ActivityFilterOption[]
): FilterConfig[] => [
  {
    key: 'content',
    label: 'CONTEÚDO',
    categories: [
      {
        key: 'subject',
        label: 'Matéria',
        selectedIds: [],
        itens: subjectOptions,
      },
    ],
  },
];
