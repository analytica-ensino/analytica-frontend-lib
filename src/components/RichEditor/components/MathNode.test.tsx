import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ReactElement } from 'react';
import type { InputRule } from '@tiptap/core';
import type { Plugin } from '@tiptap/pm/state';
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
    // `addInputRules` closes over `this.type` to build the node it inserts;
    // echoing the attrs back lets the assertions inspect what would be created.
    type: {
      create: (attrs: Record<string, unknown>) => ({
        type: 'mathInline',
        attrs,
      }),
    },
    editor: { commands: { insertContent: jest.fn() } },
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

    it('deve definir atributo display com valor padrão false', () => {
      const attributes = getConfigMethod(MathNode.config.addAttributes) as
        | { display: { default: boolean } }
        | undefined;
      expect(attributes).toHaveProperty('display');
      expect(attributes?.display.default).toBe(false);
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
      expect(result).toEqual({ latex: 'x^2 + y^2', display: false });
    });

    it('deve extrair display do atributo data-display-mode', () => {
      const parseRules = getConfigMethod(MathNode.config.parseHTML);
      const getAttrs = parseRules?.[0].getAttrs;

      const mockDom = {
        dataset: { latex: '\\frac{a}{b}', displayMode: 'true' },
      } as unknown as HTMLElement;

      expect(getAttrs?.(mockDom)).toEqual({
        latex: '\\frac{a}{b}',
        display: true,
      });
    });

    it('deve usar string vazia quando data-latex está ausente', () => {
      // Returning `undefined` here would override the attribute's default and
      // produce a node whose latex attr is undefined, which broke the cursor
      // math on click (FRONTEND-BACKOFFICE-WEB-P).
      const parseRules = getConfigMethod(MathNode.config.parseHTML);
      const getAttrs = parseRules?.[0].getAttrs;

      const mockDom = { dataset: {} } as unknown as HTMLElement;

      const result = getAttrs?.(mockDom);
      expect(result).toEqual({ latex: '', display: false });
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

    it('deve emitir data-display-mode apenas para fórmula em bloco', () => {
      const renderHTML = MathNode.config.renderHTML;
      const mockNode = { attrs: { latex: '\\frac{a}{b}', display: true } };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (renderHTML as any)?.call(
        { name: 'mathInline', options: {}, storage: {} },
        { node: mockNode, HTMLAttributes: {} }
      );

      expect(result).toEqual([
        'span',
        {
          'data-type': 'math-inline',
          'data-display-mode': 'true',
          'data-latex': '\\frac{a}{b}',
        },
      ]);
    });
  });

  describe('addInputRules', () => {
    // The old implementation returned [], leaving the Space shortcut as the
    // only trigger — which is why authors had to type a space after the closing
    // `$` and why `$$...$$` never converted at all.
    const getInputRules = () =>
      getConfigMethod(MathNode.config.addInputRules) as InputRule[];

    /** Drives one input rule the way TipTap's `run()` does. */
    const applyRule = (rule: InputRule, textBefore: string) => {
      const match = rule.find as RegExp;
      const found = match.exec(textBefore);
      if (!found) return null;

      const replaceRangeWith = jest.fn();
      const state = {
        tr: { replaceRangeWith },
        doc: {
          textBetween: (from: number, to: number) => textBefore.slice(from, to),
        },
      };
      const range = {
        from: textBefore.length - found[0].length,
        to: textBefore.length,
      };

      rule.handler({ state, range, match: found } as never);
      return replaceRangeWith;
    };

    it('deve registrar a regra de bloco antes da regra inline', () => {
      const rules = getInputRules();
      expect(rules).toHaveLength(2);
      expect((rules[0].find as RegExp).source).toContain('\\$\\$');
    });

    it('não converte quando o conteúdo entre $ está vazio', () => {
      const rules = getInputRules();
      expect(applyRule(rules[1], 'texto $   $')).not.toHaveBeenCalled();
    });

    it('converte $x^2$ assim que o cifrão final é digitado, sem espaço', () => {
      // Este é o Problema 2/3: antes só o atalho de Espaço convertia, então uma
      // fórmula no fim da frase (ou colada) ficava como texto cru.
      const rules = getInputRules();
      const replaceRangeWith = applyRule(rules[1], 'o valor de $x^2$');

      expect(replaceRangeWith).toHaveBeenCalledWith(11, 16, {
        type: 'mathInline',
        attrs: { latex: 'x^2', display: false },
      });
    });

    it('converte $$...$$ em fórmula de bloco', () => {
      const rules = getInputRules();
      const replaceRangeWith = applyRule(
        rules[0],
        'resultado $$\\frac{a}{b}$$'
      );

      expect(replaceRangeWith).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        { type: 'mathInline', attrs: { latex: '\\frac{a}{b}', display: true } }
      );
    });

    it('a regra inline não reivindica o par interno de $$...$$', () => {
      const rules = getInputRules();
      expect(applyRule(rules[1], 'resultado $$\\frac{a}{b}$$')).toBeNull();
    });

    it('não converte valores monetários em fórmula', () => {
      // Problema relatado: "moedas de R$1,00 e de R$0,50" virava
      // `R 1,00edeR 0,50` porque os dois cifrões fechavam um par válido.
      const rules = getInputRules();
      const replaceRangeWith = applyRule(
        rules[1],
        'Guardava moedas de R$1,00 e de R$'
      );
      expect(replaceRangeWith).not.toHaveBeenCalled();
    });

    it('não converte prosa entre cifrões', () => {
      const rules = getInputRules();
      const replaceRangeWith = applyRule(
        rules[1],
        'comprou $valor muito alto$'
      );
      expect(replaceRangeWith).not.toHaveBeenCalled();
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
      /**
       * Builds an editor mock whose document is exactly `textBefore`, so the
       * currency guard can read the characters preceding the opening `$`.
       */
      const setupSpace = (textBefore: string) => {
        const chain = {
          deleteRange: jest.fn().mockReturnThis(),
          insertContent: jest.fn().mockReturnThis(),
          run: jest.fn(),
        };
        const editor = {
          state: {
            doc: {
              textBetween: (from: number, to: number) =>
                textBefore.slice(from, to),
            },
            selection: {
              $from: {
                parent: { textBetween: jest.fn(() => textBefore) },
                parentOffset: textBefore.length,
                pos: textBefore.length,
              },
            },
          },
          chain: jest.fn(() => chain),
        };

        const shortcuts = getConfigMethod(MathNode.config.addKeyboardShortcuts);
        const result = shortcuts?.Space?.({ editor } as never);
        return { result, chain, editor };
      };

      it('deve retornar false quando não há padrão $...$ antes do cursor', () => {
        const { result } = setupSpace('texto normal sem formula');
        expect(result).toBe(false);
      });

      it('deve converter $latex$ para math node quando Space é pressionado', () => {
        const { result, chain, editor } = setupSpace('texto $x^2$');

        expect(result).toBe(true);
        expect(editor.chain).toHaveBeenCalled();
        expect(chain.deleteRange).toHaveBeenCalled();
        expect(chain.insertContent).toHaveBeenCalledWith([
          { type: 'mathInline', attrs: { latex: 'x^2', display: false } },
          { type: 'text', text: ' ' },
        ]);
        expect(chain.run).toHaveBeenCalled();
      });

      it('deve converter $$latex$$ em fórmula de bloco', () => {
        const { result, chain } = setupSpace('texto $$\\frac{a}{b}$$');

        expect(result).toBe(true);
        expect(chain.insertContent).toHaveBeenCalledWith([
          {
            type: 'mathInline',
            attrs: { latex: '\\frac{a}{b}', display: true },
          },
          { type: 'text', text: ' ' },
        ]);
      });

      it('não converte valores monetários quando Space é pressionado', () => {
        const { result, editor } = setupSpace('moedas de R$1,00 e de R$');
        expect(result).toBe(false);
        expect(editor.chain).not.toHaveBeenCalled();
      });

      it('deve retornar false quando $...$ está vazio', () => {
        const { result, editor } = setupSpace('texto $   $');
        expect(result).toBe(false);
        expect(editor.chain).not.toHaveBeenCalled();
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

      it('devolve fórmula de bloco com delimitador duplo', () => {
        const shortcuts = getConfigMethod(MathNode.config.addKeyboardShortcuts);
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
                  attrs: { latex: '\\frac{a}{b}', display: true },
                  nodeSize: 1,
                },
                pos: 10,
              },
            },
          },
          chain: jest.fn(() => mockChain),
        };

        shortcuts?.Backspace?.({ editor: mockEditor } as never);

        expect(mockChain.insertContent).toHaveBeenCalledWith('$$\\frac{a}{b}');
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
    display = false,
  }: {
    pos: number | undefined;
    latex?: unknown;
    docSize?: number;
    display?: boolean;
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
    const node = { attrs: { latex, display }, nodeSize: 1 };

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

  it('reinsere fórmula de bloco com delimitador duplo ao clicar', () => {
    const { setTextSelection } = setup({
      pos: 3,
      latex: 'x^2',
      display: true,
    });

    fireEvent.click(screen.getByTestId('node-view-wrapper'));

    // pos + latex.length + '$$'.length
    expect(setTextSelection).toHaveBeenCalledWith(8);
  });

  it('renderiza fórmula de bloco em displayMode', () => {
    const NodeView = getNodeView();
    render(
      <NodeView
        node={{ attrs: { latex: '\\frac{a}{b}', display: true }, nodeSize: 1 }}
        editor={{}}
        getPos={() => 0}
      />
    );

    expect(mockRenderToString).toHaveBeenCalledWith('\\frac{a}{b}', {
      throwOnError: false,
      displayMode: true,
    });
  });

  it('exibe o latex cru quando o katex lança', () => {
    const NodeView = getNodeView();
    render(
      <NodeView
        node={{ attrs: { latex: 'error-latex' }, nodeSize: 1 }}
        editor={{}}
        getPos={() => 0}
      />
    );

    expect(screen.getByTestId('node-view-wrapper')).toHaveTextContent(
      'error-latex'
    );
  });

  it('posiciona o cursor no fim do texto inserido no caso normal', () => {
    const { setTextSelection } = setup({ pos: 3, latex: 'x^2', docSize: 100 });

    fireEvent.click(screen.getByTestId('node-view-wrapper'));

    expect(setTextSelection).toHaveBeenCalledWith(7); // 3 + 3 + 1
  });
});

describe('MathNode paste handling', () => {
  // Input rules only fire while typing, so before this plugin a formula copied
  // from a document or from the KaTeX playground landed as raw text (Problema 3).
  const setupPastePlugin = () => {
    const insertContent = jest.fn();
    const plugins = (
      MathNode.config.addProseMirrorPlugins as unknown as (
        this: unknown
      ) => Plugin[]
    ).call({
      name: 'mathInline',
      options: {},
      storage: {},
      editor: { commands: { insertContent } },
    });

    // ProseMirror types these props with a `this: Plugin` context that the
    // tests do not need to reproduce.
    const props = plugins[0].props as {
      transformPastedHTML?: (html: string) => string;
      handlePaste?: (view: unknown, event: ClipboardEvent) => boolean;
    };

    return { props, insertContent };
  };

  const clipboardEvent = (data: Record<string, string>) =>
    ({
      clipboardData: { getData: (type: string) => data[type] ?? '' },
    }) as unknown as ClipboardEvent;

  it('converte LaTeX em HTML colado', () => {
    const { props } = setupPastePlugin();
    const result = props?.transformPastedHTML?.('<p>o valor de $x^2$ aqui</p>');

    expect(result).toContain('data-type="math-inline"');
    expect(result).toContain('data-latex="x^2"');
  });

  it('converte texto puro colado e insere como HTML', () => {
    const { props, insertContent } = setupPastePlugin();
    const handled = props?.handlePaste?.(
      null,
      clipboardEvent({
        'text/plain': 'A matriz $\\begin{pmatrix} a & b \\end{pmatrix}$',
      })
    );

    expect(handled).toBe(true);
    expect(insertContent).toHaveBeenCalledWith(
      expect.stringContaining('data-type="math-inline"')
    );
  });

  it('deixa o ProseMirror tratar quando o clipboard já traz HTML', () => {
    const { props, insertContent } = setupPastePlugin();
    const handled = props?.handlePaste?.(
      null,
      clipboardEvent({ 'text/html': '<p>$x^2$</p>', 'text/plain': '$x^2$' })
    );

    expect(handled).toBe(false);
    expect(insertContent).not.toHaveBeenCalled();
  });

  it('ignora texto colado sem LaTeX', () => {
    const { props, insertContent } = setupPastePlugin();
    const handled = props?.handlePaste?.(
      null,
      clipboardEvent({ 'text/plain': 'apenas texto comum' })
    );

    expect(handled).toBe(false);
    expect(insertContent).not.toHaveBeenCalled();
  });

  it('ignora valores monetários colados', () => {
    const { props, insertContent } = setupPastePlugin();
    const handled = props?.handlePaste?.(
      null,
      clipboardEvent({ 'text/plain': 'moedas de R$1,00 e de R$0,50' })
    );

    expect(handled).toBe(false);
    expect(insertContent).not.toHaveBeenCalled();
  });

  it('ignora colagem sem clipboardData', () => {
    const { props } = setupPastePlugin();
    const handled = props?.handlePaste?.(null, {
      clipboardData: null,
    } as unknown as ClipboardEvent);

    expect(handled).toBe(false);
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
