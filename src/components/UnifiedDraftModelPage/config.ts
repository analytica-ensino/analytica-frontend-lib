import {
  ActivityPageLayout,
  ActivityTab,
} from '../ActivityPageLayout/ActivityPageLayout';
import { ExamPageLayout, ExamTab } from '../ExamPageLayout/ExamPageLayout';
import type { ExtendedActivityCategory } from '../TypeSelector/TypeSelector.types';

/**
 * Page config type for drafts or models
 */
interface DraftModelConfig {
  activeTab: string;
  pageTitle: string;
  emptyTitle: string;
  emptyDescription: string;
  buttonText: string;
  itemLabel: string;
  searchPlaceholder: string;
  dialogTitle: string;
  editUrlType: 'rascunho' | 'modelo';
  errorLogLabel: string;
  currentTab: 'drafts' | 'models';
  dataKey: 'drafts' | 'models';
  fetchKey: 'fetchDrafts' | 'fetchModels';
  deleteKey: 'deleteDraft' | 'deleteModel';
  testId: string;
  onCreatePropName: 'onCreateActivity' | 'onCreateExam';
}

/**
 * Page config by category and type
 */
type CategoryConfig = {
  drafts: DraftModelConfig;
  models: DraftModelConfig;
};

/**
 * Build the drafts/models pair for one category.
 *
 * The three categories differ only in wording, tab enum and test ids, so they
 * are generated from those differences instead of being copied.
 *
 * @param options - The parts that actually vary between categories
 * @returns Config for both the drafts and the models page
 */
const createCategoryConfig = ({
  tabs,
  pluralNoun,
  createButton,
  draftHint,
  modelHint,
  testIdPrefix,
  onCreatePropName,
}: {
  tabs: { drafts: string; models: string };
  /** Plural noun used in the page titles, e.g. "atividades" */
  pluralNoun: string;
  createButton: string;
  /** Sentence shown on the empty drafts page */
  draftHint: string;
  /** Sentence shown on the empty models page */
  modelHint: string;
  testIdPrefix: string;
  onCreatePropName: 'onCreateActivity' | 'onCreateExam';
}): CategoryConfig => ({
  drafts: {
    activeTab: tabs.drafts,
    pageTitle: `Rascunhos de ${pluralNoun}`,
    emptyTitle: 'Você ainda não tem rascunhos',
    emptyDescription: draftHint,
    buttonText: createButton,
    itemLabel: 'rascunhos',
    searchPlaceholder: 'Buscar rascunho',
    dialogTitle: 'Excluir rascunho',
    editUrlType: 'rascunho',
    errorLogLabel: 'rascunho',
    currentTab: 'drafts',
    dataKey: 'drafts',
    fetchKey: 'fetchDrafts',
    deleteKey: 'deleteDraft',
    testId: `${testIdPrefix}-drafts-page`,
    onCreatePropName,
  },
  models: {
    activeTab: tabs.models,
    pageTitle: `Modelos de ${pluralNoun}`,
    emptyTitle: 'Você ainda não tem modelos salvos',
    emptyDescription: modelHint,
    buttonText: createButton,
    itemLabel: 'modelos',
    searchPlaceholder: 'Buscar modelo',
    dialogTitle: 'Excluir modelo',
    editUrlType: 'modelo',
    errorLogLabel: 'modelo',
    currentTab: 'models',
    dataKey: 'models',
    fetchKey: 'fetchModels',
    deleteKey: 'deleteModel',
    testId: `${testIdPrefix}-models-page`,
    onCreatePropName,
  },
});

/**
 * Configuration for drafts vs models by activity category
 */
export const PAGE_CONFIG: Record<ExtendedActivityCategory, CategoryConfig> = {
  ATIVIDADE: createCategoryConfig({
    tabs: { drafts: ActivityTab.DRAFTS, models: ActivityTab.MODELS },
    pluralNoun: 'atividades',
    createButton: 'Criar atividade',
    draftHint:
      'Comece a criar uma atividade e salve como rascunho para continuar depois!',
    modelHint:
      'Salve uma atividade como modelo para reutilizá-la facilmente no futuro!',
    testIdPrefix: 'activity',
    onCreatePropName: 'onCreateActivity',
  }),
  PROVA: createCategoryConfig({
    tabs: { drafts: ExamTab.DRAFTS, models: ExamTab.MODELS },
    pluralNoun: 'provas',
    createButton: 'Criar prova',
    draftHint:
      'Comece a criar uma prova e salve como rascunho para continuar depois!',
    modelHint:
      'Salve uma prova como modelo para reutilizá-la facilmente no futuro!',
    testIdPrefix: 'exam',
    onCreatePropName: 'onCreateExam',
  }),
  PRESENCIAL: createCategoryConfig({
    tabs: { drafts: ActivityTab.DRAFTS, models: ActivityTab.MODELS },
    pluralNoun: 'atividades',
    createButton: 'Criar atividade',
    draftHint:
      'Comece a criar uma atividade presencial e salve como rascunho para continuar depois!',
    modelHint:
      'Salve uma atividade presencial como modelo para reutilizá-la facilmente no futuro!',
    testIdPrefix: 'presencial-activity',
    onCreatePropName: 'onCreateActivity',
  }),
};

/**
 * Get page layout component based on activity category
 */
export const getPageLayout = (activityCategory: ExtendedActivityCategory) => {
  return activityCategory === 'PROVA' ? ExamPageLayout : ActivityPageLayout;
};
