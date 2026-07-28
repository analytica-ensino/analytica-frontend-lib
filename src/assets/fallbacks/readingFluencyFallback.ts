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
 * Há duas variantes com a mesma arte, uma por proporção de slot (o `object-contain`
 * preenche o espaço sem sobras quando o `viewBox` casa com o slot):
 * - `readingFluencyFallback`: paisagem ~252x172 (ex.: `SuccessModalReadingFluency`).
 * - `readingFluencyFallbackPortrait`: retrato ~203x254 (ex.: `ReadAloudPromptReadingFluency`).
 *
 * Para trocar a arte, edite os SVGs abaixo mantendo cada `viewBox`.
 */
const landscapeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 252 172" fill="none" role="img" aria-label="Imagem padrão">
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

const portraitSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 203 254" fill="none" role="img" aria-label="Imagem padrão">
  <defs>
    <clipPath id="rf-frame-portrait"><rect x="26" y="34" width="151" height="186" rx="16"/></clipPath>
  </defs>
  <rect x="26" y="34" width="151" height="186" rx="16" fill="#F0FDF4"/>
  <g clip-path="url(#rf-frame-portrait)">
    <circle cx="70" cy="92" r="16" fill="#FACC15"/>
    <path d="M26 220 L86 150 L120 186 L146 160 L177 220 Z" fill="#4ADE80"/>
    <path d="M96 220 L150 164 L177 220 Z" fill="#22C55E"/>
  </g>
  <rect x="26" y="34" width="151" height="186" rx="16" fill="none" stroke="#86EFAC" stroke-width="3"/>
</svg>`;

/** Data URI (image/svg+xml) paisagem, pronto para usar em `<img src>`. */
export const readingFluencyFallback = `data:image/svg+xml,${encodeURIComponent(
  landscapeSvg
)}`;

/** Data URI (image/svg+xml) retrato, para slots verticais (ex.: passarinho). */
export const readingFluencyFallbackPortrait = `data:image/svg+xml,${encodeURIComponent(
  portraitSvg
)}`;
