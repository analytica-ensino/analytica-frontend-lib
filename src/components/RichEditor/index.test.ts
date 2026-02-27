import '@testing-library/jest-dom';

// Mock das dependências externas
jest.mock('@tiptap/react', () => ({
  useEditor: jest.fn(),
  EditorContent: jest.fn(),
  ReactNodeViewRenderer: jest.fn(),
  NodeViewWrapper: jest.fn(),
}));

jest.mock('@tiptap/starter-kit', () => jest.fn());
jest.mock('@tiptap/extension-underline', () => jest.fn());
jest.mock('@tiptap/extension-text-align', () => ({
  configure: jest.fn(),
}));
jest.mock('@tiptap/extension-color', () => ({
  Color: jest.fn(),
}));
jest.mock('@tiptap/extension-text-style', () => ({
  TextStyle: jest.fn(),
}));
jest.mock('@tiptap/extension-highlight', () => ({
  configure: jest.fn(),
}));
jest.mock('@tiptap/extension-subscript', () => jest.fn());
jest.mock('@tiptap/extension-superscript', () => jest.fn());
jest.mock('@tiptap/extension-link', () => ({
  configure: jest.fn(),
}));
jest.mock('@tiptap/extension-placeholder', () => ({
  configure: jest.fn(),
}));
jest.mock('@tiptap/core', () => ({
  Node: {
    create: jest.fn(() => ({
      name: 'mathInline',
      config: {},
    })),
  },
  mergeAttributes: jest.fn(),
}));

jest.mock('katex', () => ({
  renderToString: jest.fn(),
}));

describe('RichEditor Module Exports', () => {
  it('deve exportar RichEditor', async () => {
    const module = await import('./index');
    expect(module.RichEditor).toBeDefined();
    expect(typeof module.RichEditor).toBe('function');
  });

  it('deve exportar FormulaDialog', async () => {
    const module = await import('./index');
    expect(module.FormulaDialog).toBeDefined();
    expect(typeof module.FormulaDialog).toBe('function');
  });

  it('deve exportar processLatexInHtml', async () => {
    const module = await import('./index');
    expect(module.processLatexInHtml).toBeDefined();
    expect(typeof module.processLatexInHtml).toBe('function');
  });

  it('deve exportar unprocessLatexInHtml', async () => {
    const module = await import('./index');
    expect(module.unprocessLatexInHtml).toBeDefined();
    expect(typeof module.unprocessLatexInHtml).toBe('function');
  });

  it('deve ter todas as exportações esperadas', async () => {
    const module = await import('./index');
    const expectedExports = [
      'RichEditor',
      'FormulaDialog',
      'processLatexInHtml',
      'unprocessLatexInHtml',
    ];

    expectedExports.forEach((exportName) => {
      expect(module).toHaveProperty(exportName);
    });
  });

  it('não deve exportar componentes internos', async () => {
    const module = await import('./index');

    // Componentes internos não devem ser exportados
    expect(module).not.toHaveProperty('RichEditorCore');
    expect(module).not.toHaveProperty('ToolbarBtn');
    expect(module).not.toHaveProperty('Divider');
    expect(module).not.toHaveProperty('MathNode');
    expect(module).not.toHaveProperty('MathNodeView');
    expect(module).not.toHaveProperty('LoadingFallback');
    expect(module).not.toHaveProperty('MissingDependenciesError');
    expect(module).not.toHaveProperty('RichEditorErrorBoundary');
  });
});

describe('processLatexInHtml function', () => {
  it('deve ser uma função', async () => {
    const { processLatexInHtml } = await import('./index');
    expect(typeof processLatexInHtml).toBe('function');
  });

  it('deve processar LaTeX em HTML', async () => {
    const { processLatexInHtml } = await import('./index');
    const result = processLatexInHtml('Texto $x^2$ aqui');
    expect(result).toContain('data-type="math-inline"');
  });
});

describe('unprocessLatexInHtml function', () => {
  it('deve ser uma função', async () => {
    const { unprocessLatexInHtml } = await import('./index');
    expect(typeof unprocessLatexInHtml).toBe('function');
  });

  it('deve reverter HTML para LaTeX', async () => {
    const { unprocessLatexInHtml } = await import('./index');
    const input =
      'Texto <span data-type="math-inline" data-latex="x^2"></span> aqui';
    const result = unprocessLatexInHtml(input);
    expect(result).toBe('Texto $x^2$ aqui');
  });
});

describe('RichEditor component type', () => {
  it('deve ser um componente React válido', async () => {
    const { RichEditor } = await import('./index');

    // Um componente React é uma função
    expect(typeof RichEditor).toBe('function');

    // Deve ter um nome
    expect(RichEditor.name).toBeDefined();
  });
});

describe('FormulaDialog component type', () => {
  it('deve ser um componente React válido', async () => {
    const { FormulaDialog } = await import('./index');

    expect(typeof FormulaDialog).toBe('function');
  });
});
