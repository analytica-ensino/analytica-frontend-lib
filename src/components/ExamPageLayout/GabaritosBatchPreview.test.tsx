import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useReactToPrint } from 'react-to-print';
import QRCode from 'qrcode';
import {
  AnswerSheetsBatchPreview,
  type AnswerSheetData,
} from './GabaritosBatchPreview';

// Mock react-to-print
const mockHandlePrint = jest.fn();
jest.mock('react-to-print', () => ({
  useReactToPrint: jest.fn(() => mockHandlePrint),
}));

// Mock qrcode
jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mockqrcode'),
}));

const mockUseReactToPrint = jest.mocked(useReactToPrint);
const mockQRCode = jest.mocked(QRCode);

// Mock AnswerSheetCard components
jest.mock('./GabaritoCard', () => ({
  PrintStyles: () => <div data-testid="print-styles" />,
  PageContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-container">{children}</div>
  ),
  CardContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-container">{children}</div>
  ),
  AnswerSheetCard: ({
    studentName,
    qrCodeDataUrl,
    totalQuestions,
    examTitle,
    schoolName,
    className,
  }: {
    studentName: string;
    qrCodeDataUrl: string;
    totalQuestions: number;
    examTitle?: string;
    schoolName?: string;
    className?: string;
  }) => (
    <div data-testid="answer-sheet-card">
      <span data-testid="student-name">{studentName}</span>
      <span data-testid="qr-code-url">{qrCodeDataUrl}</span>
      <span data-testid="total-questions">{totalQuestions}</span>
      <span data-testid="exam-title">{examTitle}</span>
      <span data-testid="school-name">{schoolName}</span>
      <span data-testid="class-name">{className}</span>
    </div>
  ),
}));

describe('AnswerSheetsBatchPreview', () => {
  const mockAnswerSheets: AnswerSheetData[] = [
    {
      studentName: 'João Silva',
      qrCodeUrl: 'https://example.com/qr1',
      totalQuestions: 50,
      examTitle: 'Prova 1',
      schoolName: 'Escola A',
      className: 'Turma 1',
    },
    {
      studentName: 'Maria Santos',
      qrCodeUrl: 'https://example.com/qr2',
      totalQuestions: 50,
      examTitle: 'Prova 1',
      schoolName: 'Escola A',
      className: 'Turma 2',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('rendering', () => {
    it('renders PrintStyles component', async () => {
      await act(async () => {
        render(<AnswerSheetsBatchPreview answerSheets={mockAnswerSheets} />);
      });
      expect(screen.getByTestId('print-styles')).toBeInTheDocument();
    });

    it('renders PageContainer component', async () => {
      await act(async () => {
        render(<AnswerSheetsBatchPreview answerSheets={mockAnswerSheets} />);
      });
      expect(screen.getByTestId('page-container')).toBeInTheDocument();
    });

    it('renders correct number of CardContainers', async () => {
      await act(async () => {
        render(<AnswerSheetsBatchPreview answerSheets={mockAnswerSheets} />);
      });
      const containers = screen.getAllByTestId('card-container');
      expect(containers).toHaveLength(2);
    });

    it('renders correct number of AnswerSheetCards', async () => {
      await act(async () => {
        render(<AnswerSheetsBatchPreview answerSheets={mockAnswerSheets} />);
      });
      const cards = screen.getAllByTestId('answer-sheet-card');
      expect(cards).toHaveLength(2);
    });

    it('passes correct props to each AnswerSheetCard', async () => {
      await act(async () => {
        render(<AnswerSheetsBatchPreview answerSheets={mockAnswerSheets} />);
      });

      await waitFor(() => {
        const names = screen.getAllByTestId('student-name');
        expect(names[0]).toHaveTextContent('João Silva');
        expect(names[1]).toHaveTextContent('Maria Santos');
      });
    });
  });

  describe('QR code generation', () => {
    it('generates QR codes for all answer sheets', async () => {
      await act(async () => {
        render(<AnswerSheetsBatchPreview answerSheets={mockAnswerSheets} />);
      });

      await waitFor(() => {
        expect(mockQRCode.toDataURL).toHaveBeenCalledTimes(2);
        expect(mockQRCode.toDataURL).toHaveBeenCalledWith(
          'https://example.com/qr1',
          { width: 160 }
        );
        expect(mockQRCode.toDataURL).toHaveBeenCalledWith(
          'https://example.com/qr2',
          { width: 160 }
        );
      });
    });
  });

  describe('print functionality', () => {
    it('calls handlePrint after QR codes are generated', async () => {
      await act(async () => {
        render(<AnswerSheetsBatchPreview answerSheets={mockAnswerSheets} />);
      });

      await act(async () => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(mockHandlePrint).toHaveBeenCalled();
      });
    });

    it('only prints once', async () => {
      await act(async () => {
        render(<AnswerSheetsBatchPreview answerSheets={mockAnswerSheets} />);
      });

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      expect(mockHandlePrint).toHaveBeenCalledTimes(1);
    });
  });

  describe('onComplete callback', () => {
    it('calls onComplete after print', async () => {
      const mockOnComplete = jest.fn();

      // Capture onAfterPrint callback
      let onAfterPrintCallback: (() => void) | undefined;
      mockUseReactToPrint.mockImplementation(
        (options: { onAfterPrint?: () => void }) => {
          onAfterPrintCallback = options.onAfterPrint;
          return mockHandlePrint;
        }
      );

      await act(async () => {
        render(
          <AnswerSheetsBatchPreview
            answerSheets={mockAnswerSheets}
            onComplete={mockOnComplete}
          />
        );
      });

      // Trigger onAfterPrint
      if (onAfterPrintCallback) {
        onAfterPrintCallback();
      }

      expect(mockOnComplete).toHaveBeenCalled();
    });

    it('does not throw when onComplete is not provided', async () => {
      let onAfterPrintCallback: (() => void) | undefined;
      mockUseReactToPrint.mockImplementation(
        (options: { onAfterPrint?: () => void }) => {
          onAfterPrintCallback = options.onAfterPrint;
          return mockHandlePrint;
        }
      );

      await act(async () => {
        render(<AnswerSheetsBatchPreview answerSheets={mockAnswerSheets} />);
      });

      // Should not throw
      expect(() => {
        if (onAfterPrintCallback) {
          onAfterPrintCallback();
        }
      }).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('handles empty answerSheets array', async () => {
      await act(async () => {
        render(<AnswerSheetsBatchPreview answerSheets={[]} />);
      });

      expect(screen.queryByTestId('answer-sheet-card')).not.toBeInTheDocument();
    });

    it('handles single answer sheet', async () => {
      await act(async () => {
        render(
          <AnswerSheetsBatchPreview answerSheets={[mockAnswerSheets[0]]} />
        );
      });

      const cards = screen.getAllByTestId('answer-sheet-card');
      expect(cards).toHaveLength(1);
    });

    it('handles answer sheet without optional fields', async () => {
      const minimalAnswerSheet: AnswerSheetData = {
        studentName: 'Test Student',
        qrCodeUrl: 'https://example.com/qr',
        totalQuestions: 10,
      };

      await act(async () => {
        render(
          <AnswerSheetsBatchPreview answerSheets={[minimalAnswerSheet]} />
        );
      });

      expect(screen.getByTestId('answer-sheet-card')).toBeInTheDocument();
    });
  });

  describe('useReactToPrint configuration', () => {
    it('configures useReactToPrint with correct options', async () => {
      await act(async () => {
        render(<AnswerSheetsBatchPreview answerSheets={mockAnswerSheets} />);
      });

      expect(mockUseReactToPrint).toHaveBeenCalledWith(
        expect.objectContaining({
          documentTitle: ' ',
          pageStyle: expect.stringContaining('@page'),
        })
      );
    });
  });
});
