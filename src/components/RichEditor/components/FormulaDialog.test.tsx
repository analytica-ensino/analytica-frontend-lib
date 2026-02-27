import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FormulaDialog } from './FormulaDialog';

// Mock katex
const mockRenderToString = jest.fn((latex: string, options?: { throwOnError?: boolean }) => {
  if (options?.throwOnError && latex === 'invalid{') {
    throw new Error('KaTeX parse error');
  }
  return `<span class="katex">${latex}</span>`;
});

jest.mock('katex', () => ({
  renderToString: (latex: string, options?: { throwOnError?: boolean }) =>
    mockRenderToString(latex, options),
}));

describe('FormulaDialog', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onInsert: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização', () => {
    it('deve renderizar o modal quando open é true', () => {
      render(<FormulaDialog {...defaultProps} />);

      expect(screen.getByRole('heading', { name: 'Inserir fórmula' })).toBeInTheDocument();
    });

    it('não deve renderizar quando open é false', () => {
      render(<FormulaDialog {...defaultProps} open={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('deve renderizar seção de fórmulas pré-definidas', () => {
      render(<FormulaDialog {...defaultProps} />);

      expect(
        screen.getByText('Fórmulas e símbolos mais usados')
      ).toBeInTheDocument();
    });

    it('deve renderizar seção de criar fórmula', () => {
      render(<FormulaDialog {...defaultProps} />);

      expect(screen.getByText('Crie sua fórmula')).toBeInTheDocument();
    });

    it('deve renderizar categorias de menu', () => {
      render(<FormulaDialog {...defaultProps} />);

      expect(screen.getByText('Matemática')).toBeInTheDocument();
      expect(screen.getByText('Física')).toBeInTheDocument();
      expect(screen.getByText('Química')).toBeInTheDocument();
      expect(screen.getByText('Símbolos')).toBeInTheDocument();
    });

    it('deve renderizar fórmulas da categoria matemática por padrão', () => {
      render(<FormulaDialog {...defaultProps} />);

      expect(screen.getByText('Teorema de Pitágoras')).toBeInTheDocument();
      expect(screen.getByText('Equação de 2º grau')).toBeInTheDocument();
      expect(screen.getByText('Área do círculo')).toBeInTheDocument();
    });

    it('deve renderizar botões de ação', () => {
      render(<FormulaDialog {...defaultProps} />);

      expect(screen.getByText('Cancelar')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Inserir fórmula' })).toBeInTheDocument();
    });

    it('deve renderizar input de LaTeX', () => {
      render(<FormulaDialog {...defaultProps} />);

      expect(screen.getByText('Digite o código LaTeX')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/Ex: \\sqrt\{x\^2 \+ y\^2\}/)
      ).toBeInTheDocument();
    });

    it('deve renderizar seção de IA desabilitada', () => {
      render(<FormulaDialog {...defaultProps} />);

      expect(
        screen.getByText('Descreva o que deseja criar com IA')
      ).toBeInTheDocument();
      expect(screen.getByText('Gerar fórmula')).toBeDisabled();
    });
  });

  describe('Navegação de categorias', () => {
    it('deve mostrar fórmulas de física ao clicar na categoria', () => {
      render(<FormulaDialog {...defaultProps} />);

      fireEvent.click(screen.getByText('Física'));

      expect(screen.getByText('Velocidade média')).toBeInTheDocument();
      expect(screen.getByText('Força (2ª Lei de Newton)')).toBeInTheDocument();
    });

    it('deve mostrar fórmulas de química ao clicar na categoria', () => {
      render(<FormulaDialog {...defaultProps} />);

      fireEvent.click(screen.getByText('Química'));

      expect(screen.getByText('Concentração molar')).toBeInTheDocument();
      expect(screen.getByText('pH')).toBeInTheDocument();
    });

    it('deve mostrar símbolos ao clicar na categoria', () => {
      render(<FormulaDialog {...defaultProps} />);

      fireEvent.click(screen.getByText('Símbolos'));

      expect(screen.getByText('Alfa')).toBeInTheDocument();
      expect(screen.getByText('Pi')).toBeInTheDocument();
      expect(screen.getByText('Infinito')).toBeInTheDocument();
    });
  });

  describe('Seleção de fórmulas', () => {
    it('deve preencher input ao selecionar fórmula pré-definida', () => {
      render(<FormulaDialog {...defaultProps} />);

      fireEvent.click(screen.getByText('Teorema de Pitágoras'));

      const input = screen.getByPlaceholderText(/Ex: \\sqrt\{x\^2 \+ y\^2\}/);
      expect(input).toHaveValue('a^2 + b^2 = c^2');
    });

    it('deve destacar fórmula selecionada', () => {
      render(<FormulaDialog {...defaultProps} />);

      const formulaButton = screen.getByText('Teorema de Pitágoras').closest('button');
      fireEvent.click(formulaButton!);

      expect(formulaButton).toHaveClass('border-primary-500');
    });
  });

  describe('Input de LaTeX', () => {
    it('deve atualizar preview ao digitar LaTeX válido', async () => {
      render(<FormulaDialog {...defaultProps} />);

      const input = screen.getByPlaceholderText(/Ex: \\sqrt\{x\^2 \+ y\^2\}/);
      fireEvent.change(input, { target: { value: 'x^2' } });

      await waitFor(() => {
        expect(screen.getByText('x^2')).toBeInTheDocument();
      });
    });

    it('deve mostrar erro ao digitar LaTeX inválido', async () => {
      render(<FormulaDialog {...defaultProps} />);

      const input = screen.getByPlaceholderText(/Ex: \\sqrt\{x\^2 \+ y\^2\}/);
      // 'invalid{' é configurado no mock para lançar erro
      fireEvent.change(input, { target: { value: 'invalid{' } });

      await waitFor(() => {
        expect(screen.getByText('Fórmula inválida')).toBeInTheDocument();
      });
    });

    it('deve mostrar placeholder quando input está vazio', () => {
      render(<FormulaDialog {...defaultProps} />);

      expect(
        screen.getByText(/Selecione uma fórmula ou símbolo/)
      ).toBeInTheDocument();
    });
  });

  describe('Ações', () => {
    it('deve chamar onClose ao clicar em Cancelar', () => {
      const onClose = jest.fn();
      render(<FormulaDialog {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByText('Cancelar'));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('deve chamar onInsert com latex ao clicar em Inserir fórmula', async () => {
      const onInsert = jest.fn();
      render(<FormulaDialog {...defaultProps} onInsert={onInsert} />);

      // Digitar no input de LaTeX diretamente
      const input = screen.getByPlaceholderText(/Ex: \\sqrt\{x\^2 \+ y\^2\}/);
      fireEvent.change(input, { target: { value: 'x^2' } });

      // Aguardar o estado atualizar e o botão ficar habilitado
      await waitFor(() => {
        const insertButton = screen.getByRole('button', { name: 'Inserir fórmula' });
        expect(insertButton).toBeEnabled();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Inserir fórmula' }));

      expect(onInsert).toHaveBeenCalledWith('x^2');
    });

    it('deve desabilitar botão Inserir quando input está vazio', () => {
      render(<FormulaDialog {...defaultProps} />);

      const insertButton = screen.getByRole('button', { name: 'Inserir fórmula' });
      expect(insertButton).toBeDisabled();
    });

    it('deve desabilitar botão Inserir quando há erro', async () => {
      render(<FormulaDialog {...defaultProps} />);

      const input = screen.getByPlaceholderText(/Ex: \\sqrt\{x\^2 \+ y\^2\}/);
      // 'invalid{' é configurado no mock para lançar erro
      fireEvent.change(input, { target: { value: 'invalid{' } });

      await waitFor(() => {
        const insertButton = screen.getByRole('button', { name: 'Inserir fórmula' });
        expect(insertButton).toBeDisabled();
      });
    });

    it('deve limpar estado ao fechar o modal', () => {
      const onClose = jest.fn();
      const { rerender } = render(
        <FormulaDialog {...defaultProps} onClose={onClose} />
      );

      // Selecionar uma fórmula
      fireEvent.click(screen.getByText('Teorema de Pitágoras'));

      // Fechar o modal
      fireEvent.click(screen.getByText('Cancelar'));

      // Reabrir o modal
      rerender(<FormulaDialog {...defaultProps} open={true} onClose={onClose} />);

      // Input deve estar vazio novamente
      const input = screen.getByPlaceholderText(/Ex: \\sqrt\{x\^2 \+ y\^2\}/);
      expect(input).toHaveValue('');
    });

    it('deve limpar estado após inserir fórmula', async () => {
      const onInsert = jest.fn();
      const { rerender } = render(
        <FormulaDialog {...defaultProps} onInsert={onInsert} />
      );

      // Digitar no input de LaTeX
      const input = screen.getByPlaceholderText(/Ex: \\sqrt\{x\^2 \+ y\^2\}/);
      fireEvent.change(input, { target: { value: 'x^2' } });

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Inserir fórmula' })
        ).toBeEnabled();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Inserir fórmula' }));

      // Reabrir o modal
      rerender(<FormulaDialog {...defaultProps} open={true} onInsert={onInsert} />);

      // Input deve estar vazio
      const inputAfter = screen.getByPlaceholderText(/Ex: \\sqrt\{x\^2 \+ y\^2\}/);
      expect(inputAfter).toHaveValue('');
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter role dialog através do Modal', () => {
      render(<FormulaDialog {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
