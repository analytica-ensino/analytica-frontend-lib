import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useReactToPrint } from 'react-to-print';
import QRCode from 'qrcode';
import { GabaritoPreview } from './GabaritoPreview';

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

// Mock GabaritoCard components
jest.mock('./GabaritoCard', () => ({
  PrintStyles: () => <div data-testid="print-styles" />,
  PageContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-container">{children}</div>
  ),
  CartaoContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="cartao-container">{children}</div>
  ),
  GabaritoCard: ({
    nomeAluno,
    qrCodeDataUrl,
    totalQuestoes,
    tituloProva,
    escolaNome,
    turmaNome,
  }: {
    nomeAluno: string;
    qrCodeDataUrl: string;
    totalQuestoes: number;
    tituloProva?: string;
    escolaNome?: string;
    turmaNome?: string;
  }) => (
    <div data-testid="gabarito-card">
      <span data-testid="nome-aluno">{nomeAluno}</span>
      <span data-testid="qr-code-url">{qrCodeDataUrl}</span>
      <span data-testid="total-questoes">{totalQuestoes}</span>
      <span data-testid="titulo-prova">{tituloProva}</span>
      <span data-testid="escola-nome">{escolaNome}</span>
      <span data-testid="turma-nome">{turmaNome}</span>
    </div>
  ),
}));

describe('GabaritoPreview', () => {
  const defaultProps = {
    nomeAluno: 'João Silva',
    qrCodeUrl: 'https://example.com/qr/student123',
    totalQuestoes: 50,
    tituloProva: 'Simulado ENEM 2024',
    escolaNome: 'Escola Municipal',
    turmaNome: '3º Ano A',
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
        render(<GabaritoPreview {...defaultProps} />);
      });
      expect(screen.getByTestId('print-styles')).toBeInTheDocument();
    });

    it('renders PageContainer component', async () => {
      await act(async () => {
        render(<GabaritoPreview {...defaultProps} />);
      });
      expect(screen.getByTestId('page-container')).toBeInTheDocument();
    });

    it('renders CartaoContainer component', async () => {
      await act(async () => {
        render(<GabaritoPreview {...defaultProps} />);
      });
      expect(screen.getByTestId('cartao-container')).toBeInTheDocument();
    });

    it('renders GabaritoCard component', async () => {
      await act(async () => {
        render(<GabaritoPreview {...defaultProps} />);
      });
      expect(screen.getByTestId('gabarito-card')).toBeInTheDocument();
    });

    it('passes correct props to GabaritoCard', async () => {
      await act(async () => {
        render(<GabaritoPreview {...defaultProps} />);
      });

      expect(screen.getByTestId('nome-aluno')).toHaveTextContent('João Silva');
      expect(screen.getByTestId('total-questoes')).toHaveTextContent('50');
      expect(screen.getByTestId('titulo-prova')).toHaveTextContent(
        'Simulado ENEM 2024'
      );
      expect(screen.getByTestId('escola-nome')).toHaveTextContent(
        'Escola Municipal'
      );
      expect(screen.getByTestId('turma-nome')).toHaveTextContent('3º Ano A');
    });
  });

  describe('QR code generation', () => {
    it('generates QR code from qrCodeUrl', async () => {
      await act(async () => {
        render(<GabaritoPreview {...defaultProps} />);
      });

      await waitFor(() => {
        expect(mockQRCode.toDataURL).toHaveBeenCalledWith(
          'https://example.com/qr/student123',
          { width: 160 }
        );
      });
    });

    it('passes generated QR code data URL to GabaritoCard', async () => {
      await act(async () => {
        render(<GabaritoPreview {...defaultProps} />);
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
        render(<GabaritoPreview {...defaultProps} />);
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
        render(<GabaritoPreview {...defaultProps} />);
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
        render(<GabaritoPreview {...defaultProps} />);
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
        render(<GabaritoPreview {...defaultProps} />);
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
          <GabaritoPreview {...defaultProps} onComplete={mockOnComplete} />
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
        render(<GabaritoPreview {...defaultProps} />);
      });

      expect(() => {
        if (onAfterPrintCallback) {
          onAfterPrintCallback();
        }
      }).not.toThrow();
    });
  });

  describe('optional props', () => {
    it('renders without tituloProva', async () => {
      await act(async () => {
        render(<GabaritoPreview {...defaultProps} tituloProva={undefined} />);
      });
      expect(screen.getByTestId('gabarito-card')).toBeInTheDocument();
    });

    it('renders without escolaNome', async () => {
      await act(async () => {
        render(<GabaritoPreview {...defaultProps} escolaNome={undefined} />);
      });
      expect(screen.getByTestId('gabarito-card')).toBeInTheDocument();
    });

    it('renders without turmaNome', async () => {
      await act(async () => {
        render(<GabaritoPreview {...defaultProps} turmaNome={undefined} />);
      });
      expect(screen.getByTestId('gabarito-card')).toBeInTheDocument();
    });

    it('renders with minimal props', async () => {
      await act(async () => {
        render(
          <GabaritoPreview
            nomeAluno="Test Student"
            qrCodeUrl="https://example.com/qr"
            totalQuestoes={10}
          />
        );
      });
      expect(screen.getByTestId('gabarito-card')).toBeInTheDocument();
    });
  });

  describe('useReactToPrint configuration', () => {
    it('configures useReactToPrint with correct options', async () => {
      await act(async () => {
        render(<GabaritoPreview {...defaultProps} />);
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
