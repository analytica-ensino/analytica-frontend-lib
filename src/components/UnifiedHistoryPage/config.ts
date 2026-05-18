import {
  ActivityPageLayout,
  ActivityTab,
} from '../ActivityPageLayout/ActivityPageLayout';
import { ExamPageLayout, ExamTab } from '../ExamPageLayout/ExamPageLayout';
import { ACTIVITY_FILTER_STATUS_OPTIONS } from '../../types/activitiesHistory';
import { EXAM_STATUS_OPTIONS } from '../../utils/examFilterHelpers';
import { activitiesTableColumns } from '../ActivityPageLayout/activitiesTableConfig';
import { examsTableColumns } from '../ExamPageLayout/examsTableConfig';
import type { ActivityCategory } from '../TypeSelector/TypeSelector.types';
import type { ColumnConfig } from '../TableProvider/TableProvider';
import type { ActivityTableItem } from '../../types/activitiesHistory';
import type { ExamTableItem } from '../../types/examsHistory';

/**
 * Page configuration type for activities or exams
 */
export interface PageConfig {
  PageLayout: typeof ActivityPageLayout | typeof ExamPageLayout;
  activeTab: string;
  pageTitle: string;
  emptyTitle: string;
  emptyDescription: string;
  buttonText: string;
  itemLabel: string;
  searchPlaceholder: string;
  testId: string;
  statusOptions: Array<{ id: string; name: string }>;
  statusLabel: string;
  tableColumns:
    | ColumnConfig<ActivityTableItem>[]
    | ColumnConfig<ExamTableItem>[];
  tabs: {
    HISTORY: string;
    DRAFTS: string;
    MODELS: string;
  };
  onCreatePropName: 'onCreateActivity' | 'onCreateExam';
}

/**
 * Configuration for activities vs exams
 */
export const PAGE_CONFIG: Record<ActivityCategory, PageConfig> = {
  ATIVIDADE: {
    PageLayout: ActivityPageLayout,
    activeTab: ActivityTab.HISTORY,
    pageTitle: 'Histórico de atividades',
    emptyTitle: 'Nenhuma atividade encontrada',
    emptyDescription:
      'Crie uma nova atividade e acompanhe o desempenho dos alunos!',
    buttonText: 'Criar atividade',
    itemLabel: 'atividades',
    searchPlaceholder: 'Buscar atividade',
    testId: 'activities-history-page',
    statusOptions: ACTIVITY_FILTER_STATUS_OPTIONS,
    statusLabel: 'Status da Atividade',
    tableColumns: activitiesTableColumns,
    tabs: {
      HISTORY: ActivityTab.HISTORY,
      DRAFTS: ActivityTab.DRAFTS,
      MODELS: ActivityTab.MODELS,
    },
    onCreatePropName: 'onCreateActivity' as const,
  },
  PROVA: {
    PageLayout: ExamPageLayout,
    activeTab: ExamTab.HISTORY,
    pageTitle: 'Histórico de provas',
    emptyTitle: 'Nenhuma prova encontrada',
    emptyDescription:
      'Crie uma nova prova e acompanhe o desempenho dos alunos!',
    buttonText: 'Criar prova',
    itemLabel: 'provas',
    searchPlaceholder: 'Buscar prova',
    testId: 'exams-history-page',
    statusOptions: EXAM_STATUS_OPTIONS,
    statusLabel: 'Status da Prova',
    tableColumns: examsTableColumns,
    tabs: {
      HISTORY: ExamTab.HISTORY,
      DRAFTS: ExamTab.DRAFTS,
      MODELS: ExamTab.MODELS,
    },
    onCreatePropName: 'onCreateExam' as const,
  },
} as const;
