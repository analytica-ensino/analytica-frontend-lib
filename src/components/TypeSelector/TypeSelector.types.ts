import { ACTIVITY_FILTER_STATUS_OPTIONS } from '../../types/activitiesHistory';
import { EXAM_STATUS_OPTIONS } from '../../utils/examFilterHelpers';

/**
 * Activity type enum
 */
export type ActivityCategory = 'ATIVIDADE' | 'PROVA';

/**
 * Active tab type for activity pages
 */
export type ActiveTab = 'history' | 'drafts' | 'models';

/**
 * Labels configuration for each activity type
 */
export interface TypeLabels {
  pageTitle: Record<ActiveTab, string>;
  createButton: string;
  selectorLabel: string;
  itemLabel: Record<ActiveTab, string>;
  searchPlaceholder: Record<ActiveTab, string>;
  emptyState: {
    title: string;
    description: string;
    buttonText: string;
  };
  statusLabel: string;
}

/**
 * Routes configuration for each activity type
 */
export interface TypeRoutes {
  base: string;
  create: string;
  details: (id: string) => string;
  editDraft: (id: string) => string;
  editModel: (id: string) => string;
}

/**
 * Complete configuration for an activity type
 */
export interface TypeConfig {
  labels: TypeLabels;
  routes: TypeRoutes;
  statusOptions: Array<{ id: string; name: string }>;
}

/**
 * Default labels for ATIVIDADE type
 */
export const ATIVIDADE_LABELS: TypeLabels = {
  pageTitle: {
    history: 'Histórico de atividades',
    drafts: 'Rascunhos de atividades',
    models: 'Modelos de atividades',
  },
  createButton: 'Criar atividade',
  selectorLabel: 'Atividades',
  itemLabel: {
    history: 'atividades',
    drafts: 'rascunhos',
    models: 'modelos',
  },
  searchPlaceholder: {
    history: 'Buscar atividade',
    drafts: 'Buscar rascunho',
    models: 'Buscar modelo',
  },
  emptyState: {
    title: 'Incentive sua turma ao aprendizado',
    description:
      'Crie uma nova atividade e ajude seus alunos a colocarem o conteúdo em prática!',
    buttonText: 'Criar atividade',
  },
  statusLabel: 'Status da Atividade',
};

/**
 * Default labels for PROVA type
 */
export const PROVA_LABELS: TypeLabels = {
  pageTitle: {
    history: 'Histórico de provas',
    drafts: 'Rascunhos de provas',
    models: 'Modelos de provas',
  },
  createButton: 'Criar prova',
  selectorLabel: 'Provas',
  itemLabel: {
    history: 'provas',
    drafts: 'rascunhos',
    models: 'modelos',
  },
  searchPlaceholder: {
    history: 'Buscar prova',
    drafts: 'Buscar rascunho',
    models: 'Buscar modelo',
  },
  emptyState: {
    title: 'Avalie o conhecimento da sua turma',
    description:
      'Crie uma nova prova e acompanhe o desempenho dos seus alunos!',
    buttonText: 'Criar prova',
  },
  statusLabel: 'Status da Prova',
};

/**
 * Default status options by type
 */
export const DEFAULT_STATUS_OPTIONS: Record<ActivityCategory, Array<{ id: string; name: string }>> = {
  ATIVIDADE: ACTIVITY_FILTER_STATUS_OPTIONS,
  PROVA: EXAM_STATUS_OPTIONS,
};

/**
 * Get tab path segment based on active tab
 */
export const getTabPath = (tab: ActiveTab): string => {
  switch (tab) {
    case 'drafts':
      return '/rascunhos';
    case 'models':
      return '/modelos';
    default:
      return '';
  }
};

/**
 * Get tab value from URL path segment
 */
export const getTabFromPath = (pathname: string): ActiveTab => {
  if (pathname.includes('/rascunhos')) return 'drafts';
  if (pathname.includes('/modelos')) return 'models';
  return 'history';
};

/**
 * Create activity type config with custom routes
 */
export const createActivityCategoryConfig = (
  routes: Record<ActivityCategory, TypeRoutes>
): Record<ActivityCategory, TypeConfig> => ({
  ATIVIDADE: {
    labels: ATIVIDADE_LABELS,
    routes: routes.ATIVIDADE,
    statusOptions: DEFAULT_STATUS_OPTIONS.ATIVIDADE,
  },
  PROVA: {
    labels: PROVA_LABELS,
    routes: routes.PROVA,
    statusOptions: DEFAULT_STATUS_OPTIONS.PROVA,
  },
});
