import { useEffect, useCallback, useState, type ReactNode } from 'react';
import ReportDetailModal from '../ReportDetailModal/ReportDetailModal';
import Text from '../Text/Text';
import ProgressBar from '../ProgressBar/ProgressBar';
import { SkeletonRounded } from '../Skeleton/Skeleton';
import { TableProvider, type TableParams } from '../TableProvider';
import { ArrowLeftIcon } from '@phosphor-icons/react/dist/csr/ArrowLeft';
import { useSimulatedContentDetails } from './useSimulatedContentDetails';
import { formatPercentageRounded } from '../../utils/utils';
import { downloadExcel } from '../../utils/exportExcel';
import { formatDateForFileName } from '../../utils/exportFormat';
import { fetchAllContentStudents } from './contentDetailsRequest';
import { buildSimulatedContentDetailsSheets } from './exportSheets';
import type {
  SimulatedContentDetailsModalProps,
  ContentDetailsParams,
  ContentStudentItem,
} from './types';
import Button from '../Button/Button';

/**
 * Paginação com que o modal abre — os mesmos valores que a tabela usa como
 * padrão (`defaultItemsPerPage`).
 */
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

/**
 * Prefixo do arquivo exportado, em PDF e em XLSX. Recebe a data do dia.
 *
 * Sem o nome da competência de propósito: ele traz acentos, espaços e às vezes
 * pontuação, e um nome de arquivo pede transliteração — que não existe nesta lib
 * e que não vale a pena inventar aqui. Quem diz de qual competência é o arquivo
 * são a primeira linha da aba de resumo e o card impresso no PDF.
 */
const EXPORT_FILE_PREFIX = 'desempenho-competencia';

/** Mensagem quando a varredura da tabela falha e não há erro melhor. */
const EXPORT_ERROR_MESSAGE = 'Não foi possível gerar a planilha';

/**
 * Table columns configuration
 */
const TABLE_COLUMNS = [
  {
    key: 'name',
    label: 'Nome',
    className: 'py-3 px-4 text-start',
  },
  {
    key: 'school',
    label: 'Escola',
    className: 'py-3 px-4 text-start',
  },
  {
    key: 'schoolYear',
    label: 'Ano',
    className: 'py-3 px-4 text-center',
    align: 'center' as const,
    width: '80px',
  },
  {
    key: 'class',
    label: 'Turma',
    className: 'py-3 px-4 text-center',
    align: 'center' as const,
    width: '80px',
  },
  {
    key: 'average',
    label: 'Média',
    className: 'py-3 px-4 text-center',
    align: 'center' as const,
    width: '100px',
    render: (_value: unknown, row: Record<string, unknown>) => {
      const student = row as unknown as ContentStudentItem;
      return (
        <Text size="sm" weight="semibold" className="text-text-950">
          {Math.round(student.average)}
        </Text>
      );
    },
  },
  {
    key: 'performance',
    label: 'Desempenho',
    className: 'py-3 px-4 text-center',
    align: 'center' as const,
    width: '160px',
    render: (_value: unknown, row: Record<string, unknown>) => {
      const student = row as unknown as ContentStudentItem;
      return (
        <div className="flex items-center justify-center gap-2">
          <div className="w-20 shrink-0">
            <ProgressBar
              value={student.performance}
              variant="green"
              size="small"
            />
          </div>
          <Text size="sm" weight="semibold" className="w-10 text-text-600">
            {formatPercentageRounded(student.performance)}
          </Text>
        </div>
      );
    },
  },
];

/**
 * Modal for displaying content (habilidade) performance details in simulated exams
 * Shows table of students with their individual performance for the selected content
 *
 * Exportável: monta sobre o `ReportDetailModal`, então traz o botão "Baixar
 * relatório" com PDF (impressão só deste modal) e XLSX. A planilha espelha os
 * blocos da tela aba a aba (veja `exportSheets.ts`).
 *
 * TABELA PAGINADA: os dois formatos divergem, de propósito. O PDF é a foto do
 * modal e sai com a página que está na tela; o XLSX leva a tabela INTEIRA,
 * varrida por `fetchAllContentStudents`. Diferente dos três modais irmãos já
 * exportáveis — `StudentPerformanceDetailsModal`, `StudentLessonProgressModal` e
 * `SimulatedStudentDetailsModal` —, que exportam só o que já tinham em memória,
 * este dispara requisição própria: nenhum deles tem tabela paginada, e aqui a
 * tela mostra dez linhas de cada vez, então uma planilha com a página visível
 * sairia truncada sem nada dizer que o resto ficou de fora. O resumo continua
 * vindo do `data` que a tela já tem.
 *
 * ESTADOS DE CARREGANDO, ERRO E SEM-DADO: o botão continua lá, porque é o
 * `ReportDetailModal` que o desenha e ele não tem como escondê-lo. O PDF sai com
 * o que estiver na tela (os skeletons, a mensagem de erro ou a de "Nenhum dado
 * encontrado") e o XLSX sai com as duas abas só de cabeçalho — sem varrer nada,
 * já que a tela não desenhou tabela nenhuma. Nenhum dos dois estoura.
 *
 * O consumidor precisa importar `analytica-frontend-lib/print.css`: sem as
 * regras `@media print` o PDF sai com a página inteira em vez do modal.
 */
export function SimulatedContentDetailsModal({
  api,
  isOpen,
  onClose,
  activityFilters,
  contentId,
  contentName,
  period,
  filters,
}: SimulatedContentDetailsModalProps) {
  const { data, loading, error, fetchDetails, reset } =
    useSimulatedContentDetails(api);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  /**
   * O recorte que a tela está exibindo, pronto para virar requisição.
   *
   * Um lugar só porque são três os chamadores — a abertura do modal, a troca de
   * página da tabela e a varredura do XLSX — e a planilha precisa dizer respeito
   * exatamente ao mesmo recorte que a tabela.
   */
  const buildParams = useCallback(
    (page: number, limit: number): ContentDetailsParams | null => {
      if (!contentId) return null;

      return {
        activityFilters,
        contentId,
        period,
        schoolIds: filters?.schoolIds,
        schoolYearIds: filters?.schoolYearIds,
        classIds: filters?.classIds,
        page,
        limit,
      };
    },
    [contentId, activityFilters, period, filters]
  );

  // Fetch content details when modal opens
  useEffect(() => {
    const params = buildParams(DEFAULT_PAGE, DEFAULT_PAGE_SIZE);

    if (isOpen && params) {
      fetchDetails(params);
    }
  }, [isOpen, buildParams, fetchDetails]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setDownloadError(null);
    }
  }, [isOpen, reset]);

  // Handle table params change (pagination)
  const handleParamsChange = useCallback(
    (tableParams: TableParams) => {
      const params = buildParams(tableParams.page, tableParams.limit);

      if (!params) return;

      fetchDetails(params);
    },
    [buildParams, fetchDetails]
  );

  /**
   * O nome que o card do topo exibe — e, por isso, o que a aba de resumo
   * carrega. A regra do fallback fica aqui, em uma variável só, para o arquivo
   * dizer o mesmo que a tela.
   */
  const contentDisplayName = data ? data.content.name || contentName || '' : '';

  const fileName = `${EXPORT_FILE_PREFIX}-${formatDateForFileName(new Date())}`;

  const handleDownloadExcel = useCallback(async () => {
    setIsDownloading(true);
    setDownloadError(null);

    try {
      // Sem `data` a tela não desenhou tabela nenhuma, e varrer traria linha que
      // o usuário não viu. `buildParams` devolve `null` quando não há
      // `contentId`, que é o mesmo caso.
      const params = buildParams(DEFAULT_PAGE, DEFAULT_PAGE_SIZE);
      const students =
        data && params ? await fetchAllContentStudents(api, params) : null;

      downloadExcel(
        fileName,
        buildSimulatedContentDetailsSheets(data, contentDisplayName, students)
      );
    } catch (err) {
      setDownloadError(
        err instanceof Error ? err.message : EXPORT_ERROR_MESSAGE
      );
    } finally {
      setIsDownloading(false);
    }
  }, [api, buildParams, data, contentDisplayName, fileName]);

  // Build modal title
  const modalTitle = (
    <div className="flex items-center gap-2">
      {/* `data-print-hide`: fechar é controle de tela, não conteúdo do
          relatório, e no caminho PDF este botão está DENTRO da região impressa.
          Fica no próprio <Button> porque ele É o item do flex — escondido, o
          `gap-2` não separa mais nada. O texto ao lado continua saindo. */}
      <Button
        onClick={onClose}
        variant="raw"
        className="p-1 hover:bg-background-100 rounded-md transition-colors"
        aria-label="Fechar modal"
        data-print-hide
      >
        <ArrowLeftIcon size={20} className="text-text-600" />
      </Button>
      <Text>Desempenho competência</Text>
    </div>
  );

  const renderStatusMessage = (message: ReactNode, className: string) => (
    <div className="flex items-center justify-center py-8">
      <Text size="sm" className={className}>
        {message}
      </Text>
    </div>
  );

  const renderLoading = (): ReactNode => (
    <div className="flex flex-col gap-4" data-testid="content-details-loading">
      {/* Header skeleton */}
      <div className="p-4 bg-background-50 rounded-xl">
        <SkeletonRounded className="h-5 w-48 mb-2" />
        <SkeletonRounded className="h-4 w-64" />
      </div>

      {/* Counters skeleton */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <SkeletonRounded key={i} className="h-20 rounded-xl" />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="flex flex-col gap-2">
        <SkeletonRounded className="h-10 rounded-lg" />
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonRounded key={i} className="h-12 rounded-lg" />
        ))}
      </div>
    </div>
  );

  const renderDetails = (details: NonNullable<typeof data>): ReactNode => (
    <div className="flex flex-col gap-6">
      {/* Content header */}
      <div className="flex flex-col gap-1 p-4 bg-background-50 rounded-xl">
        <Text size="md" weight="semibold" className="text-text-950">
          {contentDisplayName}
        </Text>
        <div className="flex items-center gap-2">
          {details.content.bnccCode && (
            <Text size="sm" className="text-primary-600">
              {details.content.bnccCode}
            </Text>
          )}
          <Text size="sm" className="text-text-500">
            {details.content.subject.name} • {details.content.questionsCount}{' '}
            questões • {details.content.studentsCount} alunos
          </Text>
        </div>
      </div>

      {/* Performance counters */}
      <div className="grid grid-cols-3 gap-3">
        <CounterCard
          label="Acima da média"
          count={details.counters.aboveAverage}
          variant="success"
        />
        <CounterCard
          label="Na média"
          count={details.counters.atAverage}
          variant="info"
        />
        <CounterCard
          label="Abaixo da média"
          count={details.counters.belowAverage}
          variant="error"
        />
      </div>

      {/* Students table */}
      <TableProvider
        data={details.students.data as unknown as Record<string, unknown>[]}
        headers={TABLE_COLUMNS}
        variant="borderless"
        loading={loading}
        enablePagination
        rowKey="userInstitutionId"
        paginationConfig={{
          itemLabel: 'estudantes',
          itemsPerPageOptions: [10, 20, 50],
          defaultItemsPerPage: DEFAULT_PAGE_SIZE,
          totalItems: details.students.total,
          totalPages: Math.ceil(
            details.students.total / details.students.limit
          ),
        }}
        onParamsChange={handleParamsChange}
      >
        {/* Render prop só para alcançar o rodapé de paginação: ele é controle de
            tela e mora DENTRO da região impressa, então precisa de
            `data-print-hide` (o print.css lista "paginação" no contrato do
            atributo). O layout repete o `w-full space-y-4` que o TableProvider
            aplicaria sozinho. */}
        {({ controls, table, pagination }) => (
          <div className="w-full space-y-4">
            {controls}
            {table}
            <div data-print-hide>{pagination}</div>
          </div>
        )}
      </TableProvider>
    </div>
  );

  // Os quatro estados da tela dividem a MESMA casca de modal: antes cada um
  // devolvia o seu próprio `Modal`, o que agora daria quatro `ReportDetailModal`
  // e, com eles, um botão de download que aparece e some conforme o dado chega.
  const renderModalContent = (): ReactNode => {
    if (loading && !data) {
      return renderLoading();
    }

    if (error) {
      return renderStatusMessage(error, 'text-error-500');
    }

    if (!data) {
      return renderStatusMessage('Nenhum dado encontrado', 'text-text-500');
    }

    return renderDetails(data);
  };

  return (
    <ReportDetailModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      size="xl"
      // Só `fileName`: o PDF é a impressão deste modal, e o `ReportDetailModal`
      // já a faz. Ligar `onDownloadPdf` a um `useReportPrint` local somaria uma
      // segunda impressão — o callback SUBSTITUI a embutida, então o usuário
      // veria dois diálogos.
      fileName={fileName}
      onDownloadExcel={handleDownloadExcel}
      isDownloading={isDownloading}
      error={downloadError}
    >
      {renderModalContent()}
    </ReportDetailModal>
  );
}

/**
 * Counter card component
 */
function CounterCard({
  label,
  count,
  variant,
}: {
  readonly label: string;
  readonly count: number;
  readonly variant: 'success' | 'info' | 'error';
}) {
  const bgColors = {
    success: 'bg-success-50',
    info: 'bg-primary-50',
    error: 'bg-error-50',
  };

  const textColors = {
    success: 'text-success-700',
    info: 'text-primary-700',
    error: 'text-error-700',
  };

  return (
    <div
      className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl ${bgColors[variant]}`}
    >
      <Text size="2xl" weight="bold" className={textColors[variant]}>
        {count}
      </Text>
      <Text size="sm" className="text-text-600 text-center">
        {label}
      </Text>
    </div>
  );
}
