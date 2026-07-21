import { generateHTML, generateJSON } from '@tiptap/core';
import { createRichEditorExtensions } from './extensions';
import { normalizeLineBreaksInHtml, processLatexInHtml } from './utils';

/**
 * These tests exercise the real Tiptap schema (not a mock) because the bug they
 * guard against lives in the schema itself: Tiptap silently discards nodes that
 * no registered extension can match, so only a real parse proves content survives.
 *
 * generateJSON/generateHTML are used instead of `new Editor()` because
 * instantiating an editor view requires DOM APIs jsdom does not implement
 * (elementFromPoint). The parse path being tested is identical.
 */
const extensions = createRichEditorExtensions('Digite aqui...');

const roundTrip = (html: string): string =>
  generateHTML(generateJSON(html, extensions), extensions);

describe('createRichEditorExtensions', () => {
  describe('imagens', () => {
    it('deve preservar a tag <img> ao carregar HTML existente', () => {
      const html = roundTrip(
        '<p>Antes</p><img src="https://cdn.exemplo.com/foto.png"><p>Depois</p>'
      );

      expect(html).toContain('<img');
      expect(html).toContain('https://cdn.exemplo.com/foto.png');
      expect(html).toContain('Antes');
      expect(html).toContain('Depois');
    });

    it('deve preservar o atributo alt da imagem', () => {
      const html = roundTrip(
        '<img src="https://cdn.exemplo.com/foto.png" alt="Gráfico de barras">'
      );

      expect(html).toContain('alt="Gráfico de barras"');
    });

    it('deve manter a imagem intacta ao reabrir a questão salva', () => {
      const original =
        '<p>Enunciado</p><img src="https://cdn.exemplo.com/foto.png" alt="Figura 1">';

      const afterFirstSave = roundTrip(original);
      // Simulates reopening the question with whatever was persisted.
      const afterSecondSave = roundTrip(afterFirstSave);

      expect(afterSecondSave).toContain('https://cdn.exemplo.com/foto.png');
      expect(afterSecondSave).toEqual(afterFirstSave);
    });
  });

  describe('formatações existentes', () => {
    it('deve preservar formatações de texto ao carregar HTML', () => {
      const html = roundTrip(
        '<p><strong>negrito</strong> e <em>itálico</em></p>'
      );

      expect(html).toContain('<strong>negrito</strong>');
      expect(html).toContain('<em>itálico</em>');
    });

    it('deve preservar links ao carregar HTML', () => {
      const html = roundTrip('<p><a href="https://exemplo.com">link</a></p>');

      expect(html).toContain('href="https://exemplo.com"');
    });

    it('deve preservar listas ao carregar HTML', () => {
      const html = roundTrip('<ul><li><p>um</p></li><li><p>dois</p></li></ul>');

      expect(html).toContain('<ul>');
      expect(html).toContain('um');
      expect(html).toContain('dois');
    });
  });
});

describe('normalizeLineBreaksInHtml + schema', () => {
  const prepare = (content: string) =>
    generateHTML(
      generateJSON(
        processLatexInHtml(normalizeLineBreaksInHtml(content)),
        extensions
      ),
      extensions
    );

  it('deve separar em parágrafos texto puro com linha em branco', () => {
    const html = prepare('Linha um.\n\nLinha dois.\n\nLinha três.');

    expect(html).toContain('<p>Linha um.</p>');
    expect(html).toContain('<p>Linha dois.</p>');
    expect(html).toContain('<p>Linha três.</p>');
  });

  it('deve tratar quebra simples como <br> dentro do mesmo parágrafo', () => {
    const html = prepare('Linha um.\nLinha dois.');

    expect(html).toContain('<br>');
    expect(html.match(/<p>/g)).toHaveLength(1);
  });

  it('deve preservar tags inline soltas ao separar parágrafos', () => {
    const html = prepare('A) <b>Correta</b>.\n\nB) <b>Incorreta</b>.');

    expect(html).toContain('<p>A) <strong>Correta</strong>.</p>');
    expect(html).toContain('<p>B) <strong>Incorreta</strong>.</p>');
  });

  it('não deve duplicar parágrafos em conteúdo que já é HTML estruturado', () => {
    const html = prepare('<p>Linha um.</p>\n\n<p>Linha dois.</p>');

    expect(html).toEqual('<p>Linha um.</p><p>Linha dois.</p>');
  });

  it('deve manter LaTeX e quebras de linha juntos', () => {
    const html = prepare('Item (I): $x = 1$.\n\nItem (II): $y = 2$.');

    expect(html.match(/<p>/g)).toHaveLength(2);
    expect(html).toContain('data-latex="x = 1"');
    expect(html).toContain('data-latex="y = 2"');
  });

  it('deve estabilizar após o primeiro salvamento', () => {
    const primeiraAbertura = prepare('Linha um.\n\nLinha dois.');
    // O conteúdo salvo já vem estruturado na próxima abertura.
    const segundaAbertura = prepare(primeiraAbertura);

    expect(segundaAbertura).toEqual(primeiraAbertura);
  });
});

describe('quebras de linha com imagens', () => {
  const prepare = (content: string) =>
    generateHTML(
      generateJSON(
        processLatexInHtml(normalizeLineBreaksInHtml(content)),
        extensions
      ),
      extensions
    );

  it('não deve deixar parágrafo vazio ao redor de imagem isolada', () => {
    const html = prepare(
      'Veja a figura:\n\n<img src="https://cdn.exemplo.com/a.png">\n\nAnalise.'
    );

    expect(html).not.toContain('<p></p>');
    expect(html).toContain('<p>Veja a figura:</p>');
    expect(html).toContain('https://cdn.exemplo.com/a.png');
    expect(html).toContain('<p>Analise.</p>');
  });
});
