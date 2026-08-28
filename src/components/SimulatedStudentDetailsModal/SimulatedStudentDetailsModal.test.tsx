import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { printAsPdf } from '../../utils/exportPdf';
import { downloadExcel } from '../../utils/exportExcel';
import { SimulatedStudentDetailsModal } from './SimulatedStudentDetailsModal';
import { expectPrintRegionControlsHidden } from '../../testing/printRegionInvariant';
import type {
  SimulatedStudentDetailsModalProps,
  StudentContentsData,
  StudentDetailsData,
  StudentSubjectsData,
} from './types';
import { SimulatedPerformanceTag } from './types';
import { Period } from '../PeriodSelector';

// `printAsPdf` é `globalThis.print()`, que o jsdom não implementa;
// `downloadExcel` escreve um arquivo em disco. Tudo o mais — Modal,
// ReportDetailModal, DownloadModal, Text, ProgressBar, Badge, useReportPrint e
// os builders de aba — roda de verdade.
jest.mock('../../utils/exportPdf', () => ({ printAsPdf: jest.fn() }));
jest.mock('../../utils/exportExcel', () => ({ downloadExcel: jest.fn() }));

const printAsPdfMock = printAsPdf as jest.MockedFunction<typeof printAsPdf>;
const downloadExcelMock = downloadExcel as jest.MockedFunction<
  typeof downloadExcel
>;

const mockFetchDetails = jest.fn();
const mockReset = jest.fn();
let mockHookState: {
  data: StudentDetailsData | null;
  loading: boolean;
  error: string | null;
};

jest.mock('./useSimulatedStudentDetails', () => ({
  useSimulatedStudentDetails: () => ({
    ...mockHookState,
    fetchDetails: mockFetchDetails,
    reset: mockReset,
  }),
}));

function createSubjectsData(): StudentSubjectsData {
  return {
    student: {
      studentId: 'student-1',
      institutionId: 'inst-1',
      name: 'Maria Silva',
      school: 'Escola Centro',
      schoolYear: '3 ano',
      class: 'A',
      average: 72,
      performance: SimulatedPerformanceTag.ABOVE_AVERAGE,
    },
    subjects: [
      {
        id: 'subject-1',
        name: 'Matematica',
        color: '#22C55E',
        icon: null,
        questionsCount: 12,
        performance: {
          correct: 9,
          incorrect: 3,
          correctPercentage: 75,
        },
      },
    ],
    page: 1,
    limit: 20,
    total: 1,
  };
}

function createContentsData(): StudentContentsData {
  return {
    student: {
      studentId: 'student-1',
      institutionId: 'inst-1',
      name: 'Maria Silva',
      school: 'Escola Centro',
      schoolYear: '3 ano',
      class: 'A',
      average: 72,
      performance: SimulatedPerformanceTag.ABOVE_AVERAGE,
    },
    subject: {
      id: 'subject-1',
      name: 'Matematica',
    },
    contents: [
      {
        contentId: 'content-1',
        contentName: 'Geometria Plana',
        bnccCode: 'EM13MAT301',
        questionsCount: 4,
        performance: {
          correct: 3,
          incorrect: 1,
          correctPercentage: 75,
        },
      },
    ],
    page: 1,
    limit: 20,
    total: 1,
  };
}

function buildProps(
  overrides: Partial<SimulatedStudentDetailsModalProps> = {}
): SimulatedStudentDetailsModalProps {
  return {
    api: {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    },
    isOpen: true,
    onClose: jest.fn(),
    simulationType: 'enem-1',
    userInstitutionId: 'user-inst-1',
    studentName: 'Maria Silva',
    period: '1_MONTH',
    ...overrides,
  };
}

function renderModal(
  overrides: Partial<SimulatedStudentDetailsModalProps> = {}
) {
  const props = buildProps(overrides);
  const result = render(<SimulatedStudentDetailsModal {...props} />);

  return {
    ...result,
    /** Re-renderiza com as MESMAS props, para o estado do hook mockado mudar. */
    rerenderModal: () =>
      result.rerender(<SimulatedStudentDetailsModal {...props} />),
  };
}

describe('SimulatedStudentDetailsModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHookState = {
      data: null,
      loading: false,
      error: null,
    };
  });

  it('renders loading state', () => {
    mockHookState.loading = true;

    renderModal();

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockHookState.error = 'Erro ao carregar';

    renderModal();

    expect(screen.getByText('Erro ao carregar')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    renderModal();

    expect(screen.getByText('Nenhum dado encontrado')).toBeInTheDocument();
  });

  it('renders subjects level and fetches subject details on click', () => {
    mockHookState.data = createSubjectsData();

    renderModal();

    expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    expect(screen.getByText('Matematica')).toBeInTheDocument();
    expect(screen.getByText('12 questões')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Matematica'));

    expect(mockFetchDetails).toHaveBeenCalledWith({
      simulationType: 'enem-1',
      userInstitutionId: 'user-inst-1',
      period: '1_MONTH',
      subjectId: 'subject-1',
    });
    expect(
      screen.getByLabelText('Voltar para lista de componentes curriculares')
    ).toBeInTheDocument();
  });

  it('renders contents level and empty contents message', () => {
    mockHookState.data = {
      ...createContentsData(),
      contents: [],
    };

    renderModal();

    expect(
      screen.getByText('Nenhuma habilidade encontrada')
    ).toBeInTheDocument();
  });

  it('resets hook state when modal closes', () => {
    mockHookState.data = createSubjectsData();

    const { rerender } = renderModal({ isOpen: true });

    rerender(
      <SimulatedStudentDetailsModal
        api={{
          get: jest.fn(),
          post: jest.fn(),
          patch: jest.fn(),
          delete: jest.fn(),
        }}
        isOpen={false}
        onClose={jest.fn()}
        simulationType="enem-1"
        userInstitutionId="user-inst-1"
        studentName="Maria Silva"
        period={Period.ONE_MONTH}
      />
    );

    expect(mockReset).toHaveBeenCalled();
  });

  describe('Exportação', () => {
    /** Título que a aba carrega antes de qualquer impressão. */
    const APP_TITLE = 'Analytica';

    /** Data fixa, para o nome do arquivo ser um literal e não um cálculo. */
    const FIXED_NOW = new Date(2026, 7, 20, 10, 30);

    /** Nome esperado do arquivo, sem extensão, nos dois formatos. */
    const EXPECTED_FILE_NAME = 'desempenho-simulado-20-08-2026';

    /** Abre o seletor de formato pelo botão "Baixar relatório". */
    const openFormatChooser = () => {
      fireEvent.click(screen.getByRole('button', { name: 'Baixar relatório' }));
    };

    /** Escolhe um formato e confirma no rodapé do seletor. */
    const chooseFormatAndConfirm = (format: 'PDF' | 'Excel') => {
      fireEvent.click(screen.getByRole('button', { name: format }));
      fireEvent.click(screen.getByRole('button', { name: 'Baixar' }));
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

    /**
     * Leva a tela ao nível 2 pelo mesmo caminho do usuário: clicar na matéria e
     * receber a resposta de habilidades.
     *
     * O clique é o que grava `selectedSubject` — é dele que sai o nome da
     * matéria na planilha —, e a troca de `mockHookState.data` é a resposta que
     * o hook real entregaria depois.
     */
    const navigateToContentsLevel = () => {
      mockHookState.data = createSubjectsData();
      const { rerenderModal } = renderModal();

      fireEvent.click(screen.getByText('Matematica'));

      mockHookState.data = createContentsData();
      rerenderModal();
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
      mockHookState.data = createSubjectsData();

      renderModal();

      expect(
        screen.queryByText('Como deseja baixar o relatório?')
      ).not.toBeInTheDocument();

      openFormatChooser();

      expect(screen.getByRole('button', { name: 'PDF' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Excel' })).toBeInTheDocument();
    });

    it('imprime o modal no caminho PDF, com o nome do arquivo do dia, e NÃO gera Excel', () => {
      mockHookState.data = createSubjectsData();
      const snapshots = captureDuringPrint();

      renderModal();

      openFormatChooser();
      chooseFormatAndConfirm('PDF');

      expect(printAsPdfMock).toHaveBeenCalledTimes(1);
      // Um único diálogo: quem imprime é o `ReportDetailModal`, e não há hook
      // local somando uma segunda impressão.
      expect(snapshots).toEqual([
        { bodyClasses: 'printing-modal', title: EXPECTED_FILE_NAME },
      ]);
      // Asserção negativa cruzada: `onDownloadPdf` e `onDownloadExcel` têm a
      // mesma assinatura, e trocá-las passaria pelo tsc.
      expect(downloadExcelMock).not.toHaveBeenCalled();
    });

    it('gera a planilha no caminho Excel e NÃO imprime', () => {
      mockHookState.data = createSubjectsData();

      renderModal();

      openFormatChooser();
      chooseFormatAndConfirm('Excel');

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

    it('no nível 1 a planilha leva o resumo e a lista de matérias da tela', () => {
      mockHookState.data = createSubjectsData();

      renderModal();

      openFormatChooser();
      chooseFormatAndConfirm('Excel');

      const [, sheets] = downloadExcelMock.mock.calls[0];

      expect(sheets.map((sheet) => sheet.name)).toEqual([
        'Resumo do estudante',
        'Desempenho por componente',
      ]);
      expect(sheets[0].rows).toEqual([
        ['Estudante', 'Maria Silva'],
        ['Escola', 'Escola Centro'],
        ['Turma', 'A'],
        ['Média', 72],
        ['Desempenho', 'Acima da média'],
      ]);
      expect(sheets[1]).toEqual({
        name: 'Desempenho por componente',
        headers: ['Componente curricular', 'Questões', 'Acertos (%)'],
        rows: [['Matematica', 12, 75]],
      });
    });

    it('no nível 2 a planilha troca a lista e nomeia a matéria aberta', () => {
      navigateToContentsLevel();

      openFormatChooser();
      chooseFormatAndConfirm('Excel');

      const [, sheets] = downloadExcelMock.mock.calls[0];

      expect(sheets.map((sheet) => sheet.name)).toEqual([
        'Resumo do estudante',
        'Desempenho por habilidade',
      ]);
      // A matéria do título do modal abre o resumo.
      expect(sheets[0].rows[0]).toEqual(['Componente curricular', 'Matematica']);
      expect(sheets[1]).toEqual({
        name: 'Desempenho por habilidade',
        headers: [
          'Habilidade',
          'Código BNCC',
          'Questões',
          'Acertos (%)',
          'Acertos',
        ],
        rows: [['Geometria Plana', 'EM13MAT301', 4, 75, 3]],
      });
      // A lista de matérias do nível 1 não viaja junto: ela já não está na tela
      // nem em memória.
      expect(sheets.map((sheet) => sheet.name)).not.toContain(
        'Desempenho por componente'
      );
    });

    it('sem dado carregado, a planilha sai com as abas vazias e sem estourar', () => {
      mockHookState.loading = true;

      renderModal();

      openFormatChooser();
      chooseFormatAndConfirm('Excel');

      const [, sheets] = downloadExcelMock.mock.calls[0];

      expect(sheets.map((sheet) => sheet.name)).toEqual([
        'Resumo do estudante',
        'Desempenho por componente',
      ]);
      expect(sheets.map((sheet) => sheet.rows)).toEqual([[], []]);
    });

    it('marca o <dialog> como região de impressão e preserva a largura do modal', () => {
      mockHookState.data = createSubjectsData();

      renderModal();

      const dialog = document.querySelector('dialog.js-print-region');

      expect(dialog).not.toBeNull();
      // Largura do `size="lg"` que o modal já usava.
      expect(dialog).toHaveClass('max-w-[640px]');
    });

    it('esconde do papel o botão de download e o de voltar, sem marcar o conteúdo', () => {
      navigateToContentsLevel();

      expect(
        screen.getByTestId('report-detail-download-btn').parentElement
      ).toHaveAttribute('data-print-hide');
      expect(
        screen.getByLabelText('Voltar para lista de componentes curriculares')
      ).toHaveAttribute('data-print-hide');
      // O nome da matéria ao lado do botão de voltar é conteúdo, e sai no papel.
      expect(screen.getByText('Matematica')).not.toHaveAttribute(
        'data-print-hide'
      );
    });

    it('nenhum controle dentro da região impressa fica sem data-print-hide, no nível 1', () => {
      mockHookState.data = createSubjectsData();

      renderModal();

      // Escondidos: o "X" de fechar, do `Modal` base, e o "Baixar relatório",
      // do `ReportDetailModal`. O botão de voltar não existe neste nível.
      //
      // Impressa: a linha da matéria. Ela é `<button>` porque desce para o nível
      // 2, mas o texto dela é o conteúdo do relatório — escondê-la apagaria a
      // lista de matérias do PDF.
      expectPrintRegionControlsHidden(2, {
        selector: '[data-testid="subject-performance-row"]',
        count: 1,
      });
    });

    it('nenhum controle dentro da região impressa fica sem data-print-hide, no nível 2', () => {
      // Verificado DEPOIS de descer na cascata de propósito: o botão de voltar
      // só existe no nível 2, e foi um dos três controles que esta feature
      // descobriu sem marca.
      navigateToContentsLevel();

      // Três escondidos: o "X", o "Baixar relatório" e o de voltar. Aqui nenhum
      // controle sai no papel — a lista de habilidades do nível 2 não é
      // clicável, então não tem botão nenhum.
      expectPrintRegionControlsHidden(3);
    });

    it('oferece download também nos estados de carregando e de erro', () => {
      mockHookState.loading = true;

      const { rerenderModal } = renderModal();

      expect(
        screen.getByTestId('report-detail-download-btn')
      ).toBeInTheDocument();

      mockHookState.loading = false;
      mockHookState.error = 'Erro ao carregar';
      rerenderModal();

      expect(
        screen.getByTestId('report-detail-download-btn')
      ).toBeInTheDocument();
      expect(screen.getByText('Erro ao carregar')).toBeInTheDocument();
    });
  });
});
