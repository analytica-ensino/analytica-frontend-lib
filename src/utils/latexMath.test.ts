import {
  BLOCK_INPUT_RULE,
  INLINE_INPUT_RULE,
  buildMathSpan,
  createLatexEnvPattern,
  createMathSpanPattern,
  findDollarMath,
  isCurrencyAmount,
  isCurrencyDollar,
  looksLikeMath,
  readMathSpanAttributes,
  replaceDollarMath,
} from './latexMath';

describe('buildMathSpan', () => {
  it('serializa fórmula inline sem o atributo de display', () => {
    expect(buildMathSpan('x^2')).toBe(
      '<span data-type="math-inline" data-latex="x^2"></span>'
    );
  });

  it('marca fórmula em bloco com data-display-mode', () => {
    expect(buildMathSpan('\\frac{a}{b}', true)).toBe(
      '<span data-type="math-inline" data-display-mode="true" data-latex="\\frac{a}{b}"></span>'
    );
  });

  it('escapa aspas duplas no atributo', () => {
    expect(buildMathSpan('a "b" c')).toContain(
      'data-latex="a &quot;b&quot; c"'
    );
  });
});

describe('readMathSpanAttributes', () => {
  it('lê latex e display independentemente da ordem dos atributos', () => {
    expect(
      readMathSpanAttributes(
        '<span data-latex="x^2" class="foo" data-display-mode="true" data-type="math-inline"></span>'
      )
    ).toEqual({ latex: 'x^2', display: true });
  });

  it('retorna latex vazio quando o atributo não existe', () => {
    expect(
      readMathSpanAttributes('<span data-type="math-inline"></span>')
    ).toEqual({ latex: '', display: false });
  });
});

describe('createMathSpanPattern', () => {
  it('casa o span canônico do editor', () => {
    const html =
      'antes <span data-type="math-inline" data-latex="x^2"></span> depois';
    expect(html.match(createMathSpanPattern())).toHaveLength(1);
  });

  it('devolve uma regex nova a cada chamada (sem lastIndex compartilhado)', () => {
    expect(createMathSpanPattern()).not.toBe(createMathSpanPattern());
  });
});

describe('createLatexEnvPattern', () => {
  it('casa um ambiente completo pelo nome de abertura', () => {
    const source = 'A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix} fim';
    const matches = source.match(createLatexEnvPattern());
    expect(matches).toHaveLength(1);
    expect(matches?.[0]).toContain('\\begin{pmatrix}');
    expect(matches?.[0]).toContain('\\end{pmatrix}');
  });
});

describe('isCurrencyAmount', () => {
  it.each([
    ['R', '1,00 e de R'],
    [' R', ' 15,00 pelo custo fixo e mais R'],
    ['US', ' 3,50 e depois US'],
  ])('reconhece moeda quando antes="%s"', (before, captured) => {
    expect(isCurrencyAmount(before, captured)).toBe(true);
  });

  it('reconhece número seguido de prosa mesmo sem sigla antes', () => {
    expect(isCurrencyAmount('e ', '1,00 e de R')).toBe(true);
  });

  it('não acusa moeda quando a fórmula não começa com dígito', () => {
    expect(isCurrencyAmount(' R', 'x \\neq 0')).toBe(false);
  });

  it('não acusa moeda quando há comando LaTeX no conteúdo', () => {
    expect(isCurrencyAmount(' R', '2 \\cdot 3')).toBe(false);
  });

  it('não acusa moeda em equação que começa com número', () => {
    expect(isCurrencyAmount('o ', '1 + 2 = 3')).toBe(false);
  });
});

describe('isCurrencyDollar', () => {
  it('usa os dois caracteres anteriores à posição do cifrão', () => {
    const source = 'moedas de R$1,00 e de R$0,50';
    expect(isCurrencyDollar(source, source.indexOf('$'), '1,00 e de R')).toBe(
      true
    );
  });

  it('funciona quando o cifrão está no início da string', () => {
    expect(isCurrencyDollar('$x^2$', 0, 'x^2')).toBe(false);
  });
});

describe('looksLikeMath', () => {
  it.each(['x = 1', 'a + b', '1 < 2', 'f0', 'abc', '\\frac{1}{2}', 'x^2'])(
    'aceita %s como matemática',
    (expression) => {
      expect(looksLikeMath(expression)).toBe(true);
    }
  );

  it('rejeita prosa com duas ou mais palavras', () => {
    expect(looksLikeMath('valor muito alto')).toBe(false);
  });

  it('baixa o limiar para uma palavra quando há número decimal', () => {
    expect(looksLikeMath('15,00 pelo')).toBe(false);
    expect(looksLikeMath('15,00')).toBe(true);
  });
});

describe('findDollarMath', () => {
  it('retorna vazio para entrada vazia', () => {
    expect(findDollarMath('')).toEqual([]);
  });

  it('encontra fórmula inline', () => {
    expect(findDollarMath('o valor de $x^2$ aqui')).toEqual([
      { start: 11, end: 16, latex: 'x^2', display: false },
    ]);
  });

  it('resolve $$...$$ antes de $...$', () => {
    // A regex única anterior casava o `$x$` interno e deixava cifrões órfãos.
    const matches = findDollarMath('resultado $$x^2$$ fim');
    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({ latex: 'x^2', display: true });
  });

  it('ignora cifrão escapado com \\$', () => {
    expect(findDollarMath('custo de R\\$ 130,00 pelo ingresso')).toEqual([]);
  });

  it('atravessa o separador de linha \\\\ dentro da matriz', () => {
    const source =
      '$A = \\begin{pmatrix} -x-1 & \\frac{1}{x} \\\\ -x & \\frac{1}{x}+1 \\end{pmatrix}$';
    const matches = findDollarMath(source);
    expect(matches).toHaveLength(1);
    expect(matches[0].latex).toContain('\\end{pmatrix}');
  });

  it('não pareia cifrões de valores monetários', () => {
    expect(
      findDollarMath(
        'Guardava moedas de R$1,00 e de R$0,50. Total de R$370,00.'
      )
    ).toEqual([]);
  });

  it('ainda encontra a fórmula que vem depois de um preço', () => {
    // Rejeitar consumindo o trecho inteiro engoliria a fórmula seguinte.
    const matches = findDollarMath('custou R$50,00 e vale $x^2$ pontos');
    expect(matches).toHaveLength(1);
    expect(matches[0].latex).toBe('x^2');
  });

  it('ignora cifrão sem par', () => {
    expect(findDollarMath('Preço: $50 dólares')).toEqual([]);
  });

  it('ignora $$ sem fechamento', () => {
    expect(findDollarMath('inicio $$x^2 sem fim')).toEqual([]);
  });

  it('ignora $$ com conteúdo em branco', () => {
    expect(findDollarMath('a $$   $$ b')).toEqual([]);
  });

  it('encontra várias fórmulas na mesma frase', () => {
    const matches = findDollarMath('Área: $A = \\pi r^2$ e $$V = h$$');
    expect(matches.map((m) => m.display)).toEqual([false, true]);
  });
});

describe('replaceDollarMath', () => {
  it('devolve a origem intacta quando não há matemática', () => {
    expect(replaceDollarMath('sem formula', () => 'X')).toBe('sem formula');
  });

  it('substitui apenas as regiões matemáticas', () => {
    expect(
      replaceDollarMath('antes $x^2$ depois', ({ latex }) => `[${latex}]`)
    ).toBe('antes [x^2] depois');
  });
});

describe('input rules', () => {
  it('a regra de bloco casa $$...$$ ancorado no cursor', () => {
    expect(BLOCK_INPUT_RULE.exec('texto $$x^2$$')?.[1]).toBe('x^2');
  });

  it('a regra inline casa $...$ sem exigir espaço depois', () => {
    expect(INLINE_INPUT_RULE.exec('texto $x^2$')?.[1]).toBe('x^2');
  });

  it('a regra inline não reivindica o par interno de $$...$$', () => {
    expect(INLINE_INPUT_RULE.exec('texto $$x^2$$')).toBeNull();
  });
});
