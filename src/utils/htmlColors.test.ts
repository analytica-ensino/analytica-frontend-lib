import { hasColorMarkup } from './htmlColors';

describe('hasColorMarkup', () => {
  describe('conteúdo colorido', () => {
    it('deve reconhecer cor de fonte em span', () => {
      expect(
        hasColorMarkup('<p><span style="color: red">vermelho</span></p>')
      ).toBe(true);
    });

    it('deve reconhecer cor em hexadecimal e rgb', () => {
      expect(hasColorMarkup('<span style="color:#C00000">a</span>')).toBe(true);
      expect(
        hasColorMarkup('<span style="color: rgb(192, 0, 0)">a</span>')
      ).toBe(true);
    });

    it('deve reconhecer cor declarada depois de outra propriedade', () => {
      expect(
        hasColorMarkup('<span style="font-weight:700;color:#ff0000">a</span>')
      ).toBe(true);
    });

    it('deve reconhecer style com aspas simples', () => {
      expect(hasColorMarkup("<span style='color: blue'>a</span>")).toBe(true);
    });

    it('deve reconhecer cor de fundo nas duas formas', () => {
      expect(
        hasColorMarkup('<span style="background-color: yellow">a</span>')
      ).toBe(true);
      expect(hasColorMarkup('<span style="background: #ffff00">a</span>')).toBe(
        true
      );
    });

    it('deve reconhecer a tag font legada dos exports antigos', () => {
      expect(hasColorMarkup('<p><font color="red">enunciado</font></p>')).toBe(
        true
      );
    });

    it('deve reconhecer bgcolor de célula de tabela', () => {
      expect(hasColorMarkup('<td bgcolor="#ffff00">célula</td>')).toBe(true);
    });

    it('deve reconhecer grifo salvo pelo Highlight', () => {
      expect(hasColorMarkup('<mark data-color="yellow">grifado</mark>')).toBe(
        true
      );
    });
  });

  describe('conteúdo sem cor', () => {
    it('deve ignorar conteúdo vazio', () => {
      expect(hasColorMarkup('')).toBe(false);
      expect(hasColorMarkup(undefined)).toBe(false);
      expect(hasColorMarkup(null)).toBe(false);
    });

    it('deve ignorar formatações que não pintam nada', () => {
      expect(
        hasColorMarkup('<p><strong>negrito</strong> e <em>itálico</em></p>')
      ).toBe(false);
    });

    it('deve ignorar propriedades que só terminam em color', () => {
      // `border-color` não é pintura de texto e o editor não a carrega de
      // qualquer forma: casar aqui só geraria onChange desnecessário.
      expect(hasColorMarkup('<td style="border-color: #000">a</td>')).toBe(
        false
      );
    });

    it('não deve acusar cor no HTML que o próprio editor emite', () => {
      // Guarda contra reemissão em loop: o HTML devolvido pelo editor volta como
      // `content` e não pode ser lido como colorido de novo.
      const doEditor =
        '<p>Enunciado <strong>destacado</strong></p>' +
        '<span data-type="math-inline" data-latex="x^2"></span>' +
        '<table style="min-width: 25px;"><colgroup><col style="min-width: 25px;"></colgroup>' +
        '<tbody><tr><td colspan="1" rowspan="1"><p>célula</p></td></tr></tbody></table>' +
        '<img src="https://cdn.exemplo.com/foto.png" width="400">';

      expect(hasColorMarkup(doEditor)).toBe(false);
    });

    it('não deve acusar cor em fórmula LaTeX que usa \\color', () => {
      // O `\color` vive escapado dentro de data-latex, então não é style nem tag.
      expect(
        hasColorMarkup(
          '<span data-type="math-inline" data-latex="\\color{red}{x}"></span>'
        )
      ).toBe(false);
    });
  });
});
