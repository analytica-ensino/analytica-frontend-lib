import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { DownloadSimpleIcon } from '@phosphor-icons/react';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import DownloadModal from '../DownloadModal/DownloadModal';
import { useReportPrint } from '../../hooks/useReportPrint';
import { cn } from '../../utils/utils';

/**
 * Marca o `<dialog>` que a impressão de modal isolado deve deixar passar.
 *
 * O nome é contrato com o CSS: as regras de `body.printing-modal` em
 * `src/print.css` (bloco a partir da linha 214) revelam exatamente
 * `dialog.js-print-region` e escondem o resto da página.
 */
const PRINT_REGION_CLASS = 'js-print-region';

/**
 * Classe posta no `<body>` durante a impressão deste modal.
 *
 * É a chave que liga o `useReportPrint` ao bloco `body.printing-modal` do
 * `print.css`. Os dois nomes são os que o frontend-gestor-web já usava.
 */
const PRINT_MODAL_BODY_CLASS = 'printing-modal';

/** Tamanhos aceitos pelo `Modal` base da lib. */
export type ReportDetailModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** Props do {@link ReportDetailModal}. */
export interface ReportDetailModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  /**
   * Título do modal. Renderizado dentro do `<h2>` do `Modal` base, então
   * quando for ReactNode use apenas phrasing content.
   */
  readonly title: ReactNode;
  /** Tamanho do `Modal` base. Padrão `xl`, o usado pelos modais de detalhe. */
  readonly size?: ReportDetailModalSize;
  /**
   * Classes extras para o `<dialog>`, somadas à marca de impressão.
   *
   * Existe porque `size` não cobre larguras fora da tabela de tamanhos do
   * `Modal` (o maior, `xl`, é `max-w-[970px]`) e os modais de drill-down do
   * gestor usam `max-w-[1150px]`. Vem depois de `js-print-region` no `cn`, e o
   * `Modal` já a coloca por último no seu próprio `cn`, então classes
   * conflitantes do consumidor vencem no tailwind-merge.
   */
  readonly className?: string;
  /** Conteúdo do relatório: cards de resumo, tabelas, gráficos. */
  readonly children?: ReactNode;
  /**
   * SUBSTITUI a impressão embutida no caminho PDF.
   *
   * ESCAPE HATCH, não o caminho normal. O caso comum — imprimir este modal com
   * um nome de arquivo — já está pronto e se resolve com `fileName`. Passe esta
   * prop só quando a impressão precisar ser outra coisa (gerar o PDF por
   * biblioteca, imprimir um documento montado à parte, etc).
   *
   * PRECEDÊNCIA: quando ela vem, ela VENCE — o componente não imprime nada e
   * `fileName` é ignorado, porque quem imprime passa a ser o callback e só ele
   * sabe como nomear o resultado. Deixei como precedência de runtime, e não
   * como erro de tipo, por dois motivos: um consumidor que monta as props em
   * um objeto (spread condicional) não conseguiria satisfazer uma união
   * exclusiva sem cast, e o teste que fixa esta regra precisaria de
   * `@ts-expect-error` para existir.
   *
   * Substitui, não soma: quem passa esta prop fica responsável por imprimir.
   * Um callback que só registra telemetria deixa o botão de PDF sem efeito.
   */
  readonly onDownloadPdf?: () => void;
  /**
   * Nome do arquivo oferecido no caminho PDF padrão, sem extensão.
   *
   * Repassado a `useReportPrint`, que renomeia a aba pela duração da impressão
   * — o "PDF" É a página impressa, então o nome do arquivo sai do
   * `document.title` (veja a premissa registrada em `useReportPrint.ts`). Sem
   * ele o PDF sai com o título do app, e o nome por relatório que o resto da
   * feature construiu se perde.
   *
   * É prop, e não um callback que o consumidor liga à mão, para não vazar
   * detalhe que este componente já conhece: com callback todo consumidor
   * precisaria importar `useReportPrint` e saber o valor de `bodyClass`.
   *
   * ```tsx
   * <ReportDetailModal fileName="participacao-20-08-2026" ... />
   * ```
   *
   * Ignorado quando `onDownloadPdf` é fornecido — veja a precedência lá.
   */
  readonly fileName?: string;
  /**
   * Geração do Excel. Ausente, o `DownloadModal` oferece só o cartão de PDF.
   */
  readonly onDownloadExcel?: () => void;
  /** Repassada ao `DownloadModal`: troca os cartões por skeletons. */
  readonly isDownloading?: boolean;
  /** Repassada ao `DownloadModal`: mensagem de erro exibida acima dos cartões. */
  readonly error?: string | null;
}

/**
 * Modal de detalhe de relatório com exportação do PRÓPRIO modal.
 *
 * Casca em cima do `Modal` base: acrescenta o botão "Baixar relatório", o
 * `DownloadModal` de escolha de formato e, no caminho PDF, a impressão de
 * apenas este modal — `useReportPrint({ bodyClass: 'printing-modal' })` mais a
 * marca `js-print-region` no `<dialog>`. O conteúdo do relatório é inteiramente
 * do consumidor, via `children`.
 *
 * PDF sai de graça; Excel é do consumidor. Sem `onDownloadExcel` o seletor de
 * formato mostra só o cartão de PDF, em vez de oferecer uma opção morta.
 *
 * O botão "Baixar relatório" NÃO sai no PDF: o container dele leva
 * `data-print-hide`, e o atributo não é resíduo — não remova. A impressão de
 * modal isolado revela o `dialog.js-print-region` inteiro, e o botão mora
 * dentro dele, então nada mais o esconderia. O gestor não via o problema
 * porque tinha uma regra local cega (`button:not([aria-pressed])`) que apagava
 * qualquer botão da página; ela está sendo aposentada em favor deste marcador
 * explícito. O que o consumidor puser em `children` é dele: controle de tela
 * que não deva sair no papel — busca, paginação, filtros — precisa do mesmo
 * `data-print-hide`.
 *
 * O consumidor precisa importar `analytica-frontend-lib/print.css`: sem as
 * regras `@media print` a marca no `<dialog>` não significa nada e o PDF sai
 * com a página inteira.
 *
 * Sobre a composição: usa o `Modal` BASE porque só ele aceita `className` no
 * `<dialog>` (`Modal.tsx:172` e `:276` montam `cn(..., className)`). As quatro
 * variantes especializadas — `Modal.tsx:422`, `:553`, `:729` e `:880` — têm
 * `className` hardcoded no `<dialog>` e não teriam como receber a marca de
 * impressão.
 *
 * ```tsx
 * <ReportDetailModal
 *   isOpen={isOpen}
 *   onClose={close}
 *   title={`Região ${region.name}`}
 *   className="max-w-[1150px]"
 *   fileName={`participacao-${formatDateForFileName(new Date())}`}
 *   onDownloadExcel={handleExcel}
 *   isDownloading={excel.loading}
 *   error={excel.error}
 * >
 *   <StatisticsCard title="Geral" data={cards} />
 *   <DataTable ... />
 * </ReportDetailModal>
 * ```
 */
const ReportDetailModal = ({
  isOpen,
  onClose,
  title,
  size = 'xl',
  className,
  children,
  onDownloadPdf,
  fileName,
  onDownloadExcel,
  isDownloading = false,
  error = null,
}: ReportDetailModalProps) => {
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const print = useReportPrint();

  const closeDownloadModal = useCallback(() => {
    setIsDownloadModalOpen(false);
  }, []);

  const handleDownloadPdf = useCallback(() => {
    // O escape hatch vence e `fileName` fica de fora de propósito: quem imprime
    // é o callback, e nomear o resultado passa a ser problema dele.
    if (onDownloadPdf) {
      onDownloadPdf();
      return;
    }
    print({ fileName, bodyClass: PRINT_MODAL_BODY_CLASS });
  }, [onDownloadPdf, fileName, print]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      className={cn(PRINT_REGION_CLASS, className)}
    >
      <div className="flex flex-col gap-6">
        {/* Ação de download acima do conteúdo, alinhada à direita.
            `data-print-hide` no CONTAINER, não no <Button>: no caminho PDF este
            botão está DENTRO da região impressa, e sem o marcador ele sairia no
            papel. No container o `gap-6` do flex-col pai colapsa junto — é o
            contrato que o print.css documenta (linhas 105-122). */}
        <div className="flex flex-row items-center justify-end" data-print-hide>
          <Button
            variant="solid"
            action="primary"
            size="medium"
            iconLeft={<DownloadSimpleIcon size={18} />}
            onClick={() => setIsDownloadModalOpen(true)}
            data-testid="report-detail-download-btn"
          >
            Baixar relatório
          </Button>
        </div>

        {children}
      </div>

      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={closeDownloadModal}
        isDownloading={isDownloading}
        error={error}
        onDownloadPdf={handleDownloadPdf}
        onDownloadExcel={onDownloadExcel}
      />
    </Modal>
  );
};

export default ReportDetailModal;
export { ReportDetailModal };
