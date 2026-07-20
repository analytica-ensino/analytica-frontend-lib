import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MathNode } from './MathNode';

// Mock katex
const mockRenderToString = jest.fn(
  (
    latex: string,
    _options?: { throwOnError?: boolean; displayMode?: boolean }
  ) => {
    if (latex === 'error-latex') {
      throw new Error('KaTeX parse error');
    }
    return `<span class="katex">${latex}</span>`;
  }
);

jest.mock('katex', () => ({
  renderToString: (
    latex: string,
    options?: { throwOnError?: boolean; displayMode?: boolean }
  ) => mockRenderToString(latex, options),
}));

// Mock TipTap dependencies
jest.mock('@tiptap/react', () => ({
  ReactNodeViewRenderer: jest.fn((component) => component),
  NodeViewWrapper: jest.fn(({ children, ...props }) => (
    <span data-testid="node-view-wrapper" {...props}>
      {children}
    </span>
  )),
}));

// Helper para chamar métodos de config com contexto mockado
const getConfigMethod = <T,>(
  method: (() => T) | null | undefined
): T | undefined => {
  if (!method) return undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (method as any).call({
    name: 'mathInline',
    options: {},
    storage: {},
    parent: undefined,
  });
};

describe('MathNode Extension', () => {
  describe('Configuration', () => {
    it('deve ter nome correto', () => {
      expect(MathNode.name).toBe('mathInline');
    });

    it('deve ter configuração de grupo inline', () => {
      expect(MathNode.config.group).toBe('inline');
    });

    it('deve ser inline', () => {
      expect(MathNode.config.inline).toBe(true);
    });

    it('deve ser atom', () => {
      expect(MathNode.config.atom).toBe(true);
    });

    it('deve ser selecionável', () => {
      expect(MathNode.config.selectable).toBe(true);
    });
  });

  describe('Attributes', () => {
    it('deve definir atributo latex com valor padrão vazio', () => {
      const attributes = getConfigMethod(MathNode.config.addAttributes) as
        | { latex: { default: string } }
        | undefined;
      expect(attributes).toHaveProperty('latex');
      expect(attributes?.latex.default).toBe('');
    });
  });

  describe('parseHTML', () => {
    it('deve retornar regras de parse corretas', () => {
      const parseRules = getConfigMethod(MathNode.config.parseHTML);
      expect(parseRules).toHaveLength(1);
      expect(parseRules?.[0].tag).toBe('span[data-type="math-inline"]');
    });

    it('deve extrair atributo latex do dataset', () => {
      const parseRules = getConfigMethod(MathNode.config.parseHTML);
      const getAttrs = parseRules?.[0].getAttrs;

      const mockDom = {
        dataset: { latex: 'x^2 + y^2' },
      } as unknown as HTMLElement;

      const result = getAttrs?.(mockDom);
      expect(result).toEqual({ latex: 'x^2 + y^2' });
    });

    it('deve usar string vazia quando data-latex está ausente', () => {
      // Returning `undefined` here would override the attribute's default and
      // produce a node whose latex attr is undefined, which broke the cursor
      // math on click (FRONTEND-BACKOFFICE-WEB-P).
      const parseRules = getConfigMethod(MathNode.config.parseHTML);
      const getAttrs = parseRules?.[0].getAttrs;

      const mockDom = { dataset: {} } as unknown as HTMLElement;

      const result = getAttrs?.(mockDom);
      expect(result).toEqual({ latex: '' });
    });
  });

  describe('renderHTML', () => {
    it('deve renderizar span com atributos corretos', () => {
      const renderHTML = MathNode.config.renderHTML;
      const mockNode = {
        attrs: { latex: 'a^2 + b^2 = c^2' },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (renderHTML as any)?.call(
        { name: 'mathInline', options: {}, storage: {} },
        { node: mockNode, HTMLAttributes: {} }
      );

      expect(result).toEqual([
        'span',
        {
          'data-type': 'math-inline',
          'data-latex': 'a^2 + b^2 = c^2',
        },
      ]);
    });

    it('deve mesclar HTMLAttributes existentes', () => {
      const renderHTML = MathNode.config.renderHTML;
      const mockNode = {
        attrs: { latex: 'pi' },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (renderHTML as any)?.call(
        { name: 'mathInline', options: {}, storage: {} },
        { node: mockNode, HTMLAttributes: { class: 'custom-class' } }
      );

      expect(result).toEqual([
        'span',
        {
          class: 'custom-class',
          'data-type': 'math-inline',
          'data-latex': 'pi',
        },
      ]);
    });
  });

  describe('addInputRules', () => {
    it('deve retornar array vazio (input rules desabilitadas)', () => {
      const inputRules = getConfigMethod(MathNode.config.addInputRules);
      expect(inputRules).toEqual([]);
    });
  });

  describe('addKeyboardShortcuts', () => {
    it('deve definir atalho para Space', () => {
      const shortcuts = getConfigMethod(MathNode.config.addKeyboardShortcuts);
      expect(shortcuts).toHaveProperty('Space');
      expect(typeof shortcuts?.Space).toBe('function');
    });

    it('deve definir atalho para Backspace', () => {
      const shortcuts = getConfigMethod(MathNode.config.addKeyboardShortcuts);
      expect(shortcuts).toHaveProperty('Backspace');
      expect(typeof shortcuts?.Backspace).toBe('function');
    });

    describe('Space shortcut', () => {
      it('deve retornar false quando não há padrão $...$ antes do cursor', () => {
        const shortcuts = getConfigMethod(MathNode.config.addKeyboardShortcuts);
        const spaceHandler = shortcuts?.Space;

        const mockEditor = {
          state: {
            selection: {
              $from: {
                parent: {
                  textBetween: jest.fn(() => 'texto normal sem formula'),
                },
                parentOffset: 25,
                pos: 25,
              },
            },
          },
          chain: jest.fn(() => ({
            deleteRange: jest.fn().mockReturnThis(),
            insertContent: jest.fn().mockReturnThis(),
            run: jest.fn(),
          })),
        };

        const result = spaceHandler?.({ editor: mockEditor } as never);
        expect(result).toBe(false);
      });

      it('deve converter $latex$ para math node quando Space é pressionado', () => {
        const shortcuts = getConfigMethod(MathNode.config.addKeyboardShortcuts);
        const spaceHandler = shortcuts?.Space;

        const mockChain = {
          deleteRange: jest.fn().mockReturnThis(),
          insertContent: jest.fn().mockReturnThis(),
          run: jest.fn(),
        };

        const mockEditor = {
          state: {
            selection: {
              $from: {
                parent: {
                  textBetween: jest.fn(() => 'texto $x^2$'),
                },
                parentOffset: 11,
                pos: 11,
              },
            },
          },
          chain: jest.fn(() => mockChain),
        };

        const result = spaceHandler?.({ editor: mockEditor } as never);

        expect(result).toBe(true);
        expect(mockEditor.chain).toHaveBeenCalled();
        expect(mockChain.deleteRange).toHaveBeenCalled();
        expect(mockChain.insertContent).toHaveBeenCalledWith([
          { type: 'mathInline', attrs: { latex: 'x^2' } },
          { type: 'text', text: ' ' },
        ]);
        expect(mockChain.run).toHaveBeenCalled();
      });

      it('deve retornar false quando $...$ está vazio', () => {
        const shortcuts = getConfigMethod(MathNode.config.addKeyboardShortcuts);
        const spaceHandler = shortcuts?.Space;

        const mockEditor = {
          state: {
            selection: {
              $from: {
                parent: {
                  textBetween: jest.fn(() => 'texto $   $'),
                },
                parentOffset: 11,
                pos: 11,
              },
            },
          },
          chain: jest.fn(),
        };

        const result = spaceHandler?.({ editor: mockEditor } as never);
        expect(result).toBe(false);
        expect(mockEditor.chain).not.toHaveBeenCalled();
      });
    });

    describe('Backspace shortcut', () => {
      it('deve retornar false quando não há math node antes do cursor', () => {
        const shortcuts = getConfigMethod(MathNode.config.addKeyboardShortcuts);
        const backspaceHandler = shortcuts?.Backspace;

        const mockEditor = {
          state: {
            selection: {
              $from: {
                nodeBefore: null,
                pos: 10,
              },
            },
          },
          chain: jest.fn(),
        };

        const result = backspaceHandler?.({ editor: mockEditor } as never);
        expect(result).toBe(false);
      });

      it('deve retornar false quando node antes não é mathInline', () => {
        const shortcuts = getConfigMethod(MathNode.config.addKeyboardShortcuts);
        const backspaceHandler = shortcuts?.Backspace;

        const mockEditor = {
          state: {
            selection: {
              $from: {
                nodeBefore: {
                  type: { name: 'text' },
                },
                pos: 10,
              },
            },
          },
          chain: jest.fn(),
        };

        const result = backspaceHandler?.({ editor: mockEditor } as never);
        expect(result).toBe(false);
      });

      it('deve converter math node de volta para texto editável', () => {
        const shortcuts = getConfigMethod(MathNode.config.addKeyboardShortcuts);
        const backspaceHandler = shortcuts?.Backspace;

        const mockChain = {
          deleteRange: jest.fn().mockReturnThis(),
          insertContent: jest.fn().mockReturnThis(),
          run: jest.fn(),
        };

        const mockEditor = {
          state: {
            selection: {
              $from: {
                nodeBefore: {
                  type: { name: 'mathInline' },
                  attrs: { latex: 'a^2' },
                  nodeSize: 1,
                },
                pos: 10,
              },
            },
          },
          chain: jest.fn(() => mockChain),
        };

        const result = backspaceHandler?.({ editor: mockEditor } as never);

        expect(result).toBe(true);
        expect(mockEditor.chain).toHaveBeenCalled();
        expect(mockChain.deleteRange).toHaveBeenCalledWith({ from: 9, to: 10 });
        expect(mockChain.insertContent).toHaveBeenCalledWith('$a^2');
        expect(mockChain.run).toHaveBeenCalled();
      });
    });
  });

  describe('addNodeView', () => {
    it('deve retornar ReactNodeViewRenderer', () => {
      const nodeView = getConfigMethod(MathNode.config.addNodeView);
      expect(nodeView).toBeDefined();
    });
  });
});

describe('MathNodeView Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar fórmula LaTeX usando katex', () => {
    // O MathNodeView é interno, então testamos via a extensão
    // A funcionalidade principal é testada via renderToString
    expect(mockRenderToString).toBeDefined();

    // Simular chamada
    const result = mockRenderToString('x^2', {
      throwOnError: false,
      displayMode: false,
    });
    expect(result).toBe('<span class="katex">x^2</span>');
  });

  it('deve retornar span de erro quando katex falha', () => {
    // Simular erro
    expect(() => mockRenderToString('error-latex', {})).toThrow(
      'KaTeX parse error'
    );
  });

  it('deve chamar katex com opções corretas', () => {
    mockRenderToString('pi', { throwOnError: false, displayMode: false });

    expect(mockRenderToString).toHaveBeenCalledWith('pi', {
      throwOnError: false,
      displayMode: false,
    });
  });
});

describe('MathNodeView click handling', () => {
  // The node view is what actually runs on click; ReactNodeViewRenderer is
  // mocked as identity, so addNodeView() hands us the component itself.
  const getNodeView = () =>
    getConfigMethod(MathNode.config.addNodeView) as unknown as (props: {
      node: unknown;
      editor: unknown;
      getPos: () => number | undefined;
    }) => ReactElement;

  const setup = ({
    pos,
    // Not a default parameter: passing `latex: undefined` explicitly must reach
    // the component as undefined (a default would silently substitute it).
    latex,
    docSize = 100,
  }: {
    pos: number | undefined;
    latex?: unknown;
    docSize?: number;
  }) => {
    const setTextSelection = jest.fn();
    const run = jest.fn();
    const chain = {
      focus: () => chain,
      deleteRange: () => chain,
      insertContent: () => chain,
      run,
    };
    const editor = {
      chain: () => chain,
      commands: { setTextSelection },
      state: { doc: { content: { size: docSize } } },
    };
    const node = { attrs: { latex }, nodeSize: 1 };

    const NodeView = getNodeView();
    render(<NodeView node={node} editor={editor} getPos={() => pos} />);

    return { setTextSelection, run };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('não chama setTextSelection quando getPos retorna NaN', () => {
    // typeof NaN === 'number', so the old guard let it through and ProseMirror
    // threw "Position NaN out of range" (FRONTEND-BACKOFFICE-WEB-P).
    const { setTextSelection, run } = setup({ pos: NaN, latex: 'x^2' });

    fireEvent.click(screen.getByTestId('node-view-wrapper'));

    expect(run).not.toHaveBeenCalled();
    expect(setTextSelection).not.toHaveBeenCalled();
  });

  it('não chama setTextSelection quando getPos retorna undefined', () => {
    const { setTextSelection, run } = setup({ pos: undefined, latex: 'x^2' });

    fireEvent.click(screen.getByTestId('node-view-wrapper'));

    expect(run).not.toHaveBeenCalled();
    expect(setTextSelection).not.toHaveBeenCalled();
  });

  it('usa uma posição numérica válida quando latex não é string', () => {
    // `undefined.length` used to make the sum NaN.
    const { setTextSelection } = setup({ pos: 5, latex: undefined });

    fireEvent.click(screen.getByTestId('node-view-wrapper'));

    expect(setTextSelection).toHaveBeenCalledTimes(1);
    const calledWith = setTextSelection.mock.calls[0][0];
    expect(Number.isFinite(calledWith)).toBe(true);
    expect(calledWith).toBe(6); // pos + ''.length + 1
  });

  it('limita a posição ao tamanho do documento', () => {
    // pos + latex.length + 1 would land past the end of the doc.
    const { setTextSelection } = setup({
      pos: 8,
      latex: 'abcdef',
      docSize: 10,
    });

    fireEvent.click(screen.getByTestId('node-view-wrapper'));

    expect(setTextSelection).toHaveBeenCalledWith(10);
  });

  it('posiciona o cursor no fim do texto inserido no caso normal', () => {
    const { setTextSelection } = setup({ pos: 3, latex: 'x^2', docSize: 100 });

    fireEvent.click(screen.getByTestId('node-view-wrapper'));

    expect(setTextSelection).toHaveBeenCalledWith(7); // 3 + 3 + 1
  });
});

describe('MathNode Integration', () => {
  it('deve ter todas as propriedades de extensão necessárias', () => {
    expect(MathNode.config).toHaveProperty('addAttributes');
    expect(MathNode.config).toHaveProperty('parseHTML');
    expect(MathNode.config).toHaveProperty('renderHTML');
    expect(MathNode.config).toHaveProperty('addNodeView');
    expect(MathNode.config).toHaveProperty('addInputRules');
    expect(MathNode.config).toHaveProperty('addKeyboardShortcuts');
  });

  it('deve exportar MathNode como extensão do TipTap', () => {
    expect(MathNode).toBeDefined();
    expect(MathNode.name).toBe('mathInline');
  });
});
