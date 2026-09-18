import {
  normalizeLineBreaksInHtml,
  preserveEmptyParagraphs,
} from './htmlLineBreaks';

describe('normalizeLineBreaksInHtml', () => {
  describe('conteúdo sem quebras', () => {
    it('deve devolver string vazia inalterada', () => {
      expect(normalizeLineBreaksInHtml('')).toBe('');
    });

    it('deve devolver texto sem \\n inalterado', () => {
      expect(normalizeLineBreaksInHtml('Sem quebras.')).toBe('Sem quebras.');
    });

    it('deve tolerar valor nulo', () => {
      expect(
        normalizeLineBreaksInHtml(undefined as unknown as string)
      ).toBeUndefined();
    });
  });

  describe('conteúdo já estruturado', () => {
    it.each([
      ['<p>um</p>\n<p>dois</p>'],
      ['<div>um</div>\n<div>dois</div>'],
      ['<ul>\n<li>um</li>\n</ul>'],
      ['<h2>título</h2>\n<p>corpo</p>'],
      ['<blockquote>cita</blockquote>\n<p>corpo</p>'],
    ])('deve devolver %s intacto', (html) => {
      expect(normalizeLineBreaksInHtml(html)).toBe(html);
    });
  });

  describe('modo bloco (padrão)', () => {
    it('deve criar um parágrafo por linha em branco', () => {
      expect(normalizeLineBreaksInHtml('um\n\ndois')).toBe(
        '<p>um</p><p>dois</p>'
      );
    });

    it('deve tratar quebra simples como <br>', () => {
      expect(normalizeLineBreaksInHtml('um\ndois')).toBe('<p>um<br>dois</p>');
    });

    it('deve colapsar múltiplas linhas em branco em uma separação', () => {
      expect(normalizeLineBreaksInHtml('um\n\n\n\ndois')).toBe(
        '<p>um</p><p>dois</p>'
      );
    });

    it('deve descartar blocos vazios e espaços nas bordas', () => {
      expect(normalizeLineBreaksInHtml('  um  \n\n   \n\n  dois  ')).toBe(
        '<p>um</p><p>dois</p>'
      );
    });

    it('deve preservar tags inline soltas', () => {
      expect(normalizeLineBreaksInHtml('A) <b>ok</b>\n\nB) <b>não</b>')).toBe(
        '<p>A) <b>ok</b></p><p>B) <b>não</b></p>'
      );
    });

    it('não deve envolver imagem isolada em parágrafo', () => {
      expect(
        normalizeLineBreaksInHtml('texto\n\n<img src="a.png">\n\nmais')
      ).toBe('<p>texto</p><img src="a.png"><p>mais</p>');
    });

    it('deve envolver imagem acompanhada de texto', () => {
      expect(normalizeLineBreaksInHtml('veja <img src="a.png">\n\nfim')).toBe(
        '<p>veja <img src="a.png"></p><p>fim</p>'
      );
    });
  });

  describe('modo inline', () => {
    it('não deve emitir <p>', () => {
      const result = normalizeLineBreaksInHtml('um\n\ndois', { inline: true });

      expect(result).not.toContain('<p>');
      expect(result).toBe('um<br><br>dois');
    });

    it('deve tratar quebra simples como um único <br>', () => {
      expect(normalizeLineBreaksInHtml('um\ndois', { inline: true })).toBe(
        'um<br>dois'
      );
    });

    it('deve preservar tags inline soltas', () => {
      expect(
        normalizeLineBreaksInHtml('A) <b>ok</b>\n\nB) <b>não</b>', {
          inline: true,
        })
      ).toBe('A) <b>ok</b><br><br>B) <b>não</b>');
    });
  });

  describe('conteúdo só com quebras', () => {
    it('deve devolver o original quando não sobra bloco algum', () => {
      // Every block is whitespace, so there is nothing to wrap.
      expect(normalizeLineBreaksInHtml('\n\n')).toBe('\n\n');
      expect(normalizeLineBreaksInHtml('  \n\n   \n  ')).toBe('  \n\n   \n  ');
    });
  });

  describe('quebras CRLF', () => {
    it('deve separar parágrafos vindos de conteúdo com CRLF', () => {
      // CSV/XLSX importado traz \r\n; sem normalizar, o \r fica entre os \n
      // e o split por \n{2,} nunca casa.
      expect(normalizeLineBreaksInHtml('um\r\n\r\ndois')).toBe(
        '<p>um</p><p>dois</p>'
      );
    });

    it('deve tratar CRLF simples como quebra suave', () => {
      expect(normalizeLineBreaksInHtml('um\r\ndois')).toBe('<p>um<br>dois</p>');
    });

    it('não deve deixar \\r solto na saída', () => {
      expect(normalizeLineBreaksInHtml('um\r\n\r\ndois')).not.toContain('\r');
    });

    it('deve normalizar CRLF em conteúdo já estruturado', () => {
      expect(normalizeLineBreaksInHtml('<p>um</p>\r\n<p>dois</p>')).toBe(
        '<p>um</p>\n<p>dois</p>'
      );
    });
  });
});

describe('preserveEmptyParagraphs', () => {
  it('gives an empty paragraph a line break so it keeps its height', () => {
    // The blank line the author left between the reference and the question.
    expect(
      preserveEmptyParagraphs(
        '<p>Texto.<br><em>DONNE, J. (fragmento).</em></p><p></p><p>Nesse poema…</p>'
      )
    ).toBe(
      '<p>Texto.<br><em>DONNE, J. (fragmento).</em></p><p><br></p><p>Nesse poema…</p>'
    );
  });

  it('treats whitespace-only paragraphs as empty and keeps their attributes', () => {
    expect(preserveEmptyParagraphs('<p>  </p><P class="x">\n</P>')).toBe(
      '<p><br></p><p class="x"><br></p>'
    );
  });

  it('leaves paragraphs with content, or already with a break, alone', () => {
    const html = '<p>a</p><p><br></p><p>&nbsp;</p><p><img src="x"></p>';
    expect(preserveEmptyParagraphs(html)).toBe(html);
    expect(preserveEmptyParagraphs('sem parágrafo')).toBe('sem parágrafo');
    expect(preserveEmptyParagraphs('')).toBe('');
  });
});
