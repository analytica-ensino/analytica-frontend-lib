import { render, screen, fireEvent } from '@testing-library/react';
import { printAsPdf } from '../../utils/exportPdf';
import { downloadExcel } from '../../utils/exportExcel';
import { StudentPerformanceDetailsModal } from './StudentPerformanceDetailsModal';
import { expectPrintRegionControlsHidden } from '../../testing/printRegionInvariant';
import type { StudentPerformanceDetailsData, ActivityProgress } from './types';

// `printAsPdf` é `globalThis.print()`, que o jsdom não implementa; `downloadExcel`
// escreve um arquivo em disco. Tudo o mais — Modal, ReportDetailModal,
// DownloadModal, useReportPrint e os builders de aba — roda de verdade.
jest.mock('../../utils/exportPdf', () => ({ printAsPdf: jest.fn() }));
jest.mock('../../utils/exportExcel', () => ({ downloadExcel: jest.fn() }));

const printAsPdfMock = printAsPdf as jest.MockedFunction<typeof printAsPdf>;
const downloadExcelMock = downloadExcel as jest.MockedFunction<
  typeof downloadExcel
>;

/**
 * Mock activity data with progress
 */
const mockActivityWithProgress: ActivityProgress = {
  id: 'activity-1',
  name: 'Atividade de Biologia',
  correctCount: 30,
  totalCount: 50,
  hasNoData: false,
  description: 'Descrição da atividade de biologia sobre fotossíntese.',
};

/**
 * Mock activity without data
 */
const mockActivityWithoutData: ActivityProgress = {
  id: 'activity-2',
  name: 'Atividade de Química',
  correctCount: 0,
  totalCount: 0,
  hasNoData: true,
  description: 'Descrição da atividade de química.',
};

/**
 * Complete mock student data
 */
const mockStudentData: StudentPerformanceDetailsData = {
  studentName: 'Fernanda Rocha',
  grade: {
    value: 9,
    performanceLabel: 'Acima da média',
  },
  correctQuestions: {
    value: 8,
    bestResultTopic: 'Fotossíntese',
  },
  incorrectQuestions: {
    value: 7,
    hardestTopic: 'Células',
  },
  activitiesCompleted: 10,
  contentsCompleted: 2,
  questionsAnswered: 40,
  accessCount: '15',
  timeOnline: '02:30:45',
  lastLogin: '25/01/2024 • 14:30h',
  activities: [mockActivityWithProgress, mockActivityWithoutData],
};

/**
 * Mock data with null values
 */
const mockStudentDataWithNullValues: StudentPerformanceDetailsData = {
  studentName: 'João Silva',
  grade: {
    value: 7.5,
    performanceLabel: 'Na média',
  },
  correctQuestions: {
    value: 5,
    bestResultTopic: null,
  },
  incorrectQuestions: {
    value: 3,
    hardestTopic: null,
  },
  activitiesCompleted: '--',
  contentsCompleted: '--',
  questionsAnswered: '--',
  accessCount: '--',
  timeOnline: '--',
  lastLogin: '--',
  activities: [],
};

describe('StudentPerformanceDetailsModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    data: mockStudentData,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders null when data is null and not loading', () => {
      const { container } = render(
        <StudentPerformanceDetailsModal
          isOpen={true}
          onClose={jest.fn()}
          data={null}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders modal when data is provided', () => {
      render(<StudentPerformanceDetailsModal {...defaultProps} />);
      expect(screen.getByText('Desempenho em 7 dias')).toBeInTheDocument();
    });

    it('renders student name', () => {
      render(<StudentPerformanceDetailsModal {...defaultProps} />);
      expect(screen.getByText('Fernanda Rocha')).toBeInTheDocument();
    });

    it('renders grade value with decimal', () => {
      render(<StudentPerformanceDetailsModal {...defaultProps} />);
      expect(screen.getByText('9.0')).toBeInTheDocument();
    });

    it('renders correct questions count', () => {
      render(<StudentPerformanceDetailsModal {...defaultProps} />);
      expect(screen.getByText('8')).toBeInTheDocument();
    });

    it('renders incorrect questions count', () => {
      render(<StudentPerformanceDetailsModal {...defaultProps} />);
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('renders performance label', () => {
      render(<StudentPerformanceDetailsModal {...defaultProps} />);
      expect(screen.getByText('Acima da média')).toBeInTheDocument();
    });

    it('renders best result topic', () => {
      render(<StudentPerformanceDetailsModal {...defaultProps} />);
      expect(screen.getByText('Fotossíntese')).toBeInTheDocument();
    });

    it('renders hardest topic', () => {
      render(<StudentPerformanceDetailsModal {...defaultProps} />);
      expect(screen.getByText('Células')).toBeInTheDocument();
    });
  });

  describe('Secondary Stats Row', () => {
    it('renders activities completed metric', () => {
      render(<StudentPerformanceDetailsModal {...defaultProps} />);
      expect(screen.getByText('ATIVIDADES REALIZADAS')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('renders questions answered metric', () => {
      render(<StudentPerformanceDetailsModal {...defaultProps} />);
      expect(screen.getByText('QUESTÕES RESPONDIDAS')).toBeInTheDocument();
      expect(screen.getByText('40')).toBeInTheDocument();
    });
  });

  describe('Tertiary Stats Row', () => {
    it('renders access count metric', () => {
      render(<StudentPerformanceDetailsModal {...defaultProps} />);
      expect(screen.getByText('QUANTIDADE DE ACESSOS')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('renders time online metric', () => {
      render(<StudentPerformanceDetailsModal {...defaultProps} />);
      expect(screen.getByText('TEMPO ONLINE')).toBeInTheDocument();
      expect(screen.getByText('02:30:45')).toBeInTheDocument();
    });

    it('renders last login metric', () => {
      render(<StudentPerformanceDetailsModal {...defaultProps} />);
      expect(screen.getByText('ÚLTIMO LOGIN')).toBeInTheDocument();
      expect(screen.getByText('25/01/2024 • 14:30h')).toBeInTheDocument();
    });
  });

  describe('Activities Progress Section', () => {
    it('renders activities progress title', () => {
      render(<StudentPerformanceDetailsModal {...defaultProps} />);
      expect(screen.getByText('Desempenho atividades')).toBeInTheDocument();
    });

    it('renders activity names', () => {
      render(<StudentPerformanceDetailsModal {...defaultProps} />);
      expect(screen.getByText('Atividade de Biologia')).toBeInTheDocument();
      expect(screen.getByText('Atividade de Química')).toBeInTheDocument();
    });

    it('renders activity progress text', () => {
      render(<StudentPerformanceDetailsModal {...defaultProps} />);
      expect(screen.getByText('30 de 50 corretas')).toBeInTheDocument();
    });

    it('renders no data message for activity without data', () => {
      render(<StudentPerformanceDetailsModal {...defaultProps} />);
      expect(
        screen.getByText('Sem dados ainda! A atividade ainda não foi feita.')
      ).toBeInTheDocument();
    });

    it('does not render activities section when activities array is empty', () => {
      render(
        <StudentPerformanceDetailsModal
          {...defaultProps}
          data={mockStudentDataWithNullValues}
        />
      );
      expect(
        screen.queryByText('Desempenho atividades')
      ).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('renders loading skeleton when loading is true', () => {
      render(
        <StudentPerformanceDetailsModal
          isOpen={true}
          onClose={jest.fn()}
          data={null}
          loading={true}
        />
      );
      expect(screen.getByText('Desempenho em 7 dias')).toBeInTheDocument();
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders modal with loading state even when data is null', () => {
      render(
        <StudentPerformanceDetailsModal
          isOpen={true}
          onClose={jest.fn()}
          data={null}
          loading={true}
        />
      );
      expect(screen.getByText('Desempenho em 7 dias')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('renders error message when error is provided', () => {
      render(
        <StudentPerformanceDetailsModal
          isOpen={true}
          onClose={jest.fn()}
          data={null}
          error="Erro ao carregar desempenho do aluno"
        />
      );
      expect(
        screen.getByText('Erro ao carregar desempenho do aluno')
      ).toBeInTheDocument();
    });

    it('renders modal with error state even when data is null', () => {
      render(
        <StudentPerformanceDetailsModal
          isOpen={true}
          onClose={jest.fn()}
          data={null}
          error="Network error"
        />
      );
      expect(screen.getByText('Desempenho em 7 dias')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    it('does not render when data, loading, and error are all null/false', () => {
      const { container } = render(
        <StudentPerformanceDetailsModal
          isOpen={true}
          onClose={jest.fn()}
          data={null}
          loading={false}
          error={null}
        />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Null Values Handling', () => {
    it('renders dash for null bestResultTopic', () => {
      render(
        <StudentPerformanceDetailsModal
          {...defaultProps}
          data={mockStudentDataWithNullValues}
        />
      );
      const dashes = screen.getAllByText('-');
      expect(dashes.length).toBeGreaterThan(0);
    });

    it('renders placeholder values for unavailable metrics', () => {
      render(
        <StudentPerformanceDetailsModal
          {...defaultProps}
          data={mockStudentDataWithNullValues}
        />
      );
      const placeholders = screen.getAllByText('--');
      expect(placeholders.length).toBeGreaterThan(0);
    });
  });

  describe('Custom Labels', () => {
    it('uses custom title when provided', () => {
      render(
        <StudentPerformanceDetailsModal
          {...defaultProps}
          labels={{
            title: 'Desempenho Personalizado',
          }}
        />
      );
      expect(screen.getByText('Desempenho Personalizado')).toBeInTheDocument();
    });

    it('uses custom grade label when provided', () => {
      render(
        <StudentPerformanceDetailsModal
          {...defaultProps}
          labels={{
            gradeLabel: 'PONTUAÇÃO',
          }}
        />
      );
      expect(screen.getByText('PONTUAÇÃO')).toBeInTheDocument();
    });

    it('uses custom activities progress title when provided', () => {
      render(
        <StudentPerformanceDetailsModal
          {...defaultProps}
          labels={{
            activitiesProgressTitle: 'Progresso das Atividades',
          }}
        />
      );
      expect(screen.getByText('Progresso das Atividades')).toBeInTheDocument();
    });

    it('uses custom no data message when provided', () => {
      render(
        <StudentPerformanceDetailsModal
          {...defaultProps}
          labels={{
            noDataMessage: 'Nenhum dado disponível',
          }}
        />
      );
      expect(screen.getByText('Nenhum dado disponível')).toBeInTheDocument();
    });
  });

  describe('Modal Behavior', () => {
    it('calls onClose when modal is closed', () => {
      const onClose = jest.fn();
      render(
        <StudentPerformanceDetailsModal {...defaultProps} onClose={onClose} />
      );

      const closeButton = screen.getByRole('button', { name: /fechar/i });
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('does not render when isOpen is false', () => {
      render(
        <StudentPerformanceDetailsModal {...defaultProps} isOpen={false} />
      );
      expect(
        screen.queryByText('Desempenho em 7 dias')
      ).not.toBeInTheDocument();
    });
  });

  describe('Performance Stat Cards', () => {
    it('renders NOTA card with orange variant', () => {
      render(<StudentPerformanceDetailsModal {...defaultProps} />);
      expect(screen.getByText('NOTA')).toBeInTheDocument();
      expect(screen.getByText('DESEMPENHO')).toBeInTheDocument();
    });

    it('renders CORRETAS card with green variant', () => {
      render(<StudentPerformanceDetailsModal {...defaultProps} />);
      expect(screen.getByText('N° DE QUESTÕES CORRETAS')).toBeInTheDocument();
      expect(screen.getByText('MELHOR RESULTADO')).toBeInTheDocument();
    });

    it('renders INCORRETAS card with red variant', () => {
      render(<StudentPerformanceDetailsModal {...defaultProps} />);
      expect(screen.getByText('N° DE QUESTÕES INCORRETAS')).toBeInTheDocument();
      expect(screen.getByText('MAIOR DIFICULDADE')).toBeInTheDocument();
    });
  });

  describe('Activity Accordion', () => {
    it('renders progress bar for activity with data', () => {
      render(<StudentPerformanceDetailsModal {...defaultProps} />);
      // Check for progress bar by finding the progress text that indicates data exists
      expect(screen.getByText('30 de 50 corretas')).toBeInTheDocument();
    });

    it('does not render progress bar for activity without data', () => {
      const dataWithOnlyNoDataActivity: StudentPerformanceDetailsData = {
        ...mockStudentData,
        activities: [mockActivityWithoutData],
      };
      render(
        <StudentPerformanceDetailsModal
          {...defaultProps}
          data={dataWithOnlyNoDataActivity}
        />
      );
      expect(
        screen.getByText('Sem dados ainda! A atividade ainda não foi feita.')
      ).toBeInTheDocument();
    });

    it('expands accordion to show activity description', () => {
      render(<StudentPerformanceDetailsModal {...defaultProps} />);

      // Click on the activity to expand accordion
      const activityTrigger = screen.getByText('Atividade de Biologia');
      fireEvent.click(activityTrigger);

      // Description should now be visible
      expect(
        screen.getByText(
          'Descrição da atividade de biologia sobre fotossíntese.'
        )
      ).toBeInTheDocument();
    });

    it('shows default message when description is not provided', () => {
      const dataWithNoDescription: StudentPerformanceDetailsData = {
        ...mockStudentData,
        activities: [
          {
            id: 'activity-no-desc',
            name: 'Atividade sem descrição',
            correctCount: 10,
            totalCount: 20,
            hasNoData: false,
          },
        ],
      };
      render(
        <StudentPerformanceDetailsModal
          {...defaultProps}
          data={dataWithNoDescription}
        />
      );

      // Click to expand
      const activityTrigger = screen.getByText('Atividade sem descrição');
      fireEvent.click(activityTrigger);

      // Default message should be shown
      expect(
        screen.getByText('Detalhes da atividade não disponíveis.')
      ).toBeInTheDocument();
    });
  });

  describe('Exportação', () => {
    /** Título que a aba carrega antes de qualquer impressão. */
    const APP_TITLE = 'Analytica';

    /** Data fixa, para o nome do arquivo ser um literal e não um cálculo. */
    const FIXED_NOW = new Date(2026, 7, 20, 10, 30);

    /** Nome esperado do arquivo, sem extensão, nos dois formatos. */
    const EXPECTED_FILE_NAME = 'desempenho-estudante-20-08-2026';

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
      render(<StudentPerformanceDetailsModal {...defaultProps} />);

      expect(
        screen.queryByText('Como deseja baixar o relatório?')
      ).not.toBeInTheDocument();

      openFormatChooser();

      expect(screen.getByRole('button', { name: 'PDF' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Excel' })).toBeInTheDocument();
    });

    it('imprime o modal no caminho PDF, com o nome do arquivo do dia, e NÃO gera Excel', () => {
      const snapshots = captureDuringPrint();

      render(<StudentPerformanceDetailsModal {...defaultProps} />);

      openFormatChooser();
      chooseFormatAndConfirm('PDF');

      expect(printAsPdfMock).toHaveBeenCalledTimes(1);
      // Um único diálogo: o componente imprime, e não há hook local somando
      // uma segunda impressão.
      expect(snapshots).toEqual([
        { bodyClasses: 'printing-modal', title: EXPECTED_FILE_NAME },
      ]);
      // Asserção negativa cruzada: `onDownloadPdf` e `onDownloadExcel` têm a
      // mesma assinatura, e trocá-las passaria pelo tsc.
      expect(downloadExcelMock).not.toHaveBeenCalled();
    });

    it('gera a planilha no caminho Excel e NÃO imprime', () => {
      render(<StudentPerformanceDetailsModal {...defaultProps} />);

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

    it('a planilha leva as abas da tela, com o conteúdo que o modal desenha', () => {
      render(<StudentPerformanceDetailsModal {...defaultProps} />);

      openFormatChooser();
      chooseFormatAndConfirm('Excel');

      const [, sheets] = downloadExcelMock.mock.calls[0];

      expect(sheets.map((sheet) => sheet.name)).toEqual([
        'Desempenho do estudante',
        'Desempenho atividades',
      ]);
      expect(sheets[0].rows).toContainEqual(['Estudante', 'Fernanda Rocha']);
      expect(sheets[1]).toEqual({
        name: 'Desempenho atividades',
        headers: ['Atividade', 'Progresso', 'Descrição'],
        rows: [
          [
            'Atividade de Biologia',
            '30 de 50 corretas',
            'Descrição da atividade de biologia sobre fotossíntese.',
          ],
          [
            'Atividade de Química',
            'Sem dados ainda! A atividade ainda não foi feita.',
            'Descrição da atividade de química.',
          ],
        ],
      });
    });

    it('a planilha usa os rótulos customizados que a tela recebeu', () => {
      render(
        <StudentPerformanceDetailsModal
          {...defaultProps}
          labels={{ gradeLabel: 'PONTUAÇÃO' }}
        />
      );

      openFormatChooser();
      chooseFormatAndConfirm('Excel');

      const [, sheets] = downloadExcelMock.mock.calls[0];
      expect(sheets[0].rows).toContainEqual(['PONTUAÇÃO', 9]);
    });

    it('sem dado carregado, a planilha sai com as abas vazias e sem estourar', () => {
      render(
        <StudentPerformanceDetailsModal
          isOpen
          onClose={jest.fn()}
          data={null}
          loading
        />
      );

      openFormatChooser();
      chooseFormatAndConfirm('Excel');

      const [, sheets] = downloadExcelMock.mock.calls[0];
      expect(sheets.map((sheet) => sheet.name)).toEqual([
        'Desempenho do estudante',
        'Desempenho atividades',
      ]);
      expect(sheets.map((sheet) => sheet.rows)).toEqual([[], []]);
    });

    it('marca o <dialog> como região de impressão e preserva largura e altura', () => {
      render(<StudentPerformanceDetailsModal {...defaultProps} />);

      const dialog = document.querySelector('dialog.js-print-region');

      expect(dialog).not.toBeNull();
      // Largura do `size="lg"` que o modal já usava.
      expect(dialog).toHaveClass('max-w-[640px]');
      // Altura equivalente ao `contentClassName="max-h-[80vh]"` de antes, agora
      // no <dialog>: precisa VENCER o teto padrão do Modal.
      expect(dialog).toHaveClass('max-h-[80vh]');
      expect(dialog).not.toHaveClass('max-h-[calc(100dvh-2rem)]');
    });

    it('esconde o botão de download do papel, sem marcar o conteúdo', () => {
      render(<StudentPerformanceDetailsModal {...defaultProps} />);

      const button = screen.getByTestId('report-detail-download-btn');

      expect(button.parentElement).toHaveAttribute('data-print-hide');
      expect(screen.getByText('Fernanda Rocha')).not.toHaveAttribute(
        'data-print-hide'
      );
    });

    it('nenhum controle dentro da região impressa fica sem data-print-hide', () => {
      render(<StudentPerformanceDetailsModal {...defaultProps} />);

      // Escondidos: o "X" de fechar, do `Modal` base, e o "Baixar relatório",
      // do `ReportDetailModal`. Este modal não navega, não busca e não pagina.
      //
      // Impressos: os dois cabeçalhos de `CardAccordation`, um por atividade. O
      // texto DELES é o nome da atividade e o placar, então eles são conteúdo do
      // relatório — escondê-los apagaria a lista de atividades do PDF.
      expectPrintRegionControlsHidden(2, {
        selector: '[aria-expanded]',
        count: 2,
      });
    });
  });
});
