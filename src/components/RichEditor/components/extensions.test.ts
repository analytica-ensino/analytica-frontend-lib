import { generateHTML, generateJSON } from '@tiptap/core';
import { createRichEditorExtensions } from './extensions';

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
