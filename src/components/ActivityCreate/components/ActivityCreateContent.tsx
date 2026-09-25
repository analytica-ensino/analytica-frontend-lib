import {
  ActivityFilters,
  ActivityFiltersPopover,
  ActivityPreview,
  Button,
  SkeletonText,
  QUESTION_TYPE,
  Divider,
} from '../../..';
import { FunnelIcon } from '@phosphor-icons/react/dist/csr/Funnel';
import { NotebookIcon } from '@phosphor-icons/react/dist/csr/Notebook';
import { FileIcon } from '@phosphor-icons/react/dist/csr/File';
import Menu, { MenuContent, MenuItem } from '../../Menu/Menu';
import { ActivityListQuestions } from '../../ActivityListQuestions/ActivityListQuestions';
import type {
  ActivityFiltersData,
  BaseApiClient,
  PreviewQuestion,
  QuestionActivity as Question,
} from '../../..';

interface LoadingSkeletonProps {
  className?: string;
}

/**
 * Loading skeleton for activity preview
 */
export const LoadingSkeleton = ({ className }: LoadingSkeletonProps) => (
  <div className={`flex flex-col gap-4 p-4 ${className || ''}`}>
    <div className="flex flex-col gap-2">
      <SkeletonText lines={1} width={200} />
      <SkeletonText lines={1} width={150} />
    </div>
    <div className="flex flex-col gap-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 border rounded">
          <SkeletonText lines={2} />
        </div>
      ))}
    </div>
  </div>
);

interface SmallScreenLayoutProps {
  apiClient: BaseApiClient;
  institutionId: string;
  isDark: boolean;
  selectedView: 'questions' | 'preview';
  onViewChange: (view: 'questions' | 'preview') => void;
  initialFiltersData: ActivityFiltersData | null;
  onFiltersChange: (filters: ActivityFiltersData) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  onAddQuestion: (question: Question) => void;
  addedQuestionIds: string[];
  enableExamMode: boolean;
  isInPersonExam: boolean;
  loadingInitialQuestions: boolean;
  questions: PreviewQuestion[];
  onRemoveAll: () => void;
  onRemoveQuestion: (questionId: string) => void;
  onReorder: (questions: PreviewQuestion[]) => void;
  filtersKey?: number;
  /**
   * Scopes the question bank to one institution. Only needed by a SUPER_ADMIN
   * (no institution in the session) building an exam for a given institution;
   * see `ActivityListQuestions.institutionId`.
   */
  questionsInstitutionId?: string;
}

/**
 * Small screen layout for activity creation (<= 1200px)
 */
export const SmallScreenLayout = ({
  apiClient,
  institutionId,
  isDark,
  selectedView,
  onViewChange,
  initialFiltersData,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  onAddQuestion,
  addedQuestionIds,
  enableExamMode,
  isInPersonExam,
  loadingInitialQuestions,
  questions,
  onRemoveAll,
  onRemoveQuestion,
  onReorder,
  filtersKey = 0,
  questionsInstitutionId,
}: SmallScreenLayoutProps) => (
  <div className="flex flex-col w-full flex-1 overflow-hidden gap-5 min-h-0">
    {/*
      Filters and Menu Row — o gatilho de filtro e as abas dividem a linha
      enquanto couberem, nessa ordem de recuo:

      1. Abaixo de 660px o gatilho esconde o rótulo e vira só o funil. Medido:
         as duas abas do `menu2` pedem 385px e o gatilho com rótulo ocupa 227px,
         então é a partir daí que ele precisa sair da frente. Colapsado cai para
         54px e a linha volta a caber.
      2. Abaixo de 480px nem isso basta — os rótulos por extenso passam do que
         sobra. Aí o `flex-wrap` desce as abas para a linha de baixo, onde elas
         ocupam a largura toda. Deixar o `flex-wrap` decidir, em vez de amarrar a
         quebra num breakpoint, faz ela acontecer exatamente quando o conteúdo
         não cabe — mudar um rótulo depois não desalinha a conta.
      3. Nesse ponto o gatilho ficou sozinho na primeira linha e volta a mostrar
         o rótulo: não há mais nada disputando espaço com ele, e um botão só de
         ícone é mais difícil de reconhecer. Daí o colapso ser uma faixa fechada
         (480–660) e não um "abaixo de".
    */}
    {/*
      `mt-5` porque esta linha é o primeiro filho e o `gap-5` do pai não vale
      acima dela: ela encostava no texto de apoio do header, e os poucos pixels
      que pareciam separá-los eram só a centralização do botão dentro da linha,
      não respiro. O valor repete o `gap-5` para manter o mesmo ritmo que separa
      a linha do conteúdo abaixo.
    */}
    <div className="mt-5 flex flex-row flex-wrap items-center justify-between gap-2 flex-shrink-0 min-[660px]:gap-4">
      <div className="flex-shrink-0">
        <ActivityFiltersPopover
          key={filtersKey}
          apiClient={apiClient}
          institutionId={institutionId}
          onFiltersChange={onFiltersChange}
          initialFilters={initialFiltersData || undefined}
          triggerLabel="Filtro de questões"
          triggerIcon={<FunnelIcon size={20} />}
          collapseTriggerLabel
          onApplyFilters={onApplyFilters}
          onClearFilters={onClearFilters}
          allowedQuestionTypes={
            isInPersonExam ? [QUESTION_TYPE.ALTERNATIVA] : undefined
          }
        />
      </div>
      {/*
        Dois regimes, e o `480px` é o ponto onde a linha única deixa de caber.

        Dividindo a linha com o filtro (>= 480px), `w-fit` encolhe a caixa: o
        variant `menu2` deixa lista e itens `w-full`, então sem isso cada aba
        ocuparia metade da linha e a barra do indicador esticaria junto.

        Na linha própria (< 480px), o `w-fit` sai e as abas assumem a largura
        toda, metade para cada uma. Não é só estética: as duas juntas pedem
        385px no tamanho natural e um celular de 375px oferece 343px de área
        útil — encolhidas ao tamanho natural elas vazariam para fora da tela.
        Ocupando metade cada, o rótulo cabe com folga.
      */}
      <div className="basis-full min-[480px]:basis-auto min-[480px]:w-fit flex-shrink-0">
        <Menu
          defaultValue="questions"
          value={selectedView}
          onValueChange={(value) =>
            onViewChange(value as 'questions' | 'preview')
          }
          variant="menu2"
          className="bg-transparent shadow-none px-0"
        >
          <MenuContent variant="menu2">
            {/*
              Os ícones só entram de 480px para cima. Eles custam 52px nas duas
              abas somadas, e é justamente esse excedente que faz os rótulos não
              caberem na linha própria de um celular: 385px de abas contra 343px
              de área útil em 375px. Sem eles, 333px — sobra.

              `whitespace-nowrap` pelo mesmo corte: acima de 480px ele impede que
              "Prévia da atividade" vire duas linhas e desalinhe as barras.
              Abaixo, fica solto de propósito — é a última válvula de escape num
              aparelho ainda mais estreito, onde é melhor o rótulo quebrar do que
              vazar para fora da tela.
            */}
            <MenuItem
              value="questions"
              variant="menu2"
              className="min-[480px]:whitespace-nowrap"
            >
              <NotebookIcon
                size={18}
                aria-hidden
                className="hidden min-[480px]:block"
              />
              Banco de questões
            </MenuItem>
            <MenuItem
              value="preview"
              variant="menu2"
              className="min-[480px]:whitespace-nowrap"
            >
              <FileIcon
                size={18}
                aria-hidden
                className="hidden min-[480px]:block"
              />
              {enableExamMode ? 'Prévia da prova' : 'Prévia da atividade'}
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>
    </div>

    {/* Content Area - Single Column */}
    <div className="flex-1 min-w-0 relative">
      {selectedView === 'questions' ? (
        <div className="absolute inset-0 overflow-hidden">
          <ActivityListQuestions
            apiClient={apiClient}
            onAddQuestion={onAddQuestion}
            addedQuestionIds={addedQuestionIds}
            enableExamMode={enableExamMode}
            institutionId={questionsInstitutionId}
          />
        </div>
      ) : (
        <div className="absolute inset-0 overflow-hidden">
          {loadingInitialQuestions ? (
            <LoadingSkeleton />
          ) : (
            <ActivityPreview
              questions={questions}
              onRemoveAll={onRemoveAll}
              onRemoveQuestion={onRemoveQuestion}
              onReorder={onReorder}
              isDark={isDark}
              className="h-full overflow-y-auto"
            />
          )}
        </div>
      )}
    </div>
  </div>
);

interface DesktopLayoutProps {
  apiClient: BaseApiClient;
  institutionId: string;
  isDark: boolean;
  initialFiltersData: ActivityFiltersData | null;
  draftFilters: ActivityFiltersData | null;
  onFiltersChange: (filters: ActivityFiltersData) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  onAddQuestion: (question: Question) => void;
  addedQuestionIds: string[];
  enableExamMode: boolean;
  isInPersonExam: boolean;
  loadingInitialQuestions: boolean;
  questions: PreviewQuestion[];
  onRemoveAll: () => void;
  onRemoveQuestion: (questionId: string) => void;
  onReorder: (questions: PreviewQuestion[]) => void;
  filtersKey?: number;
  /** See `SmallScreenLayoutProps.questionsInstitutionId`. */
  questionsInstitutionId?: string;
}

/**
 * Desktop layout for activity creation (> 1200px)
 */
export const DesktopLayout = ({
  apiClient,
  institutionId,
  isDark,
  initialFiltersData,
  draftFilters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  onAddQuestion,
  addedQuestionIds,
  enableExamMode,
  isInPersonExam,
  loadingInitialQuestions,
  questions,
  onRemoveAll,
  onRemoveQuestion,
  onReorder,
  filtersKey = 0,
  questionsInstitutionId,
}: DesktopLayoutProps) => (
  <div className="flex flex-row w-full flex-1 overflow-hidden gap-5 min-h-0">
    {/* First Column - Filters */}
    {/*
      overflow-clip (not overflow-hidden): an overflow-hidden box is still a
      scroll container, so when a descendant (accordion/checkbox) receives focus
      while the content transiently overflows, the browser scrolls this box via
      scrollIntoView. With no scrollbar the user can't scroll back and the filter
      appears blank until a zoom forces a reflow. overflow-clip clips identically
      but never becomes scrollable, so the offset can't get stuck.
    */}
    <div className="flex flex-col gap-3 overflow-clip h-full min-h-0 max-h-full relative w-[400px] flex-shrink-0">
      <div className="flex flex-col overflow-y-auto overflow-x-hidden flex-1 min-h-0 max-h-full">
        <ActivityFilters
          key={filtersKey}
          apiClient={apiClient}
          institutionId={institutionId}
          variant={'default'}
          onFiltersChange={onFiltersChange}
          initialFilters={initialFiltersData || undefined}
          allowedQuestionTypes={
            isInPersonExam ? [QUESTION_TYPE.ALTERNATIVA] : undefined
          }
        />
      </div>
      <div className="flex-shrink-0 grid grid-cols-2 gap-2">
        <Button size="medium" variant="link" onClick={onClearFilters}>
          Limpar filtros
        </Button>
        <Button
          size="medium"
          variant="outline"
          onClick={onApplyFilters}
          disabled={!draftFilters}
        >
          Filtrar
        </Button>
      </div>
    </div>

    <Divider orientation="vertical" />

    {/* Second Column - Center, fills remaining space */}
    <div className="flex-1 min-w-0 relative">
      <div className="absolute inset-0 overflow-hidden">
        <ActivityListQuestions
          apiClient={apiClient}
          onAddQuestion={onAddQuestion}
          addedQuestionIds={addedQuestionIds}
          enableExamMode={enableExamMode}
          institutionId={questionsInstitutionId}
        />
      </div>
    </div>

    <Divider orientation="vertical" />

    {/* Third Column - Activity Preview */}
    <div className="w-[400px] flex-shrink-0 overflow-hidden h-full min-h-0">
      {loadingInitialQuestions ? (
        <LoadingSkeleton />
      ) : (
        <ActivityPreview
          questions={questions}
          onRemoveAll={onRemoveAll}
          onRemoveQuestion={onRemoveQuestion}
          onReorder={onReorder}
          isDark={isDark}
          className="h-full overflow-y-auto"
        />
      )}
    </div>
  </div>
);
