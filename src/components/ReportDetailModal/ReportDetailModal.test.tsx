import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { printAsPdf } from '../../utils/exportPdf';
import ReportDetailModal from './ReportDetailModal';

// Único mock do arquivo: `printAsPdf` é `globalThis.print()`, que o jsdom não
// implementa. Modal, DownloadModal, Button e o próprio useReportPrint rodam de
// verdade — é a composição deles que este componente É.
jest.mock('../../utils/exportPdf', () => ({ printAsPdf: jest.fn() }));

const printAsPdfMock = printAsPdf as jest.MockedFunction<typeof printAsPdf>;

/** O `<dialog>` do modal externo, o que a impressão deve isolar. */
function printRegionDialog(): HTMLElement | null {
  return document.querySelector('dialog.js-print-region');
}

/** Abre o seletor de formato pelo botão "Baixar relatório". */
function openFormatChooser(): void {
  fireEvent.click(screen.getByRole('button', { name: 'Baixar relatório' }));
}

/**
 * Escolhe um formato e confirma.
 *
 * Os cartões são botões com `aria-label` PDF/Excel; "Baixar" é o botão de
 * confirmação do rodapé (o de fora se chama "Baixar relatório").
 */
function chooseFormatAndConfirm(format: 'PDF' | 'Excel'): void {
  fireEvent.click(screen.getByRole('button', { name: format }));
  fireEvent.click(screen.getByRole('button', { name: 'Baixar' }));
}

/** O que o DOM tinha no único instante em que isso é observável. */
interface PrintSnapshot {
  bodyClasses: string;
  title: string;
}

/**
 * Fotografa `<body>` e `document.title` DE DENTRO do `printAsPdf`.
 *
 * É o único instante em que `printing-modal` e o nome do arquivo existem: o
 * `useReportPrint` desfaz os dois no `afterprint`, então uma asserção feita
 * depois de `print()` retornar passaria igual contra um componente que nunca
 * tocou o DOM.
 */
function captureDuringPrint(): PrintSnapshot[] {
  const captured: PrintSnapshot[] = [];
  printAsPdfMock.mockImplementation(() => {
    captured.push({
      bodyClasses: document.body.className,
      title: document.title,
    });
  });
  return captured;
}

/** O título que a aba carrega antes de qualquer impressão. */
const APP_TITLE = 'Analytica';

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  title: 'Região Sudeste',
};

describe('ReportDetailModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    printAsPdfMock.mockReset();
    document.body.className = '';
    document.title = APP_TITLE;
  });

  it('não renderiza nada quando fechado', () => {
    render(
      <ReportDetailModal {...defaultProps} isOpen={false}>
        <p>Tabela de escolas</p>
      </ReportDetailModal>
    );

    expect(screen.queryByText('Região Sudeste')).not.toBeInTheDocument();
    expect(screen.queryByText('Tabela de escolas')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Baixar relatório' })
    ).not.toBeInTheDocument();
  });

  it('renderiza título, children e o botão de download', () => {
    render(
      <ReportDetailModal {...defaultProps}>
        <p>Tabela de escolas</p>
      </ReportDetailModal>
    );

    expect(screen.getByText('Região Sudeste')).toBeInTheDocument();
    expect(screen.getByText('Tabela de escolas')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Baixar relatório' })
    ).toBeInTheDocument();
  });

  it('marca o <dialog> com js-print-region e mescla a className do consumidor', () => {
    render(
      <ReportDetailModal {...defaultProps} className="max-w-[1150px]">
        <p>Tabela de escolas</p>
      </ReportDetailModal>
    );

    const dialog = printRegionDialog();
    expect(dialog).not.toBeNull();
    expect(dialog).toHaveClass('max-w-[1150px]');
    // A largura do consumidor precisa VENCER a do `size` (xl = max-w-[970px]),
    // senão a prop `className` não serviria pro caso que a motivou.
    expect(dialog).not.toHaveClass('max-w-[970px]');
  });

  it('marca o container do botão de download com data-print-hide', () => {
    render(
      <ReportDetailModal {...defaultProps}>
        <p>Tabela de escolas</p>
      </ReportDetailModal>
    );

    const button = screen.getByTestId('report-detail-download-btn');
    const container = button.parentElement;

    // No CONTAINER, não no botão: é o container que carrega o espaçamento, e
    // `display: none` nele faz o `gap` do flex pai colapsar junto.
    expect(container).toHaveAttribute('data-print-hide');
    expect(button).not.toHaveAttribute('data-print-hide');

    // E o marcador não pode vazar para o conteúdo do relatório.
    expect(screen.getByText('Tabela de escolas')).not.toHaveAttribute(
      'data-print-hide'
    );
  });

  it('não impõe conteúdo próprio: nenhum bloco "Geral" vem do componente', () => {
    render(
      <ReportDetailModal {...defaultProps}>
        <p>Tabela de escolas</p>
      </ReportDetailModal>
    );

    // O StatisticsCard "Geral" da casca do gestor NÃO subiu para a lib: é
    // conteúdo de tela e entra por `children`.
    expect(screen.queryByText('Geral')).not.toBeInTheDocument();
  });

  it('abre o seletor de formato ao clicar em "Baixar relatório"', () => {
    render(
      <ReportDetailModal {...defaultProps} onDownloadExcel={jest.fn()}>
        <p>Tabela de escolas</p>
      </ReportDetailModal>
    );

    expect(
      screen.queryByText('Como deseja baixar o relatório?')
    ).not.toBeInTheDocument();

    openFormatChooser();

    expect(
      screen.getByText('Como deseja baixar o relatório?')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'PDF' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Excel' })).toBeInTheDocument();
  });

  describe('caminho PDF', () => {
    it('imprime com body.printing-modal e desfaz no afterprint', () => {
      const snapshots = captureDuringPrint();

      render(
        <ReportDetailModal {...defaultProps}>
          <p>Tabela de escolas</p>
        </ReportDetailModal>
      );

      openFormatChooser();
      chooseFormatAndConfirm('PDF');

      expect(printAsPdfMock).toHaveBeenCalledTimes(1);
      expect(snapshots).toEqual([
        // Sem `fileName` a aba fica como estava: o PDF sai com o nome do app.
        { bodyClasses: 'printing-modal', title: APP_TITLE },
      ]);

      // E a marca não fica para trás depois que o diálogo do browser fecha.
      expect(document.body).toHaveClass('printing-modal');
      fireEvent(window, new Event('afterprint'));
      expect(document.body).not.toHaveClass('printing-modal');
    });

    it('fileName nomeia a impressão padrão e é desfeito no afterprint', () => {
      const snapshots = captureDuringPrint();

      render(
        <ReportDetailModal {...defaultProps} fileName="participacao-20-08-2026">
          <p>Tabela de escolas</p>
        </ReportDetailModal>
      );

      openFormatChooser();
      chooseFormatAndConfirm('PDF');

      // A aba precisa carregar o nome NO instante da impressão — é de lá que o
      // browser tira o nome do arquivo (premissa registrada em useReportPrint).
      expect(snapshots).toEqual([
        { bodyClasses: 'printing-modal', title: 'participacao-20-08-2026' },
      ]);

      fireEvent(window, new Event('afterprint'));
      expect(document.title).toBe(APP_TITLE);
    });

    it('onDownloadPdf SUBSTITUI a impressão embutida, não soma a ela', () => {
      // O consumidor que precisa nomear o arquivo passa o seu próprio
      // `useReportPrint({ fileName, bodyClass })`. Se o componente também
      // imprimisse, o usuário veria dois diálogos de impressão.
      const onDownloadPdf = jest.fn();

      render(
        <ReportDetailModal {...defaultProps} onDownloadPdf={onDownloadPdf}>
          <p>Tabela de escolas</p>
        </ReportDetailModal>
      );

      openFormatChooser();
      chooseFormatAndConfirm('PDF');

      expect(onDownloadPdf).toHaveBeenCalledTimes(1);
      expect(printAsPdfMock).not.toHaveBeenCalled();
    });

    it('com onDownloadPdf E fileName, o callback vence e fileName é ignorado', () => {
      const snapshots = captureDuringPrint();
      const onDownloadPdf = jest.fn();

      render(
        <ReportDetailModal
          {...defaultProps}
          onDownloadPdf={onDownloadPdf}
          fileName="participacao-20-08-2026"
        >
          <p>Tabela de escolas</p>
        </ReportDetailModal>
      );

      openFormatChooser();
      chooseFormatAndConfirm('PDF');

      expect(onDownloadPdf).toHaveBeenCalledTimes(1);
      expect(snapshots).toEqual([]);
      // `fileName` não pode vazar para a aba por um caminho lateral: quem
      // imprime é o callback, e nomear o arquivo passou a ser problema dele.
      expect(document.title).toBe(APP_TITLE);
    });

    it('imprime mesmo sem onDownloadPdf: o PDF é responsabilidade do componente', () => {
      render(
        <ReportDetailModal {...defaultProps}>
          <p>Tabela de escolas</p>
        </ReportDetailModal>
      );

      openFormatChooser();
      chooseFormatAndConfirm('PDF');

      expect(printAsPdfMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('caminho Excel', () => {
    it('chama onDownloadExcel e não imprime', () => {
      const onDownloadExcel = jest.fn();

      render(
        <ReportDetailModal {...defaultProps} onDownloadExcel={onDownloadExcel}>
          <p>Tabela de escolas</p>
        </ReportDetailModal>
      );

      openFormatChooser();
      chooseFormatAndConfirm('Excel');

      expect(onDownloadExcel).toHaveBeenCalledTimes(1);
      expect(printAsPdfMock).not.toHaveBeenCalled();
    });

    it('sem onDownloadExcel, o seletor oferece só PDF', () => {
      render(
        <ReportDetailModal {...defaultProps}>
          <p>Tabela de escolas</p>
        </ReportDetailModal>
      );

      openFormatChooser();

      expect(screen.getByRole('button', { name: 'PDF' })).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Excel' })
      ).not.toBeInTheDocument();
    });
  });

  describe('estado do download (o que a casca do gestor silenciava)', () => {
    it('exibe a mensagem de erro dentro do seletor de formato', () => {
      render(
        <ReportDetailModal
          {...defaultProps}
          onDownloadExcel={jest.fn()}
          error="Falha ao gerar o Excel"
        >
          <p>Tabela de escolas</p>
        </ReportDetailModal>
      );

      openFormatChooser();

      expect(screen.getByText('Falha ao gerar o Excel')).toBeInTheDocument();
    });

    it('mostra os skeletons e trava a confirmação enquanto baixa', () => {
      render(
        <ReportDetailModal
          {...defaultProps}
          onDownloadExcel={jest.fn()}
          isDownloading
        >
          <p>Tabela de escolas</p>
        </ReportDetailModal>
      );

      openFormatChooser();

      expect(screen.getByTestId('download-skeleton')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Baixar' })).toBeDisabled();
    });
  });

  it('fecha o seletor de formato sem fechar o modal de detalhe', () => {
    const onClose = jest.fn();

    render(
      <ReportDetailModal
        {...defaultProps}
        onClose={onClose}
        onDownloadExcel={jest.fn()}
      >
        <p>Tabela de escolas</p>
      </ReportDetailModal>
    );

    openFormatChooser();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(
      screen.queryByText('Como deseja baixar o relatório?')
    ).not.toBeInTheDocument();
    expect(screen.getByText('Tabela de escolas')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('encaminha o fechamento do modal de detalhe para onClose', () => {
    const onClose = jest.fn();

    render(
      <ReportDetailModal {...defaultProps} onClose={onClose}>
        <p>Tabela de escolas</p>
      </ReportDetailModal>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Fechar modal' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
