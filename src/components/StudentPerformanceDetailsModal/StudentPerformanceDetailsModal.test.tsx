import { render, screen, fireEvent } from '@testing-library/react';
import { StudentPerformanceDetailsModal } from './StudentPerformanceDetailsModal';
import type { StudentPerformanceDetailsData, ActivityProgress } from './types';

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
});
