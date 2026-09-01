import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { RichEditor } from './RichEditorCore';
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
  setImage: jest.Mock;
  insertContent: jest.Mock;
  setContent: jest.Mock;
  insertTable: jest.Mock;
  addRowBefore: jest.Mock;
  addRowAfter: jest.Mock;
  addColumnBefore: jest.Mock;
  addColumnAfter: jest.Mock;
  toggleHeaderRow: jest.Mock;
  deleteRow: jest.Mock;
  deleteColumn: jest.Mock;
  deleteTable: jest.Mock;
  run: jest.Mock;
}

/**
 * Every chained call returns a brand new mock, so the per-instance `setImage`
 * spy is unreachable from a test. This shared spy records the arguments the
 * editor was actually asked to insert.
 */
const setImageSpy = jest.fn();

/**
 * Same problem as `setImageSpy`, for the table commands: the chain hands back a
 * fresh mock on every hop, so the assertions read the command name (and any
 * argument) from this shared recorder instead.
 */
const tableCommandSpy = jest.fn();

const recordTableCommand =
  (name: string) =>
  (...args: unknown[]) => {
    tableCommandSpy(name, ...args);
    return createMockChain();
  };

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
  setImage: jest.fn((options: Record<string, unknown>) => {
    setImageSpy(options);
    return createMockChain();
  }),
  insertContent: jest.fn(() => createMockChain()),
  setContent: jest.fn(() => createMockChain()),
  insertTable: jest.fn(recordTableCommand('insertTable')),
  addRowBefore: jest.fn(recordTableCommand('addRowBefore')),
  addRowAfter: jest.fn(recordTableCommand('addRowAfter')),
  addColumnBefore: jest.fn(recordTableCommand('addColumnBefore')),
  addColumnAfter: jest.fn(recordTableCommand('addColumnAfter')),
  toggleHeaderRow: jest.fn(recordTableCommand('toggleHeaderRow')),
  deleteRow: jest.fn(recordTableCommand('deleteRow')),
  deleteColumn: jest.fn(recordTableCommand('deleteColumn')),
  deleteTable: jest.fn(recordTableCommand('deleteTable')),
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
  // Roda o seletor de verdade contra o editor mockado: assim `mockEditor
  // .isActive` continua sendo o que os testes controlam para ligar/desligar os
  // estados da toolbar, sem precisar simular transações.
  useEditorState: jest.fn(
    ({
      editor,
      selector,
    }: {
      editor: unknown;
      selector: (snapshot: { editor: unknown }) => unknown;
    }) => (editor ? selector({ editor }) : null)
  ),
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

describe('Imagem', () => {
  /**
   * The dialog measures the image before inserting it, and jsdom never loads
   * one. This stub settles the measurement synchronously so the tests do not
   * wait on the internal timeout.
   */
  let stubbedNaturalWidth: number | null = null;
  const originalImage = globalThis.Image;

  beforeEach(() => {
    jest.clearAllMocks();
    // An earlier test sets useEditor to null to cover the "no editor" branch,
    // and mockReturnValue survives clearAllMocks.
    (useEditor as jest.Mock).mockReturnValue(mockEditor);

    stubbedNaturalWidth = null;
    class FakeImage {
      naturalWidth = 0;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      set src(_value: string) {
        if (stubbedNaturalWidth === null) {
          this.onerror?.();
          return;
        }
        this.naturalWidth = stubbedNaturalWidth;
        this.onload?.();
      }
    }
    globalThis.Image = FakeImage as unknown as typeof globalThis.Image;
  });

  afterEach(() => {
    globalThis.Image = originalImage;
  });

  it('deve abrir o ImageDialog ao clicar no botão de imagem', () => {
    render(<RichEditor />);

    fireEvent.click(screen.getByTitle('Inserir imagem'));

    expect(
      screen.getByRole('heading', { name: 'Inserir imagem' })
    ).toBeInTheDocument();
  });

  it('deve fechar o ImageDialog ao cancelar', () => {
    render(<RichEditor />);

    fireEvent.click(screen.getByTitle('Inserir imagem'));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(
      screen.queryByRole('heading', { name: 'Inserir imagem' })
    ).not.toBeInTheDocument();
  });

  /**
   * Fills the dialog with a URL and confirms it.
   * @param url - Image URL to type into the dialog
   */
  const insertUrl = (url: string) => {
    fireEvent.click(screen.getByTitle('Inserir imagem'));
    fireEvent.change(
      screen.getByPlaceholderText('https://exemplo.com/imagem.png'),
      { target: { value: url } }
    );
    // The toolbar button carries the same accessible name, so scope the query
    // to the dialog.
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Inserir imagem',
      })
    );
  };

  it('deve inserir a imagem no editor ao confirmar uma URL', async () => {
    render(<RichEditor />);

    insertUrl('https://cdn.exemplo.com/a.png');

    await waitFor(() => expect(mockEditor.chain).toHaveBeenCalled());
    expect(
      screen.queryByRole('heading', { name: 'Inserir imagem' })
    ).not.toBeInTheDocument();
  });

  it('deve inserir sem largura quando a imagem já cabe no padrão', async () => {
    stubbedNaturalWidth = 320;
    render(<RichEditor />);

    insertUrl('https://cdn.exemplo.com/pequena.png');

    await waitFor(() =>
      expect(setImageSpy).toHaveBeenCalledWith({
        src: 'https://cdn.exemplo.com/pequena.png',
        alt: '',
      })
    );
  });

  it('deve inserir com largura limitada quando a imagem é muito grande', async () => {
    stubbedNaturalWidth = 1600;
    render(<RichEditor />);

    insertUrl('https://cdn.exemplo.com/enem.png');

    await waitFor(() =>
      expect(setImageSpy).toHaveBeenCalledWith({
        src: 'https://cdn.exemplo.com/enem.png',
        alt: '',
        width: 640,
      })
    );
  });
});

describe('Sincronização de conteúdo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useEditor as jest.Mock).mockReturnValue(mockEditor);
  });

  // The last call is the render from the current test; earlier entries belong
  // to previous ones.
  const getEditorConfig = () =>
    (useEditor as jest.Mock).mock.calls.at(-1)![0] as {
      onUpdate: (arg: { editor: typeof mockEditor }) => void;
    };

  it('deve notificar onChange ao editar', () => {
    const onChange = jest.fn();
    render(<RichEditor onChange={onChange} />);

    getEditorConfig().onUpdate({ editor: mockEditor });

    expect(onChange).toHaveBeenCalledWith({
      json: { type: 'doc', content: [] },
      html: '<p>Test content</p>',
    });
  });

  it('não deve quebrar quando onChange não é informado', () => {
    render(<RichEditor />);

    expect(() =>
      getEditorConfig().onUpdate({ editor: mockEditor })
    ).not.toThrow();
  });

  it('deve aplicar conteúdo novo vindo de fora', () => {
    const { rerender } = render(<RichEditor content="<p>Inicial</p>" />);

    rerender(<RichEditor content="<p>Carregado da API</p>" />);

    expect(mockEditor.commands.setContent).toHaveBeenCalledWith(
      '<p>Carregado da API</p>',
      { emitUpdate: false }
    );
  });

  it('deve normalizar quebras de linha do conteúdo externo', () => {
    const { rerender } = render(<RichEditor content="inicial" />);

    rerender(<RichEditor content={'Linha um.\n\n<b>Linha dois.</b>'} />);

    expect(mockEditor.commands.setContent).toHaveBeenCalledWith(
      '<p>Linha um.</p><p><b>Linha dois.</b></p>',
      { emitUpdate: false }
    );
  });

  it('não deve reaplicar o mesmo conteúdo', () => {
    const { rerender } = render(<RichEditor content="<p>Igual</p>" />);
    (mockEditor.commands.setContent as jest.Mock).mockClear();

    rerender(<RichEditor content="<p>Igual</p>" />);

    expect(mockEditor.commands.setContent).not.toHaveBeenCalled();
  });
});

describe('Tabela', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useEditor as jest.Mock).mockReturnValue(mockEditor);
    mockEditor.isActive.mockReturnValue(false);
  });

  it('deve inserir uma tabela 3x3 com cabeçalho', () => {
    render(<RichEditor />);

    fireEvent.click(screen.getByTitle('Inserir tabela'));

    expect(tableCommandSpy).toHaveBeenCalledWith('insertTable', {
      rows: 3,
      cols: 3,
      withHeaderRow: true,
    });
  });

  it('não deve mostrar as ações de linha/coluna fora de uma tabela', () => {
    render(<RichEditor />);

    expect(screen.queryByTestId('table-toolbar')).not.toBeInTheDocument();
  });

  describe('com o cursor dentro da tabela', () => {
    beforeEach(() => {
      mockEditor.isActive.mockImplementation((name) => name === 'table');
    });

    it('deve mostrar a barra de ações da tabela', () => {
      render(<RichEditor />);

      expect(screen.getByTestId('table-toolbar')).toBeInTheDocument();
    });

    it.each([
      ['Linha acima', 'addRowBefore'],
      ['Linha abaixo', 'addRowAfter'],
      ['Coluna à esquerda', 'addColumnBefore'],
      ['Coluna à direita', 'addColumnAfter'],
      ['Cabeçalho', 'toggleHeaderRow'],
      ['Excluir linha', 'deleteRow'],
      ['Excluir coluna', 'deleteColumn'],
      ['Excluir tabela', 'deleteTable'],
    ])('deve chamar %s -> %s', (label, command) => {
      render(<RichEditor />);

      fireEvent.click(
        within(screen.getByTestId('table-toolbar')).getByTitle(label)
      );

      expect(tableCommandSpy).toHaveBeenCalledWith(command);
    });

    it('deve destacar as ações destrutivas', () => {
      render(<RichEditor />);

      const toolbar = within(screen.getByTestId('table-toolbar'));

      expect(toolbar.getByTitle('Excluir tabela')).toHaveClass(
        'text-error-600'
      );
      expect(toolbar.getByTitle('Linha abaixo')).toHaveClass('text-text-700');
    });
  });
});
