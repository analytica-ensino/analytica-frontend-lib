import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  PerformanceReportModal,
  PerformanceReportModalVariant,
  type UserPerformanceStudentData,
  type UserPerformanceProfessionalData,
  type UserPerformanceQuestionStats,
} from './PerformanceReportModal';

// ─── Mock data ────────────────────────────────────────────────

const mockStats: UserPerformanceQuestionStats = {
  totalAnswered: 70,
  correctQuestions: 50,
  correctPercentage: 62.5,
  incorrectQuestions: 20,
  incorrectPercentage: 25,
  blankQuestions: 10,
  blankPercentage: 12.5,
  performanceTag: 'Abaixo da média',
};

const mockStudentData: UserPerformanceStudentData = {
  user: { id: 'user-1', name: 'João Silva' },
  school: { schoolId: 'school-1', schoolName: 'Escola Municipal São Paulo' },
  class: { classId: 'class-1', className: '9A' },
  schoolYear: { schoolYearId: 'sy-1', schoolYearName: '9º Ano' },
  status: 'Abaixo da média',
  generalStats: mockStats,
  activityStats: mockStats,
  questionnaireStats: mockStats,
  simulationStats: mockStats,
  downloadedLessons: [
    { lessonId: 'l1', lessonName: 'Matemática: Frações', bnccCode: 'EF09MA01' },
    { lessonId: 'l2', lessonName: 'Português: Redação', bnccCode: null },
  ],
};

const mockProfessionalData: UserPerformanceProfessionalData = {
  generalStats: {
    totalMaterialProduced: 30,
    totalRecommendedLessons: 18,
    recommendedLessonsPercentage: 60,
    totalActivities: 12,
    activitiesPercentage: 40,
  },
};

// ─── Tests ───────────────────────────────────────────────────

describe('PerformanceReportModal', () => {
  describe('Closed modal', () => {
    it('should not render when isOpen is false', () => {
      render(
        <PerformanceReportModal
          isOpen={false}
          onClose={() => {}}
          variant={PerformanceReportModalVariant.STUDENT}
          data={mockStudentData}
        />
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Modal title', () => {
    it('should render default title', () => {
      render(
        <PerformanceReportModal
          isOpen={true}
          onClose={() => {}}
          variant={PerformanceReportModalVariant.STUDENT}
          data={mockStudentData}
        />
      );
      expect(screen.getByText('Desempenho em 1 ano')).toBeInTheDocument();
    });

    it('should render custom title', () => {
      render(
        <PerformanceReportModal
          isOpen={true}
          onClose={() => {}}
          variant={PerformanceReportModalVariant.STUDENT}
          data={mockStudentData}
          title="Desempenho em 6 meses"
        />
      );
      expect(screen.getByText('Desempenho em 6 meses')).toBeInTheDocument();
    });
  });

  describe('Student variant', () => {
    it('should render user name and context info', () => {
      render(
        <PerformanceReportModal
          isOpen={true}
          onClose={() => {}}
          variant={PerformanceReportModalVariant.STUDENT}
          data={mockStudentData}
        />
      );
      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(
        screen.getByText(/Escola Municipal São Paulo/)
      ).toBeInTheDocument();
      expect(screen.getByText(/9A/)).toBeInTheDocument();
      expect(screen.getByText(/9º Ano/)).toBeInTheDocument();
    });

    it('should render status badge with uppercased label', () => {
      render(
        <PerformanceReportModal
          isOpen={true}
          onClose={() => {}}
          variant={PerformanceReportModalVariant.STUDENT}
          data={mockStudentData}
        />
      );
      expect(screen.getByText('ABAIXO DA MÉDIA')).toBeInTheDocument();
    });

    it('should render all four section titles', () => {
      render(
        <PerformanceReportModal
          isOpen={true}
          onClose={() => {}}
          variant={PerformanceReportModalVariant.STUDENT}
          data={mockStudentData}
        />
      );
      expect(screen.getByText('Dados gerais')).toBeInTheDocument();
      expect(screen.getByText('Dados de atividades')).toBeInTheDocument();
      expect(screen.getByText('Dados de questionários')).toBeInTheDocument();
      expect(screen.getByText('Dados de simulados')).toBeInTheDocument();
    });

    it('should display total as correct + incorrect + blank, not totalAnswered', () => {
      render(
        <PerformanceReportModal
          isOpen={true}
          onClose={() => {}}
          variant={PerformanceReportModalVariant.STUDENT}
          data={mockStudentData}
        />
      );
      // displayTotal = 50 + 20 + 10 = 80, not totalAnswered (70)
      const totals = screen.getAllByText('80');
      expect(totals.length).toBeGreaterThan(0);
      expect(screen.queryByText('70')).not.toBeInTheDocument();
    });

    it('should render downloaded lessons table with header', () => {
      render(
        <PerformanceReportModal
          isOpen={true}
          onClose={() => {}}
          variant={PerformanceReportModalVariant.STUDENT}
          data={mockStudentData}
        />
      );
      expect(screen.getByText('Aulas baixadas')).toBeInTheDocument();
      expect(screen.getByText('Matemática: Frações')).toBeInTheDocument();
      expect(screen.getByText('Português: Redação')).toBeInTheDocument();
    });

    it('should render bnccCode when present', () => {
      render(
        <PerformanceReportModal
          isOpen={true}
          onClose={() => {}}
          variant={PerformanceReportModalVariant.STUDENT}
          data={mockStudentData}
        />
      );
      expect(screen.getByText('EF09MA01')).toBeInTheDocument();
    });

    it('should render "—" when bnccCode is null', () => {
      render(
        <PerformanceReportModal
          isOpen={true}
          onClose={() => {}}
          variant={PerformanceReportModalVariant.STUDENT}
          data={mockStudentData}
        />
      );
      expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('should render "Nenhuma aula baixada" when downloadedLessons is empty', () => {
      render(
        <PerformanceReportModal
          isOpen={true}
          onClose={() => {}}
          variant={PerformanceReportModalVariant.STUDENT}
          data={{ ...mockStudentData, downloadedLessons: [] }}
        />
      );
      expect(screen.getByText('Nenhuma aula baixada')).toBeInTheDocument();
    });

    it('should render getLessonIcon for each lesson when provided', () => {
      render(
        <PerformanceReportModal
          isOpen={true}
          onClose={() => {}}
          variant={PerformanceReportModalVariant.STUDENT}
          data={mockStudentData}
          getLessonIcon={() => <span data-testid="lesson-icon">icon</span>}
        />
      );
      expect(screen.getAllByTestId('lesson-icon')).toHaveLength(
        mockStudentData.downloadedLessons.length
      );
    });
  });

  describe('Professional variant', () => {
    it('should render section title and total material produced', () => {
      render(
        <PerformanceReportModal
          isOpen={true}
          onClose={() => {}}
          variant={PerformanceReportModalVariant.PROFESSIONAL}
          data={mockProfessionalData}
        />
      );
      expect(screen.getByText('Dados gerais')).toBeInTheDocument();
      expect(
        screen.getByText('Total de material produzido')
      ).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
    });

    it('should render legend labels for material slices', () => {
      render(
        <PerformanceReportModal
          isOpen={true}
          onClose={() => {}}
          variant={PerformanceReportModalVariant.PROFESSIONAL}
          data={mockProfessionalData}
        />
      );
      expect(screen.getByText('Aulas recomendadas')).toBeInTheDocument();
      expect(screen.getByText('Atividades')).toBeInTheDocument();
    });

    it('should render user header when professionalUserInfo is provided', () => {
      render(
        <PerformanceReportModal
          isOpen={true}
          onClose={() => {}}
          variant={PerformanceReportModalVariant.PROFESSIONAL}
          data={mockProfessionalData}
          professionalUserInfo={{
            userName: 'Maria Souza',
            schoolName: 'Escola Estadual Paraná',
            className: 'Turma B',
            year: '2024',
          }}
        />
      );
      expect(screen.getByText('Maria Souza')).toBeInTheDocument();
      expect(screen.getByText(/Escola Estadual Paraná/)).toBeInTheDocument();
    });

    it('should not render user header when professionalUserInfo is absent', () => {
      render(
        <PerformanceReportModal
          isOpen={true}
          onClose={() => {}}
          variant={PerformanceReportModalVariant.PROFESSIONAL}
          data={mockProfessionalData}
        />
      );
      expect(screen.queryByText('Maria Souza')).not.toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    it('should render loading skeleton when loading is true', () => {
      const { container } = render(
        <PerformanceReportModal
          isOpen={true}
          onClose={() => {}}
          variant={PerformanceReportModalVariant.STUDENT}
          data={null}
          loading={true}
        />
      );
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('should not render data content while loading', () => {
      render(
        <PerformanceReportModal
          isOpen={true}
          onClose={() => {}}
          variant={PerformanceReportModalVariant.STUDENT}
          data={mockStudentData}
          loading={true}
        />
      );
      expect(screen.queryByText('João Silva')).not.toBeInTheDocument();
    });
  });

  describe('Error state', () => {
    it('should render error message when error is provided', () => {
      render(
        <PerformanceReportModal
          isOpen={true}
          onClose={() => {}}
          variant={PerformanceReportModalVariant.STUDENT}
          data={null}
          error="Não foi possível carregar os dados."
        />
      );
      expect(
        screen.getByText('Não foi possível carregar os dados.')
      ).toBeInTheDocument();
    });

    it('should not render data content when error is set', () => {
      render(
        <PerformanceReportModal
          isOpen={true}
          onClose={() => {}}
          variant={PerformanceReportModalVariant.STUDENT}
          data={mockStudentData}
          error="Erro de conexão"
        />
      );
      expect(screen.queryByText('João Silva')).not.toBeInTheDocument();
    });
  });

  describe('Null data', () => {
    it('should render empty modal when data is null and not loading', () => {
      render(
        <PerformanceReportModal
          isOpen={true}
          onClose={() => {}}
          variant={PerformanceReportModalVariant.STUDENT}
          data={null}
        />
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.queryByText('Dados gerais')).not.toBeInTheDocument();
    });
  });

  describe('Close button', () => {
    it('should call onClose when close button is clicked', () => {
      const onClose = jest.fn();
      render(
        <PerformanceReportModal
          isOpen={true}
          onClose={onClose}
          variant={PerformanceReportModalVariant.STUDENT}
          data={mockStudentData}
        />
      );
      fireEvent.click(screen.getByLabelText('Fechar modal'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Status badge variants', () => {
    it.each([
      ['Destaque da turma', 'DESTAQUE DA TURMA'],
      ['Acima da média', 'ACIMA DA MÉDIA'],
      ['Abaixo da média', 'ABAIXO DA MÉDIA'],
      ['Ponto de atenção', 'PONTO DE ATENÇÃO'],
    ])('should render badge for status "%s"', (status, badgeText) => {
      render(
        <PerformanceReportModal
          isOpen={true}
          onClose={() => {}}
          variant={PerformanceReportModalVariant.STUDENT}
          data={{ ...mockStudentData, status }}
        />
      );
      expect(screen.getByText(badgeText)).toBeInTheDocument();
    });
  });

  describe('Pie chart', () => {
    it('should render SVG elements for question stats', () => {
      const { container } = render(
        <PerformanceReportModal
          isOpen={true}
          onClose={() => {}}
          variant={PerformanceReportModalVariant.STUDENT}
          data={mockStudentData}
        />
      );
      const svgs = container.querySelectorAll('svg[aria-hidden="true"]');
      expect(svgs.length).toBeGreaterThan(0);
    });

    it('should render fallback circle when all slice values are zero', () => {
      const zeroStats: UserPerformanceQuestionStats = {
        ...mockStats,
        correctQuestions: 0,
        incorrectQuestions: 0,
        blankQuestions: 0,
        totalAnswered: 0,
      };
      const { container } = render(
        <PerformanceReportModal
          isOpen={true}
          onClose={() => {}}
          variant={PerformanceReportModalVariant.STUDENT}
          data={{
            ...mockStudentData,
            generalStats: zeroStats,
            activityStats: zeroStats,
            questionnaireStats: zeroStats,
            simulationStats: zeroStats,
          }}
        />
      );
      const fallbackCircles = container.querySelectorAll(
        '.fill-background-200'
      );
      expect(fallbackCircles.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have aria-modal on the dialog element', () => {
      render(
        <PerformanceReportModal
          isOpen={true}
          onClose={() => {}}
          variant={PerformanceReportModalVariant.STUDENT}
          data={mockStudentData}
        />
      );
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('should have accessible label on close button', () => {
      render(
        <PerformanceReportModal
          isOpen={true}
          onClose={() => {}}
          variant={PerformanceReportModalVariant.STUDENT}
          data={mockStudentData}
        />
      );
      expect(screen.getByLabelText('Fechar modal')).toBeInTheDocument();
    });
  });
});
