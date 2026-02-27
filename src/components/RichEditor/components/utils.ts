/**
 * Processa HTML convertendo padrões $...$ para spans de math-inline
 * que o TipTap pode reconhecer
 */
export function processLatexInHtml(html: string): string {
  if (!html) return html;

  // Regex para encontrar $...$ (não-greedy, permite múltiplas linhas)
  // Captura conteúdo entre $ que não seja vazio
  const latexPattern = /\$([^$]+?)\$/g;

  return html.replaceAll(latexPattern, (_match: string, latex: string) => {
    // Escapa aspas duplas no atributo
    const escapedLatex = latex.replaceAll('"', '&quot;');
    return `<span data-type="math-inline" data-latex="${escapedLatex}"></span>`;
  });
}

/**
 * Converte spans math-inline de volta para formato $...$
 * Útil para exportar o conteúdo em formato mais simples
 */
export function unprocessLatexInHtml(html: string): string {
  if (!html) return html;

  const mathSpanPattern =
    /<span[^>]*data-type="math-inline"[^>]*data-latex="([^"]*)"[^>]*><\/span>/g;

  return html.replaceAll(mathSpanPattern, (_match: string, latex: string) => {
    // Desescapa aspas
    const unescapedLatex = latex.replaceAll('&quot;', '"');
    return `$${unescapedLatex}$`;
  });
}
