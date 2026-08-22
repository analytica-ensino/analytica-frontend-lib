import { useEffect, useState, useCallback, type ReactNode } from 'react';
import ReportDetailModal from '../ReportDetailModal/ReportDetailModal';
import Text from '../Text/Text';
import ProgressBar from '../ProgressBar/ProgressBar';
import Badge from '../Badge/Badge';
import { ArrowLeftIcon } from '@phosphor-icons/react/dist/csr/ArrowLeft';
import { CaretRightIcon } from '@phosphor-icons/react/dist/csr/CaretRight';
import { useSimulatedStudentDetails } from './useSimulatedStudentDetails';
import { formatPercentageRounded } from '../../utils/utils';
import { downloadExcel } from '../../utils/exportExcel';
import { formatDateForFileName } from '../../utils/exportFormat';
import { buildSimulatedStudentDetailsSheets } from './exportSheets';
import {
  isStudentSubjectsData,
  SIMULATED_PERFORMANCE_TAG_CONFIG,
  PERFORMANCE_TAG_TO_BADGE_ACTION,
  type SimulatedStudentDetailsModalProps,
  type SubjectPerformanceItem,
  type StudentContentPerformanceItem,
} from './types';
import Button from '../Button/Button';

/**
 * Prefixo do arquivo exportado, em PDF e em XLSX. Recebe a data do dia.
 *
 * Sem o nome do estudante nem o da matéria de propósito: os dois trazem
 * acentos, espaços e às vezes pontuação, e um nome de arquivo pede
 * transliteração — que não existe nesta lib e que não vale a pena inventar
 * aqui. É o mesmo prefixo nos dois níveis da cascata; quem diz de qual nível é
 * o arquivo são as abas da planilha (o nome da segunda muda) e o título
 * impresso no PDF.
 */
const EXPORT_FILE_PREFIX = 'desempenho-simulado';

/**
 * Modal for displaying student performance details in simulated exams
 * Supports cascading navigation: Subjects (level 1) -> Contents (level 2)
 *
 * Exportável: monta sobre o `ReportDetailModal`, então traz o botão "Baixar
 * relatório" com PDF (impressão só deste modal) e XLSX. As duas saídas usam o
 * dado que ESTE componente já buscou por `useSimulatedStudentDetails` — nenhuma
 * requisição a mais é disparada para exportar — e a planilha espelha os blocos
 * da tela aba a aba (veja `exportSheets.ts`).
 *
 * CASCATA: a planilha leva o nível VISÍVEL, um só. O hook guarda um `data`
 * único e o troca a cada navegação, então o outro nível não está em memória;
 * levá-lo junto exigiria requisições que a tela não fez. Ver a justificativa
 * completa em `exportSheets.ts`.
 *
 * ESTADOS DE CARREGANDO, ERRO E SEM-DADO: o botão continua lá, porque é o
 * `ReportDetailModal` que o desenha e ele não tem como escondê-lo. O PDF sai com
 * o que estiver na tela (a mensagem de carregando, a de erro ou a de
 * "Nenhum dado encontrado") e o XLSX sai com as duas abas só de cabeçalho, já
 * que `data` é `null` — nenhum dos dois estoura.
 *
 * O consumidor precisa importar `analytica-frontend-lib/print.css`: sem as
 * regras `@media print` o PDF sai com a página inteira em vez do modal.
 */
export function SimulatedStudentDetailsModal({
  api,
  isOpen,
  onClose,
  simulationType,
  userInstitutionId,
  studentName,
  period,
}: SimulatedStudentDetailsModalProps) {
  const { data, loading, error, fetchDetails, reset } =
    useSimulatedStudentDetails(api);
  const [selectedSubject, setSelectedSubject] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Fetch subjects when modal opens
  useEffect(() => {
    if (isOpen && userInstitutionId) {
      fetchDetails({
        simulationType,
        userInstitutionId,
        period,
        subjectId: null,
      });
    }
  }, [isOpen, userInstitutionId, simulationType, period, fetchDetails]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setSelectedSubject(null);
    }
  }, [isOpen, reset]);

  // Handle subject click (navigate to level 2)
  const handleSubjectClick = useCallback(
    (subject: SubjectPerformanceItem) => {
      if (!userInstitutionId) return;

      setSelectedSubject({ id: subject.id, name: subject.name });
      fetchDetails({
        simulationType,
        userInstitutionId,
        period,
        subjectId: subject.id,
      });
    },
    [userInstitutionId, simulationType, period, fetchDetails]
  );

  // Handle back navigation (return to level 1)
  const handleBack = useCallback(() => {
    if (!userInstitutionId) return;

    setSelectedSubject(null);
    fetchDetails({
      simulationType,
      userInstitutionId,
      period,
      subjectId: null,
    });
  }, [userInstitutionId, simulationType, period, fetchDetails]);

  // O nome que o TÍTULO do modal exibe no nível 2 — e, por isso, o que a aba de
  // resumo da planilha carrega. Sai do estado local, não de
  // `StudentContentsData.subject`, para que o arquivo diga o mesmo que a tela.
  const selectedSubjectName = selectedSubject?.name ?? null;

  const fileName = `${EXPORT_FILE_PREFIX}-${formatDateForFileName(new Date())}`;

  const handleDownloadExcel = useCallback(() => {
    downloadExcel(
      fileName,
      buildSimulatedStudentDetailsSheets(data, selectedSubjectName)
    );
  }, [fileName, data, selectedSubjectName]);

  // Build modal title with back button when in level 2
  const modalTitle = selectedSubject ? (
    <div className="flex items-center gap-2">
      {/* `data-print-hide`: navegar é controle de tela, não conteúdo do
          relatório, e no caminho PDF este botão está DENTRO da região impressa.
          Fica no próprio <Button> porque ele É o item do flex — escondido, o
          `gap-2` não separa mais nada, que é o que o contrato do print.css
          quer evitar. O nome da matéria ao lado continua saindo no papel. */}
      <Button
        onClick={handleBack}
        variant="raw"
        className="p-1 hover:bg-background-100 rounded-md transition-colors"
        aria-label="Voltar para lista de matérias"
        data-print-hide
      >
        <ArrowLeftIcon size={20} className="text-text-600" />
      </Button>
      <Text>{selectedSubject.name}</Text>
    </div>
  ) : (
    `Desempenho de ${studentName || 'Estudante'}`
  );

  const renderStatusMessage = (message: ReactNode, className: string) => (
    <div className="flex items-center justify-center py-8">
      <Text size="sm" className={className}>
        {message}
      </Text>
    </div>
  );

  const renderDetailsContent = (
    details: NonNullable<typeof data>
  ): ReactNode => {
    if (isStudentSubjectsData(details)) {
      if (details.subjects.length > 0) {
        return details.subjects.map((subject) => (
          <SubjectItem
            key={subject.id}
            subject={subject}
            onClick={() => handleSubjectClick(subject)}
            questionsLabel="questões"
          />
        ));
      }

      return (
        <Text size="sm" className="text-text-500 text-center py-4">
          Nenhuma matéria encontrada
        </Text>
      );
    }

    if (details.contents.length > 0) {
      return details.contents.map((content) => (
        <ContentItem
          key={content.contentId}
          content={content}
          questionsLabel="questões"
          ofLabel="de"
        />
      ));
    }

    return (
      <Text size="sm" className="text-text-500 text-center py-4">
        Nenhuma habilidade encontrada
      </Text>
    );
  };

  // Os quatro estados da tela dividem a MESMA casca de modal: antes cada um
  // devolvia o seu próprio `Modal`, o que agora daria quatro `ReportDetailModal`
  // e, com eles, um botão de download que aparece e some conforme o dado chega.
  const renderModalContent = (): ReactNode => {
    if (loading) {
      return renderStatusMessage('Carregando...', 'text-text-500');
    }

    if (error) {
      return renderStatusMessage(error, 'text-error-500');
    }

    if (!data) {
      return renderStatusMessage('Nenhum dado encontrado', 'text-text-500');
    }

    return (
      <div className="flex flex-col gap-4">
        {/* Student header card */}
        <div className="flex items-center justify-between p-4 bg-background-50 rounded-xl">
          <div className="flex flex-col gap-1">
            <Text size="md" weight="semibold" className="text-text-950">
              {data.student.name}
            </Text>
            <Text size="sm" className="text-text-500">
              {data.student.school} - {data.student.class}
            </Text>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Text size="lg" weight="bold" className="text-text-950">
              {formatPercentageRounded(data.student.average)}
            </Text>
            <Badge
              variant="solid"
              action={PERFORMANCE_TAG_TO_BADGE_ACTION[data.student.performance]}
              size="small"
            >
              {SIMULATED_PERFORMANCE_TAG_CONFIG[data.student.performance].label}
            </Badge>
          </div>
        </div>

        {/* List of subjects or contents */}
        <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
          {renderDetailsContent(data)}
        </div>
      </div>
    );
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
 * Subject item component (level 1)
 */
function SubjectItem({
  subject,
  onClick,
  questionsLabel,
}: Readonly<{
  subject: SubjectPerformanceItem;
  onClick: () => void;
  questionsLabel: string;
}>) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 p-4 bg-background border border-border-50 rounded-xl hover:bg-background-50 transition-colors text-left w-full"
      /* A linha é `<button>` porque desce para o nível 2, mas o TEXTO dela é o
         conteúdo do relatório: nome da matéria, questões e percentual. Por isso
         ela NÃO leva `data-print-hide` — escondê-la apagaria a lista de matérias
         do PDF. O testid existe para o invariante de impressão poder declará-la
         como impressa de propósito (veja `testing/printRegionInvariant.ts`); sem
         ele a linha não tem atributo nenhum que a distinga de um controle. */
      data-testid="subject-performance-row"
    >
      {/* Subject color indicator */}
      {subject.color && (
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: subject.color }}
        />
      )}

      {/* Subject info */}
      <div className="flex-1 min-w-0">
        <Text size="sm" weight="semibold" className="text-text-950 truncate">
          {subject.name}
        </Text>
        <Text size="xs" className="text-text-500">
          {subject.questionsCount} {questionsLabel}
        </Text>
      </div>

      {/* Progress bar */}
      <div className="w-32 flex-shrink-0">
        <ProgressBar
          value={subject.performance.correctPercentage}
          variant="green"
          size="small"
          showPercentage
        />
      </div>

      {/* Arrow indicator */}
      <CaretRightIcon size={16} className="text-text-400 flex-shrink-0" />
    </button>
  );
}

/**
 * Content item component (level 2)
 */
function ContentItem({
  content,
  questionsLabel,
  ofLabel,
}: Readonly<{
  content: StudentContentPerformanceItem;
  questionsLabel: string;
  ofLabel: string;
}>) {
  return (
    <div className="flex items-center gap-4 p-4 bg-background border border-border-50 rounded-xl">
      {/* Content info */}
      <div className="flex-1 min-w-0">
        <Text size="sm" weight="semibold" className="text-text-950 truncate">
          {content.contentName}
        </Text>
        <div className="flex items-center gap-2">
          {content.bnccCode && (
            <Text size="xs" className="text-primary-600">
              {content.bnccCode}
            </Text>
          )}
          <Text size="xs" className="text-text-500">
            {content.questionsCount} {questionsLabel}
          </Text>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-32 flex-shrink-0">
        <ProgressBar
          value={content.performance.correctPercentage}
          variant="green"
          size="small"
          showPercentage
        />
      </div>

      {/* Hit count */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Text size="sm" weight="semibold" className="text-success-600">
          {content.performance.correct}
        </Text>
        <Text size="xs" className="text-text-500 whitespace-nowrap">
          {ofLabel} {content.questionsCount}
        </Text>
      </div>
    </div>
  );
}
