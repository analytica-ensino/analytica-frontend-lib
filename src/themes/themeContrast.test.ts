import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Contrato dos temas: `--color-primary` (o passo "0"/base da rampa) NÃO é
 * apenas o topo da escala — é o foreground de tudo que é pintado sobre
 * `--color-primary-800` (barra do AppHeader e os ícones de sino, calendário e
 * perfil, que usam `text-primary`).
 *
 * Os dois passos precisam formar um par contrastante em TODOS os temas e nos
 * dois modos, inclusive nos temas em que o dark inverte o header (paraiba,
 * analytica) e nos que o mantêm escuro (parana, papole).
 *
 * Este teste existe porque a tabela original do tema Papolê definia o passo 0
 * do dark mais escuro que o próprio 800, o que zerava o contraste (1.27:1) e
 * fazia sumir todo o conteúdo da barra.
 */

/*
 * O ESLint só expõe globals de browser/jest em `src/**` (correto: é código que
 * roda no navegador). Este é o único teste que lê arquivo do disco, então
 * declaramos o global do Node aqui em vez de afrouxar a config para toda a
 * pasta. Resolver por `__dirname` — e não pelo cwd — mantém os caminhos
 * corretos independente de onde o Jest for invocado.
 */
/* global __dirname */
const THEMES_DIR = __dirname;
const TOKENS_FILE = join(THEMES_DIR, 'tokens.css');

/** Lê o valor de uma custom property em um arquivo CSS. */
const readToken = (file: string, token: string): string | undefined => {
  if (!existsSync(file)) return undefined;
  const css = readFileSync(file, 'utf8');
  const match = new RegExp(`${token}:\\s*(#[0-9a-fA-F]{3,8})\\s*;`).exec(css);
  return match?.[1];
};

/** Luminância relativa (WCAG 2.x). */
const luminance = (hex: string): number => {
  const full =
    hex.length === 4
      ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
      : hex;
  const channels = [1, 3, 5].map(
    (i) => parseInt(full.slice(i, i + 2), 16) / 255
  );
  const [r, g, b] = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** Temas = subpastas de src/themes que tenham light.css/dark.css. */
const themeDirs = readdirSync(THEMES_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

const cases = themeDirs.flatMap((theme) =>
  (['light', 'dark'] as const).map((mode) => ({ theme, mode }))
);

describe('contrato de contraste dos temas', () => {
  it('encontra as pastas de tema', () => {
    expect(themeDirs.length).toBeGreaterThan(0);
  });

  it.each(cases)(
    '$theme/$mode: --color-primary contrasta com --color-primary-800',
    ({ theme, mode }) => {
      const file = join(THEMES_DIR, theme, `${mode}.css`);
      if (!existsSync(file)) return;

      // Quando o tema não declara o token, ele herda o default do tokens.css.
      const foreground =
        readToken(file, '--color-primary') ??
        readToken(TOKENS_FILE, '--color-primary');
      const background =
        readToken(file, '--color-primary-800') ??
        readToken(TOKENS_FILE, '--color-primary-800');

      expect(foreground).toBeDefined();
      expect(background).toBeDefined();

      const ratio = contrast(foreground!, background!);
      // AA para texto normal. Falhar aqui significa que o conteúdo da barra
      // do AppHeader ficaria ilegível neste tema/modo.
      expect({
        theme,
        mode,
        foreground,
        background,
        ratio: +ratio.toFixed(2),
      }).toMatchObject({ theme, mode });
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    }
  );
});
