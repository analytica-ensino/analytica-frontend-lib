import { render, screen, fireEvent } from '@testing-library/react';
import { StudentPerformanceModal } from './StudentPerformanceModal';
import type { StudentPerformanceData, LessonProgress } from '../types';

// Mock data for tests (Biology - Categorias Taxonômicas)
const mockLessonWithQuestions: LessonProgress = {
  id: 'lesson-1',
  title: 'Categorias Taxonômicas',
  progress: 50,
  questions: [
    {
      id: 'q1',
      answerId: 'answer-1',
      activityId: 'activity-1',
      title: 'Questão 1',
      statement:
        'Qual é a sequência correta das categorias taxonômicas, da mais ampla para a mais específica?',
      questionType: 'MULTIPLA_ESCOLHA',
      isCorrect: true,
      teacherFeedback: null,
      alternatives: [
        {
          id: 'a1',
          text: 'Espécie, Gênero, Família, Ordem',
          isCorrect: false,
          isSelected: false,
        },
        {
          id: 'a2',
          text: 'Reino, Filo, Classe, Ordem, Família, Gênero, Espécie',
          isCorrect: true,
          isSelected: true,
        },
        {
          id: 'a3',
          text: 'Filo, Reino, Classe, Ordem',
          isCorrect: false,
          isSelected: false,
        },
      ],
    },
    {
      id: 'q2',
      answerId: 'answer-2',
      activityId: 'activity-1',
      title: 'Questão 2',
      statement: 'Qual categoria taxonômica agrupa espécies semelhantes?',
      questionType: 'MULTIPLA_ESCOLHA',
      isCorrect: false,
      teacherFeedback: null,
      alternatives: [
        {
          id: 'b1',
          text: 'Família',
          isCorrect: false,
          isSelected: true,
        },
        {
          id: 'b2',
          text: 'Gênero',
          isCorrect: true,
          isSelected: false,
        },
      ],
    },
  ],
};

const mockLessonWithoutQuestions: LessonProgress = {
  id: 'lesson-2',
  title: 'Reino Animal',
  progress: 80,
  questions: [],
};

const mockStudentData: StudentPerformanceData = {
  studentName: 'Lucas Oliveira',
  correctAnswers: 8,
  incorrectAnswers: 2,
  bestResult: 'Sistema Binomial',
  hardestTopic: 'Hierarquia Taxonômica',
  lessons: [mockLessonWithQuestions, mockLessonWithoutQuestions],
};

const mockStudentDataWithNullValues: StudentPerformanceData = {
  studentName: 'Ana Costa',
  correctAnswers: 5,
  incorrectAnswers: 3,
  bestResult: null,
  hardestTopic: null,
  lessons: [],
};

describe('StudentPerformanceModal', () => {
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
        <StudentPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={null}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders modal when data is provided', () => {
      render(<StudentPerformanceModal {...defaultProps} />);
      expect(screen.getByText('Desempenho')).toBeInTheDocument();
    });

    it('renders student name', () => {
      render(<StudentPerformanceModal {...defaultProps} />);
      expect(screen.getByText('Lucas Oliveira')).toBeInTheDocument();
    });

    it('renders correct answers count', () => {
      render(<StudentPerformanceModal {...defaultProps} />);
      expect(screen.getByText('8')).toBeInTheDocument();
    });

    it('renders incorrect answers count', () => {
      render(<StudentPerformanceModal {...defaultProps} />);
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('renders best result topic', () => {
      render(<StudentPerformanceModal {...defaultProps} />);
      expect(screen.getByText('Sistema Binomial')).toBeInTheDocument();
    });

    it('renders hardest topic', () => {
      render(<StudentPerformanceModal {...defaultProps} />);
      expect(screen.getByText('Hierarquia Taxonômica')).toBeInTheDocument();
    });

    it('renders lessons section title', () => {
      render(<StudentPerformanceModal {...defaultProps} />);
      expect(screen.getByText('Aulas')).toBeInTheDocument();
    });

    it('renders lesson titles', () => {
      render(<StudentPerformanceModal {...defaultProps} />);
      expect(screen.getByText('Categorias Taxonômicas')).toBeInTheDocument();
      expect(screen.getByText('Reino Animal')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('renders loading skeleton when loading is true', () => {
      render(
        <StudentPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={null}
          loading={true}
        />
      );
      expect(screen.getByText('Desempenho')).toBeInTheDocument();
      // Check for skeleton elements
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders modal with loading state even when data is null', () => {
      render(
        <StudentPerformanceModal
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
        <StudentPerformanceModal
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
        <StudentPerformanceModal
          isOpen={true}
          onClose={jest.fn()}
          data={null}
          error="Network error"
        />
      );
      expect(screen.getByText('Desempenho')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    it('does not render when data, loading, and error are all null/false', () => {
      const { container } = render(
        <StudentPerformanceModal
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
        <StudentPerformanceModal
          {...defaultProps}
          data={mockStudentDataWithNullValues}
        />
      );
      const dashes = screen.getAllByText('-');
      expect(dashes.length).toBeGreaterThan(0);
    });

    it('does not render lessons section when lessons array is empty', () => {
      render(
        <StudentPerformanceModal
          {...defaultProps}
          data={mockStudentDataWithNullValues}
        />
      );
      expect(screen.queryByText('Aulas')).not.toBeInTheDocument();
    });
  });

  describe('Custom Labels', () => {
    it('uses custom labels when provided', () => {
      render(
        <StudentPerformanceModal
          {...defaultProps}
          labels={{
            title: 'Custom Title',
            lessonsTitle: 'Custom Lessons',
          }}
        />
      );
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.getByText('Custom Lessons')).toBeInTheDocument();
    });
  });

  describe('Modal Behavior', () => {
    it('calls onClose when modal is closed', () => {
      const onClose = jest.fn();
      render(<StudentPerformanceModal {...defaultProps} onClose={onClose} />);

      // Find and click the close button (usually an X or close icon)
      const closeButton = screen.getByRole('button', { name: /fechar/i });
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('does not render when isOpen is false', () => {
      render(<StudentPerformanceModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Desempenho')).not.toBeInTheDocument();
    });
  });

  describe('Accordion Functionality', () => {
    it('renders lesson accordion items', () => {
      render(<StudentPerformanceModal {...defaultProps} />);

      // Both lessons should be visible as accordion triggers
      expect(screen.getByText('Categorias Taxonômicas')).toBeInTheDocument();
      expect(screen.getByText('Reino Animal')).toBeInTheDocument();
    });

    it('expands lesson accordion to show questions', () => {
      render(<StudentPerformanceModal {...defaultProps} />);

      // Click on the first lesson to expand
      const lessonAccordion = screen.getByText('Categorias Taxonômicas');
      fireEvent.click(lessonAccordion);

      // Questions should now be visible
      expect(screen.getByText('Questão 1')).toBeInTheDocument();
      expect(screen.getByText('Questão 2')).toBeInTheDocument();
    });

    it('shows correct badge for correct questions', () => {
      render(<StudentPerformanceModal {...defaultProps} />);

      // Expand the lesson
      const lessonAccordion = screen.getByText('Categorias Taxonômicas');
      fireEvent.click(lessonAccordion);

      expect(screen.getByText('Correta')).toBeInTheDocument();
    });

    it('shows incorrect badge for incorrect questions', () => {
      render(<StudentPerformanceModal {...defaultProps} />);

      // Expand the lesson
      const lessonAccordion = screen.getByText('Categorias Taxonômicas');
      fireEvent.click(lessonAccordion);

      expect(screen.getByText('Incorreta')).toBeInTheDocument();
    });

    it('expands question to show statement', () => {
      render(<StudentPerformanceModal {...defaultProps} />);

      // Expand the lesson first
      const lessonAccordion = screen.getByText('Categorias Taxonômicas');
      fireEvent.click(lessonAccordion);

      // Expand the question
      const questionAccordion = screen.getByText('Questão 1');
      fireEvent.click(questionAccordion);

      // Statement should be visible
      expect(
        screen.getByText(
          'Qual é a sequência correta das categorias taxonômicas, da mais ampla para a mais específica?'
        )
      ).toBeInTheDocument();
    });

    it('shows alternatives accordion inside question', () => {
      render(<StudentPerformanceModal {...defaultProps} />);

      // Expand lesson and question
      fireEvent.click(screen.getByText('Categorias Taxonômicas'));
      fireEvent.click(screen.getByText('Questão 1'));

      // Alternatives accordions should be visible (one for each question)
      const alternativesElements = screen.getAllByText('Alternativas');
      expect(alternativesElements.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Cards', () => {
    it('renders correct answers card with success variant', () => {
      render(<StudentPerformanceModal {...defaultProps} />);

      expect(screen.getByText('N° DE QUESTÕES CORRETAS')).toBeInTheDocument();
      expect(screen.getByText('MELHOR RESULTADO')).toBeInTheDocument();
    });

    it('renders incorrect answers card with error variant', () => {
      render(<StudentPerformanceModal {...defaultProps} />);

      expect(screen.getByText('N° DE QUESTÕES INCORRETAS')).toBeInTheDocument();
      expect(screen.getByText('MAIOR DIFICULDADE')).toBeInTheDocument();
    });
  });

  describe('Progress Bar', () => {
    it('renders progress bar with percentage for lessons', () => {
      render(<StudentPerformanceModal {...defaultProps} />);

      // Progress bars show percentage text (50% and 80% from mock data)
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getByText('80%')).toBeInTheDocument();
    });
  });
});
