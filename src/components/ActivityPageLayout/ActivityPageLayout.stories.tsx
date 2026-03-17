import type { Story } from '@ladle/react';
import { ActivityPageLayout, ActivityTab } from './ActivityPageLayout';
import type { ColumnConfig } from '../TableProvider/TableProvider';

/**
 * Sample row type for story demonstrations
 */
interface SampleRow extends Record<string, unknown> {
  id: string;
  title: string;
  subject: string;
  status: string;
}

/**
 * Column configuration for story demonstrations
 */
const storyHeaders: ColumnConfig<SampleRow>[] = [
  { key: 'title', label: 'Título', sortable: true },
  { key: 'subject', label: 'Disciplina', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
];

/**
 * Sample data for story demonstrations
 */
const sampleData: SampleRow[] = [
  {
    id: '1',
    title: 'Prova de Matemática - Funções do 1º Grau',
    subject: 'Matemática',
    status: 'Ativa',
  },
  {
    id: '2',
    title: 'Lista de Exercícios de Português',
    subject: 'Português',
    status: 'Concluída',
  },
  {
    id: '3',
    title: 'Avaliação de História Antiga',
    subject: 'História',
    status: 'Vencida',
  },
];

/**
 * Empty state placeholder for story demonstrations
 */
const EmptyStatePlaceholder = () => (
  <div className="flex flex-col items-center gap-2 py-8 text-text-600">
    <p>Nenhuma atividade encontrada</p>
  </div>
);

/**
 * Common no-search image placeholder (data URI 1×1 transparent PNG)
 */
const NO_SEARCH_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

/**
 * Base story wrapper with common props
 */
const BaseStory = ({
  activeTab = ActivityTab.HISTORY,
  data = sampleData,
  error = null,
  loading = false,
}: Partial<{
  activeTab: ActivityTab;
  data: SampleRow[];
  error: string | null;
  loading: boolean;
}>) => (
  <ActivityPageLayout
    activeTab={activeTab}
    pageTitle="Atividades"
    testId="activity-page-layout-story"
    data={data}
    headers={storyHeaders}
    loading={loading}
    error={error}
    pagination={{ total: data.length, totalPages: 1 }}
    itemLabel="atividades"
    searchPlaceholder="Buscar atividades..."
    emptyState={<EmptyStatePlaceholder />}
    noSearchImage={NO_SEARCH_IMAGE}
    onParamsChange={() => {}}
    onRowClick={() => {}}
    onTabChange={() => {}}
    onCreateActivity={() => {}}
  />
);

/**
 * Default story — Histórico tab with data
 */
export const Default: Story = () => <BaseStory />;
Default.storyName = 'Histórico com dados';

/**
 * Rascunhos tab
 */
export const DraftsTab: Story = () => (
  <BaseStory activeTab={ActivityTab.DRAFTS} />
);
DraftsTab.storyName = 'Aba Rascunhos';

/**
 * Modelos tab
 */
export const ModelsTab: Story = () => (
  <BaseStory activeTab={ActivityTab.MODELS} />
);
ModelsTab.storyName = 'Aba Modelos';

/**
 * Empty data state
 */
export const Empty: Story = () => <BaseStory data={[]} />;
Empty.storyName = 'Sem dados';

/**
 * Loading state
 */
export const Loading: Story = () => <BaseStory loading={true} />;
Loading.storyName = 'Carregando';

/**
 * Error state
 */
export const WithError: Story = () => (
  <BaseStory error="Erro ao carregar atividades. Tente novamente." />
);
WithError.storyName = 'Com erro';
