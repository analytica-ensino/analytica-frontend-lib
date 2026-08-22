import { useEffect, useCallback, useState, type ReactNode } from 'react';
import ReportDetailModal from '../ReportDetailModal/ReportDetailModal';
import Text from '../Text/Text';
import Badge from '../Badge/Badge';
import { SkeletonRounded } from '../Skeleton/Skeleton';
import { TableProvider, type TableParams } from '../TableProvider';
import { useEssayCompetenceDetails } from './useEssayCompetenceDetails';
import { downloadExcel } from '../../utils/exportExcel';
import { formatDateForFileName } from '../../utils/exportFormat';
import { fetchAllCompetenceStudents } from './competenceDetailsRequest';
import { buildEssayCompetenceDetailsSheets } from './exportSheets';
import {
  SIMULATED_PERFORMANCE_TAG_CONFIG,
  PERFORMANCE_TAG_TO_BADGE_ACTION,
  PerformanceBadgeAction,
} from '../SimulatedStudentDetailsModal/types';
import { BadgeActionType } from '../../types/common';
import type {
  EssayCompetenceDetailsModalProps,
  EssayCompetenceDetailsParams,
  EssayCompetenceStudentItem,
} from './types';

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
 * são a primeira linha da aba de resumo e o título impresso no PDF.
 *
 * O sufixo "-redacao" separa este arquivo do do `SimulatedContentDetailsModal`,
 * que já usa `desempenho-competencia`: os dois modais desenham "uma competência
 * e seus estudantes", e sem o sufixo os dois relatórios sairiam com o MESMO nome
 * no mesmo dia. "redacao" sem cedilha porque é nome de arquivo, e para ficar na
 * família do `desempenho-redacao` do `EssayStudentDetailsModal`.
 */
const EXPORT_FILE_PREFIX = 'desempenho-competencia-redacao';

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
    key: 'averageScore',
    label: 'Média',
    className: 'py-3 px-4 text-center',
    align: 'center' as const,
    width: '100px',
    render: (_value: unknown, row: Record<string, unknown>) => {
      const student = row as unknown as EssayCompetenceStudentItem;
      return (
        <Text size="sm" color="text-text-950">
          {Math.round(student.averageScore)}/200
        </Text>
      );
    },
  },
  {
    key: 'performance',
    label: 'Proficiência',
    className: 'py-3 px-4 text-center',
    align: 'center' as const,
    width: '140px',
    render: (_value: unknown, row: Record<string, unknown>) => {
      const student = row as unknown as EssayCompetenceStudentItem;
      const badgeAction =
        PERFORMANCE_TAG_TO_BADGE_ACTION[student.performance] ??
        PerformanceBadgeAction.INFO;
      const tagConfig = SIMULATED_PERFORMANCE_TAG_CONFIG[student.performance];
      const label = tagConfig?.label ?? 'Desconhecido';
      return (
        <Badge variant="solid" action={badgeAction} size="small">
          {label}
        </Badge>
      );
    },
  },
];

/**
 * Modal for displaying essay competence performance details
 * Shows table of students with their scores for a specific competency
 *
 * Exportável: monta sobre o `ReportDetailModal`, então traz o botão "Baixar
 * relatório" com PDF (impressão só deste modal) e XLSX. A planilha espelha os
 * blocos da tela aba a aba (veja `exportSheets.ts`).
 *
 * TABELA PAGINADA: os dois formatos divergem, de propósito. O PDF é a foto do
 * modal e sai com a página que está na tela; o XLSX leva a tabela INTEIRA,
 * varrida por `fetchAllCompetenceStudents`. É o mesmo arranjo do
 * `SimulatedContentDetailsModal`, o outro modal desta feature com tabela
 * paginada: a tela mostra dez linhas de cada vez, e uma planilha com a página
 * visível sairia truncada sem nada dizer que o resto ficou de fora. O resumo
 * continua vindo do `data` que a tela já tem, sem requisição a mais.
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
export function EssayCompetenceDetailsModal({
  api,
  isOpen,
  onClose,
  competenceNumber,
  competenceName,
  period,
  schoolIds,
  schoolYearIds,
  classIds,
}: EssayCompetenceDetailsModalProps) {
  const { data, loading, error, fetchDetails, reset } =
    useEssayCompetenceDetails(api);
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
    (page: number, limit: number): EssayCompetenceDetailsParams | null => {
      if (!competenceNumber) return null;

      return {
        competenceNumber,
        period,
        schoolIds,
        schoolYearIds,
        classIds,
        page,
        limit,
      };
    },
    [competenceNumber, period, schoolIds, schoolYearIds, classIds]
  );

  // Fetch details when modal opens
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

  const fallbackCompetenceName = `Competência ${competenceNumber}`;
  const resolvedCompetenceName = competenceName || fallbackCompetenceName;
  const modalTitle = competenceNumber
    ? `C${competenceNumber} - ${resolvedCompetenceName}`
    : 'Detalhes da Competência';

  const fileName = `${EXPORT_FILE_PREFIX}-${formatDateForFileName(new Date())}`;

  const handleDownloadExcel = useCallback(async () => {
    setIsDownloading(true);
    setDownloadError(null);

    try {
      // Sem `data` a tela não desenhou tabela nenhuma, e varrer traria linha que
      // o usuário não viu. `buildParams` devolve `null` quando não há
      // `competenceNumber`, que é o mesmo caso.
      const params = buildParams(DEFAULT_PAGE, DEFAULT_PAGE_SIZE);
      const students =
        data && params ? await fetchAllCompetenceStudents(api, params) : null;

      downloadExcel(
        fileName,
        buildEssayCompetenceDetailsSheets(data, modalTitle, students)
      );
    } catch (err) {
      setDownloadError(
        err instanceof Error ? err.message : EXPORT_ERROR_MESSAGE
      );
    } finally {
      setIsDownloading(false);
    }
  }, [api, buildParams, data, modalTitle, fileName]);

  const renderLoading = (): ReactNode => (
    <div className="flex flex-col gap-4">
      {/* Header skeleton */}
      <div className="flex items-center gap-2">
        <SkeletonRounded className="h-4 w-32" />
      </div>

      {/* Counters skeleton */}
      <div className="flex gap-3">
        {[1, 2, 3].map((i) => (
          <SkeletonRounded key={i} className="flex-1 h-20 rounded-xl" />
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

  const renderStatusMessage = (
    message: ReactNode,
    className: string
  ): ReactNode => (
    <div className="flex items-center justify-center py-8">
      <Text size="sm" className={className}>
        {message}
      </Text>
    </div>
  );

  const renderDetails = (details: NonNullable<typeof data>): ReactNode => (
    <div className="flex flex-col gap-6">
      {/* Subtitle */}
      <Text size="sm" className="text-text-500">
        Redação • {details.totalEssays}{' '}
        {details.totalEssays === 1 ? 'redação' : 'redações'} •{' '}
        {details.totalStudents}{' '}
        {details.totalStudents === 1 ? 'aluno' : 'alunos'}
      </Text>

      {/* Performance counters - 3 cards */}
      <div className="flex gap-3">
        <CounterCard
          label="Acima da média"
          count={details.counters.highlight + details.counters.aboveAverage}
          variant={BadgeActionType.SUCCESS}
        />
        <CounterCard
          label="Abaixo da média"
          count={details.counters.belowAverage}
          variant={BadgeActionType.WARNING}
        />
        <CounterCard
          label="Ponto de atenção"
          count={details.counters.attentionPoint}
          variant={BadgeActionType.ERROR}
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
          totalPages:
            details.students.limit > 0
              ? Math.ceil(details.students.total / details.students.limit)
              : 1,
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
  readonly variant: BadgeActionType;
}) {
  const bgColors: Record<BadgeActionType, string> = {
    [BadgeActionType.SUCCESS]: 'bg-success-50',
    [BadgeActionType.WARNING]: 'bg-warning-50',
    [BadgeActionType.ERROR]: 'bg-error-50',
    [BadgeActionType.INFO]: 'bg-info-50',
  };

  const textColors: Record<BadgeActionType, string> = {
    [BadgeActionType.SUCCESS]: 'text-success-700',
    [BadgeActionType.WARNING]: 'text-warning-700',
    [BadgeActionType.ERROR]: 'text-error-700',
    [BadgeActionType.INFO]: 'text-info-700',
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
