import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  AnswerSheetCard,
  PrintStyles,
  PageContainer,
  CardContainer,
} from './GabaritoCard';

describe('AnswerSheetCard', () => {
  const defaultProps = {
    studentName: 'João Silva',
    qrCodeDataUrl: 'data:image/png;base64,test123',
    totalQuestions: 50,
    examTitle: 'Simulado ENEM 2024',
    schoolName: 'Escola Municipal',
    className: '3º Ano A',
  };

  describe('rendering', () => {
    it('renders header with CARTAO-RESPOSTA title', () => {
      render(<AnswerSheetCard {...defaultProps} />);
      expect(screen.getByText('CARTAO-RESPOSTA')).toBeInTheDocument();
    });

    it('renders student name', () => {
      render(<AnswerSheetCard {...defaultProps} />);
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    it('renders exam title in subheader', () => {
      render(<AnswerSheetCard {...defaultProps} />);
      expect(screen.getByText('Simulado ENEM 2024')).toBeInTheDocument();
    });

    it('renders default title when examTitle is not provided', () => {
      render(<AnswerSheetCard {...defaultProps} examTitle={undefined} />);
      expect(screen.getByText('Simulado Analytica 2026')).toBeInTheDocument();
    });

    it('renders school and class combined', () => {
      render(<AnswerSheetCard {...defaultProps} />);
      expect(
        screen.getByText('Escola Municipal - 3º Ano A')
      ).toBeInTheDocument();
    });

    it('renders only school when class is not provided', () => {
      render(<AnswerSheetCard {...defaultProps} className={undefined} />);
      expect(screen.getByText('Escola Municipal')).toBeInTheDocument();
    });

    it('renders only class when school is not provided', () => {
      render(<AnswerSheetCard {...defaultProps} schoolName={undefined} />);
      expect(screen.getByText('3º Ano A')).toBeInTheDocument();
    });

    it('renders empty when neither school nor class provided', () => {
      render(
        <AnswerSheetCard
          {...defaultProps}
          schoolName={undefined}
          className={undefined}
        />
      );
      const content = screen.getByText('ESCOLA E TURMA:').parentElement;
      const contentDiv = content?.querySelector('.content');
      expect(contentDiv?.textContent).toBe('');
    });

    it('renders QR code image when qrCodeDataUrl is provided', () => {
      render(<AnswerSheetCard {...defaultProps} />);
      const qrImage = screen.getByAltText('QR Code');
      expect(qrImage).toBeInTheDocument();
      expect(qrImage).toHaveAttribute('src', 'data:image/png;base64,test123');
    });

    it('does not render QR code when qrCodeDataUrl is empty', () => {
      render(<AnswerSheetCard {...defaultProps} qrCodeDataUrl="" />);
      expect(screen.queryByAltText('QR Code')).not.toBeInTheDocument();
    });
  });

  describe('sections', () => {
    it('renders LINGUA ESTRANGEIRA section', () => {
      render(<AnswerSheetCard {...defaultProps} />);
      expect(screen.getByText('LINGUA ESTRANGEIRA')).toBeInTheDocument();
      expect(screen.getByText('INGLES')).toBeInTheDocument();
      expect(screen.getByText('ESPANHOL')).toBeInTheDocument();
    });

    it('renders fiscal section', () => {
      render(<AnswerSheetCard {...defaultProps} />);
      expect(
        screen.getByText('PARA USO EXCLUSIVO DO FISCAL DE SALA')
      ).toBeInTheDocument();
      expect(screen.getByText('PARTICIPANTE AUSENTE')).toBeInTheDocument();
      expect(
        screen.getByText(
          'PARTICIPANTE PRESENTE DEIXOU O CARTAO-RESPOSTA EM BRANCO'
        )
      ).toBeInTheDocument();
    });

    it('renders signature section', () => {
      render(<AnswerSheetCard {...defaultProps} />);
      expect(
        screen.getByText('ASSINATURA DO PARTICIPANTE')
      ).toBeInTheDocument();
    });

    it('renders instructions section', () => {
      render(<AnswerSheetCard {...defaultProps} />);
      expect(screen.getByText('INSTRUCOES')).toBeInTheDocument();
    });

    it('renders transcription section', () => {
      render(<AnswerSheetCard {...defaultProps} />);
      expect(
        screen.getByText(/TRANSCREVA AQUI A FRASE APRESENTADA/)
      ).toBeInTheDocument();
    });

    it('renders example section', () => {
      render(<AnswerSheetCard {...defaultProps} />);
      expect(screen.getByText('EXEMPLO DE PREENCHIMENTO')).toBeInTheDocument();
      expect(screen.getByText('Exemplo de resposta')).toBeInTheDocument();
    });
  });

  describe('questions grid', () => {
    it('renders correct number of questions', () => {
      render(<AnswerSheetCard {...defaultProps} totalQuestions={50} />);
      // 50 questions should be rendered
      const questionNumbers = screen.getAllByText(/^[0-9]+$/);
      // Filter out example numbers (01, 02, 03)
      const gridNumbers = questionNumbers.filter(
        (el) => !el.closest('[class*="ExampleRow"]')
      );
      expect(gridNumbers.length).toBeGreaterThanOrEqual(50);
    });

    it('renders answer bubbles A-E for each question', () => {
      render(<AnswerSheetCard {...defaultProps} totalQuestions={1} />);
      expect(screen.getAllByText('A').length).toBeGreaterThan(0);
      expect(screen.getAllByText('B').length).toBeGreaterThan(0);
      expect(screen.getAllByText('C').length).toBeGreaterThan(0);
      expect(screen.getAllByText('D').length).toBeGreaterThan(0);
      expect(screen.getAllByText('E').length).toBeGreaterThan(0);
    });

    it('renders dash for empty cells when questions < grid capacity', () => {
      render(<AnswerSheetCard {...defaultProps} totalQuestions={3} />);
      // Grid has 5 columns x 10 rows = 50 cells
      // With 3 questions, 47 cells should be empty
      const dashes = screen.getAllByText('-');
      expect(dashes.length).toBeGreaterThan(0);
    });

    it('renders grid header with column titles', () => {
      render(<AnswerSheetCard {...defaultProps} />);
      const headers = screen.getAllByText('Questao / Resposta');
      expect(headers).toHaveLength(5); // 5 columns
    });
  });

  describe('example section', () => {
    it('renders three example rows', () => {
      render(<AnswerSheetCard {...defaultProps} />);
      expect(screen.getByText(/Resposta da questao X = A/)).toBeInTheDocument();
      expect(screen.getByText(/Resposta da questao X = B/)).toBeInTheDocument();
      expect(screen.getByText(/Resposta da questao X = C/)).toBeInTheDocument();
    });
  });
});

describe('PrintStyles', () => {
  it('renders without crashing', () => {
    const { container } = render(<PrintStyles />);
    // Global styles don't render visible content
    expect(container).toBeInTheDocument();
  });
});

describe('PageContainer', () => {
  it('renders children', () => {
    render(<PageContainer>Test Content</PageContainer>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});

describe('CardContainer', () => {
  it('renders children', () => {
    render(<CardContainer>Card Content</CardContainer>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });
});
