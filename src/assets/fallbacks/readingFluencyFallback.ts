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
  <defs>
    <clipPath id="rf-frame"><rect x="46" y="26" width="160" height="120" rx="16"/></clipPath>
  </defs>
  <rect x="46" y="26" width="160" height="120" rx="16" fill="#F0FDF4"/>
  <g clip-path="url(#rf-frame)">
    <circle cx="86" cy="64" r="13" fill="#FACC15"/>
    <path d="M46 146 L100 94 L128 120 L150 104 L206 146 Z" fill="#4ADE80"/>
    <path d="M118 146 L164 108 L206 146 Z" fill="#22C55E"/>
  </g>
  <rect x="46" y="26" width="160" height="120" rx="16" fill="none" stroke="#86EFAC" stroke-width="3"/>
</svg>`;

/** Data URI (image/svg+xml) pronto para usar em `<img src>`. */
export const readingFluencyFallback = `data:image/svg+xml,${encodeURIComponent(
  svg
)}`;
