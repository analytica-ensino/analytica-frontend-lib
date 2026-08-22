import { useCallback, useEffect, type ReactNode } from 'react';
import ReportDetailModal from '../ReportDetailModal/ReportDetailModal';
import Text from '../Text/Text';
import ProgressBar from '../ProgressBar/ProgressBar';
import Badge from '../Badge/Badge';
import { SkeletonRounded } from '../Skeleton/Skeleton';
import { useEssayStudentDetails } from './useEssayStudentDetails';
import { formatPercentageRounded } from '../../utils/utils';
import { downloadExcel } from '../../utils/exportExcel';
import { formatDateForFileName } from '../../utils/exportFormat';
import { buildEssayStudentDetailsSheets } from './exportSheets';
import { SIMULATED_PERFORMANCE_TAG_CONFIG } from '../SimulatedStudentDetailsModal/types';
import {
  type EssayStudentDetailsModalProps,
  type EssayCompetencyPerformance,
} from './types';
import { PERFORMANCE_TAG_TO_BADGE_ACTION } from '../SimulatedStudentDetailsModal';

/**
 * Prefixo do arquivo exportado, em PDF e em XLSX. Recebe a data do dia.
 *
 * Sem o nome do estudante de propósito: ele traz acentos, espaços e às vezes
 * pontuação, e um nome de arquivo pede transliteração — que não existe nesta lib
 * e que não vale a pena inventar aqui. Quem diz de quem é o arquivo são o título
 * impresso no PDF e a primeira linha da aba de resumo. "redacao" sem cedilha
 * pelo mesmo motivo, e para ficar na família de `desempenho-simulado` e
 * `desempenho-competencia` dos modais irmãos.
 */
const EXPORT_FILE_PREFIX = 'desempenho-redacao';

/**
 * Modal for displaying essay student performance details
 * Shows 5 ENEM competencies with their average scores
 *
 * Exportável: monta sobre o `ReportDetailModal`, então traz o botão "Baixar
 * relatório" com PDF (impressão só deste modal) e XLSX. As duas saídas usam o
 * dado que ESTE componente já buscou por `useEssayStudentDetails` — nenhuma
 * requisição a mais é disparada para exportar — e a planilha espelha os blocos
 * da tela aba a aba (veja `exportSheets.ts`).
 *
 * NÍVEL ÚNICO E SEM PAGINAÇÃO: a tela não navega e não pagina; a resposta traz
 * as competências inteiras e a lista apenas rola dentro do modal. Por isso PDF e
 * XLSX levam o MESMO conjunto — não existe aqui a distinção "página visível no
 * PDF, tabela inteira no XLSX" que o `SimulatedContentDetailsModal` precisou
 * fazer.
 *
 * ESTADOS DE CARREGANDO, ERRO E SEM-DADO: o botão continua lá, porque é o
 * `ReportDetailModal` que o desenha e ele não tem como escondê-lo. O PDF sai com
 * o que estiver na tela (os skeletons de carregamento, a mensagem de erro ou a
 * de "Nenhum dado encontrado") e o XLSX sai com as duas abas só de cabeçalho, já
 * que `data` é `null` — nenhum dos dois estoura.
 *
 * O consumidor precisa importar `analytica-frontend-lib/print.css`: sem as
 * regras `@media print` o PDF sai com a página inteira em vez do modal.
 */
export function EssayStudentDetailsModal({
  api,
  isOpen,
  onClose,
  userInstitutionId,
  studentName,
  period,
  schoolIds,
  schoolYearIds,
  classIds,
  labels: customLabels,
}: EssayStudentDetailsModalProps) {
  const DEFAULT_LABELS = {
    loading: 'Carregando...',
    noData: 'Nenhum dado encontrado',
    competencies: 'Competências',
    noCompetencies: 'Nenhuma competência encontrada',
    essays: 'redações',
  };

  const labels = { ...DEFAULT_LABELS, ...customLabels };
  const { data, loading, error, fetchDetails, reset } =
    useEssayStudentDetails(api);

  // Fetch details when modal opens
  useEffect(() => {
    if (isOpen && userInstitutionId) {
      fetchDetails({
        userInstitutionId,
        period,
        schoolIds,
        schoolYearIds,
        classIds,
      });
    }
  }, [
    isOpen,
    userInstitutionId,
    period,
    schoolIds,
    schoolYearIds,
    classIds,
    fetchDetails,
  ]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const modalTitle = `Desempenho de ${studentName || 'Estudante'}`;

  const fileName = `${EXPORT_FILE_PREFIX}-${formatDateForFileName(new Date())}`;

  const handleDownloadExcel = useCallback(() => {
    downloadExcel(fileName, buildEssayStudentDetailsSheets(data));
  }, [fileName, data]);

  const renderLoading = (): ReactNode => (
    <div className="flex flex-col gap-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between p-4 bg-background-50 rounded-xl">
        <div className="flex flex-col gap-2">
          <SkeletonRounded className="h-5 w-40" />
          <SkeletonRounded className="h-4 w-32" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <SkeletonRounded className="h-6 w-16" />
          <SkeletonRounded className="h-5 w-24" />
        </div>
      </div>

      {/* Competencies skeleton */}
      <div className="flex flex-col gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 bg-background border border-border-50 rounded-xl"
          >
            <SkeletonRounded className="h-8 w-8 rounded-full" />
            <div className="flex-1">
              <SkeletonRounded className="h-4 w-3/4" />
            </div>
            <SkeletonRounded className="h-3 w-32" />
            <SkeletonRounded className="h-5 w-12" />
          </div>
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
    <div className="flex flex-col gap-4">
      {/* Student header card */}
      <div className="flex items-center justify-between p-4 bg-background-50 rounded-xl">
        <div className="flex flex-col gap-1">
          <Text size="md" weight="semibold" className="text-text-950">
            {details.student.name}
          </Text>
          <Text size="sm" className="text-text-500">
            {details.student.school} - {details.student.class}
          </Text>
          <Text size="xs" className="text-text-400">
            {details.essaysCount}{' '}
            {details.essaysCount === 1 ? 'redação' : labels.essays}
          </Text>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-baseline gap-1">
            <Text size="lg" weight="bold" className="text-text-950">
              {Math.round(details.overallAverage)}
            </Text>
            <Text size="xs" className="text-text-400">
              / 1000
            </Text>
          </div>
          <Text size="sm" className="text-text-500">
            {formatPercentageRounded(details.overallPercentage)}
          </Text>
          <Badge
            variant="solid"
            action={PERFORMANCE_TAG_TO_BADGE_ACTION[details.performance]}
            size="small"
          >
            {SIMULATED_PERFORMANCE_TAG_CONFIG[details.performance].label}
          </Badge>
        </div>
      </div>

      {/* Section title */}
      <Text size="sm" weight="semibold" className="text-text-700">
        {labels.competencies}
      </Text>

      {/* List of competencies */}
      <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
        {details.competencies.length > 0 ? (
          details.competencies.map((competency) => (
            <CompetencyItem key={competency.number} competency={competency} />
          ))
        ) : (
          <Text size="sm" className="text-text-500 text-center py-4">
            {labels.noCompetencies}
          </Text>
        )}
      </div>
    </div>
  );

  // Os quatro estados da tela dividem a MESMA casca de modal: antes cada um
  // devolvia o seu próprio `Modal`, o que agora daria quatro `ReportDetailModal`
  // e, com eles, um botão de download que aparece e some conforme o dado chega.
  const renderModalContent = (): ReactNode => {
    if (loading) {
      return renderLoading();
    }

    if (error) {
      return renderStatusMessage(error, 'text-error-500');
    }

    if (!data) {
      return renderStatusMessage(labels.noData, 'text-text-500');
    }

    return renderDetails(data);
  };

  return (
    <ReportDetailModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      size="lg"
      // Só `fileName`: o PDF é a impressão deste modal, e o `ReportDetailModal`
      // já a faz. Ligar `onDownloadPdf` a um `useReportPrint` local somaria uma
      // segunda impressão — o callback SUBSTITUI a embutida, então o usuário
      // veria dois diálogos.
      fileName={fileName}
      onDownloadExcel={handleDownloadExcel}
    >
      {renderModalContent()}
    </ReportDetailModal>
  );
}

/**
 * Competency item component
 */
function CompetencyItem({
  competency,
}: {
  readonly competency: EssayCompetencyPerformance;
}) {
  return (
    <div className="flex items-center gap-4 p-4 bg-background border border-border-50 rounded-xl">
      {/* Competency number badge */}
      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-rose-100 flex-shrink-0">
        <Text size="sm" weight="bold" className="text-rose-600">
          {competency.number}
        </Text>
      </div>

      {/* Competency info */}
      <div className="flex-1 min-w-0">
        <Text size="sm" weight="semibold" className="text-text-950 truncate">
          {competency.name}
        </Text>
      </div>

      {/* Progress bar */}
      <div className="w-32 flex-shrink-0">
        <ProgressBar
          value={competency.averagePercentage}
          variant="green"
          size="small"
          showPercentage
        />
      </div>

      {/* Score */}
      <div className="flex items-baseline gap-1 flex-shrink-0 min-w-[60px] justify-end">
        <Text size="sm" weight="semibold" className="text-success-600">
          {Math.round(competency.averageScore)}
        </Text>
        <Text size="xs" className="text-text-500">
          / 200
        </Text>
      </div>
    </div>
  );
}
