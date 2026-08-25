import { render, screen, fireEvent } from '@testing-library/react';
import { printAsPdf } from '../../utils/exportPdf';
import { downloadExcel } from '../../utils/exportExcel';
import { StudentLessonProgressModal } from './StudentLessonProgressModal';
import { expectPrintRegionControlsHidden } from '../../testing/printRegionInvariant';
import type {
  StudentLessonProgressData,
  TopicProgressItem,
  SubtopicProgressItem,
  ContentProgressItem,
} from './types';

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
 * Mock content item (deepest level)
 */
const mockContentItem: ContentProgressItem = {
  content: {
    id: 'content-1-1-1',
    name: 'Fundamentos do Movimento Uniforme',
  },
  progress: 70,
  isCompleted: false,
};

/**
 * Mock subtopic item with contents
 */
const mockSubtopicWithContents: SubtopicProgressItem = {
  subtopic: {
    id: 'subtopic-1-1',
    name: 'Aspectos iniciais',
  },
  progress: 70,
  status: 'in_progress',
  contents: [mockContentItem],
};

/**
 * Mock subtopic item without contents
 */
const mockSubtopicWithoutContents: SubtopicProgressItem = {
  subtopic: {
    id: 'subtopic-1-2',
    name: 'Movimento uniforme',
  },
  progress: 70,
  status: 'in_progress',
  contents: [],
};

/**
 * Mock topic with subtopics (nested)
 */
const mockNestedTopicItem: TopicProgressItem = {
  topic: {
    id: 'topic-1',
    name: 'Cinemática',
  },
  progress: 70,
  status: 'in_progress',
  subtopics: [mockSubtopicWithContents, mockSubtopicWithoutContents],
};

/**
 * Mock topic without subtopics (flat)
 */
const mockFlatTopicItem: TopicProgressItem = {
  topic: {
    id: 'topic-2',
    name: 'Grandezas físicas',
  },
  progress: 0,
  status: 'no_data',
  subtopics: [],
};

/**
 * Mock topic with completed status
 */
const mockCompletedTopicItem: TopicProgressItem = {
  topic: {
    id: 'topic-3',
    name: 'Mecânica',
  },
  progress: 100,
  status: 'completed',
  subtopics: [],
};

/**
 * Complete mock student data with nested structure
 */
const mockStudentData: StudentLessonProgressData = {
  name: 'Lucas Oliveira',
  overallCompletionRate: 90,
  bestResult: 'Fotossíntese',
  biggestDifficulty: 'Células',
  lessonProgress: [
    mockNestedTopicItem,
    mockFlatTopicItem,
    mockCompletedTopicItem,
  ],
};

/**
 * Mock data with null values
 */
const mockStudentDataWithNullValues: StudentLessonProgressData = {
  name: 'João Silva',
  overallCompletionRate: 0,
  bestResult: null,
  biggestDifficulty: null,
  lessonProgress: [],
};

/**
 * Mock flat data (simulating current API response with no nested items)
 */
const mockFlatData: StudentLessonProgressData = {
  name: 'Maria Santos',
  overallCompletionRate: 75.5,
  bestResult: 'Frações',
  biggestDifficulty: 'Geometria Espacial',
  lessonProgress: [
    {
      topic: { id: '1', name: 'Números Inteiros' },
      progress: 100,
      status: 'completed',
      subtopics: [],
    },
    {
      topic: { id: '2', name: 'Frações' },
      progress: 60,
      status: 'in_progress',
      subtopics: [],
    },
    {
      topic: { id: '3', name: 'Geometria Espacial' },
      progress: 0,
      status: 'no_data',
      subtopics: [],
    },
  ],
};

describe('StudentLessonProgressModal', () => {
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
        <StudentLessonProgressModal
          isOpen={true}
          onClose={jest.fn()}
          data={null}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders modal when data is provided', () => {
      render(<StudentLessonProgressModal {...defaultProps} />);
      expect(screen.getByText('Desempenho')).toBeInTheDocument();
    });

    it('renders student name', () => {
      render(<StudentLessonProgressModal {...defaultProps} />);
      expect(screen.getByText('Lucas Oliveira')).toBeInTheDocument();
    });

    it('renders completion rate', () => {
      render(<StudentLessonProgressModal {...defaultProps} />);
      expect(screen.getByText('90%')).toBeInTheDocument();
      expect(screen.getByText('CONCLUÍDO')).toBeInTheDocument();
    });

    it('renders best result', () => {
      render(<StudentLessonProgressModal {...defaultProps} />);
      expect(screen.getByText('MELHOR RESULTADO')).toBeInTheDocument();
      expect(screen.getByText('Fotossíntese')).toBeInTheDocument();
    });

    it('renders biggest difficulty', () => {
      render(<StudentLessonProgressModal {...defaultProps} />);
      expect(screen.getByText('MAIOR DIFICULDADE')).toBeInTheDocument();
      expect(screen.getByText('Células')).toBeInTheDocument();
    });
  });

  describe('Lesson Progress Section', () => {
    it('renders lesson progress title', () => {
      render(<StudentLessonProgressModal {...defaultProps} />);
      expect(screen.getByText('Conclusão das aulas')).toBeInTheDocument();
    });

    it('renders topic names', () => {
      render(<StudentLessonProgressModal {...defaultProps} />);
      expect(screen.getByText('Cinemática')).toBeInTheDocument();
      expect(screen.getByText('Grandezas físicas')).toBeInTheDocument();
      expect(screen.getByText('Mecânica')).toBeInTheDocument();
    });

    it('renders progress percentage for items with progress', () => {
      render(<StudentLessonProgressModal {...defaultProps} />);
      const progressTexts = screen.getAllByText('70%');
      expect(progressTexts.length).toBeGreaterThan(0);
    });

    it('renders no data message for items without data', () => {
      render(<StudentLessonProgressModal {...defaultProps} />);
      expect(screen.getByText('Sem dados ainda!')).toBeInTheDocument();
    });

    it('does not render lesson progress section when array is empty', () => {
      render(
        <StudentLessonProgressModal
          {...defaultProps}
          data={mockStudentDataWithNullValues}
        />
      );
      expect(screen.queryByText('Conclusão das aulas')).not.toBeInTheDocument();
    });
  });

  describe('Nested Accordion Behavior', () => {
    it('expands topic item when clicked', () => {
      render(<StudentLessonProgressModal {...defaultProps} />);

      // Initially, nested content should be collapsed
      const expandableContent = screen.getByTestId('accordion-content-topic-1');
      expect(expandableContent).toHaveAttribute('data-expanded', 'false');

      // Click on parent topic to expand
      const topicButton = screen.getByText('Cinemática').closest('button');
      fireEvent.click(topicButton!);

      // Now nested content should be expanded
      expect(expandableContent).toHaveAttribute('data-expanded', 'true');
    });

    it('expands deeply nested items (subtopic to content)', () => {
      render(<StudentLessonProgressModal {...defaultProps} />);

      // Expand first level (topic)
      const topicButton = screen.getByText('Cinemática').closest('button');
      fireEvent.click(topicButton!);

      // Expand second level (subtopic)
      const subtopicButton = screen
        .getByText('Aspectos iniciais')
        .closest('button');
      fireEvent.click(subtopicButton!);

      // Third level (content) should now be visible
      expect(
        screen.getByText('Fundamentos do Movimento Uniforme')
      ).toBeVisible();
    });

    it('does not show expand arrow for topics without subtopics', () => {
      render(<StudentLessonProgressModal {...defaultProps} />);

      // "Grandezas físicas" has no subtopics
      const itemButton = screen
        .getByText('Grandezas físicas')
        .closest('button');
      expect(itemButton).toHaveAttribute('disabled');
    });

    it('does not show expand arrow for subtopics without contents', () => {
      render(<StudentLessonProgressModal {...defaultProps} />);

      // Expand topic first
      const topicButton = screen.getByText('Cinemática').closest('button');
      fireEvent.click(topicButton!);

      // "Movimento uniforme" has no contents
      const subtopicButton = screen
        .getByText('Movimento uniforme')
        .closest('button');
      expect(subtopicButton).toHaveAttribute('disabled');
    });
  });

  describe('Loading State', () => {
    it('renders loading skeleton when loading is true', () => {
      render(
        <StudentLessonProgressModal
          isOpen={true}
          onClose={jest.fn()}
          data={null}
          loading={true}
        />
      );
      expect(screen.getByText('Desempenho')).toBeInTheDocument();
      expect(
        screen.getByTestId('lesson-progress-skeleton')
      ).toBeInTheDocument();
    });

    it('renders modal with loading state even when data is null', () => {
      render(
        <StudentLessonProgressModal
          isOpen={true}
          onClose={jest.fn()}
          data={null}
          loading={true}
        />
      );
      expect(screen.getByText('Desempenho')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('renders error message when error is provided', () => {
      render(
        <StudentLessonProgressModal
          isOpen={true}
          onClose={jest.fn()}
          data={null}
          error="Falha na conexão"
        />
      );
      expect(
        screen.getByText('Erro ao carregar dados: Falha na conexão')
      ).toBeInTheDocument();
    });

    it('renders modal with error state even when data is null', () => {
      render(
        <StudentLessonProgressModal
          isOpen={true}
          onClose={jest.fn()}
          data={null}
          error="Network error"
        />
      );
      expect(screen.getByText('Desempenho')).toBeInTheDocument();
      expect(
        screen.getByText('Erro ao carregar dados: Network error')
      ).toBeInTheDocument();
    });

    it('does not render when data, loading, and error are all null/false', () => {
      const { container } = render(
        <StudentLessonProgressModal
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
    it('renders dash for null bestResult', () => {
      render(
        <StudentLessonProgressModal
          {...defaultProps}
          data={mockStudentDataWithNullValues}
        />
      );
      const dashes = screen.getAllByText('-');
      expect(dashes.length).toBeGreaterThan(0);
    });

    it('renders 0% for zero completion rate', () => {
      render(
        <StudentLessonProgressModal
          {...defaultProps}
          data={mockStudentDataWithNullValues}
        />
      );
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  describe('Custom Labels', () => {
    it('uses custom title when provided', () => {
      render(
        <StudentLessonProgressModal
          {...defaultProps}
          labels={{
            title: 'Progresso Personalizado',
          }}
        />
      );
      expect(screen.getByText('Progresso Personalizado')).toBeInTheDocument();
    });

    it('uses custom completion rate label when provided', () => {
      render(
        <StudentLessonProgressModal
          {...defaultProps}
          labels={{
            completionRateLabel: 'FINALIZADO',
          }}
        />
      );
      expect(screen.getByText('FINALIZADO')).toBeInTheDocument();
    });

    it('uses custom lesson progress title when provided', () => {
      render(
        <StudentLessonProgressModal
          {...defaultProps}
          labels={{
            lessonProgressTitle: 'Progresso por Módulo',
          }}
        />
      );
      expect(screen.getByText('Progresso por Módulo')).toBeInTheDocument();
    });

    it('uses custom no data message when provided', () => {
      render(
        <StudentLessonProgressModal
          {...defaultProps}
          labels={{
            noDataMessage: 'Aula pendente',
          }}
        />
      );
      expect(screen.getByText('Aula pendente')).toBeInTheDocument();
    });

    it('uses custom error message prefix when provided', () => {
      render(
        <StudentLessonProgressModal
          isOpen={true}
          onClose={jest.fn()}
          data={null}
          error="Connection failed"
          labels={{
            errorMessagePrefix: 'Falha',
          }}
        />
      );
      expect(screen.getByText('Falha: Connection failed')).toBeInTheDocument();
    });

    it('renders error message without prefix when prefix is empty', () => {
      render(
        <StudentLessonProgressModal
          isOpen={true}
          onClose={jest.fn()}
          data={null}
          error="Connection timeout"
          labels={{
            errorMessagePrefix: '',
          }}
        />
      );
      expect(screen.getByText('Connection timeout')).toBeInTheDocument();
    });
  });

  describe('Modal Behavior', () => {
    it('calls onClose when modal is closed', () => {
      const onClose = jest.fn();
      render(
        <StudentLessonProgressModal {...defaultProps} onClose={onClose} />
      );

      const closeButton = screen.getByRole('button', { name: /fechar/i });
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('does not render when isOpen is false', () => {
      render(<StudentLessonProgressModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Desempenho')).not.toBeInTheDocument();
    });
  });

  describe('Flat Data (Topics without nested items)', () => {
    it('renders flat data structure correctly', () => {
      render(
        <StudentLessonProgressModal {...defaultProps} data={mockFlatData} />
      );

      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
      expect(screen.getByText('Números Inteiros')).toBeInTheDocument();
      // "Frações" appears twice: once in bestResult card and once in lesson progress
      expect(screen.getAllByText('Frações').length).toBeGreaterThanOrEqual(1);
      // "Geometria Espacial" appears twice: once in biggestDifficulty card and once in lesson progress
      expect(
        screen.getAllByText('Geometria Espacial').length
      ).toBeGreaterThanOrEqual(1);
    });

    it('renders progress percentages for flat data', () => {
      render(
        <StudentLessonProgressModal {...defaultProps} data={mockFlatData} />
      );

      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('60%')).toBeInTheDocument();
    });

    it('does not show expand arrows for flat items', () => {
      render(
        <StudentLessonProgressModal {...defaultProps} data={mockFlatData} />
      );

      // All items are flat (no subtopics), so buttons should be disabled
      const lessonItems = ['1', '2', '3'].map((id) =>
        screen.getByTestId(`lesson-item-${id}`)
      );

      lessonItems.forEach((item) => {
        const button = item.querySelector('button');
        expect(button).toHaveAttribute('disabled');
      });
    });
  });

  describe('Highlight Cards', () => {
    it('renders best result card with success variant', () => {
      render(<StudentLessonProgressModal {...defaultProps} />);
      expect(screen.getByText('MELHOR RESULTADO')).toBeInTheDocument();
      expect(screen.getByText('Fotossíntese')).toBeInTheDocument();
    });

    it('renders biggest difficulty card with error variant', () => {
      render(<StudentLessonProgressModal {...defaultProps} />);
      expect(screen.getByText('MAIOR DIFICULDADE')).toBeInTheDocument();
      expect(screen.getByText('Células')).toBeInTheDocument();
    });
  });

  describe('Progress Circle', () => {
    it('renders progress circle with correct percentage', () => {
      render(<StudentLessonProgressModal {...defaultProps} />);
      // Progress circle shows 90% for mockStudentData
      expect(screen.getByText('90%')).toBeInTheDocument();
    });

    it('renders progress circle with zero for empty data', () => {
      render(
        <StudentLessonProgressModal
          {...defaultProps}
          data={mockStudentDataWithNullValues}
        />
      );
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  describe('Exportação', () => {
    /** Título que a aba carrega antes de qualquer impressão. */
    const APP_TITLE = 'Analytica';

    /** Data fixa, para o nome do arquivo ser um literal e não um cálculo. */
    const FIXED_NOW = new Date(2026, 7, 20, 10, 30);

    /** Nome esperado do arquivo, sem extensão, nos dois formatos. */
    const EXPECTED_FILE_NAME = 'conclusao-aulas-20-08-2026';

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
      render(<StudentLessonProgressModal {...defaultProps} />);

      expect(
        screen.queryByText('Como deseja baixar o relatório?')
      ).not.toBeInTheDocument();

      openFormatChooser();

      expect(screen.getByRole('button', { name: 'PDF' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Excel' })).toBeInTheDocument();
    });

    it('imprime o modal no caminho PDF, com o nome do arquivo do dia, e NÃO gera Excel', () => {
      const snapshots = captureDuringPrint();

      render(<StudentLessonProgressModal {...defaultProps} />);

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
      render(<StudentLessonProgressModal {...defaultProps} />);

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
      render(<StudentLessonProgressModal {...defaultProps} />);

      openFormatChooser();
      chooseFormatAndConfirm('Excel');

      const [, sheets] = downloadExcelMock.mock.calls[0];

      expect(sheets.map((sheet) => sheet.name)).toEqual([
        'Resumo do estudante',
        'Conclusão das aulas',
      ]);
      expect(sheets[0].rows).toEqual([
        ['Estudante', 'Lucas Oliveira'],
        ['CONCLUÍDO', 90],
        ['MELHOR RESULTADO', 'Fotossíntese'],
        ['MAIOR DIFICULDADE', 'Células'],
      ]);
      // Os três níveis do acordeão, na ordem em que a tela os empilha.
      expect(sheets[1]).toEqual({
        name: 'Conclusão das aulas',
        headers: ['Tópico', 'Subtópico', 'Aula', 'Progresso (%)'],
        rows: [
          ['Cinemática', '', '', 70],
          ['', 'Aspectos iniciais', '', 70],
          ['', '', 'Fundamentos do Movimento Uniforme', 70],
          ['', 'Movimento uniforme', '', 70],
          ['Grandezas físicas', '', '', 'Sem dados ainda!'],
          ['Mecânica', '', '', 100],
        ],
      });
    });

    it('a planilha usa os rótulos customizados que a tela recebeu', () => {
      render(
        <StudentLessonProgressModal
          {...defaultProps}
          labels={{ completionRateLabel: 'AULAS VISTAS' }}
        />
      );

      openFormatChooser();
      chooseFormatAndConfirm('Excel');

      const [, sheets] = downloadExcelMock.mock.calls[0];
      expect(sheets[0].rows).toContainEqual(['AULAS VISTAS', 90]);
    });

    it('sem dado carregado, a planilha sai com as abas vazias e sem estourar', () => {
      render(
        <StudentLessonProgressModal
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
        'Resumo do estudante',
        'Conclusão das aulas',
      ]);
      expect(sheets.map((sheet) => sheet.rows)).toEqual([[], []]);
    });

    it('marca o <dialog> como região de impressão e preserva largura e altura', () => {
      render(<StudentLessonProgressModal {...defaultProps} />);

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
      render(<StudentLessonProgressModal {...defaultProps} />);

      const button = screen.getByTestId('report-detail-download-btn');

      expect(button.parentElement).toHaveAttribute('data-print-hide');
      expect(screen.getByText('Lucas Oliveira')).not.toHaveAttribute(
        'data-print-hide'
      );
    });

    it('nenhum controle dentro da região impressa fica sem data-print-hide', () => {
      render(<StudentLessonProgressModal {...defaultProps} />);

      // Escondidos: o "X" de fechar, do `Modal` base, e o "Baixar relatório",
      // do `ReportDetailModal`.
      //
      // Impressos: as cinco linhas da árvore de aulas. Cada linha É um
      // `<button>` — três tópicos e dois subtópicos —, e o texto delas é o nome
      // e o percentual, ou seja, o conteúdo do relatório. Escondê-las apagaria a
      // árvore inteira do PDF.
      //
      // O seletor tem duas partes porque a linha só ganha `aria-expanded` quando
      // tem filhos (`hasChildren ? isExpanded : undefined`); as folhas saem
      // `disabled`, sem o atributo. `button:disabled` é declarado AQUI e não
      // embutido no helper de propósito: um "Baixar relatório" desabilitado
      // durante o download continua sendo controle e tem de ficar fora do papel.
      expectPrintRegionControlsHidden(2, {
        selector: '[aria-expanded], button:disabled',
        count: 5,
      });
    });

    it('não oferece download quando não há dado, carregamento nem erro', () => {
      render(
        <StudentLessonProgressModal isOpen onClose={jest.fn()} data={null} />
      );

      expect(
        screen.queryByTestId('report-detail-download-btn')
      ).not.toBeInTheDocument();
    });
  });
});
