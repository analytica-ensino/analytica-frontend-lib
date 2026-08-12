import { ACTIVITY_FILTER_STATUS_OPTIONS } from '../../types/activitiesHistory';
import { EXAM_STATUS_OPTIONS } from '../../utils/examFilterHelpers';

/**
 * Activity type enum.
 *
 * Deliberately still the two original categories: consumer apps key their own
 * records by this type (`Record<ActivityCategory, TypeRoutes>`), so widening it
 * would break their type-check on the next release. Optional categories live in
 * `OptionalActivityCategory` and the full set in `ExtendedActivityCategory`.
 */
export type ActivityCategory = 'ATIVIDADE' | 'PROVA';

/**
 * Categories a consumer opts into by providing routes for them. Omitting one
 * simply keeps it out of the selector.
 */
export type OptionalActivityCategory = 'PRESENCIAL';

/**
 * Every category the selector can display: the two required ones plus whatever
 * the app opted into.
 */
export type ExtendedActivityCategory =
  | ActivityCategory
  | OptionalActivityCategory;

/**
 * Runtime values of the activity categories, for apps to compare and switch on
 * instead of repeating string literals.
 *
 * Kept apart from `ExamActivityCategory`, which mirrors the backend's
 * `ACTIVITY_CATEGORY` (PROVA/ATIVIDADE only): `PRESENCIAL` is a front-end
 * category — on the backend it is a PROVA with `isDigital: false`.
 *
 * The props above stay string unions on purpose, so `activityCategory="PROVA"`
 * keeps working; a string-enum member is assignable to its literal type, so
 * both spellings are accepted.
 */
export enum ActivityCategoryValue {
  ATIVIDADE = 'ATIVIDADE',
  PROVA = 'PROVA',
  PRESENCIAL = 'PRESENCIAL',
}

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
 * Routes an app provides for the activity categories it supports. The two core
 * categories are required; optional ones (e.g. PRESENCIAL) are what enables
 * them in the selector.
 */
export type ActivityRoutesInput = Record<ActivityCategory, TypeRoutes> &
  Partial<Record<OptionalActivityCategory, TypeRoutes>>;

/**
 * Resolved configuration keyed by category. Mirrors ActivityRoutesInput: the
 * optional categories are only present when routes were provided for them.
 */
export type ActivityCategoryConfig = Record<ActivityCategory, TypeConfig> &
  Partial<Record<OptionalActivityCategory, TypeConfig>>;

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
 * Default labels for PRESENCIAL type (in-person activities).
 *
 * Page titles intentionally match ATIVIDADE_LABELS: the type selector sits next
 * to the title and already tells the two apart.
 */
export const PRESENCIAL_LABELS: TypeLabels = {
  pageTitle: {
    history: 'Histórico de atividades',
    drafts: 'Rascunhos de atividades',
    models: 'Modelos de atividades',
  },
  createButton: 'Criar atividade',
  selectorLabel: 'Presenciais',
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
    title: 'Nenhuma atividade presencial por aqui',
    description:
      'Crie uma nova atividade presencial e acompanhe o desempenho dos seus alunos!',
    buttonText: 'Criar atividade',
  },
  statusLabel: 'Status da Atividade',
};

/**
 * Default status options by type
 */
export const DEFAULT_STATUS_OPTIONS: Record<
  ExtendedActivityCategory,
  Array<{ id: string; name: string }>
> = {
  ATIVIDADE: ACTIVITY_FILTER_STATUS_OPTIONS,
  PROVA: EXAM_STATUS_OPTIONS,
  PRESENCIAL: ACTIVITY_FILTER_STATUS_OPTIONS,
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
  const cleanPath = pathname.split('?')[0].split('#')[0];

  if (/(^|\/)rascunhos(\/|$)/.test(cleanPath)) return 'drafts';
  if (/(^|\/)modelos(\/|$)/.test(cleanPath)) return 'models';
  return 'history';
};

/**
 * Create activity type config with custom routes.
 *
 * Optional categories (PRESENCIAL) are only included when the caller provided
 * routes for them — that is how an app opts into showing them in the selector.
 */
export const createActivityCategoryConfig = (
  routes: ActivityRoutesInput
): ActivityCategoryConfig => ({
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
  ...(routes.PRESENCIAL
    ? {
        PRESENCIAL: {
          labels: PRESENCIAL_LABELS,
          routes: routes.PRESENCIAL,
          statusOptions: DEFAULT_STATUS_OPTIONS.PRESENCIAL,
        },
      }
    : {}),
});
