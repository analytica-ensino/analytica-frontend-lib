import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  createExamStudentsTableColumns,
  getExamStudentStatusBadgeAction,
  getExamStudentStatusDisplayText,
} from './examStudentsTableConfig';
import { StudentAnswerStatus } from '../../types/examDetails';
import type { ExamStudentTableItem } from '../../types/examDetails';

describe('examStudentsTableConfig', () => {
  describe('getExamStudentStatusBadgeAction', () => {
    it('returns warning for AGUARDANDO_GABARITO status', () => {
      expect(
        getExamStudentStatusBadgeAction(StudentAnswerStatus.AGUARDANDO_GABARITO)
      ).toBe('warning');
    });

    it('returns success for GABARITO_RECEBIDO status', () => {
      expect(
        getExamStudentStatusBadgeAction(StudentAnswerStatus.GABARITO_RECEBIDO)
      ).toBe('success');
    });
  });

  describe('getExamStudentStatusDisplayText', () => {
    it('returns display text for AGUARDANDO_GABARITO', () => {
      expect(
        getExamStudentStatusDisplayText(StudentAnswerStatus.AGUARDANDO_GABARITO)
      ).toBe('Aguardando gabarito');
    });

    it('returns display text for GABARITO_RECEBIDO', () => {
      expect(
        getExamStudentStatusDisplayText(StudentAnswerStatus.GABARITO_RECEBIDO)
      ).toBe('Gabarito recebido');
    });
  });

  describe('createExamStudentsTableColumns', () => {
    const mockOnDownloadAnswerSheet = jest.fn();
    const mockOnViewAnswers = jest.fn();

    const mockStudent: ExamStudentTableItem = {
      id: 'student-1',
      studentId: 'student-1',
      studentName: 'João Silva',
      status: StudentAnswerStatus.GABARITO_RECEBIDO,
      answerReceivedAt: '01 Jan 2024',
      score: 8.5,
    };

    const mockStudentWaiting: ExamStudentTableItem = {
      id: 'student-2',
      studentId: 'student-2',
      studentName: 'Maria Santos',
      status: StudentAnswerStatus.AGUARDANDO_GABARITO,
      answerReceivedAt: null,
      score: null,
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('creates correct number of columns', () => {
      const columns = createExamStudentsTableColumns(
        mockOnDownloadAnswerSheet,
        mockOnViewAnswers,
        null
      );
      expect(columns).toHaveLength(6);
    });

    it('has correct column keys', () => {
      const columns = createExamStudentsTableColumns(
        mockOnDownloadAnswerSheet,
        mockOnViewAnswers,
        null
      );
      const keys = columns.map((c) => c.key);
      expect(keys).toEqual([
        'studentName',
        'status',
        'answerReceivedAt',
        'score',
        'downloadAnswerSheet',
        'viewAnswers',
      ]);
    });

    describe('studentName column', () => {
      it('renders student name with avatar', () => {
        const columns = createExamStudentsTableColumns(
          mockOnDownloadAnswerSheet,
          mockOnViewAnswers,
          null
        );
        const nameColumn = columns.find((c) => c.key === 'studentName');
        const { container } = render(
          <>{nameColumn?.render?.(mockStudent.studentName, mockStudent, 0)}</>
        );

        expect(screen.getByText('João Silva')).toBeInTheDocument();
        expect(screen.getByText('J')).toBeInTheDocument(); // Avatar initial
        expect(container.querySelector('.rounded-full')).toBeInTheDocument();
      });

      it('is sortable', () => {
        const columns = createExamStudentsTableColumns(
          mockOnDownloadAnswerSheet,
          mockOnViewAnswers,
          null
        );
        const nameColumn = columns.find((c) => c.key === 'studentName');
        expect(nameColumn?.sortable).toBe(true);
      });
    });

    describe('status column', () => {
      it('renders badge for GABARITO_RECEBIDO status', () => {
        const columns = createExamStudentsTableColumns(
          mockOnDownloadAnswerSheet,
          mockOnViewAnswers,
          null
        );
        const statusColumn = columns.find((c) => c.key === 'status');
        render(
          <>{statusColumn?.render?.(mockStudent.status, mockStudent, 0)}</>
        );

        expect(screen.getByText('Gabarito recebido')).toBeInTheDocument();
      });

      it('renders badge for AGUARDANDO_GABARITO status', () => {
        const columns = createExamStudentsTableColumns(
          mockOnDownloadAnswerSheet,
          mockOnViewAnswers,
          null
        );
        const statusColumn = columns.find((c) => c.key === 'status');
        render(
          <>
            {statusColumn?.render?.(
              mockStudentWaiting.status,
              mockStudentWaiting,
              0
            )}
          </>
        );

        expect(screen.getByText('Aguardando gabarito')).toBeInTheDocument();
      });

      it('is sortable', () => {
        const columns = createExamStudentsTableColumns(
          mockOnDownloadAnswerSheet,
          mockOnViewAnswers,
          null
        );
        const statusColumn = columns.find((c) => c.key === 'status');
        expect(statusColumn?.sortable).toBe(true);
      });
    });

    describe('answerReceivedAt column', () => {
      it('renders date when available', () => {
        const columns = createExamStudentsTableColumns(
          mockOnDownloadAnswerSheet,
          mockOnViewAnswers,
          null
        );
        const dateColumn = columns.find((c) => c.key === 'answerReceivedAt');
        render(
          <>
            {dateColumn?.render?.(mockStudent.answerReceivedAt, mockStudent, 0)}
          </>
        );

        expect(screen.getByText('01 Jan 2024')).toBeInTheDocument();
      });

      it('renders dash when date is null', () => {
        const columns = createExamStudentsTableColumns(
          mockOnDownloadAnswerSheet,
          mockOnViewAnswers,
          null
        );
        const dateColumn = columns.find((c) => c.key === 'answerReceivedAt');
        render(<>{dateColumn?.render?.(null, mockStudentWaiting, 0)}</>);

        expect(screen.getByText('-')).toBeInTheDocument();
      });

      it('is sortable', () => {
        const columns = createExamStudentsTableColumns(
          mockOnDownloadAnswerSheet,
          mockOnViewAnswers,
          null
        );
        const dateColumn = columns.find((c) => c.key === 'answerReceivedAt');
        expect(dateColumn?.sortable).toBe(true);
      });
    });

    describe('score column', () => {
      it('renders score with one decimal when available', () => {
        const columns = createExamStudentsTableColumns(
          mockOnDownloadAnswerSheet,
          mockOnViewAnswers,
          null
        );
        const scoreColumn = columns.find((c) => c.key === 'score');
        render(<>{scoreColumn?.render?.(mockStudent.score, mockStudent, 0)}</>);

        expect(screen.getByText('8.5')).toBeInTheDocument();
      });

      it('renders dash when score is null', () => {
        const columns = createExamStudentsTableColumns(
          mockOnDownloadAnswerSheet,
          mockOnViewAnswers,
          null
        );
        const scoreColumn = columns.find((c) => c.key === 'score');
        render(<>{scoreColumn?.render?.(null, mockStudentWaiting, 0)}</>);

        expect(screen.getByText('-')).toBeInTheDocument();
      });

      it('is sortable', () => {
        const columns = createExamStudentsTableColumns(
          mockOnDownloadAnswerSheet,
          mockOnViewAnswers,
          null
        );
        const scoreColumn = columns.find((c) => c.key === 'score');
        expect(scoreColumn?.sortable).toBe(true);
      });
    });

    describe('downloadAnswerSheet column', () => {
      it('renders download button', () => {
        const columns = createExamStudentsTableColumns(
          mockOnDownloadAnswerSheet,
          mockOnViewAnswers,
          null
        );
        const downloadColumn = columns.find(
          (c) => c.key === 'downloadAnswerSheet'
        );
        render(<>{downloadColumn?.render?.(undefined, mockStudent, 0)}</>);

        expect(screen.getByText('Baixar gabarito')).toBeInTheDocument();
      });

      it('calls onDownloadAnswerSheet when clicked', () => {
        const columns = createExamStudentsTableColumns(
          mockOnDownloadAnswerSheet,
          mockOnViewAnswers,
          null
        );
        const downloadColumn = columns.find(
          (c) => c.key === 'downloadAnswerSheet'
        );
        render(<>{downloadColumn?.render?.(undefined, mockStudent, 0)}</>);

        const button = screen.getByText('Baixar gabarito');
        fireEvent.click(button);

        expect(mockOnDownloadAnswerSheet).toHaveBeenCalledWith('student-1');
      });

      it('shows loading state when loadingStudentId matches', () => {
        const columns = createExamStudentsTableColumns(
          mockOnDownloadAnswerSheet,
          mockOnViewAnswers,
          'student-1'
        );
        const downloadColumn = columns.find(
          (c) => c.key === 'downloadAnswerSheet'
        );
        render(<>{downloadColumn?.render?.(undefined, mockStudent, 0)}</>);

        expect(screen.getByText('Carregando...')).toBeInTheDocument();
      });

      it('disables button when loading', () => {
        const columns = createExamStudentsTableColumns(
          mockOnDownloadAnswerSheet,
          mockOnViewAnswers,
          'student-1'
        );
        const downloadColumn = columns.find(
          (c) => c.key === 'downloadAnswerSheet'
        );
        render(<>{downloadColumn?.render?.(undefined, mockStudent, 0)}</>);

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
      });

      it('stops event propagation on click', () => {
        const columns = createExamStudentsTableColumns(
          mockOnDownloadAnswerSheet,
          mockOnViewAnswers,
          null
        );
        const downloadColumn = columns.find(
          (c) => c.key === 'downloadAnswerSheet'
        );
        render(<>{downloadColumn?.render?.(undefined, mockStudent, 0)}</>);

        const button = screen.getByText('Baixar gabarito');
        const event = { stopPropagation: jest.fn() };
        fireEvent.click(button, event);

        expect(mockOnDownloadAnswerSheet).toHaveBeenCalled();
      });

      it('is not sortable', () => {
        const columns = createExamStudentsTableColumns(
          mockOnDownloadAnswerSheet,
          mockOnViewAnswers,
          null
        );
        const downloadColumn = columns.find(
          (c) => c.key === 'downloadAnswerSheet'
        );
        expect(downloadColumn?.sortable).toBe(false);
      });
    });

    describe('viewAnswers column', () => {
      it('renders view answers button', () => {
        const columns = createExamStudentsTableColumns(
          mockOnDownloadAnswerSheet,
          mockOnViewAnswers,
          null
        );
        const viewColumn = columns.find((c) => c.key === 'viewAnswers');
        render(<>{viewColumn?.render?.(undefined, mockStudent, 0)}</>);

        expect(screen.getByText('Ver respostas')).toBeInTheDocument();
      });

      it('enables button when status is GABARITO_RECEBIDO', () => {
        const columns = createExamStudentsTableColumns(
          mockOnDownloadAnswerSheet,
          mockOnViewAnswers,
          null
        );
        const viewColumn = columns.find((c) => c.key === 'viewAnswers');
        render(<>{viewColumn?.render?.(undefined, mockStudent, 0)}</>);

        const button = screen.getByRole('button');
        expect(button).not.toBeDisabled();
      });

      it('disables button when status is AGUARDANDO_GABARITO', () => {
        const columns = createExamStudentsTableColumns(
          mockOnDownloadAnswerSheet,
          mockOnViewAnswers,
          null
        );
        const viewColumn = columns.find((c) => c.key === 'viewAnswers');
        render(<>{viewColumn?.render?.(undefined, mockStudentWaiting, 0)}</>);

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
      });

      it('calls onViewAnswers when clicked', () => {
        const columns = createExamStudentsTableColumns(
          mockOnDownloadAnswerSheet,
          mockOnViewAnswers,
          null
        );
        const viewColumn = columns.find((c) => c.key === 'viewAnswers');
        render(<>{viewColumn?.render?.(undefined, mockStudent, 0)}</>);

        const button = screen.getByText('Ver respostas');
        fireEvent.click(button);

        expect(mockOnViewAnswers).toHaveBeenCalledWith('student-1');
      });

      it('stops event propagation on click', () => {
        const columns = createExamStudentsTableColumns(
          mockOnDownloadAnswerSheet,
          mockOnViewAnswers,
          null
        );
        const viewColumn = columns.find((c) => c.key === 'viewAnswers');
        render(<>{viewColumn?.render?.(undefined, mockStudent, 0)}</>);

        const button = screen.getByText('Ver respostas');
        const event = { stopPropagation: jest.fn() };
        fireEvent.click(button, event);

        expect(mockOnViewAnswers).toHaveBeenCalled();
      });

      it('is not sortable', () => {
        const columns = createExamStudentsTableColumns(
          mockOnDownloadAnswerSheet,
          mockOnViewAnswers,
          null
        );
        const viewColumn = columns.find((c) => c.key === 'viewAnswers');
        expect(viewColumn?.sortable).toBe(false);
      });
    });
  });
});
