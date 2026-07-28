/**
 * Imagem de fallback genérica para os assets de Fluência Leitora.
 *
 * Usada quando a instituição não configurou uma imagem própria (e o asset
 * específico, ex.: o gif de comemoração, já não está mais empacotado na lib
 * porque foi migrado para o backend). É um SVG inline convertido em data URI —
 * assim não depende de loader de asset do bundler (funciona tanto no build da
 * lib via tsup quanto quando o hook é importado direto do source por um app),
 * fica leve e continua editável aqui.
 *
 * Para trocar a arte, edite o SVG abaixo mantendo o `viewBox` (proporção ~252x172,
 * como o modal renderiza a imagem com `object-contain`).
 */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 252 172" fill="none" role="img" aria-label="Imagem padrão">
  <circle cx="126" cy="86" r="60" fill="#DCFCE7"/>
  <circle cx="126" cy="86" r="44" fill="#22C55E"/>
  <path d="M104 88 L120 104 L150 72" stroke="#FFFFFF" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M60 40 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 z" fill="#FACC15"/>
  <path d="M196 44 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 z" fill="#86EFAC"/>
  <path d="M188 122 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 z" fill="#FACC15"/>
  <circle cx="70" cy="120" r="5" fill="#86EFAC"/>
</svg>`;

/** Data URI (image/svg+xml) pronto para usar em `<img src>`. */
export const readingFluencyFallback = `data:image/svg+xml,${encodeURIComponent(
  svg
)}`;
