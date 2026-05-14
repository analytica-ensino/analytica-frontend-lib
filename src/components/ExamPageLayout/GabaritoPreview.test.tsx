import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useReactToPrint } from 'react-to-print';
import QRCode from 'qrcode';
import { AnswerSheetPreview } from './GabaritoPreview';

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

describe('AnswerSheetPreview', () => {
  const defaultProps = {
    studentName: 'João Silva',
    qrCodeUrl: 'https://example.com/qr/student123',
    totalQuestions: 50,
    examTitle: 'Simulado ENEM 2024',
    schoolName: 'Escola Municipal',
    className: '3º Ano A',
  };

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
        render(<AnswerSheetPreview {...defaultProps} />);
      });
      expect(screen.getByTestId('print-styles')).toBeInTheDocument();
    });

    it('renders PageContainer component', async () => {
      await act(async () => {
        render(<AnswerSheetPreview {...defaultProps} />);
      });
      expect(screen.getByTestId('page-container')).toBeInTheDocument();
    });

    it('renders CardContainer component', async () => {
      await act(async () => {
        render(<AnswerSheetPreview {...defaultProps} />);
      });
      expect(screen.getByTestId('card-container')).toBeInTheDocument();
    });

    it('renders AnswerSheetCard component', async () => {
      await act(async () => {
        render(<AnswerSheetPreview {...defaultProps} />);
      });
      expect(screen.getByTestId('answer-sheet-card')).toBeInTheDocument();
    });

    it('passes correct props to AnswerSheetCard', async () => {
      await act(async () => {
        render(<AnswerSheetPreview {...defaultProps} />);
      });

      expect(screen.getByTestId('student-name')).toHaveTextContent(
        'João Silva'
      );
      expect(screen.getByTestId('total-questions')).toHaveTextContent('50');
      expect(screen.getByTestId('exam-title')).toHaveTextContent(
        'Simulado ENEM 2024'
      );
      expect(screen.getByTestId('school-name')).toHaveTextContent(
        'Escola Municipal'
      );
      expect(screen.getByTestId('class-name')).toHaveTextContent('3º Ano A');
    });
  });

  describe('QR code generation', () => {
    it('generates QR code from qrCodeUrl', async () => {
      await act(async () => {
        render(<AnswerSheetPreview {...defaultProps} />);
      });

      await waitFor(() => {
        expect(mockQRCode.toDataURL).toHaveBeenCalledWith(
          'https://example.com/qr/student123',
          { width: 160 }
        );
      });
    });

    it('passes generated QR code data URL to AnswerSheetCard', async () => {
      await act(async () => {
        render(<AnswerSheetPreview {...defaultProps} />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('qr-code-url')).toHaveTextContent(
          'data:image/png;base64,mockqrcode'
        );
      });
    });

    it('handles QR code generation error', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      (mockQRCode.toDataURL as jest.Mock).mockRejectedValueOnce(
        new Error('QR generation failed')
      );

      await act(async () => {
        render(<AnswerSheetPreview {...defaultProps} />);
      });

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });
  });

  describe('print functionality', () => {
    it('calls handlePrint after QR code is generated', async () => {
      await act(async () => {
        render(<AnswerSheetPreview {...defaultProps} />);
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
        render(<AnswerSheetPreview {...defaultProps} />);
      });

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      expect(mockHandlePrint).toHaveBeenCalledTimes(1);
    });

    it('does not print if QR code is not ready', async () => {
      (mockQRCode.toDataURL as jest.Mock).mockImplementationOnce(
        () => new Promise(() => {}) // Never resolves
      );

      await act(async () => {
        render(<AnswerSheetPreview {...defaultProps} />);
      });

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      expect(mockHandlePrint).not.toHaveBeenCalled();
    });
  });

  describe('onComplete callback', () => {
    it('calls onComplete after print', async () => {
      const mockOnComplete = jest.fn();

      let onAfterPrintCallback: (() => void) | undefined;
      mockUseReactToPrint.mockImplementation(
        (options: { onAfterPrint?: () => void }) => {
          onAfterPrintCallback = options.onAfterPrint;
          return mockHandlePrint;
        }
      );

      await act(async () => {
        render(
          <AnswerSheetPreview {...defaultProps} onComplete={mockOnComplete} />
        );
      });

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
        render(<AnswerSheetPreview {...defaultProps} />);
      });

      expect(() => {
        if (onAfterPrintCallback) {
          onAfterPrintCallback();
        }
      }).not.toThrow();
    });
  });

  describe('optional props', () => {
    it('renders without examTitle', async () => {
      await act(async () => {
        render(<AnswerSheetPreview {...defaultProps} examTitle={undefined} />);
      });
      expect(screen.getByTestId('answer-sheet-card')).toBeInTheDocument();
    });

    it('renders without schoolName', async () => {
      await act(async () => {
        render(<AnswerSheetPreview {...defaultProps} schoolName={undefined} />);
      });
      expect(screen.getByTestId('answer-sheet-card')).toBeInTheDocument();
    });

    it('renders without className', async () => {
      await act(async () => {
        render(<AnswerSheetPreview {...defaultProps} className={undefined} />);
      });
      expect(screen.getByTestId('answer-sheet-card')).toBeInTheDocument();
    });

    it('renders with minimal props', async () => {
      await act(async () => {
        render(
          <AnswerSheetPreview
            studentName="Test Student"
            qrCodeUrl="https://example.com/qr"
            totalQuestions={10}
          />
        );
      });
      expect(screen.getByTestId('answer-sheet-card')).toBeInTheDocument();
    });
  });

  describe('useReactToPrint configuration', () => {
    it('configures useReactToPrint with correct options', async () => {
      await act(async () => {
        render(<AnswerSheetPreview {...defaultProps} />);
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
