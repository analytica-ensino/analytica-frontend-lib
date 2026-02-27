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
  totalTime: '42h15min',
  content: 18,
  recommendedLessons: 12,
  simulations: 5,
  accessCount: 87,
  lastAccess: '27/02/2026',
  platformAccess: { web: 65, mobile: 35 },
  hoursByItem: {
    activities: 20,
    content: 10,
    simulations: 8,
    questionnaires: 4,
  },
};

const mockProfessionalData: AccessReportProfessionalData = {
  totalTime: '18h30min',
  activities: 24,
  recommendedLessons: 10,
  accessCount: 45,
  lastAccess: '26/02/2026',
  platformAccess: { web: 80, mobile: 20 },
  hoursByItem: { activities: 12, recommendedLessons: 6 },
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
      // "Conteúdo" appears in MetricBox label and pie chart legend
      expect(screen.getAllByText('Conteúdo').length).toBeGreaterThan(0);
      expect(screen.getByText('Aulas recomendadas')).toBeInTheDocument();
      // "Simulados" appears in MetricBox label and pie chart legend
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
      expect(screen.getByText('18')).toBeInTheDocument();
      expect(screen.getByText('87')).toBeInTheDocument();
      expect(screen.getByText('27/02/2026')).toBeInTheDocument();
    });

    it('should render user header when studentUserInfo is provided', () => {
      render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.STUDENT}
          data={mockStudentData}
          studentUserInfo={{
            userName: 'João Silva',
            schoolName: 'Escola Municipal São Paulo',
            className: '9A',
            year: '9º Ano',
          }}
        />
      );
      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(
        screen.getByText(/Escola Municipal São Paulo/)
      ).toBeInTheDocument();
      expect(screen.getByText(/9A/)).toBeInTheDocument();
    });

    it('should not render user header when studentUserInfo is absent', () => {
      render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.STUDENT}
          data={mockStudentData}
        />
      );
      expect(screen.queryByText('João Silva')).not.toBeInTheDocument();
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
      expect(screen.getByText('Plataforma de acesso')).toBeInTheDocument();
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
      expect(screen.getByText('Horas por item')).toBeInTheDocument();
      expect(screen.getAllByText('Atividades').length).toBeGreaterThan(0);
      expect(screen.getByText('Questionários')).toBeInTheDocument();
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
    it('should render all 5 metric labels', () => {
      render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.PROFESSIONAL}
          data={mockProfessionalData}
        />
      );
      expect(screen.getByText('Tempo total')).toBeInTheDocument();
      // "Atividades" appears in MetricBox label and pie chart legend
      expect(screen.getAllByText('Atividades').length).toBeGreaterThan(0);
      // "Aulas recomendadas" appears in MetricBox label and pie chart legend
      expect(screen.getAllByText('Aulas recomendadas').length).toBeGreaterThan(
        0
      );
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
      expect(screen.getByText('24')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();
      expect(screen.getByText('26/02/2026')).toBeInTheDocument();
    });

    it('should render platform and hours section titles', () => {
      render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.PROFESSIONAL}
          data={mockProfessionalData}
        />
      );
      expect(screen.getByText('Plataforma de acesso')).toBeInTheDocument();
      expect(screen.getByText('Horas por item')).toBeInTheDocument();
    });

    it('should render user header when professionalUserInfo is provided', () => {
      render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.PROFESSIONAL}
          data={mockProfessionalData}
          professionalUserInfo={{
            userName: 'Maria Souza',
            schoolName: 'Escola Estadual Paraná',
            className: 'Turma B',
            year: '2026',
          }}
        />
      );
      expect(screen.getByText('Maria Souza')).toBeInTheDocument();
      expect(screen.getByText(/Escola Estadual Paraná/)).toBeInTheDocument();
      expect(screen.getByText(/Turma B/)).toBeInTheDocument();
    });

    it('should not render user header when professionalUserInfo is absent', () => {
      render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.PROFESSIONAL}
          data={mockProfessionalData}
        />
      );
      expect(screen.queryByText('Maria Souza')).not.toBeInTheDocument();
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
    it('should render empty modal when data is null and not loading', () => {
      render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.STUDENT}
          data={null}
        />
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.queryByText('Tempo total')).not.toBeInTheDocument();
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
    it('should render fallback circle when all platform values are zero', () => {
      const { container } = render(
        <AccessReportModal
          isOpen={true}
          onClose={() => {}}
          variant={AccessReportModalVariant.STUDENT}
          data={{
            ...mockStudentData,
            platformAccess: { web: 0, mobile: 0 },
          }}
        />
      );
      expect(
        container.querySelector('.fill-background-200')
      ).toBeInTheDocument();
    });
  });
});
