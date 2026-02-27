import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RichEditor } from './RichEditor';
import { useEditor } from '@tiptap/react';

// Mock katex
jest.mock('katex', () => ({
  renderToString: jest.fn(
    (latex: string) => `<span class="katex">${latex}</span>`
  ),
}));

// Mock do useEditor do TipTap
interface MockChainResult {
  focus: jest.Mock;
  toggleBold: jest.Mock;
  toggleItalic: jest.Mock;
  toggleUnderline: jest.Mock;
  toggleStrike: jest.Mock;
  toggleSubscript: jest.Mock;
  toggleSuperscript: jest.Mock;
  toggleCode: jest.Mock;
  toggleHeading: jest.Mock;
  setTextAlign: jest.Mock;
  toggleBulletList: jest.Mock;
  toggleOrderedList: jest.Mock;
  toggleBlockquote: jest.Mock;
  setHorizontalRule: jest.Mock;
  extendMarkRange: jest.Mock;
  setLink: jest.Mock;
  unsetLink: jest.Mock;
  insertContent: jest.Mock;
  setContent: jest.Mock;
  run: jest.Mock;
}

const createMockChain = (): MockChainResult => ({
  focus: jest.fn(() => createMockChain()),
  toggleBold: jest.fn(() => createMockChain()),
  toggleItalic: jest.fn(() => createMockChain()),
  toggleUnderline: jest.fn(() => createMockChain()),
  toggleStrike: jest.fn(() => createMockChain()),
  toggleSubscript: jest.fn(() => createMockChain()),
  toggleSuperscript: jest.fn(() => createMockChain()),
  toggleCode: jest.fn(() => createMockChain()),
  toggleHeading: jest.fn(() => createMockChain()),
  setTextAlign: jest.fn(() => createMockChain()),
  toggleBulletList: jest.fn(() => createMockChain()),
  toggleOrderedList: jest.fn(() => createMockChain()),
  toggleBlockquote: jest.fn(() => createMockChain()),
  setHorizontalRule: jest.fn(() => createMockChain()),
  extendMarkRange: jest.fn(() => createMockChain()),
  setLink: jest.fn(() => createMockChain()),
  unsetLink: jest.fn(() => createMockChain()),
  insertContent: jest.fn(() => createMockChain()),
  setContent: jest.fn(() => createMockChain()),
  run: jest.fn(),
});

const mockChain = jest.fn(createMockChain);

const mockEditor = {
  chain: jest.fn(() => mockChain()),
  isActive: jest.fn(
    (_name?: string, _attributes?: Record<string, unknown>) => false
  ),
  getHTML: jest.fn(() => '<p>Test content</p>'),
  getJSON: jest.fn(() => ({ type: 'doc', content: [] })),
  commands: {
    setContent: jest.fn(),
  },
};

jest.mock('@tiptap/react', () => ({
  useEditor: jest.fn(() => mockEditor),
  EditorContent: jest.fn(({ editor }) => (
    <div data-testid="editor-content">
      {editor ? 'Editor loaded' : 'No editor'}
    </div>
  )),
}));

// Mock window.prompt para o link
const originalPrompt = globalThis.window.prompt;

describe('RichEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.window.prompt = jest.fn();
  });

  afterEach(() => {
    globalThis.window.prompt = originalPrompt;
  });

  describe('Renderização', () => {
    it('deve renderizar o editor', () => {
      render(<RichEditor />);

      expect(screen.getByTestId('editor-content')).toBeInTheDocument();
    });

    it('deve renderizar a toolbar', () => {
      render(<RichEditor />);

      // Botões de heading
      expect(screen.getByTitle('Título 1')).toBeInTheDocument();
      expect(screen.getByTitle('Título 2')).toBeInTheDocument();
      expect(screen.getByTitle('Título 3')).toBeInTheDocument();
    });

    it('deve renderizar botões de formatação de texto', () => {
      render(<RichEditor />);

      expect(screen.getByTitle('Negrito (Ctrl+B)')).toBeInTheDocument();
      expect(screen.getByTitle('Itálico (Ctrl+I)')).toBeInTheDocument();
      expect(screen.getByTitle('Sublinhado (Ctrl+U)')).toBeInTheDocument();
      expect(screen.getByTitle('Tachado')).toBeInTheDocument();
      expect(screen.getByTitle('Subscrito')).toBeInTheDocument();
      expect(screen.getByTitle('Sobrescrito')).toBeInTheDocument();
      expect(screen.getByTitle('Código inline')).toBeInTheDocument();
    });

    it('deve renderizar botões de alinhamento', () => {
      render(<RichEditor />);

      expect(screen.getByTitle('Alinhar à esquerda')).toBeInTheDocument();
      expect(screen.getByTitle('Centralizar')).toBeInTheDocument();
      expect(screen.getByTitle('Alinhar à direita')).toBeInTheDocument();
      expect(screen.getByTitle('Justificar')).toBeInTheDocument();
    });

    it('deve renderizar botões de lista', () => {
      render(<RichEditor />);

      expect(screen.getByTitle('Lista com marcadores')).toBeInTheDocument();
      expect(screen.getByTitle('Lista numerada')).toBeInTheDocument();
      expect(screen.getByTitle('Citação')).toBeInTheDocument();
      expect(screen.getByTitle('Linha horizontal')).toBeInTheDocument();
    });

    it('deve renderizar botão de link', () => {
      render(<RichEditor />);

      expect(screen.getByTitle('Inserir link')).toBeInTheDocument();
    });

    it('deve renderizar botão de fórmula LaTeX', () => {
      render(<RichEditor />);

      expect(screen.getByTitle('Inserir fórmula LaTeX')).toBeInTheDocument();
      expect(screen.getByText('LaTeX')).toBeInTheDocument();
    });

    it('deve renderizar dica de uso do LaTeX', () => {
      render(<RichEditor />);

      expect(screen.getByText(/Dica:/)).toBeInTheDocument();
      expect(screen.getByText('$fórmula$')).toBeInTheDocument();
    });
  });

  describe('Ações da Toolbar', () => {
    it('deve chamar toggleBold ao clicar no botão negrito', () => {
      render(<RichEditor />);

      fireEvent.click(screen.getByTitle('Negrito (Ctrl+B)'));

      expect(mockEditor.chain).toHaveBeenCalled();
    });

    it('deve chamar toggleItalic ao clicar no botão itálico', () => {
      render(<RichEditor />);

      fireEvent.click(screen.getByTitle('Itálico (Ctrl+I)'));

      expect(mockEditor.chain).toHaveBeenCalled();
    });

    it('deve chamar toggleUnderline ao clicar no botão sublinhado', () => {
      render(<RichEditor />);

      fireEvent.click(screen.getByTitle('Sublinhado (Ctrl+U)'));

      expect(mockEditor.chain).toHaveBeenCalled();
    });

    it('deve chamar toggleStrike ao clicar no botão tachado', () => {
      render(<RichEditor />);

      fireEvent.click(screen.getByTitle('Tachado'));

      expect(mockEditor.chain).toHaveBeenCalled();
    });

    it('deve chamar toggleHeading ao clicar nos botões de título', () => {
      render(<RichEditor />);

      fireEvent.click(screen.getByTitle('Título 1'));
      fireEvent.click(screen.getByTitle('Título 2'));
      fireEvent.click(screen.getByTitle('Título 3'));

      expect(mockEditor.chain).toHaveBeenCalledTimes(3);
    });

    it('deve chamar setTextAlign ao clicar nos botões de alinhamento', () => {
      render(<RichEditor />);

      fireEvent.click(screen.getByTitle('Alinhar à esquerda'));
      fireEvent.click(screen.getByTitle('Centralizar'));
      fireEvent.click(screen.getByTitle('Alinhar à direita'));
      fireEvent.click(screen.getByTitle('Justificar'));

      expect(mockEditor.chain).toHaveBeenCalledTimes(4);
    });

    it('deve chamar toggleBulletList ao clicar no botão de lista', () => {
      render(<RichEditor />);

      fireEvent.click(screen.getByTitle('Lista com marcadores'));

      expect(mockEditor.chain).toHaveBeenCalled();
    });

    it('deve chamar toggleOrderedList ao clicar no botão de lista numerada', () => {
      render(<RichEditor />);

      fireEvent.click(screen.getByTitle('Lista numerada'));

      expect(mockEditor.chain).toHaveBeenCalled();
    });

    it('deve chamar toggleBlockquote ao clicar no botão de citação', () => {
      render(<RichEditor />);

      fireEvent.click(screen.getByTitle('Citação'));

      expect(mockEditor.chain).toHaveBeenCalled();
    });

    it('deve chamar setHorizontalRule ao clicar no botão de linha', () => {
      render(<RichEditor />);

      fireEvent.click(screen.getByTitle('Linha horizontal'));

      expect(mockEditor.chain).toHaveBeenCalled();
    });

    it('deve chamar toggleSubscript ao clicar no botão subscrito', () => {
      render(<RichEditor />);

      fireEvent.click(screen.getByTitle('Subscrito'));

      expect(mockEditor.chain).toHaveBeenCalled();
    });

    it('deve chamar toggleSuperscript ao clicar no botão sobrescrito', () => {
      render(<RichEditor />);

      fireEvent.click(screen.getByTitle('Sobrescrito'));

      expect(mockEditor.chain).toHaveBeenCalled();
    });

    it('deve chamar toggleCode ao clicar no botão código', () => {
      render(<RichEditor />);

      fireEvent.click(screen.getByTitle('Código inline'));

      expect(mockEditor.chain).toHaveBeenCalled();
    });
  });

  describe('Link', () => {
    it('deve abrir prompt ao clicar no botão de link', () => {
      (globalThis.window.prompt as jest.Mock).mockReturnValue(
        'https://example.com'
      );

      render(<RichEditor />);

      fireEvent.click(screen.getByTitle('Inserir link'));

      expect(globalThis.window.prompt).toHaveBeenCalledWith('URL do link:');
    });

    it('deve definir link quando URL é fornecida', () => {
      (globalThis.window.prompt as jest.Mock).mockReturnValue(
        'https://example.com'
      );

      render(<RichEditor />);

      fireEvent.click(screen.getByTitle('Inserir link'));

      expect(mockEditor.chain).toHaveBeenCalled();
    });

    it('deve remover link quando URL é vazia', () => {
      (globalThis.window.prompt as jest.Mock).mockReturnValue('');

      render(<RichEditor />);

      fireEvent.click(screen.getByTitle('Inserir link'));

      expect(mockEditor.chain).toHaveBeenCalled();
    });

    it('não deve fazer nada quando prompt é cancelado', () => {
      (globalThis.window.prompt as jest.Mock).mockReturnValue(null);

      render(<RichEditor />);

      const initialCalls = mockEditor.chain.mock.calls.length;
      fireEvent.click(screen.getByTitle('Inserir link'));

      expect(mockEditor.chain.mock.calls.length).toBe(initialCalls);
    });
  });

  describe('FormulaDialog', () => {
    it('deve abrir FormulaDialog ao clicar no botão LaTeX', () => {
      render(<RichEditor />);

      fireEvent.click(screen.getByTitle('Inserir fórmula LaTeX'));

      // Verifica se o modal com o título foi aberto
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: 'Inserir fórmula' })
      ).toBeInTheDocument();
    });

    it('deve fechar FormulaDialog ao clicar em Cancelar', () => {
      render(<RichEditor />);

      fireEvent.click(screen.getByTitle('Inserir fórmula LaTeX'));
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Cancelar'));

      // O modal deve fechar
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('deve inserir fórmula e fechar dialog', async () => {
      render(<RichEditor />);

      // Abrir dialog
      fireEvent.click(screen.getByTitle('Inserir fórmula LaTeX'));

      // Selecionar uma fórmula
      fireEvent.click(screen.getByText('Teorema de Pitágoras'));

      // Aguardar e clicar em inserir (botão dentro do footer do modal)
      await waitFor(() => {
        const insertButtons = screen.getAllByRole('button', {
          name: 'Inserir fórmula',
        });
        const footerButton = insertButtons.find(
          (btn) => !btn.hasAttribute('disabled') || btn.closest('footer')
        );
        expect(footerButton).toBeDefined();
      });

      const insertButtons = screen.getAllByRole('button', {
        name: 'Inserir fórmula',
      });
      const enabledButton = insertButtons.find(
        (btn) => !btn.hasAttribute('disabled')
      );
      if (enabledButton) {
        fireEvent.click(enabledButton);
      }

      // Dialog deve fechar
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      // Editor deve ter recebido o comando de inserir
      expect(mockEditor.chain).toHaveBeenCalled();
    });
  });

  describe('Props', () => {
    it('deve aceitar conteúdo inicial', () => {
      render(<RichEditor content="<p>Conteúdo inicial</p>" />);

      expect(screen.getByTestId('editor-content')).toBeInTheDocument();
    });

    it('deve aceitar placeholder customizado', () => {
      // O placeholder é passado para o TipTap, então verificamos que o componente renderiza
      render(<RichEditor placeholder="Digite seu texto aqui..." />);

      expect(screen.getByTestId('editor-content')).toBeInTheDocument();
    });

    it('deve aceitar callback onChange', () => {
      const onChange = jest.fn();
      render(<RichEditor onChange={onChange} />);

      expect(screen.getByTestId('editor-content')).toBeInTheDocument();
    });
  });

  describe('Estados da Toolbar', () => {
    it('deve aplicar classe ativa quando formatação está ativa', () => {
      // Simular que negrito está ativo
      mockEditor.isActive.mockImplementation((format) => format === 'bold');

      render(<RichEditor />);

      const boldButton = screen.getByTitle('Negrito (Ctrl+B)');
      expect(boldButton).toHaveClass('bg-background-200');
    });

    it('deve aplicar classe inativa quando formatação não está ativa', () => {
      mockEditor.isActive.mockReturnValue(false);

      render(<RichEditor />);

      const boldButton = screen.getByTitle('Negrito (Ctrl+B)');
      expect(boldButton).toHaveClass('text-text-700');
    });
  });

  describe('Editor null', () => {
    it('deve retornar null quando editor não está pronto', () => {
      (useEditor as jest.Mock).mockReturnValue(null);

      const { container } = render(<RichEditor />);

      expect(container.firstChild).toBeNull();
    });
  });
});
