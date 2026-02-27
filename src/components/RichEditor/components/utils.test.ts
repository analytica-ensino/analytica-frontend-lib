import { processLatexInHtml, unprocessLatexInHtml } from './utils';

describe('processLatexInHtml', () => {
  it('deve retornar string vazia quando input é vazio', () => {
    expect(processLatexInHtml('')).toBe('');
  });

  it('deve retornar o mesmo valor quando input é null/undefined', () => {
    expect(processLatexInHtml(null as unknown as string)).toBe(null);
    expect(processLatexInHtml(undefined as unknown as string)).toBe(undefined);
  });

  it('deve converter $...$ para span math-inline', () => {
    const input = 'A fórmula $a^2 + b^2 = c^2$ é o teorema de Pitágoras';
    const expected =
      'A fórmula <span data-type="math-inline" data-latex="a^2 + b^2 = c^2"></span> é o teorema de Pitágoras';

    expect(processLatexInHtml(input)).toBe(expected);
  });

  it('deve converter múltiplas fórmulas', () => {
    const input = 'Área: $A = \\pi r^2$ e Volume: $V = \\frac{4}{3}\\pi r^3$';
    const result = processLatexInHtml(input);

    expect(result).toContain('data-latex="A = \\pi r^2"');
    expect(result).toContain('data-latex="V = \\frac{4}{3}\\pi r^3"');
  });

  it('deve escapar aspas duplas no latex', () => {
    const input = 'Texto $a "quoted" b$ texto';
    const result = processLatexInHtml(input);

    expect(result).toContain('data-latex="a &quot;quoted&quot; b"');
  });

  it('deve ignorar $ sozinhos sem par', () => {
    const input = 'Preço: $50 dólares';
    const result = processLatexInHtml(input);

    // Não deve converter pois não há par de $
    expect(result).toBe('Preço: $50 dólares');
  });

  it('deve converter fórmulas com caracteres especiais', () => {
    const input = '$\\sqrt{x^2 + y^2}$';
    const result = processLatexInHtml(input);

    expect(result).toBe(
      '<span data-type="math-inline" data-latex="\\sqrt{x^2 + y^2}"></span>'
    );
  });

  it('deve preservar HTML existente', () => {
    const input = '<p>Texto <strong>negrito</strong> e $x^2$</p>';
    const result = processLatexInHtml(input);

    expect(result).toContain('<p>Texto <strong>negrito</strong> e ');
    expect(result).toContain('data-latex="x^2"');
  });
});

describe('unprocessLatexInHtml', () => {
  it('deve retornar string vazia quando input é vazio', () => {
    expect(unprocessLatexInHtml('')).toBe('');
  });

  it('deve retornar o mesmo valor quando input é null/undefined', () => {
    expect(unprocessLatexInHtml(null as unknown as string)).toBe(null);
    expect(unprocessLatexInHtml(undefined as unknown as string)).toBe(undefined);
  });

  it('deve converter span math-inline de volta para $...$', () => {
    const input =
      'Texto <span data-type="math-inline" data-latex="a^2 + b^2"></span> texto';
    const expected = 'Texto $a^2 + b^2$ texto';

    expect(unprocessLatexInHtml(input)).toBe(expected);
  });

  it('deve converter múltiplas spans', () => {
    const input =
      '<span data-type="math-inline" data-latex="x"></span> e <span data-type="math-inline" data-latex="y"></span>';
    const expected = '$x$ e $y$';

    expect(unprocessLatexInHtml(input)).toBe(expected);
  });

  it('deve desescapar aspas duplas', () => {
    const input =
      '<span data-type="math-inline" data-latex="a &quot;b&quot; c"></span>';
    const expected = '$a "b" c$';

    expect(unprocessLatexInHtml(input)).toBe(expected);
  });

  it('deve ser inverso de processLatexInHtml', () => {
    const original = 'Fórmula: $a^2 + b^2 = c^2$ aqui';
    const processed = processLatexInHtml(original);
    const unprocessed = unprocessLatexInHtml(processed);

    expect(unprocessed).toBe(original);
  });

  it('deve preservar HTML que não é math-inline', () => {
    const input =
      '<p><strong>Texto</strong> <span data-type="math-inline" data-latex="x"></span></p>';
    const result = unprocessLatexInHtml(input);

    expect(result).toBe('<p><strong>Texto</strong> $x$</p>');
  });

  it('deve lidar com spans com atributos extras', () => {
    const input =
      '<span class="math" data-type="math-inline" style="color:red" data-latex="pi"></span>';
    const expected = '$pi$';

    expect(unprocessLatexInHtml(input)).toBe(expected);
  });
});
