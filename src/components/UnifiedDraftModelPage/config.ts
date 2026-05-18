import {
  ActivityPageLayout,
  ActivityTab,
} from '../ActivityPageLayout/ActivityPageLayout';
import { ExamPageLayout, ExamTab } from '../ExamPageLayout/ExamPageLayout';
import type { ActivityCategory } from '../TypeSelector/TypeSelector.types';

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
 * Configuration for drafts vs models by activity category
 */
export const PAGE_CONFIG: Record<ActivityCategory, CategoryConfig> = {
  ATIVIDADE: {
    drafts: {
      activeTab: ActivityTab.DRAFTS,
      pageTitle: 'Rascunhos de atividades',
      emptyTitle: 'Você ainda não tem rascunhos',
      emptyDescription:
        'Comece a criar uma atividade e salve como rascunho para continuar depois!',
      buttonText: 'Criar atividade',
      itemLabel: 'rascunhos',
      searchPlaceholder: 'Buscar rascunho',
      dialogTitle: 'Excluir rascunho',
      editUrlType: 'rascunho' as const,
      errorLogLabel: 'rascunho',
      currentTab: 'drafts' as const,
      dataKey: 'drafts' as const,
      fetchKey: 'fetchDrafts' as const,
      deleteKey: 'deleteDraft' as const,
      testId: 'activity-drafts-page',
      onCreatePropName: 'onCreateActivity' as const,
    },
    models: {
      activeTab: ActivityTab.MODELS,
      pageTitle: 'Modelos de atividades',
      emptyTitle: 'Você ainda não tem modelos salvos',
      emptyDescription:
        'Salve uma atividade como modelo para reutilizá-la facilmente no futuro!',
      buttonText: 'Criar atividade',
      itemLabel: 'modelos',
      searchPlaceholder: 'Buscar modelo',
      dialogTitle: 'Excluir modelo',
      editUrlType: 'modelo' as const,
      errorLogLabel: 'modelo',
      currentTab: 'models' as const,
      dataKey: 'models' as const,
      fetchKey: 'fetchModels' as const,
      deleteKey: 'deleteModel' as const,
      testId: 'activity-models-page',
      onCreatePropName: 'onCreateActivity' as const,
    },
  },
  PROVA: {
    drafts: {
      activeTab: ExamTab.DRAFTS,
      pageTitle: 'Rascunhos de provas',
      emptyTitle: 'Você ainda não tem rascunhos',
      emptyDescription:
        'Comece a criar uma prova e salve como rascunho para continuar depois!',
      buttonText: 'Criar prova',
      itemLabel: 'rascunhos',
      searchPlaceholder: 'Buscar rascunho',
      dialogTitle: 'Excluir rascunho',
      editUrlType: 'rascunho' as const,
      errorLogLabel: 'rascunho',
      currentTab: 'drafts' as const,
      dataKey: 'drafts' as const,
      fetchKey: 'fetchDrafts' as const,
      deleteKey: 'deleteDraft' as const,
      testId: 'exam-drafts-page',
      onCreatePropName: 'onCreateExam' as const,
    },
    models: {
      activeTab: ExamTab.MODELS,
      pageTitle: 'Modelos de provas',
      emptyTitle: 'Você ainda não tem modelos salvos',
      emptyDescription:
        'Salve uma prova como modelo para reutilizá-la facilmente no futuro!',
      buttonText: 'Criar prova',
      itemLabel: 'modelos',
      searchPlaceholder: 'Buscar modelo',
      dialogTitle: 'Excluir modelo',
      editUrlType: 'modelo' as const,
      errorLogLabel: 'modelo',
      currentTab: 'models' as const,
      dataKey: 'models' as const,
      fetchKey: 'fetchModels' as const,
      deleteKey: 'deleteModel' as const,
      testId: 'exam-models-page',
      onCreatePropName: 'onCreateExam' as const,
    },
  },
} as const;

/**
 * Get page layout component based on activity category
 */
export const getPageLayout = (activityCategory: ActivityCategory) => {
  return activityCategory === 'PROVA' ? ExamPageLayout : ActivityPageLayout;
};
