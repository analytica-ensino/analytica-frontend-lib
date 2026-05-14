import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useReactToPrint } from 'react-to-print';
import QRCode from 'qrcode';
import {
  GabaritosBatchPreview,
  type GabaritoData,
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

describe('GabaritosBatchPreview', () => {
  const mockGabaritos: GabaritoData[] = [
    {
      nomeAluno: 'João Silva',
      qrCodeUrl: 'https://example.com/qr1',
      totalQuestoes: 50,
      tituloProva: 'Prova 1',
      escolaNome: 'Escola A',
      turmaNome: 'Turma 1',
    },
    {
      nomeAluno: 'Maria Santos',
      qrCodeUrl: 'https://example.com/qr2',
      totalQuestoes: 50,
      tituloProva: 'Prova 1',
      escolaNome: 'Escola A',
      turmaNome: 'Turma 2',
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
        render(<GabaritosBatchPreview gabaritos={mockGabaritos} />);
      });
      expect(screen.getByTestId('print-styles')).toBeInTheDocument();
    });

    it('renders PageContainer component', async () => {
      await act(async () => {
        render(<GabaritosBatchPreview gabaritos={mockGabaritos} />);
      });
      expect(screen.getByTestId('page-container')).toBeInTheDocument();
    });

    it('renders correct number of CartaoContainers', async () => {
      await act(async () => {
        render(<GabaritosBatchPreview gabaritos={mockGabaritos} />);
      });
      const containers = screen.getAllByTestId('cartao-container');
      expect(containers).toHaveLength(2);
    });

    it('renders correct number of GabaritoCards', async () => {
      await act(async () => {
        render(<GabaritosBatchPreview gabaritos={mockGabaritos} />);
      });
      const cards = screen.getAllByTestId('gabarito-card');
      expect(cards).toHaveLength(2);
    });

    it('passes correct props to each GabaritoCard', async () => {
      await act(async () => {
        render(<GabaritosBatchPreview gabaritos={mockGabaritos} />);
      });

      await waitFor(() => {
        const nomes = screen.getAllByTestId('nome-aluno');
        expect(nomes[0]).toHaveTextContent('João Silva');
        expect(nomes[1]).toHaveTextContent('Maria Santos');
      });
    });
  });

  describe('QR code generation', () => {
    it('generates QR codes for all gabaritos', async () => {
      await act(async () => {
        render(<GabaritosBatchPreview gabaritos={mockGabaritos} />);
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
        render(<GabaritosBatchPreview gabaritos={mockGabaritos} />);
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
        render(<GabaritosBatchPreview gabaritos={mockGabaritos} />);
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
          <GabaritosBatchPreview
            gabaritos={mockGabaritos}
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
        render(<GabaritosBatchPreview gabaritos={mockGabaritos} />);
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
    it('handles empty gabaritos array', async () => {
      await act(async () => {
        render(<GabaritosBatchPreview gabaritos={[]} />);
      });

      expect(screen.queryByTestId('gabarito-card')).not.toBeInTheDocument();
    });

    it('handles single gabarito', async () => {
      await act(async () => {
        render(<GabaritosBatchPreview gabaritos={[mockGabaritos[0]]} />);
      });

      const cards = screen.getAllByTestId('gabarito-card');
      expect(cards).toHaveLength(1);
    });

    it('handles gabarito without optional fields', async () => {
      const minimalGabarito: GabaritoData = {
        nomeAluno: 'Test Student',
        qrCodeUrl: 'https://example.com/qr',
        totalQuestoes: 10,
      };

      await act(async () => {
        render(<GabaritosBatchPreview gabaritos={[minimalGabarito]} />);
      });

      expect(screen.getByTestId('gabarito-card')).toBeInTheDocument();
    });
  });

  describe('useReactToPrint configuration', () => {
    it('configures useReactToPrint with correct options', async () => {
      await act(async () => {
        render(<GabaritosBatchPreview gabaritos={mockGabaritos} />);
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
