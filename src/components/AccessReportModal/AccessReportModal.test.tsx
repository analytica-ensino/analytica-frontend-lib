import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  AccessReportModal,
  AccessReportModalVariant,
  type AccessReportStudentData,
  type AccessReportProfessionalData,
} from './AccessReportModal';

// ─── Mock data ────────────────────────────────────────────────

const mockStudentData: AccessReportStudentData = {
  user: {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'João Silva',
    profileType: 'STUDENT',
    school: 'Escola Municipal São Paulo',
    group: 'NRE Centro',
    class: '9A',
    year: 2026,
  },
  accessData: {
    totalTime: '42h15min',
    activitiesTime: '15h00min',
    contentTime: '10h30min',
    recommendedLessonsTime: '8h00min',
    simulationsTime: '5h45min',
    questionnairesTime: '3h00min',
    accessCount: 87,
    lastAccess: '27/02/2026',
  },
  accessByPlatform: {
    web: { time: '27h30min', percentage: 65 },
    mobile: { time: '14h45min', percentage: 35 },
  },
  hoursByItem: {
    activities: { time: '20h00min', percentage: 47 },
    content: { time: '10h00min', percentage: 24 },
    simulations: { time: '8h00min', percentage: 19 },
    questionnaires: { time: '4h15min', percentage: 10 },
  },
};

const mockProfessionalData: AccessReportProfessionalData = {
  user: {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Maria Souza',
    profileType: 'TEACHER',
    school: 'Escola Estadual Paraná',
    group: 'NRE Sul',
    class: 'Turma B',
    year: 2026,
  },
  accessData: {
    totalTime: '18h30min',
    activitiesTime: '12h00min',
    recommendedLessonsTime: '6h30min',
    accessCount: 45,
    lastAccess: '26/02/2026',
  },
  accessByPlatform: {
    web: { time: '14h50min', percentage: 80 },
    mobile: { time: '3h40min', percentage: 20 },
  },
  hoursByItem: {
    activities: { time: '12h00min', percentage: 67 },
    recommendedLessons: { time: '6h30min', percentage: 33 },
  },
};

// ─── Tests ───────────────────────────────────────────────────

describe('AccessReportModal', () => {
  describe('Closed modal', () => {
    it('should not render when isOpen is false', () => {
      render(
        <AccessReportModal
          isOpen={false}
          onClose={() => {}}
          variant={AccessReportModalVariant.STUDENT}
          data={mockStudentData}
        />
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Modal title', () => {
    it('should render default title', () => {
      render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.STUDENT}
          data={mockStudentData}
        />
      );
      expect(screen.getByText('Relatório de acesso')).toBeInTheDocument();
    });

    it('should render custom title', () => {
      render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.STUDENT}
          data={mockStudentData}
          title="Relatório de acesso — Março 2026"
        />
      );
      expect(
        screen.getByText('Relatório de acesso — Março 2026')
      ).toBeInTheDocument();
    });
  });

  describe('Student variant', () => {
    it('should render all 6 metric labels', () => {
      render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.STUDENT}
          data={mockStudentData}
        />
      );
      expect(screen.getByText('Tempo total')).toBeInTheDocument();
      expect(screen.getAllByText('Videoaulas').length).toBeGreaterThan(0);
      expect(screen.getByText('Aulas recomendadas')).toBeInTheDocument();
      expect(screen.getAllByText('Simulados').length).toBeGreaterThan(0);
      expect(screen.getByText('Quantidade de acessos')).toBeInTheDocument();
      expect(screen.getByText('Último acesso')).toBeInTheDocument();
    });

    it('should render metric values from data', () => {
      render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.STUDENT}
          data={mockStudentData}
        />
      );
      expect(screen.getByText('42h15min')).toBeInTheDocument();
      expect(screen.getByText('10h30min')).toBeInTheDocument();
      expect(screen.getByText('87')).toBeInTheDocument();
      expect(screen.getByText('27/02/2026')).toBeInTheDocument();
    });

    it('should render user header from data.user', () => {
      render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.STUDENT}
          data={mockStudentData}
        />
      );
      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(
        screen.getByText(/Escola Municipal São Paulo/)
      ).toBeInTheDocument();
      expect(screen.getByText(/9A/)).toBeInTheDocument();
    });

    it('should render platform section title and legend labels', () => {
      render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.STUDENT}
          data={mockStudentData}
        />
      );
      expect(
        screen.getByText('Dados de acesso por plataforma')
      ).toBeInTheDocument();
      expect(screen.getByText('Web')).toBeInTheDocument();
      expect(screen.getByText('Celular')).toBeInTheDocument();
    });

    it('should render hours by item section title and legend labels', () => {
      render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.STUDENT}
          data={mockStudentData}
        />
      );
      expect(screen.getByText('Dados de horas por item')).toBeInTheDocument();
      expect(screen.getAllByText('Atividades').length).toBeGreaterThan(0);
      expect(screen.getByText('Questionários das Videoaulas')).toBeInTheDocument();
    });

    it('should render SVG pie charts', () => {
      const { container } = render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.STUDENT}
          data={mockStudentData}
        />
      );
      const svgs = container.querySelectorAll('svg[aria-hidden="true"]');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  describe('Professional variant', () => {
    it('should render 3 metric labels (simplified for professionals)', () => {
      render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.PROFESSIONAL}
          data={mockProfessionalData}
        />
      );
      // Professional variant shows simplified metrics without activity breakdown
      expect(screen.getByText('Tempo na plataforma')).toBeInTheDocument();
      expect(screen.getByText('Quantidade de acessos')).toBeInTheDocument();
      expect(screen.getByText('Último acesso')).toBeInTheDocument();
    });

    it('should render metric values from data', () => {
      render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.PROFESSIONAL}
          data={mockProfessionalData}
        />
      );
      expect(screen.getByText('18h30min')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();
      expect(screen.getByText('26/02/2026')).toBeInTheDocument();
    });

    it('should render user header from data.user', () => {
      render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.PROFESSIONAL}
          data={mockProfessionalData}
        />
      );
      expect(screen.getByText('Maria Souza')).toBeInTheDocument();
      expect(screen.getByText(/Escola Estadual Paraná/)).toBeInTheDocument();
      expect(screen.getByText(/Turma B/)).toBeInTheDocument();
    });

    it('should render platform section title (no hours breakdown for professionals)', () => {
      render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.PROFESSIONAL}
          data={mockProfessionalData}
        />
      );
      expect(
        screen.getByText('Dados de acesso por plataforma')
      ).toBeInTheDocument();
      // "Dados de horas por item" section is not shown for professional variant
    });

    it('should NOT render "Dados de horas por item" section for professional variant', () => {
      render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.PROFESSIONAL}
          data={mockProfessionalData}
        />
      );
      expect(
        screen.queryByText('Dados de horas por item')
      ).not.toBeInTheDocument();
    });

    it('should render only 1 pie chart for professional variant', () => {
      const { container } = render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.PROFESSIONAL}
          data={mockProfessionalData}
        />
      );
      // Only the platform pie chart should be rendered
      const pieCharts = container.querySelectorAll('svg[aria-hidden="true"]');
      expect(pieCharts).toHaveLength(1);
    });
  });

  describe('Loading state', () => {
    it('should render loading skeleton when loading is true', () => {
      const { container } = render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.STUDENT}
          data={null}
          loading={true}
        />
      );
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('should not render data content while loading', () => {
      render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.STUDENT}
          data={mockStudentData}
          loading={true}
        />
      );
      expect(screen.queryByText('42h15min')).not.toBeInTheDocument();
    });

    it('should render 6 metric box skeletons for student variant', () => {
      const { container } = render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.STUDENT}
          data={null}
          loading={true}
        />
      );
      const skeletonBoxes = container.querySelectorAll(
        '.animate-pulse .h-16.bg-background-200.rounded-xl'
      );
      expect(skeletonBoxes).toHaveLength(6);
    });

    it('should render 3 metric box skeletons for professional variant', () => {
      const { container } = render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.PROFESSIONAL}
          data={null}
          loading={true}
        />
      );
      const skeletonBoxes = container.querySelectorAll(
        '.animate-pulse .h-16.bg-background-200.rounded-xl'
      );
      expect(skeletonBoxes).toHaveLength(3);
    });

    it('should render 2 chart skeletons for student variant (platform + hours)', () => {
      const { container } = render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.STUDENT}
          data={null}
          loading={true}
        />
      );
      const chartSkeletons = container.querySelectorAll(
        '.animate-pulse .h-32.bg-background-200.rounded-xl'
      );
      expect(chartSkeletons).toHaveLength(2);
    });

    it('should render 1 chart skeleton for professional variant (platform only)', () => {
      const { container } = render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.PROFESSIONAL}
          data={null}
          loading={true}
        />
      );
      const chartSkeletons = container.querySelectorAll(
        '.animate-pulse .h-32.bg-background-200.rounded-xl'
      );
      expect(chartSkeletons).toHaveLength(1);
    });
  });

  describe('Error state', () => {
    it('should render error message when error is provided', () => {
      render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.STUDENT}
          data={null}
          error="Não foi possível carregar os dados de acesso."
        />
      );
      expect(
        screen.getByText('Não foi possível carregar os dados de acesso.')
      ).toBeInTheDocument();
    });

    it('should not render data content when error is set', () => {
      render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.STUDENT}
          data={mockStudentData}
          error="Erro de conexão"
        />
      );
      expect(screen.queryByText('42h15min')).not.toBeInTheDocument();
    });
  });

  describe('Null data', () => {
    it('should render empty state message when data is null and not loading', () => {
      render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.STUDENT}
          data={null}
        />
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Nenhum dado disponível.')).toBeInTheDocument();
    });
  });

  describe('Null lastAccess', () => {
    it('should render fallback when lastAccess is null', () => {
      const dataWithNullLastAccess: AccessReportStudentData = {
        ...mockStudentData,
        accessData: { ...mockStudentData.accessData, lastAccess: null },
      };
      render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.STUDENT}
          data={dataWithNullLastAccess}
        />
      );
      expect(screen.getByText('—')).toBeInTheDocument();
    });
  });

  describe('Close button', () => {
    it('should call onClose when close button is clicked', () => {
      const onClose = jest.fn();
      render(
        <AccessReportModal
          isOpen={true}
          onClose={onClose}
          variant={AccessReportModalVariant.STUDENT}
          data={mockStudentData}
        />
      );
      fireEvent.click(screen.getByLabelText('Fechar modal'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have aria-modal on the dialog element', () => {
      render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.STUDENT}
          data={mockStudentData}
        />
      );
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('should have accessible label on close button', () => {
      render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.STUDENT}
          data={mockStudentData}
        />
      );
      expect(screen.getByLabelText('Fechar modal')).toBeInTheDocument();
    });
  });

  describe('Pie chart fallback', () => {
    it('should render fallback circle when all platform percentages are zero', () => {
      const { container } = render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.STUDENT}
          data={{
            ...mockStudentData,
            accessByPlatform: {
              web: { time: '0h00min', percentage: 0 },
              mobile: { time: '0h00min', percentage: 0 },
            },
          }}
        />
      );
      expect(
        container.querySelector('.fill-background-200')
      ).toBeInTheDocument();
    });
  });
});
