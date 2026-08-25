import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { printAsPdf } from '../../utils/exportPdf';
import { downloadExcel } from '../../utils/exportExcel';
import { SimulatedContentDetailsModal } from './SimulatedContentDetailsModal';
import { expectPrintRegionControlsHidden } from '../../testing/printRegionInvariant';
import type {
  ContentDetailsApiResponse,
  ContentDetailsData,
  ContentStudentItem,
  SimulatedContentDetailsModalProps,
} from './types';
import type { BaseApiClient } from '../../types/api';

// `printAsPdf` é `globalThis.print()`, que o jsdom não implementa;
// `downloadExcel` escreve um arquivo em disco. Tudo o mais — Modal,
// ReportDetailModal, DownloadModal, TableProvider (com a paginação de verdade),
// useReportPrint, `fetchAllContentStudents` e os builders de aba — roda de
// verdade.
jest.mock('../../utils/exportPdf', () => ({ printAsPdf: jest.fn() }));
jest.mock('../../utils/exportExcel', () => ({ downloadExcel: jest.fn() }));

const printAsPdfMock = printAsPdf as jest.MockedFunction<typeof printAsPdf>;
const downloadExcelMock = downloadExcel as jest.MockedFunction<
  typeof downloadExcel
>;

const mockFetchDetails = jest.fn();
const mockReset = jest.fn();
let mockHookState: {
  data: ContentDetailsData | null;
  loading: boolean;
  error: string | null;
};

jest.mock('./useSimulatedContentDetails', () => ({
  useSimulatedContentDetails: () => ({
    ...mockHookState,
    fetchDetails: mockFetchDetails,
    reset: mockReset,
  }),
}));

const ENDPOINT =
  '/performance/simulated/activities/content-details?types=SIMULADO';

function createMockApi(): jest.Mocked<BaseApiClient> {
  return {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };
}

function createStudent(
  overrides: Partial<ContentStudentItem> = {}
): ContentStudentItem {
  return {
    studentId: 's1',
    institutionId: 'i1',
    userInstitutionId: 'u1',
    name: 'Maria Silva',
    school: 'Escola Centro',
    schoolYear: '1',
    class: 'A',
    average: 700,
    performance: 72,
    ...overrides,
  };
}

function createMockData(
  overrides: Partial<ContentDetailsData['students']> = {}
): ContentDetailsData {
  return {
    content: {
      id: 'content-1',
      name: 'Leitura e interpretação',
      bnccCode: 'BNCC-001',
      subject: { id: 'sub-1', name: 'Linguagens' },
      questionsCount: 18,
      studentsCount: 12,
    },
    counters: {
      aboveAverage: 4,
      atAverage: 5,
      belowAverage: 3,
    },
    students: {
      data: [createStudent()],
      page: 1,
      limit: 10,
      total: 1,
      ...overrides,
    },
  };
}

/** Uma página de resposta do endpoint, como a varredura do XLSX a recebe. */
function createPageResponse(
  students: ContentStudentItem[],
  page: number,
  total: number
): { data: ContentDetailsApiResponse } {
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

describe('SimulatedContentDetailsModal', () => {
  let mockApi: jest.Mocked<BaseApiClient>;
  let baseProps: SimulatedContentDetailsModalProps;

  beforeEach(() => {
    jest.clearAllMocks();
    mockApi = createMockApi();
    baseProps = {
      api: mockApi,
      isOpen: true,
      onClose: jest.fn(),
      activityFilters: { types: ['SIMULADO'] },
      contentId: 'content-1',
      contentName: 'Fallback content name',
      period: '1_MONTH',
      filters: {
        schoolIds: ['school-1'],
        schoolYearIds: ['year-1'],
        classIds: ['class-1'],
      },
    };
    mockHookState = {
      data: null,
      loading: false,
      error: null,
    };
  });

  const renderModal = (
    overrides: Partial<SimulatedContentDetailsModalProps> = {}
  ) => {
    const props = { ...baseProps, ...overrides };
    const result = render(<SimulatedContentDetailsModal {...props} />);

    return {
      ...result,
      /** Re-renderiza com as MESMAS props, para o estado do hook mockado mudar. */
      rerenderModal: () =>
        result.rerender(<SimulatedContentDetailsModal {...props} />),
    };
  };

  it('fetches details on open with default pagination', () => {
    renderModal();

    expect(mockFetchDetails).toHaveBeenCalledWith({
      activityFilters: { types: ['SIMULADO'] },
      contentId: 'content-1',
      period: '1_MONTH',
      schoolIds: ['school-1'],
      schoolYearIds: ['year-1'],
      classIds: ['class-1'],
      page: 1,
      limit: 10,
    });
  });

  it('resets state when modal is closed', () => {
    renderModal({ isOpen: false });

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('renders loading skeleton when loading and no data', () => {
    mockHookState = { data: null, loading: true, error: null };

    renderModal();

    expect(screen.getByTestId('content-details-loading')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockHookState = { data: null, loading: false, error: 'Erro ao carregar' };

    renderModal();

    expect(screen.getByText('Erro ao carregar')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    renderModal();

    expect(screen.getByText('Nenhum dado encontrado')).toBeInTheDocument();
  });

  it('renders data state with header, counters and table', () => {
    mockHookState = { data: createMockData(), loading: false, error: null };

    renderModal();

    expect(screen.getByText('Leitura e interpretação')).toBeInTheDocument();
    expect(screen.getByText('BNCC-001')).toBeInTheDocument();

    const aboveCard = screen.getByText('Acima da média').closest('div');
    const atCard = screen.getByText('Na média').closest('div');
    const belowCard = screen.getByText('Abaixo da média').closest('div');

    expect(within(aboveCard as HTMLElement).getByText('4')).toBeInTheDocument();
    expect(within(atCard as HTMLElement).getByText('5')).toBeInTheDocument();
    expect(within(belowCard as HTMLElement).getByText('3')).toBeInTheDocument();

    expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    expect(screen.getByText('Escola Centro')).toBeInTheDocument();
  });

  it('uses fallback contentName when API content name is empty', () => {
    const data = createMockData();
    data.content.name = '';
    mockHookState = { data, loading: false, error: null };

    renderModal();

    expect(screen.getByText('Fallback content name')).toBeInTheDocument();
  });

  it('refetches with new params when table pagination changes', () => {
    mockHookState = {
      data: createMockData({ total: 25 }),
      loading: false,
      error: null,
    };

    renderModal();
    mockFetchDetails.mockClear();

    fireEvent.click(screen.getByLabelText('Próxima página'));

    expect(mockFetchDetails).toHaveBeenCalledWith(
      expect.objectContaining({
        contentId: 'content-1',
        period: '1_MONTH',
        page: 2,
      })
    );
  });

  describe('Exportação', () => {
    /** Título que a aba carrega antes de qualquer impressão. */
    const APP_TITLE = 'Analytica';

    /** Data fixa, para o nome do arquivo ser um literal e não um cálculo. */
    const FIXED_NOW = new Date(2026, 7, 20, 10, 30);

    /** Nome esperado do arquivo, sem extensão, nos dois formatos. */
    const EXPECTED_FILE_NAME = 'desempenho-competencia-20-08-2026';

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

      renderModal();

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

      renderModal();

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

    it('gera a planilha no caminho Excel e NÃO imprime', async () => {
      mockHookState = { data: createMockData(), loading: false, error: null };
      mockApi.post.mockResolvedValue(
        createPageResponse([createStudent()], 1, 1)
      );

      renderModal();

      openFormatChooser();
      await chooseFormatAndConfirm('Excel');

      expect(downloadExcelMock).toHaveBeenCalledTimes(1);
      expect(downloadExcelMock).toHaveBeenCalledWith(
        EXPECTED_FILE_NAME,
        expect.any(Array)
      );
      // O par negativo do teste acima.
      expect(printAsPdfMock).not.toHaveBeenCalled();
      expect(document.body).not.toHaveClass('printing-modal');
      expect(document.title).toBe(APP_TITLE);
    });

    it('a planilha leva o resumo do topo e os contadores da tela', async () => {
      mockHookState = { data: createMockData(), loading: false, error: null };
      mockApi.post.mockResolvedValue(
        createPageResponse([createStudent()], 1, 1)
      );

      renderModal();

      openFormatChooser();
      await chooseFormatAndConfirm('Excel');

      const [, sheets] = downloadExcelMock.mock.calls[0];

      expect(sheets.map((sheet) => sheet.name)).toEqual([
        'Resumo da competência',
        'Desempenho por estudante',
      ]);
      expect(sheets[0].rows).toEqual([
        ['Competência', 'Leitura e interpretação'],
        ['Código BNCC', 'BNCC-001'],
        ['Matéria', 'Linguagens'],
        ['Questões', 18],
        ['Alunos', 12],
        ['Acima da média', 4],
        ['Na média', 5],
        ['Abaixo da média', 3],
      ]);
    });

    it('a planilha leva a tabela INTEIRA, varrendo as páginas que a tela não mostrou', async () => {
      // A tela está na primeira página de 10; o conjunto tem 150 estudantes,
      // que a varredura pega em duas requisições de 100.
      mockHookState = {
        data: createMockData({ total: 150 }),
        loading: false,
        error: null,
      };
      mockApi.post
        .mockResolvedValueOnce(
          createPageResponse(
            [createStudent({ name: 'Aluno pagina 1' })],
            1,
            150
          )
        )
        .mockResolvedValueOnce(
          createPageResponse(
            [createStudent({ name: 'Aluno pagina 2' })],
            2,
            150
          )
        );

      renderModal();

      openFormatChooser();
      await chooseFormatAndConfirm('Excel');

      expect(mockApi.post).toHaveBeenCalledTimes(2);
      expect(mockApi.post).toHaveBeenNthCalledWith(
        1,
        ENDPOINT,
        expect.objectContaining({ page: 1, limit: 100 })
      );
      expect(mockApi.post).toHaveBeenNthCalledWith(
        2,
        ENDPOINT,
        expect.objectContaining({ page: 2, limit: 100 })
      );

      const [, sheets] = downloadExcelMock.mock.calls[0];

      expect(sheets[1]).toEqual({
        name: 'Desempenho por estudante',
        headers: ['Nome', 'Escola', 'Ano', 'Turma', 'Média', 'Desempenho (%)'],
        rows: [
          ['Aluno pagina 1', 'Escola Centro', '1', 'A', 700, 72],
          ['Aluno pagina 2', 'Escola Centro', '1', 'A', 700, 72],
        ],
      });
    });

    it('sem dado carregado, a planilha sai com as abas vazias e sem varrer nada', async () => {
      mockHookState = { data: null, loading: true, error: null };

      renderModal();

      openFormatChooser();
      await chooseFormatAndConfirm('Excel');

      const [, sheets] = downloadExcelMock.mock.calls[0];

      expect(sheets.map((sheet) => sheet.name)).toEqual([
        'Resumo da competência',
        'Desempenho por estudante',
      ]);
      expect(sheets.map((sheet) => sheet.rows)).toEqual([[], []]);
      // A tela não desenhou tabela nenhuma: não há o que varrer.
      expect(mockApi.post).not.toHaveBeenCalled();
    });

    it('mostra a falha da varredura no seletor, sem gerar arquivo', async () => {
      mockHookState = { data: createMockData(), loading: false, error: null };
      mockApi.post.mockRejectedValue(new Error('Falha de rede'));

      renderModal();

      openFormatChooser();
      await chooseFormatAndConfirm('Excel');

      expect(screen.getByText('Falha de rede')).toBeInTheDocument();
      expect(downloadExcelMock).not.toHaveBeenCalled();
    });

    it('marca o <dialog> como região de impressão e preserva a largura do modal', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      renderModal();

      const dialog = document.querySelector('dialog.js-print-region');

      expect(dialog).not.toBeNull();
      // Largura do `size="xl"` que o modal já usava.
      expect(dialog).toHaveClass('max-w-[970px]');
    });

    it('esconde do papel o botão de download, o de fechar e a paginação, sem marcar o conteúdo', () => {
      mockHookState = {
        data: createMockData({ total: 25 }),
        loading: false,
        error: null,
      };

      renderModal();

      expect(
        screen.getByTestId('report-detail-download-btn').parentElement
      ).toHaveAttribute('data-print-hide');
      // Dois botões fecham este modal: o "X" do `Modal` base e o de seta que
      // este componente põe no título. Os dois são controle e nenhum sai no
      // papel.
      const closeButtons = screen.getAllByLabelText('Fechar modal');
      expect(closeButtons).toHaveLength(2);
      for (const button of closeButtons) {
        expect(button).toHaveAttribute('data-print-hide');
      }
      expect(
        screen.getByLabelText('Próxima página').closest('[data-print-hide]')
      ).not.toBeNull();
      // A tabela é conteúdo do relatório e sai no papel.
      expect(
        screen.getByText('Maria Silva').closest('[data-print-hide]')
      ).toBeNull();
      // O título do modal também.
      expect(
        screen.getByText('Desempenho competência').closest('[data-print-hide]')
      ).toBeNull();
    });

    it('nenhum controle dentro da região impressa fica sem data-print-hide', () => {
      // `total: 25` para o rodapé de paginação existir: ele traz DOIS botões de
      // navegação e o `<select>` de itens por página.
      mockHookState = {
        data: createMockData({ total: 25 }),
        loading: false,
        error: null,
      };

      renderModal();

      // Seis controles, todos escondidos: os DOIS que fecham o modal (o "X" do
      // `Modal` base e a seta do título, ambos com aria-label "Fechar modal"), o
      // "Baixar relatório" e, no rodapé, o seletor de itens por página,
      // "Página anterior" e "Próxima página". O seletor é um `<select>` — uma
      // varredura só de `<button>` o deixaria passar cru para o papel.
      expectPrintRegionControlsHidden(6);
    });

    it('oferece download também nos estados de carregando e de erro', () => {
      mockHookState = { data: null, loading: true, error: null };

      const { rerenderModal } = renderModal();

      expect(
        screen.getByTestId('report-detail-download-btn')
      ).toBeInTheDocument();

      mockHookState = { data: null, loading: false, error: 'Erro ao carregar' };
      rerenderModal();

      expect(
        screen.getByTestId('report-detail-download-btn')
      ).toBeInTheDocument();
      expect(screen.getByText('Erro ao carregar')).toBeInTheDocument();
    });
  });
});
