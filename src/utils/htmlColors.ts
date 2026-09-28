/**
 * Detecção de cor no HTML das questões.
 *
 * O schema do RichEditor não tem atributo onde guardar cor (ver
 * `components/RichEditor/components/extensions.ts`), então toda declaração de
 * cor é descartada na leitura — o autor abre a questão e ela já aparece sem o
 * vermelho que veio da API. O que o schema não faz é avisar que descartou algo:
 * o valor em memória do formulário continua sendo o HTML colorido, e salvar sem
 * editar nada regravaria a cor no banco.
 *
 * Este módulo é o gatilho que fecha esse buraco. É deliberadamente uma
 * heurística sobre a string: basta reconhecer que havia cor para que o editor
 * devolva ao consumidor o HTML já limpo. Um falso positivo custa um
 * `onChange` extra na carga; um falso negativo só deixa a cor no valor salvo até
 * a próxima edição de verdade.
 */

/** Valores de atributos `style` (aspas duplas ou simples) presentes no HTML. */
const STYLE_ATTRIBUTE = /style\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;

/**
 * Propriedades CSS que pintam texto ou fundo, ancoradas no início de uma
 * declaração para não casar com `border-color` e afins. A forma abreviada
 * `background` entra na lista porque é o que Word e Google Docs escrevem com
 * frequência no lugar de `background-color`.
 */
const COLOR_DECLARATION =
  /(?:^|;)\s*(?:color|background|background-color)\s*:/i;

/**
 * Cor que vive fora do `style`: `<font color>` e `bgcolor` vêm dos exports
 * antigos do ENEM e do que se cola de um PDF; `<mark>` e `data-color` são o
 * grifo que o Highlight do Tiptap gravava junto com a cor de fundo.
 */
const COLOR_MARKUP = [
  /<font\b[^>]*\bcolor\s*=/i,
  /<[a-z][^>]*\bbgcolor\s*=/i,
  /<mark\b/i,
  /\bdata-color\s*=/i,
];

/**
 * Se `html` carrega alguma cor que o editor vai descartar ao carregá-lo.
 * @param html - HTML como veio da API, da geração por IA ou de um export antigo
 * @returns True quando há cor de fonte, de fundo ou grifo no conteúdo
 */
export function hasColorMarkup(html?: string | null): boolean {
  if (!html) return false;

  if (COLOR_MARKUP.some((pattern) => pattern.test(html))) return true;

  for (const match of html.matchAll(STYLE_ATTRIBUTE)) {
    if (COLOR_DECLARATION.test(match[1] ?? match[2] ?? '')) return true;
  }

  return false;
}
