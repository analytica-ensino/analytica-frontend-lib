import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EssayCompetenceDetailsModal } from './EssayCompetenceDetailsModal';
import { SimulatedPerformanceTag } from '../SimulatedStudentDetailsModal/types';
import { printAsPdf } from '../../utils/exportPdf';
import { downloadExcel } from '../../utils/exportExcel';
import { expectPrintRegionControlsHidden } from '../../testing/printRegionInvariant';
import type {
  EssayCompetenceDetailsApiResponse,
  EssayCompetenceDetailsData,
  EssayCompetenceStudentItem,
} from './types';
import type { BaseApiClient } from '../../types/api';

// `printAsPdf` é `globalThis.print()`, que o jsdom não implementa;
// `downloadExcel` escreve um arquivo em disco. Tudo o mais — Modal,
// ReportDetailModal, DownloadModal, TableProvider (com a paginação de verdade),
// useReportPrint, `fetchAllCompetenceStudents` e os builders de aba — roda de
// verdade.
//
// Em especial NÃO se mocka o TableProvider: um duble dele apagaria o rodapé de
// paginação, e com ele o `<select>` de itens por página e os dois botões de
// navegação — justamente os controles que o invariante de impressão precisa
// encontrar dentro da região impressa.
jest.mock('../../utils/exportPdf', () => ({ printAsPdf: jest.fn() }));
jest.mock('../../utils/exportExcel', () => ({ downloadExcel: jest.fn() }));

const printAsPdfMock = printAsPdf as jest.MockedFunction<typeof printAsPdf>;
const downloadExcelMock = downloadExcel as jest.MockedFunction<
  typeof downloadExcel
>;

// Mock useEssayCompetenceDetails hook
const mockFetchDetails = jest.fn();
const mockReset = jest.fn();
let mockHookState: {
  data: EssayCompetenceDetailsData | null;
  loading: boolean;
  error: string | null;
};

jest.mock('./useEssayCompetenceDetails', () => ({
  useEssayCompetenceDetails: () => ({
    ...mockHookState,
    fetchDetails: mockFetchDetails,
    reset: mockReset,
  }),
}));

/**
 * Create mock student items
 */
function createMockStudents(count: number): EssayCompetenceStudentItem[] {
  const performances = [
    SimulatedPerformanceTag.HIGHLIGHT,
    SimulatedPerformanceTag.ABOVE_AVERAGE,
    SimulatedPerformanceTag.BELOW_AVERAGE,
    SimulatedPerformanceTag.ATTENTION_POINT,
  ];

  return Array.from({ length: count }, (_, i) => ({
    studentId: `student-${i + 1}`,
    userInstitutionId: `user-inst-${i + 1}`,
    name: `Estudante ${i + 1}`,
    school: `Escola ${Math.floor(i / 5) + 1}`,
    schoolYear: '2024',
    class: `Turma ${String.fromCharCode(65 + (i % 3))}`,
    averageScore: 100 + Math.random() * 100,
    averagePercentage: 50 + Math.random() * 50,
    performance: performances[i % performances.length],
    essaysCount: Math.floor(Math.random() * 5) + 1,
  }));
}

/**
 * Create mock competence details data
 */
function createMockData(
  studentCount = 5,
  page = 1,
  total = 5
): EssayCompetenceDetailsData {
  return {
    competence: {
      number: 1,
      name: 'Domínio da modalidade escrita formal da língua portuguesa',
    },
    classAverage: 145.5,
    classAveragePercentage: 72.75,
    totalEssays: 25,
    totalStudents: total,
    counters: {
      highlight: 5,
      aboveAverage: 10,
      belowAverage: 7,
      attentionPoint: 3,
    },
    students: {
      data: createMockStudents(studentCount),
      page,
      limit: 10,
      total,
    },
  };
}

/**
 * Create mock API client
 */
function createMockApi(): jest.Mocked<BaseApiClient> {
  return {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };
}

/** Uma resposta do endpoint, como a varredura do XLSX a recebe. */
function createPageResponse(
  students: EssayCompetenceStudentItem[],
  page: number,
  total: number
): { data: EssayCompetenceDetailsApiResponse } {
  return {
    data: {
      message: 'Success',
      data: {
        ...createMockData(),
        students: { data: students, page, limit: 100, total },
      },
    },
  };
}

describe('EssayCompetenceDetailsModal', () => {
  const mockApi = createMockApi();
  const mockOnClose = jest.fn();

  const defaultProps = {
    api: mockApi,
    isOpen: true,
    onClose: mockOnClose,
    competenceNumber: 1,
    competenceName: 'Domínio da escrita',
    period: '1_MONTH',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // `clearAllMocks` zera as chamadas mas NÃO remove implementações; sem isto
    // um `mockResolvedValue` de um teste vazaria para o seguinte.
    mockApi.post.mockReset();
    mockHookState = {
      data: null,
      loading: false,
      error: null,
    };
  });

  describe('Loading state', () => {
    it('renders loading skeletons when loading', () => {
      mockHookState = { data: null, loading: true, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      // Should show modal with title in C{number} - {name} format
      expect(screen.getByText('C1 - Domínio da escrita')).toBeInTheDocument();
    });

    it('shows modal title during loading', () => {
      mockHookState = { data: null, loading: true, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      expect(screen.getByText('C1 - Domínio da escrita')).toBeInTheDocument();
    });

    it('uses competence number as fallback title when name not provided', () => {
      mockHookState = { data: null, loading: true, error: null };

      render(
        <EssayCompetenceDetailsModal
          {...defaultProps}
          competenceName={undefined}
        />
      );

      expect(screen.getByText('C1 - Competência 1')).toBeInTheDocument();
    });
  });

  describe('Error state', () => {
    it('renders error message when error occurs', () => {
      mockHookState = {
        data: null,
        loading: false,
        error: 'Erro ao carregar dados',
      };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      expect(screen.getByText('Erro ao carregar dados')).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('renders empty state when no data', () => {
      mockHookState = { data: null, loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      expect(screen.getByText('Nenhum dado encontrado')).toBeInTheDocument();
    });
  });

  describe('Data rendering', () => {
    it('renders subtitle with essay and student count', () => {
      const data = createMockData();
      data.totalStudents = 25;
      data.totalEssays = 30;
      mockHookState = { data, loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      expect(
        screen.getByText(/Redação • 30 redações • 25 alunos/)
      ).toBeInTheDocument();
    });

    it('handles singular forms correctly', () => {
      const data = createMockData(1, 1, 1);
      data.totalStudents = 1;
      data.totalEssays = 1;
      mockHookState = { data, loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      expect(
        screen.getByText(/Redação • 1 redação • 1 aluno/)
      ).toBeInTheDocument();
    });

    it('renders 3 performance counters', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      // 3 Counter labels - use getAllByText since badges may have similar text
      expect(screen.getAllByText('Acima da média').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Abaixo da média').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Ponto de atenção').length).toBeGreaterThan(0);

      // Counter values (highlight + aboveAverage = 15 for "Acima da média")
      expect(screen.getByText('15')).toBeInTheDocument(); // combined highlight + aboveAverage
      expect(screen.getByText('7')).toBeInTheDocument(); // belowAverage
      expect(screen.getByText('3')).toBeInTheDocument(); // attentionPoint
    });

    it('renders table with students', () => {
      mockHookState = { data: createMockData(3), loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      // Table headers
      expect(screen.getByText('Nome')).toBeInTheDocument();
      expect(screen.getByText('Escola')).toBeInTheDocument();
      expect(screen.getByText('Ano')).toBeInTheDocument();
      expect(screen.getByText('Turma')).toBeInTheDocument();
      expect(screen.getByText('Média')).toBeInTheDocument();
      expect(screen.getByText('Proficiência')).toBeInTheDocument();
    });

    it('renders student names in table', () => {
      mockHookState = { data: createMockData(3), loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      expect(screen.getByText('Estudante 1')).toBeInTheDocument();
      expect(screen.getByText('Estudante 2')).toBeInTheDocument();
      expect(screen.getByText('Estudante 3')).toBeInTheDocument();
    });

    it('renders empty students message when no students', () => {
      const data = createMockData(0, 1, 0);
      mockHookState = { data, loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      // Mensagem do estado vazio do `TableProvider`, que este modal usa sem
      // customizar `emptyState`.
      expect(screen.getByText('Nenhum dado disponível')).toBeInTheDocument();
    });
  });

  describe('Modal open/close behavior', () => {
    it('fetches details when modal opens', () => {
      mockHookState = { data: null, loading: true, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} isOpen={true} />);

      expect(mockFetchDetails).toHaveBeenCalledWith({
        competenceNumber: 1,
        period: '1_MONTH',
        schoolIds: undefined,
        schoolYearIds: undefined,
        classIds: undefined,
        page: 1,
        limit: 10,
      });
    });

    it('does not fetch when competenceNumber is null', () => {
      mockHookState = { data: null, loading: false, error: null };

      render(
        <EssayCompetenceDetailsModal
          {...defaultProps}
          isOpen={true}
          competenceNumber={null}
        />
      );

      expect(mockFetchDetails).not.toHaveBeenCalled();
    });

    it('resets state when modal closes', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      const { rerender } = render(
        <EssayCompetenceDetailsModal {...defaultProps} isOpen={true} />
      );

      // Close the modal
      rerender(
        <EssayCompetenceDetailsModal {...defaultProps} isOpen={false} />
      );

      expect(mockReset).toHaveBeenCalled();
    });
  });

  describe('Filter parameters', () => {
    it('passes filter parameters to fetchDetails', () => {
      mockHookState = { data: null, loading: true, error: null };

      render(
        <EssayCompetenceDetailsModal
          {...defaultProps}
          schoolIds={['school-1', 'school-2']}
          schoolYearIds={['year-1']}
          classIds={['class-1', 'class-2', 'class-3']}
        />
      );

      expect(mockFetchDetails).toHaveBeenCalledWith({
        competenceNumber: 1,
        period: '1_MONTH',
        schoolIds: ['school-1', 'school-2'],
        schoolYearIds: ['year-1'],
        classIds: ['class-1', 'class-2', 'class-3'],
        page: 1,
        limit: 10,
      });
    });
  });

  describe('Accessibility', () => {
    it('modal can be closed', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      // Modal component should handle close button
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('handles very long competence name', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      const longName =
        'Esta é uma competência com um nome muito longo que deve ser tratada corretamente pelo componente';

      render(
        <EssayCompetenceDetailsModal
          {...defaultProps}
          competenceName={longName}
        />
      );

      expect(screen.getByText(`C1 - ${longName}`)).toBeInTheDocument();
    });

    it('handles zero counters', () => {
      const data = createMockData();
      data.counters = {
        highlight: 0,
        aboveAverage: 0,
        belowAverage: 0,
        attentionPoint: 0,
      };
      mockHookState = { data, loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      // All 3 counter cards should show 0
      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBe(3);
    });

    it('handles large numbers', () => {
      const data = createMockData();
      data.totalStudents = 10000;
      data.totalEssays = 50000;
      mockHookState = { data, loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      expect(
        screen.getByText(/Redação • 50000 redações • 10000 alunos/)
      ).toBeInTheDocument();
    });
  });

  describe('Exportação', () => {
    /** Título que a aba carrega antes de qualquer impressão. */
    const APP_TITLE = 'Analytica';

    /** Data fixa, para o nome do arquivo ser um literal e não um cálculo. */
    const FIXED_NOW = new Date(2026, 7, 20, 10, 30);

    /** Nome esperado do arquivo, sem extensão, nos dois formatos. */
    const EXPECTED_FILE_NAME = 'desempenho-competencia-redacao-20-08-2026';

    /** Abre o seletor de formato pelo botão "Baixar relatório". */
    const openFormatChooser = () => {
      fireEvent.click(screen.getByRole('button', { name: 'Baixar relatório' }));
    };

    /**
     * Escolhe um formato e confirma no rodapé do seletor.
     *
     * `act` assíncrono porque o caminho Excel varre as páginas da tabela antes
     * de montar a planilha.
     */
    const chooseFormatAndConfirm = async (format: 'PDF' | 'Excel') => {
      fireEvent.click(screen.getByRole('button', { name: format }));
      fireEvent.click(screen.getByRole('button', { name: 'Baixar' }));
      // O `fireEvent` já roda dentro de um `act` do Testing Library; este aqui
      // existe só para drenar o que o clique disparou de assíncrono — o caminho
      // Excel aguarda a varredura de páginas antes de montar a planilha.
      await act(async () => {});
    };

    /**
     * Fotografa `<body>` e `document.title` DE DENTRO do `printAsPdf`.
     *
     * É o único instante em que a marca de impressão e o nome do arquivo
     * existem: o `useReportPrint` desfaz os dois no `afterprint`.
     */
    const captureDuringPrint = () => {
      const captured: { bodyClasses: string; title: string }[] = [];
      printAsPdfMock.mockImplementation(() => {
        captured.push({
          bodyClasses: document.body.className,
          title: document.title,
        });
      });
      return captured;
    };

    beforeEach(() => {
      jest.useFakeTimers({ now: FIXED_NOW });
      document.body.className = '';
      document.title = APP_TITLE;
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('oferece PDF e Excel no seletor de formato', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      expect(
        screen.queryByText('Como deseja baixar o relatório?')
      ).not.toBeInTheDocument();

      openFormatChooser();

      expect(screen.getByRole('button', { name: 'PDF' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Excel' })).toBeInTheDocument();
    });

    it('imprime o modal no caminho PDF, com o nome do arquivo do dia, e NÃO gera Excel', async () => {
      mockHookState = { data: createMockData(), loading: false, error: null };
      const snapshots = captureDuringPrint();

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      openFormatChooser();
      await chooseFormatAndConfirm('PDF');

      expect(printAsPdfMock).toHaveBeenCalledTimes(1);
      // Um único diálogo: quem imprime é o `ReportDetailModal`, e não há hook
      // local somando uma segunda impressão.
      expect(snapshots).toEqual([
        { bodyClasses: 'printing-modal', title: EXPECTED_FILE_NAME },
      ]);
      // Asserção negativa cruzada: `onDownloadPdf` e `onDownloadExcel` têm a
      // mesma assinatura, e trocá-las passaria pelo tsc.
      expect(downloadExcelMock).not.toHaveBeenCalled();
      // O PDF é a foto do modal: leva a página visível e não varre a tabela.
      expect(mockApi.post).not.toHaveBeenCalled();
    });

    it('gera as duas abas no caminho Excel, com o mesmo nome de arquivo', async () => {
      mockHookState = { data: createMockData(3), loading: false, error: null };
      mockApi.post.mockResolvedValue(
        createPageResponse(createMockStudents(3), 1, 3)
      );

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      openFormatChooser();
      await chooseFormatAndConfirm('Excel');

      expect(downloadExcelMock).toHaveBeenCalledTimes(1);

      const [fileName, sheets] = downloadExcelMock.mock.calls[0];

      expect(fileName).toBe(EXPECTED_FILE_NAME);
      expect(sheets.map((sheet) => sheet.name)).toEqual([
        'Resumo da competência',
        'Desempenho por estudante',
      ]);
      // O título que a tela exibe abre o resumo.
      expect(sheets[0].rows[0]).toEqual([
        'Competência',
        'C1 - Domínio da escrita',
      ]);
      expect(printAsPdfMock).not.toHaveBeenCalled();
    });

    it('a planilha leva a tabela INTEIRA, e não a página visível', async () => {
      // A tela mostra 10 de 150; a varredura pede 100 por página, então são duas
      // requisições e 150 linhas na aba.
      mockHookState = {
        data: createMockData(10, 1, 150),
        loading: false,
        error: null,
      };
      mockApi.post
        .mockResolvedValueOnce(
          createPageResponse(createMockStudents(100), 1, 150)
        )
        .mockResolvedValueOnce(
          createPageResponse(createMockStudents(50), 2, 150)
        );

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      openFormatChooser();
      await chooseFormatAndConfirm('Excel');

      expect(mockApi.post).toHaveBeenCalledTimes(2);

      const [, sheets] = downloadExcelMock.mock.calls[0];

      expect(sheets[1].rows).toHaveLength(150);
    });

    it('a varredura leva os mesmos filtros da tela', async () => {
      mockHookState = { data: createMockData(3), loading: false, error: null };
      mockApi.post.mockResolvedValue(
        createPageResponse(createMockStudents(3), 1, 3)
      );

      render(
        <EssayCompetenceDetailsModal
          {...defaultProps}
          schoolIds={['school-1']}
          schoolYearIds={['year-1']}
          classIds={['class-1']}
        />
      );

      openFormatChooser();
      await chooseFormatAndConfirm('Excel');

      expect(mockApi.post).toHaveBeenCalledWith(
        '/performance/simulated/essays/competence-details',
        expect.objectContaining({
          competenceNumber: 1,
          period: '1_MONTH',
          schoolIds: ['school-1'],
          schoolYearIds: ['year-1'],
          classIds: ['class-1'],
        })
      );
    });

    it('mostra o erro da varredura no seletor, sem gerar planilha', async () => {
      mockHookState = { data: createMockData(3), loading: false, error: null };
      mockApi.post.mockRejectedValue(new Error('Falha de rede'));

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      openFormatChooser();
      await chooseFormatAndConfirm('Excel');

      expect(screen.getByText('Falha de rede')).toBeInTheDocument();
      expect(downloadExcelMock).not.toHaveBeenCalled();
    });

    it('sem dado, a planilha sai com as duas abas vazias e sem varrer nada', async () => {
      mockHookState = { data: null, loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      openFormatChooser();
      await chooseFormatAndConfirm('Excel');

      const [, sheets] = downloadExcelMock.mock.calls[0];

      expect(sheets.map((sheet) => sheet.name)).toEqual([
        'Resumo da competência',
        'Desempenho por estudante',
      ]);
      expect(sheets.map((sheet) => sheet.rows)).toEqual([[], []]);
      expect(mockApi.post).not.toHaveBeenCalled();
    });

    it('oferece download também nos estados de carregando, erro e sem-dado', () => {
      mockHookState = { data: null, loading: true, error: null };

      const { rerender } = render(
        <EssayCompetenceDetailsModal {...defaultProps} />
      );

      expect(
        screen.getByTestId('report-detail-download-btn')
      ).toBeInTheDocument();

      mockHookState = { data: null, loading: false, error: 'Erro ao carregar' };
      rerender(<EssayCompetenceDetailsModal {...defaultProps} />);

      expect(
        screen.getByTestId('report-detail-download-btn')
      ).toBeInTheDocument();
      expect(screen.getByText('Erro ao carregar')).toBeInTheDocument();

      mockHookState = { data: null, loading: false, error: null };
      rerender(<EssayCompetenceDetailsModal {...defaultProps} />);

      expect(
        screen.getByTestId('report-detail-download-btn')
      ).toBeInTheDocument();
      expect(screen.getByText('Nenhum dado encontrado')).toBeInTheDocument();
    });

    it('marca o <dialog> como região de impressão e preserva a largura do modal', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      const dialog = document.querySelector('dialog.js-print-region');

      expect(dialog).not.toBeNull();
      // Largura do `size="xl"` que o modal já usava.
      expect(dialog).toHaveClass('max-w-[970px]');
    });

    it('nenhum controle dentro da região impressa fica sem data-print-hide', () => {
      // `total: 25` para o rodapé de paginação existir: ele traz o `<select>` de
      // itens por página e os dois botões de navegação.
      mockHookState = {
        data: createMockData(10, 1, 25),
        loading: false,
        error: null,
      };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      // Cinco controles, todos escondidos: o "X" do `Modal` base, o "Baixar
      // relatório" e, no rodapé, o seletor de itens por página, "Página
      // anterior" e "Próxima página". Este modal não tem botão de voltar — não
      // é cascata — e a tabela não é clicável, então nada sai no papel.
      expectPrintRegionControlsHidden(5);
    });

    it('não marca o conteúdo do relatório com data-print-hide', () => {
      mockHookState = { data: createMockData(3), loading: false, error: null };

      render(<EssayCompetenceDetailsModal {...defaultProps} />);

      // A tabela e os contadores são conteúdo, e saem no papel.
      expect(
        screen.getByText('Estudante 1').closest('[data-print-hide]')
      ).toBeNull();
      expect(
        screen.getByText('Ponto de atenção').closest('[data-print-hide]')
      ).toBeNull();
    });
  });
});
