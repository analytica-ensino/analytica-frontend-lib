import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  GabaritoCard,
  PrintStyles,
  PageContainer,
  CartaoContainer,
} from './GabaritoCard';

describe('GabaritoCard', () => {
  const defaultProps = {
    nomeAluno: 'João Silva',
    qrCodeDataUrl: 'data:image/png;base64,test123',
    totalQuestoes: 50,
    tituloProva: 'Simulado ENEM 2024',
    escolaNome: 'Escola Municipal',
    turmaNome: '3º Ano A',
  };

  describe('rendering', () => {
    it('renders header with CARTAO-RESPOSTA title', () => {
      render(<GabaritoCard {...defaultProps} />);
      expect(screen.getByText('CARTAO-RESPOSTA')).toBeInTheDocument();
    });

    it('renders student name', () => {
      render(<GabaritoCard {...defaultProps} />);
      expect(screen.getByText('João Silva')).toBeInTheDocument();
    });

    it('renders exam title in subheader', () => {
      render(<GabaritoCard {...defaultProps} />);
      expect(screen.getByText('Simulado ENEM 2024')).toBeInTheDocument();
    });

    it('renders default title when tituloProva is not provided', () => {
      render(<GabaritoCard {...defaultProps} tituloProva={undefined} />);
      expect(screen.getByText('Simulado Analytica 2026')).toBeInTheDocument();
    });

    it('renders school and class combined', () => {
      render(<GabaritoCard {...defaultProps} />);
      expect(
        screen.getByText('Escola Municipal - 3º Ano A')
      ).toBeInTheDocument();
    });

    it('renders only school when class is not provided', () => {
      render(<GabaritoCard {...defaultProps} turmaNome={undefined} />);
      expect(screen.getByText('Escola Municipal')).toBeInTheDocument();
    });

    it('renders only class when school is not provided', () => {
      render(<GabaritoCard {...defaultProps} escolaNome={undefined} />);
      expect(screen.getByText('3º Ano A')).toBeInTheDocument();
    });

    it('renders empty when neither school nor class provided', () => {
      render(
        <GabaritoCard
          {...defaultProps}
          escolaNome={undefined}
          turmaNome={undefined}
        />
      );
      const content = screen.getByText('ESCOLA E TURMA:').parentElement;
      const contentDiv = content?.querySelector('.content');
      expect(contentDiv?.textContent).toBe('');
    });

    it('renders QR code image when qrCodeDataUrl is provided', () => {
      render(<GabaritoCard {...defaultProps} />);
      const qrImage = screen.getByAltText('QR Code');
      expect(qrImage).toBeInTheDocument();
      expect(qrImage).toHaveAttribute('src', 'data:image/png;base64,test123');
    });

    it('does not render QR code when qrCodeDataUrl is empty', () => {
      render(<GabaritoCard {...defaultProps} qrCodeDataUrl="" />);
      expect(screen.queryByAltText('QR Code')).not.toBeInTheDocument();
    });
  });

  describe('sections', () => {
    it('renders LINGUA ESTRANGEIRA section', () => {
      render(<GabaritoCard {...defaultProps} />);
      expect(screen.getByText('LINGUA ESTRANGEIRA')).toBeInTheDocument();
      expect(screen.getByText('INGLES')).toBeInTheDocument();
      expect(screen.getByText('ESPANHOL')).toBeInTheDocument();
    });

    it('renders fiscal section', () => {
      render(<GabaritoCard {...defaultProps} />);
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
      render(<GabaritoCard {...defaultProps} />);
      expect(
        screen.getByText('ASSINATURA DO PARTICIPANTE')
      ).toBeInTheDocument();
    });

    it('renders instructions section', () => {
      render(<GabaritoCard {...defaultProps} />);
      expect(screen.getByText('INSTRUCOES')).toBeInTheDocument();
    });

    it('renders transcription section', () => {
      render(<GabaritoCard {...defaultProps} />);
      expect(
        screen.getByText(/TRANSCREVA AQUI A FRASE APRESENTADA/)
      ).toBeInTheDocument();
    });

    it('renders example section', () => {
      render(<GabaritoCard {...defaultProps} />);
      expect(screen.getByText('EXEMPLO DE PREENCHIMENTO')).toBeInTheDocument();
      expect(screen.getByText('Exemplo de resposta')).toBeInTheDocument();
    });
  });

  describe('questions grid', () => {
    it('renders correct number of questions', () => {
      render(<GabaritoCard {...defaultProps} totalQuestoes={50} />);
      // 50 questions should be rendered
      const questionNumbers = screen.getAllByText(/^[0-9]+$/);
      // Filter out example numbers (01, 02, 03)
      const gridNumbers = questionNumbers.filter(
        (el) => !el.closest('[class*="ExemploRow"]')
      );
      expect(gridNumbers.length).toBeGreaterThanOrEqual(50);
    });

    it('renders answer bubbles A-E for each question', () => {
      render(<GabaritoCard {...defaultProps} totalQuestoes={1} />);
      expect(screen.getAllByText('A').length).toBeGreaterThan(0);
      expect(screen.getAllByText('B').length).toBeGreaterThan(0);
      expect(screen.getAllByText('C').length).toBeGreaterThan(0);
      expect(screen.getAllByText('D').length).toBeGreaterThan(0);
      expect(screen.getAllByText('E').length).toBeGreaterThan(0);
    });

    it('renders dash for empty cells when questions < grid capacity', () => {
      render(<GabaritoCard {...defaultProps} totalQuestoes={3} />);
      // Grid has 5 columns x 10 rows = 50 cells
      // With 3 questions, 47 cells should be empty
      const dashes = screen.getAllByText('-');
      expect(dashes.length).toBeGreaterThan(0);
    });

    it('renders grid header with column titles', () => {
      render(<GabaritoCard {...defaultProps} />);
      const headers = screen.getAllByText('Questao / Resposta');
      expect(headers).toHaveLength(5); // 5 columns
    });
  });

  describe('example section', () => {
    it('renders three example rows', () => {
      render(<GabaritoCard {...defaultProps} />);
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

describe('CartaoContainer', () => {
  it('renders children', () => {
    render(<CartaoContainer>Card Content</CartaoContainer>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });
});
