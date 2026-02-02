import { render, screen, fireEvent } from '@testing-library/react';
import type { ReactNode } from 'react';
import RecommendedLessonDetails from './RecommendedLessonDetails';
import type { LessonDetailsData } from '../../types/recommendedLessons';
import { SubjectEnum } from '../../enums/SubjectEnum';

// External mock for handleSort to allow verification in tests
const mockHandleSort = jest.fn();

// Mock the SubjectInfo to avoid dependency issues
jest.mock('../SubjectInfo/SubjectInfo', () => ({
  getSubjectInfo: (subject: string) => ({
    icon: <span data-testid="subject-icon">{subject}</span>,
    colorClass: 'bg-subject-5',
    name: subject,
  }),
}));

// Mock the Table components
jest.mock('../Table/Table', () => {
  const Table = ({ children }: { children: ReactNode }) => (
    <table data-testid="table">{children}</table>
  );
  const TableHeader = ({ children }: { children: ReactNode }) => (
    <thead>{children}</thead>
  );
  const TableBody = ({ children }: { children: ReactNode }) => (
    <tbody>{children}</tbody>
  );
  const TableRow = ({ children }: { children: ReactNode }) => (
    <tr>{children}</tr>
  );
  const TableHead = ({
    children,
    sortable,
    onSort,
    sortDirection,
    className,
  }: {
    children?: ReactNode;
    sortable?: boolean;
    onSort?: () => void;
    sortDirection?: 'asc' | 'desc' | null;
    className?: string;
  }) => (
    <th
      onClick={() => {
        if (onSort) onSort();
      }}
      data-sortable={sortable}
      data-sort-direction={sortDirection}
      className={className}
    >
      {children}
    </th>
  );
  const TableCell = ({ children }: { children: ReactNode }) => (
    <td>{children}</td>
  );

  const useTableSort = <T extends Record<string, unknown>>(data: T[]) => ({
    sortedData: data,
    sortColumn: null,
    sortDirection: null,
    handleSort: mockHandleSort,
  });

  return {
    __esModule: true,
    default: Table,
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    useTableSort,
  };
});

// Use future dates to avoid NAO_FINALIZADO status in tests
const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  .toISOString()
  .split('T')[0];
const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  .toISOString()
  .split('T')[0];

// Mock data aligned with API responses
const mockLessonData: LessonDetailsData = {
  recommendedClass: {
    id: 'lesson-1',
    title: 'Explorando a Fotossíntese: Atividade Prática de Campo',
    startDate: startDate,
    finalDate: futureDate,
    progress: 90,
    lessons: [
      {
        recommendedClassId: 'lesson-1',
        supLessonsProgressId: 'progress-1',
        supLessonsProgress: {
          id: 'progress-1',
          userId: 'user-1',
          lessonId: 'lesson-content-1',
          progress: 100,
          lesson: {
            id: 'lesson-content-1',
            content: { id: 'content-1', name: 'Fotossíntese' },
            subtopic: { id: 'subtopic-1', name: 'Processo' },
            topic: { id: 'topic-1', name: 'Biologia Celular' },
            subject: {
              id: 'subject-1',
              name: 'Biologia',
              color: '#22c55e',
              icon: 'biology',
            },
          },
        },
      },
    ],
  },
  details: {
    students: [
      {
        userInstitutionId: 'student-1',
        userId: 'user-1',
        name: 'Ana Costa',
        progress: 0,
        completedAt: null,
        avgScore: null,
        daysToComplete: null,
      },
      {
        userInstitutionId: 'student-2',
        userId: 'user-2',
        name: 'Carlos Pereira',
        progress: 90,
        completedAt: null,
        avgScore: 85,
        daysToComplete: null,
      },
      {
        userInstitutionId: 'student-3',
        userId: 'user-3',
        name: 'Maria Silva',
        progress: 50,
        completedAt: null,
        avgScore: 70,
        daysToComplete: null,
      },
      {
        userInstitutionId: 'student-4',
        userId: 'user-4',
        name: 'Lucas Oliveira',
        progress: 100,
        completedAt: '2024-01-15T00:00:00.000Z',
        avgScore: 95,
        daysToComplete: 15,
      },
    ],
    aggregated: {
      completionPercentage: 90,
      avgScore: 83,
    },
    contentPerformance: {
      best: { contentId: 'content-1', contentName: 'Fotossíntese', rate: 95 },
      worst: { contentId: 'content-2', contentName: 'Células', rate: 65 },
    },
  },
  breakdown: {
    classId: 'class-1',
    className: 'Turma A',
    schoolId: 'school-1',
    schoolName: 'Escola Estadual Professor João da Silva',
    studentCount: 30,
    completedCount: 27,
  },
};

describe('RecommendedLessonDetails', () => {
  const mockMapSubjectNameToEnum = (name: string): SubjectEnum | null => {
    if (name === 'Biologia') return SubjectEnum.BIOLOGIA;
    return null;
  };

  describe('Rendering', () => {
    it('should render the component with data', () => {
      render(
        <RecommendedLessonDetails
          data={mockLessonData}
          mapSubjectNameToEnum={mockMapSubjectNameToEnum}
        />
      );

      expect(
        screen.getByTestId('recommended-class-details')
      ).toBeInTheDocument();
    });

    it('should render the lesson title', () => {
      render(
        <RecommendedLessonDetails
          data={mockLessonData}
          mapSubjectNameToEnum={mockMapSubjectNameToEnum}
        />
      );

      // Title appears in both header and breadcrumb
      expect(
        screen.getAllByText(
          'Explorando a Fotossíntese: Atividade Prática de Campo'
        ).length
      ).toBeGreaterThanOrEqual(1);
    });

    it('should render school information from breakdown', () => {
      render(
        <RecommendedLessonDetails
          data={mockLessonData}
          mapSubjectNameToEnum={mockMapSubjectNameToEnum}
        />
      );

      expect(
        screen.getByText('Escola Estadual Professor João da Silva')
      ).toBeInTheDocument();
      // Biologia appears in the subject icon mock and in the metadata
      expect(screen.getAllByText('Biologia').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Turma A')).toBeInTheDocument();
    });

    it('should render results section with aggregated data', () => {
      render(
        <RecommendedLessonDetails
          data={mockLessonData}
          mapSubjectNameToEnum={mockMapSubjectNameToEnum}
        />
      );

      expect(
        screen.getByText('Resultados da aula recomendada')
      ).toBeInTheDocument();
      expect(screen.getByText('Fotossíntese')).toBeInTheDocument();
      expect(screen.getByText('Células')).toBeInTheDocument();
    });

    it('should render students table', () => {
      render(
        <RecommendedLessonDetails
          data={mockLessonData}
          mapSubjectNameToEnum={mockMapSubjectNameToEnum}
        />
      );

      expect(screen.getByText('Ana Costa')).toBeInTheDocument();
      expect(screen.getByText('Lucas Oliveira')).toBeInTheDocument();
    });

    it('should derive and render student statuses correctly', () => {
      render(
        <RecommendedLessonDetails
          data={mockLessonData}
          mapSubjectNameToEnum={mockMapSubjectNameToEnum}
        />
      );

      // Ana Costa: progress 0, no completedAt -> A INICIAR
      expect(screen.getByText('A INICIAR')).toBeInTheDocument();
      // Lucas Oliveira: completedAt set -> CONCLUÍDO
      expect(screen.getAllByText('CONCLUÍDO').length).toBeGreaterThanOrEqual(1);
      // Maria Silva (progress 50) and Carlos Pereira (progress 90): no completedAt -> EM ANDAMENTO
      expect(screen.getAllByText('EM ANDAMENTO').length).toBe(2);
    });

    it('should format daysToComplete as duration', () => {
      render(
        <RecommendedLessonDetails
          data={mockLessonData}
          mapSubjectNameToEnum={mockMapSubjectNameToEnum}
        />
      );

      // Lucas Oliveira has daysToComplete: 15
      expect(screen.getByText('15 dias')).toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    it('should render loading skeleton when loading is true', () => {
      render(<RecommendedLessonDetails data={null} loading={true} />);

      expect(screen.getByTestId('lesson-details-loading')).toBeInTheDocument();
    });
  });

  describe('Error state', () => {
    it('should render error message when error is provided', () => {
      render(
        <RecommendedLessonDetails data={null} error="Erro ao carregar dados" />
      );

      expect(screen.getByTestId('lesson-details-error')).toBeInTheDocument();
      expect(screen.getByText('Erro ao carregar dados')).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('should render nothing when data is null and not loading', () => {
      const { container } = render(<RecommendedLessonDetails data={null} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Callbacks', () => {
    it('should call onViewLesson when Ver aula button is clicked', () => {
      const mockOnViewLesson = jest.fn();

      render(
        <RecommendedLessonDetails
          data={mockLessonData}
          onViewLesson={mockOnViewLesson}
          mapSubjectNameToEnum={mockMapSubjectNameToEnum}
        />
      );

      const viewLessonButton = screen.getByText('Ver aula');
      fireEvent.click(viewLessonButton);

      expect(mockOnViewLesson).toHaveBeenCalledTimes(1);
    });

    it('should call onBreadcrumbClick when breadcrumb is clicked', () => {
      const mockOnBreadcrumbClick = jest.fn();

      render(
        <RecommendedLessonDetails
          data={mockLessonData}
          onBreadcrumbClick={mockOnBreadcrumbClick}
          mapSubjectNameToEnum={mockMapSubjectNameToEnum}
        />
      );

      const breadcrumbLink = screen.getByText('Aulas recomendadas');
      fireEvent.click(breadcrumbLink);

      expect(mockOnBreadcrumbClick).toHaveBeenCalledWith('/aulas-recomendadas');
    });
  });

  describe('Custom labels', () => {
    it('should use custom labels when provided', () => {
      render(
        <RecommendedLessonDetails
          data={mockLessonData}
          mapSubjectNameToEnum={mockMapSubjectNameToEnum}
          labels={{
            viewLesson: 'Visualizar aula',
            resultsTitle: 'Resumo dos resultados',
          }}
          onViewLesson={() => {}}
        />
      );

      expect(screen.getByText('Visualizar aula')).toBeInTheDocument();
      expect(screen.getByText('Resumo dos resultados')).toBeInTheDocument();
    });
  });

  describe('Custom breadcrumbs', () => {
    it('should use custom breadcrumbs when provided', () => {
      render(
        <RecommendedLessonDetails
          data={mockLessonData}
          mapSubjectNameToEnum={mockMapSubjectNameToEnum}
          breadcrumbs={[
            { label: 'Home', path: '/' },
            { label: 'Aulas', path: '/aulas' },
            { label: 'Detalhes' },
          ]}
        />
      );

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Aulas')).toBeInTheDocument();
      expect(screen.getByText('Detalhes')).toBeInTheDocument();
    });
  });

  describe('Date formatting', () => {
    it('should format dates correctly', () => {
      render(
        <RecommendedLessonDetails
          data={mockLessonData}
          mapSubjectNameToEnum={mockMapSubjectNameToEnum}
        />
      );

      // Check that dates are formatted in pt-BR format
      expect(screen.getByText(/Início em/)).toBeInTheDocument();
      expect(screen.getByText(/Prazo final/)).toBeInTheDocument();
    });

    it('should show placeholder for null dates', () => {
      const dataWithNullDates: LessonDetailsData = {
        ...mockLessonData,
        recommendedClass: {
          ...mockLessonData.recommendedClass,
          startDate: null as unknown as string,
          finalDate: null as unknown as string,
        },
      };

      render(
        <RecommendedLessonDetails
          data={dataWithNullDates}
          mapSubjectNameToEnum={mockMapSubjectNameToEnum}
        />
      );

      expect(screen.getByText('Início em -')).toBeInTheDocument();
      expect(screen.getByText('Prazo final -')).toBeInTheDocument();
    });

    it('should show placeholder for invalid date strings', () => {
      const dataWithInvalidDates: LessonDetailsData = {
        ...mockLessonData,
        recommendedClass: {
          ...mockLessonData.recommendedClass,
          startDate: 'invalid-date',
          finalDate: 'not-a-date',
        },
      };

      render(
        <RecommendedLessonDetails
          data={dataWithInvalidDates}
          mapSubjectNameToEnum={mockMapSubjectNameToEnum}
        />
      );

      // Invalid dates should show placeholder
      expect(screen.getByText('Início em -')).toBeInTheDocument();
      expect(screen.getByText('Prazo final -')).toBeInTheDocument();
    });
  });

  describe('Table sorting', () => {
    beforeEach(() => {
      mockHandleSort.mockClear();
    });

    it('should call handleSort when name column header is clicked', () => {
      render(
        <RecommendedLessonDetails
          data={mockLessonData}
          mapSubjectNameToEnum={mockMapSubjectNameToEnum}
        />
      );

      const headers = screen.getAllByRole('columnheader');
      const nameHeader = headers[0];

      fireEvent.click(nameHeader);

      expect(mockHandleSort).toHaveBeenCalledWith('name');
    });

    it('should call handleSort when status column header is clicked', () => {
      render(
        <RecommendedLessonDetails
          data={mockLessonData}
          mapSubjectNameToEnum={mockMapSubjectNameToEnum}
        />
      );

      const headers = screen.getAllByRole('columnheader');
      const statusHeader = headers[1];

      fireEvent.click(statusHeader);

      expect(mockHandleSort).toHaveBeenCalledWith('status');
    });

    it('should call handleSort when completion column header is clicked', () => {
      render(
        <RecommendedLessonDetails
          data={mockLessonData}
          mapSubjectNameToEnum={mockMapSubjectNameToEnum}
        />
      );

      const headers = screen.getAllByRole('columnheader');
      const completionHeader = headers[2];

      fireEvent.click(completionHeader);

      expect(mockHandleSort).toHaveBeenCalledWith('completionPercentage');
    });

    it('should render all sortable column headers', () => {
      render(
        <RecommendedLessonDetails
          data={mockLessonData}
          mapSubjectNameToEnum={mockMapSubjectNameToEnum}
        />
      );

      // All columns should render
      const headers = screen.getAllByRole('columnheader');
      expect(headers.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Results cards', () => {
    it('should show dash when contentPerformance.best is null', () => {
      const dataWithNullPerformance: LessonDetailsData = {
        ...mockLessonData,
        details: {
          ...mockLessonData.details,
          contentPerformance: {
            best: null,
            worst: null,
          },
        },
      };

      render(
        <RecommendedLessonDetails
          data={dataWithNullPerformance}
          mapSubjectNameToEnum={mockMapSubjectNameToEnum}
        />
      );

      // Should show dashes for null topics
      const dashes = screen.getAllByText('-');
      expect(dashes.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Missing breakdown data', () => {
    it('should handle missing breakdown gracefully', () => {
      const dataWithoutBreakdown: LessonDetailsData = {
        recommendedClass: mockLessonData.recommendedClass,
        details: mockLessonData.details,
        // No breakdown
      };

      render(
        <RecommendedLessonDetails
          data={dataWithoutBreakdown}
          mapSubjectNameToEnum={mockMapSubjectNameToEnum}
        />
      );

      // Should still render without school/class info
      expect(
        screen.getByTestId('recommended-class-details')
      ).toBeInTheDocument();
    });
  });

  describe('Missing lessons data', () => {
    it('should handle missing lessons gracefully', () => {
      const dataWithoutLessons: LessonDetailsData = {
        ...mockLessonData,
        recommendedClass: {
          ...mockLessonData.recommendedClass,
          lessons: [],
        },
      };

      render(
        <RecommendedLessonDetails
          data={dataWithoutLessons}
          mapSubjectNameToEnum={mockMapSubjectNameToEnum}
        />
      );

      // Should still render without subject info
      expect(
        screen.getByTestId('recommended-class-details')
      ).toBeInTheDocument();
    });
  });

  describe('NAO_FINALIZADO status (past deadline)', () => {
    // Use past deadline to trigger NAO_FINALIZADO
    const pastDeadline = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const mockDataWithPastDeadline: LessonDetailsData = {
      recommendedClass: {
        ...mockLessonData.recommendedClass,
        finalDate: pastDeadline,
      },
      details: {
        students: [
          {
            userInstitutionId: 'student-1',
            userId: 'user-1',
            name: 'Ana Costa',
            progress: 0,
            completedAt: null,
            avgScore: null,
            daysToComplete: null,
          },
          {
            userInstitutionId: 'student-2',
            userId: 'user-2',
            name: 'Carlos Pereira',
            progress: 50,
            completedAt: null,
            avgScore: 85,
            daysToComplete: null,
          },
          {
            userInstitutionId: 'student-3',
            userId: 'user-3',
            name: 'Lucas Oliveira',
            progress: 100,
            completedAt: '2024-01-15T00:00:00.000Z',
            avgScore: 95,
            daysToComplete: 15,
          },
        ],
        aggregated: mockLessonData.details.aggregated,
        contentPerformance: mockLessonData.details.contentPerformance,
      },
      breakdown: mockLessonData.breakdown,
    };

    it('should show NAO_FINALIZADO for students who did not complete when deadline passed', () => {
      render(
        <RecommendedLessonDetails
          data={mockDataWithPastDeadline}
          mapSubjectNameToEnum={mockMapSubjectNameToEnum}
        />
      );

      // Ana Costa (progress 0) and Carlos Pereira (progress 50) should be NAO_FINALIZADO
      expect(screen.getAllByText('NÃO FINALIZADO').length).toBe(2);
    });

    it('should show CONCLUIDO for student who completed even with past deadline', () => {
      render(
        <RecommendedLessonDetails
          data={mockDataWithPastDeadline}
          mapSubjectNameToEnum={mockMapSubjectNameToEnum}
        />
      );

      // Lucas Oliveira has completedAt, so should be CONCLUIDO
      // There might be multiple "CONCLUÍDO" texts (one in student row, possibly others)
      expect(screen.getAllByText('CONCLUÍDO').length).toBeGreaterThanOrEqual(1);
    });
  });
});
