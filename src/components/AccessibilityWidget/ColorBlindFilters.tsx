import {
  ColorBlindMode,
  getColorBlindFilterId,
} from '../../store/accessibilityStore';

/**
 * SVG escondido com matrizes `<feColorMatrix>` que simulam/auxiliam
 * cada tipo de daltonismo. As classes em `accessibility.css` aplicam
 * `filter: url(#a11y-cb-...)` no `<html>` para colorir a página.
 *
 * Os IDs dos filters são derivados do enum `ColorBlindMode` via
 * `getColorBlindFilterId` — mesma fonte da verdade que o hook usa
 * para aplicar a classe.
 *
 * Matrizes baseadas em Brettel/Vienot/Mollon — padrão amplamente
 * utilizado em ferramentas de acessibilidade como AXE, Daltonize e
 * widget oficial do HandTalk.
 */
export default function ColorBlindFilters() {
  return (
    <svg
      aria-hidden="true"
      data-testid="a11y-colorblind-filters"
      style={{
        position: 'absolute',
        width: 0,
        height: 0,
        overflow: 'hidden',
      }}
    >
      <defs>
        <filter id={getColorBlindFilterId(ColorBlindMode.Protanopia)}>
          <feColorMatrix
            type="matrix"
            values="0.567 0.433 0     0 0
                    0.558 0.442 0     0 0
                    0     0.242 0.758 0 0
                    0     0     0     1 0"
          />
        </filter>
        <filter id={getColorBlindFilterId(ColorBlindMode.Deuteranopia)}>
          <feColorMatrix
            type="matrix"
            values="0.625 0.375 0   0 0
                    0.700 0.300 0   0 0
                    0     0.300 0.7 0 0
                    0     0     0   1 0"
          />
        </filter>
        <filter id={getColorBlindFilterId(ColorBlindMode.Tritanopia)}>
          <feColorMatrix
            type="matrix"
            values="0.95 0.05  0     0 0
                    0    0.433 0.567 0 0
                    0    0.475 0.525 0 0
                    0    0     0     1 0"
          />
        </filter>
      </defs>
    </svg>
  );
}
