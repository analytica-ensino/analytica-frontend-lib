import { useId, type FC } from 'react';
import type { ReadingFluencyIconProps } from './types';

/**
 * Ícone do modo CONTAR do Papolê — os quatro bloquinhos de operação
 * (+ − = ÷) arrumados num quadrado (o "Math" da arte). Ilustração multicolor
 * com cores fixas, viewBox nativo 32×32. Usado no seletor de modo
 * (`ModeToggleReadingFluency`). A versão grande, da capa do card, é a
 * `MathCoverIconReadingFluency`.
 *
 * `size` define largura e altura (é quadrado); sem `size`, usa o tamanho
 * nativo. Os ids dos filtros/recortes levam o `useId` para que várias instâncias
 * na mesma página não colidam. `aria-hidden` por ser decorativo — quem usa em
 * botão deve prover o rótulo.
 */
export const MathIconReadingFluency: FC<ReadingFluencyIconProps> = ({
  size,
  className,
}) => {
  // `useId` devolve algo como «r1»; só letras, dígitos, `-` e `_` são seguros
  // dentro de um `url(#...)`.
  const uid = `rf${useId().replaceAll(/[^a-zA-Z0-9_-]/g, '')}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size ?? 32}
      height={size ?? 32}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g filter={`url(#${uid}-filter0_d_2321_7985)`}>
        <rect
          x="4.00001"
          y="4"
          width="11"
          height="11"
          rx="2.75513"
          fill="#EF99A4"
          shapeRendering="crispEdges"
        />
        <rect
          x="6.45997"
          y="8.72308"
          width="5.90385"
          height="1.37756"
          rx="0.688782"
          fill="#F1EEE0"
        />
        <rect
          x="8.72291"
          y="6.45996"
          width="1.37756"
          height="5.90385"
          rx="0.688782"
          fill="#F1EEE0"
        />
      </g>
      <g filter={`url(#${uid}-filter1_d_2321_7985)`}>
        <rect
          x="16.9998"
          y="5"
          width="11"
          height="11"
          rx="2.75513"
          transform="rotate(6 16.9998 5)"
          fill="#A4D6A3"
          shapeRendering="crispEdges"
        />
        <rect
          x="18.9523"
          y="9.95435"
          width="5.90385"
          height="1.37756"
          rx="0.688782"
          transform="rotate(6 18.9523 9.95435)"
          fill="#1F5E34"
        />
      </g>
      <g filter={`url(#${uid}-filter2_d_2321_7985)`}>
        <rect
          x="4.49976"
          y="16.5"
          width="11"
          height="11"
          rx="2.75513"
          transform="rotate(-5 4.49976 16.5)"
          fill="#1F5E34"
          shapeRendering="crispEdges"
        />
        <rect
          x="7.27613"
          y="20.0105"
          width="5.90385"
          height="1.18077"
          rx="0.590385"
          transform="rotate(-5 7.27613 20.0105)"
          fill="#A4D6A3"
        />
        <rect
          x="7.46485"
          y="22.167"
          width="5.90385"
          height="1.18077"
          rx="0.590385"
          transform="rotate(-5 7.46485 22.167)"
          fill="#A4D6A3"
        />
      </g>
      <g filter={`url(#${uid}-filter3_d_2321_7985)`}>
        <rect
          x="15.9998"
          y="17"
          width="11"
          height="11"
          rx="2.75513"
          transform="rotate(4 15.9998 17)"
          fill="#F1EEE0"
          shapeRendering="crispEdges"
        />
        <rect
          x="18.1242"
          y="21.8832"
          width="5.90385"
          height="1.37756"
          rx="0.688782"
          transform="rotate(4 18.1242 21.8832)"
          fill="#EF99A4"
        />
        <circle
          cx="21.1991"
          cy="20.2241"
          r="0.688782"
          transform="rotate(4 21.1991 20.2241)"
          fill="#EF99A4"
        />
        <circle
          cx="20.8422"
          cy="25.3283"
          r="0.688782"
          transform="rotate(4 20.8422 25.3283)"
          fill="#EF99A4"
        />
      </g>
      <defs>
        <filter
          id={`${uid}-filter0_d_2321_7985`}
          x="2.42565"
          y="2.81923"
          width="14.1487"
          height="14.1487"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="0.39359" />
          <feGaussianBlur stdDeviation="0.78718" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0470588 0 0 0 0 0.0470588 0 0 0 0 0.0509804 0 0 0 0.101961 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_2321_7985"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_2321_7985"
            result="shape"
          />
        </filter>
        <filter
          id={`${uid}-filter1_d_2321_7985`}
          x="14.2756"
          y="3.81923"
          width="15.2382"
          height="15.2383"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="0.39359" />
          <feGaussianBlur stdDeviation="0.78718" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0470588 0 0 0 0 0.0470588 0 0 0 0 0.0509804 0 0 0 0.101961 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_2321_7985"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_2321_7985"
            result="shape"
          />
        </filter>
        <filter
          id={`${uid}-filter2_d_2321_7985`}
          x="2.9254"
          y="14.3605"
          width="15.0656"
          height="15.0656"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="0.39359" />
          <feGaussianBlur stdDeviation="0.78718" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0470588 0 0 0 0 0.0470588 0 0 0 0 0.0509804 0 0 0 0.101961 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_2321_7985"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_2321_7985"
            result="shape"
          />
        </filter>
        <filter
          id={`${uid}-filter3_d_2321_7985`}
          x="13.6581"
          y="15.8192"
          width="14.8892"
          height="14.8893"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="0.39359" />
          <feGaussianBlur stdDeviation="0.78718" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0470588 0 0 0 0 0.0470588 0 0 0 0 0.0509804 0 0 0 0.101961 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_2321_7985"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_2321_7985"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};
MathIconReadingFluency.displayName = 'MathIconReadingFluency';
