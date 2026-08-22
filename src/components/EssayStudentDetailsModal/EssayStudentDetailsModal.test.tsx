import type React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EssayStudentDetailsModal } from './EssayStudentDetailsModal';
import { SimulatedPerformanceTag } from '../SimulatedStudentDetailsModal/types';
import { printAsPdf } from '../../utils/exportPdf';
import { downloadExcel } from '../../utils/exportExcel';
import { expectPrintRegionControlsHidden } from '../../testing/printRegionInvariant';
import {
  type EssayStudentDetailsData,
  type EssayCompetencyPerformance,
} from './types';
import type { BaseApiClient } from '../../types/api';

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

// Mock useEssayStudentDetails hook
const mockFetchDetails = jest.fn();
const mockReset = jest.fn();
let mockHookState: {
  data: EssayStudentDetailsData | null;
  loading: boolean;
  error: string | null;
};

jest.mock('./useEssayStudentDetails', () => ({
  useEssayStudentDetails: () => ({
    ...mockHookState,
    fetchDetails: mockFetchDetails,
    reset: mockReset,
  }),
}));

/**
 * Create mock competencies (5 ENEM competencies)
 */
function createMockCompetencies(): EssayCompetencyPerformance[] {
  const names = [
    'Domínio da modalidade escrita formal da língua portuguesa',
    'Compreender a proposta de redação e aplicar conceitos',
    'Selecionar, relacionar, organizar e interpretar informações',
    'Demonstrar conhecimento dos mecanismos linguísticos',
    'Elaborar proposta de intervenção para o problema abordado',
  ];

  return names.map((name, i) => ({
    number: i + 1,
    name,
    averageScore: 120 + i * 15,
    averagePercentage: 60 + i * 8,
    essaysCount: 3,
  }));
}

/**
 * Create mock student details data
 */
function createMockData(
  performance: SimulatedPerformanceTag = SimulatedPerformanceTag.ABOVE_AVERAGE
): EssayStudentDetailsData {
  return {
    student: {
      id: 'student-1',
      name: 'Maria Silva',
      school: 'Colégio Santa Maria',
      schoolYear: '2024',
      class: '3A',
    },
    overallAverage: 720,
    overallPercentage: 72,
    performance,
    essaysCount: 5,
    competencies: createMockCompetencies(),
  };
}

/**
 * Create mock API client
 */
function createMockApi(): BaseApiClient {
  return {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };
}

describe('EssayStudentDetailsModal', () => {
  const mockApi = createMockApi();
  const mockOnClose = jest.fn();

  const defaultProps = {
    api: mockApi,
    isOpen: true,
    onClose: mockOnClose,
    userInstitutionId: 'user-inst-1',
    studentName: 'Maria Silva',
    period: '1_MONTH',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockHookState = {
      data: null,
      loading: false,
      error: null,
    };
  });

  describe('Loading state', () => {
    it('renders loading skeletons when loading', () => {
      mockHookState = { data: null, loading: true, error: null };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      // Should show modal with title
      expect(screen.getByText('Desempenho de Maria Silva')).toBeInTheDocument();
    });

    it('shows 5 competency skeleton items when loading', () => {
      mockHookState = { data: null, loading: true, error: null };

      const { container } = render(
        <EssayStudentDetailsModal {...defaultProps} />
      );

      // Should have 5 skeleton rows for competencies
      const skeletonRows = container.querySelectorAll(
        '.flex.items-center.gap-4.p-4.bg-background.border'
      );
      expect(skeletonRows.length).toBe(5);
    });
  });

  describe('Error state', () => {
    it('renders error message when error occurs', () => {
      mockHookState = {
        data: null,
        loading: false,
        error: 'Erro ao carregar dados',
      };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      expect(screen.getByText('Erro ao carregar dados')).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('renders empty state when no data', () => {
      mockHookState = { data: null, loading: false, error: null };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      expect(screen.getByText('Nenhum dado encontrado')).toBeInTheDocument();
    });
  });

  describe('Data rendering', () => {
    it('renders student name in header card', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      // Student name appears in header card
      expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    });

    it('renders school and class info', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      expect(screen.getByText('Colégio Santa Maria - 3A')).toBeInTheDocument();
    });

    it('renders essays count', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      expect(screen.getByText(/5\s+redações/)).toBeInTheDocument();
    });

    it('renders overall average score', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      expect(screen.getByText('720')).toBeInTheDocument();
      expect(screen.getByText('/ 1000')).toBeInTheDocument();
    });

    it('renders overall percentage', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      expect(screen.getByText('72%')).toBeInTheDocument();
    });

    it('renders performance badge', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      // Should show "Acima da média" badge
      expect(screen.getByText('Acima da média')).toBeInTheDocument();
    });

    it('renders all 5 competencies', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      // Check competency numbers
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('renders competency names', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      expect(
        screen.getByText(
          'Domínio da modalidade escrita formal da língua portuguesa'
        )
      ).toBeInTheDocument();
    });

    it('renders competency scores', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      // First competency score (120)
      expect(screen.getByText('120')).toBeInTheDocument();
      // All competencies show /200
      expect(screen.getAllByText('/ 200').length).toBe(5);
    });

    it('handles singular essay count', () => {
      const data = createMockData();
      data.essaysCount = 1;
      mockHookState = { data, loading: false, error: null };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      expect(screen.getByText(/1\s+redação$/)).toBeInTheDocument();
    });
  });

  describe('Performance tags', () => {
    it('renders highlight performance correctly', () => {
      mockHookState = {
        data: createMockData(SimulatedPerformanceTag.HIGHLIGHT),
        loading: false,
        error: null,
      };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      expect(screen.getByText('Destaque da turma')).toBeInTheDocument();
    });

    it('renders above average performance correctly', () => {
      mockHookState = {
        data: createMockData(SimulatedPerformanceTag.ABOVE_AVERAGE),
        loading: false,
        error: null,
      };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      expect(screen.getByText('Acima da média')).toBeInTheDocument();
    });

    it('renders below average performance correctly', () => {
      mockHookState = {
        data: createMockData(SimulatedPerformanceTag.BELOW_AVERAGE),
        loading: false,
        error: null,
      };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      expect(screen.getByText('Abaixo da média')).toBeInTheDocument();
    });

    it('renders attention point performance correctly', () => {
      mockHookState = {
        data: createMockData(SimulatedPerformanceTag.ATTENTION_POINT),
        loading: false,
        error: null,
      };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      expect(screen.getByText('Ponto de atenção')).toBeInTheDocument();
    });
  });

  describe('Modal open/close behavior', () => {
    it('fetches details when modal opens', () => {
      mockHookState = { data: null, loading: true, error: null };

      render(<EssayStudentDetailsModal {...defaultProps} isOpen={true} />);

      expect(mockFetchDetails).toHaveBeenCalledWith({
        userInstitutionId: 'user-inst-1',
        period: '1_MONTH',
        schoolIds: undefined,
        schoolYearIds: undefined,
        classIds: undefined,
      });
    });

    it('does not fetch when userInstitutionId is null', () => {
      mockHookState = { data: null, loading: false, error: null };

      render(
        <EssayStudentDetailsModal
          {...defaultProps}
          isOpen={true}
          userInstitutionId={null}
        />
      );

      expect(mockFetchDetails).not.toHaveBeenCalled();
    });

    it('resets state when modal closes', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      const { rerender } = render(
        <EssayStudentDetailsModal {...defaultProps} isOpen={true} />
      );

      // Close the modal
      rerender(<EssayStudentDetailsModal {...defaultProps} isOpen={false} />);

      expect(mockReset).toHaveBeenCalled();
    });
  });

  describe('Filter parameters', () => {
    it('passes filter parameters to fetchDetails', () => {
      mockHookState = { data: null, loading: true, error: null };

      render(
        <EssayStudentDetailsModal
          {...defaultProps}
          schoolIds={['school-1', 'school-2']}
          schoolYearIds={['year-1']}
          classIds={['class-1', 'class-2', 'class-3']}
        />
      );

      expect(mockFetchDetails).toHaveBeenCalledWith({
        userInstitutionId: 'user-inst-1',
        period: '1_MONTH',
        schoolIds: ['school-1', 'school-2'],
        schoolYearIds: ['year-1'],
        classIds: ['class-1', 'class-2', 'class-3'],
      });
    });
  });

  describe('Custom labels', () => {
    it('uses custom noData label', () => {
      mockHookState = { data: null, loading: false, error: null };

      render(
        <EssayStudentDetailsModal
          {...defaultProps}
          labels={{ noData: 'Sem informações disponíveis' }}
        />
      );

      expect(
        screen.getByText('Sem informações disponíveis')
      ).toBeInTheDocument();
    });

    it('uses custom competencies label', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(
        <EssayStudentDetailsModal
          {...defaultProps}
          labels={{ competencies: 'Habilidades ENEM' }}
        />
      );

      expect(screen.getByText('Habilidades ENEM')).toBeInTheDocument();
    });
  });

  describe('Modal title', () => {
    it('uses student name in title', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(
        <EssayStudentDetailsModal {...defaultProps} studentName="João Pedro" />
      );

      expect(screen.getByText('Desempenho de João Pedro')).toBeInTheDocument();
    });

    it('uses fallback title when student name not provided', () => {
      mockHookState = { data: null, loading: true, error: null };

      render(
        <EssayStudentDetailsModal {...defaultProps} studentName={undefined} />
      );

      expect(screen.getByText('Desempenho de Estudante')).toBeInTheDocument();
    });
  });

  describe('Empty competencies', () => {
    it('shows no competencies message when list is empty', () => {
      const data = createMockData();
      data.competencies = [];
      mockHookState = { data, loading: false, error: null };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      expect(
        screen.getByText('Nenhuma competência encontrada')
      ).toBeInTheDocument();
    });
  });

  describe('Exportação', () => {
    /** Título que a aba carrega antes de qualquer impressão. */
    const APP_TITLE = 'Analytica';

    /** Data fixa, para o nome do arquivo ser um literal e não um cálculo. */
    const FIXED_NOW = new Date(2026, 7, 20, 10, 30);

    /** Nome esperado do arquivo, sem extensão, nos dois formatos. */
    const EXPECTED_FILE_NAME = 'desempenho-redacao-20-08-2026';

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

      render(<EssayStudentDetailsModal {...defaultProps} />);

      expect(
        screen.queryByText('Como deseja baixar o relatório?')
      ).not.toBeInTheDocument();

      openFormatChooser();

      expect(screen.getByRole('button', { name: 'PDF' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Excel' })).toBeInTheDocument();
    });

    it('imprime o modal no caminho PDF, com o nome do arquivo do dia, e NÃO gera Excel', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };
      const snapshots = captureDuringPrint();

      render(<EssayStudentDetailsModal {...defaultProps} />);

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
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayStudentDetailsModal {...defaultProps} />);

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

    it('a planilha leva o resumo e as competências que a tela desenha', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      openFormatChooser();
      chooseFormatAndConfirm('Excel');

      const [, sheets] = downloadExcelMock.mock.calls[0];

      expect(sheets.map((sheet) => sheet.name)).toEqual([
        'Resumo do estudante',
        'Desempenho por competência',
      ]);
      expect(sheets[0].rows).toEqual([
        ['Estudante', 'Maria Silva'],
        ['Escola', 'Colégio Santa Maria'],
        ['Turma', '3A'],
        ['Redações', 5],
        ['Média (0-1000)', 720],
        ['Aproveitamento (%)', 72],
        ['Desempenho', 'Acima da média'],
      ]);
      expect(sheets[1]).toEqual({
        name: 'Desempenho por competência',
        headers: ['Nº', 'Competência', 'Aproveitamento (%)', 'Nota (0-200)'],
        rows: [
          [
            1,
            'Domínio da modalidade escrita formal da língua portuguesa',
            60,
            120,
          ],
          [2, 'Compreender a proposta de redação e aplicar conceitos', 68, 135],
          [
            3,
            'Selecionar, relacionar, organizar e interpretar informações',
            76,
            150,
          ],
          [4, 'Demonstrar conhecimento dos mecanismos linguísticos', 84, 165],
          [
            5,
            'Elaborar proposta de intervenção para o problema abordado',
            92,
            180,
          ],
        ],
      });
    });

    it('sem dado carregado, a planilha sai com as abas vazias e sem estourar', () => {
      mockHookState = { data: null, loading: true, error: null };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      openFormatChooser();
      chooseFormatAndConfirm('Excel');

      const [, sheets] = downloadExcelMock.mock.calls[0];

      expect(sheets.map((sheet) => sheet.name)).toEqual([
        'Resumo do estudante',
        'Desempenho por competência',
      ]);
      expect(sheets.map((sheet) => sheet.rows)).toEqual([[], []]);
    });

    it('marca o <dialog> como região de impressão e preserva a largura do modal', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      const dialog = document.querySelector('dialog.js-print-region');

      expect(dialog).not.toBeNull();
      // Largura do `size="lg"` que o modal já usava.
      expect(dialog).toHaveClass('max-w-[640px]');
    });

    it('nenhum controle dentro da região impressa fica sem data-print-hide', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      // Dois controles: o "X" de fechar, do `Modal` base, e o "Baixar
      // relatório", do `ReportDetailModal`. Este modal não acrescenta nenhum —
      // não navega e não pagina.
      expectPrintRegionControlsHidden(2);
    });

    it('não marca o conteúdo do relatório com data-print-hide', () => {
      mockHookState = { data: createMockData(), loading: false, error: null };

      render(<EssayStudentDetailsModal {...defaultProps} />);

      // O card e a lista são conteúdo, e saem no papel.
      expect(screen.getByText('Maria Silva')).not.toHaveAttribute(
        'data-print-hide'
      );
      expect(
        screen
          .getByText(
            'Domínio da modalidade escrita formal da língua portuguesa'
          )
          .closest('[data-print-hide]')
      ).toBeNull();
    });

    it('oferece download também nos estados de carregando, erro e sem-dado', () => {
      mockHookState = { data: null, loading: true, error: null };

      const { rerender } = render(
        <EssayStudentDetailsModal {...defaultProps} />
      );

      expect(
        screen.getByTestId('report-detail-download-btn')
      ).toBeInTheDocument();

      mockHookState = { data: null, loading: false, error: 'Erro ao carregar' };
      rerender(<EssayStudentDetailsModal {...defaultProps} />);

      expect(
        screen.getByTestId('report-detail-download-btn')
      ).toBeInTheDocument();
      expect(screen.getByText('Erro ao carregar')).toBeInTheDocument();

      mockHookState = { data: null, loading: false, error: null };
      rerender(<EssayStudentDetailsModal {...defaultProps} />);

      expect(
        screen.getByTestId('report-detail-download-btn')
      ).toBeInTheDocument();
      expect(screen.getByText('Nenhum dado encontrado')).toBeInTheDocument();
    });
  });
});
