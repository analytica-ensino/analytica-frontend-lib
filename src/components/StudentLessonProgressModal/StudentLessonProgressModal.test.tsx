import { render, screen, fireEvent } from '@testing-library/react';
import { StudentLessonProgressModal } from './StudentLessonProgressModal';
import type {
  StudentLessonProgressData,
  TopicProgressItem,
  SubtopicProgressItem,
  ContentProgressItem,
} from './types';

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
});
