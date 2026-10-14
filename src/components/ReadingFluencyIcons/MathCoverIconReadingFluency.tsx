import { useId, type FC } from 'react';
import type { ReadingFluencyIconProps } from './types';

/**
 * Capa padrão dos cards de matemática do Papolê — os bloquinhos de operação
 * (+ − = ÷) empilhados em 2×2, levemente tortos (o "Math" do "Lesson card" da
 * arte). viewBox nativo 76×95 (não é quadrado): `size` define a LARGURA e a
 * altura sai proporcional.
 *
 * No card "em breve" a arte aplica `mix-blend-mode: luminosity` sobre a cor
 * do card — por isso os blocos parecem tingidos da cor dele. Quem aplica o
 * blend é o `CardReadingFluency`; o ícone é sempre o mesmo.
 *
 * `size` define a LARGURA (a altura sai proporcional); sem `size`, usa o tamanho
 * nativo. Os ids dos filtros/recortes levam o `useId` para que várias instâncias
 * na mesma página não colidam. `aria-hidden` por ser decorativo — quem usa em
 * botão deve prover o rótulo.
 */
export const MathCoverIconReadingFluency: FC<ReadingFluencyIconProps> = ({
  size,
  className,
}) => {
  // `useId` devolve algo como «r1»; só letras, dígitos, `-` e `_` são seguros
  // dentro de um `url(#...)`.
  const uid = `rf${useId().replaceAll(/[^a-zA-Z0-9_-]/g, '')}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size ?? 76}
      height={size != null ? (size * 95) / 76 : 95}
      viewBox="0 0 76 95"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g filter={`url(#${uid}-filter0_d_2321_2324)`}>
        <rect
          x="9.5"
          y="11.875"
          width="26.125"
          height="32.6562"
          rx="2.75513"
          fill="#EF99A4"
          shapeRendering="crispEdges"
        />
        <rect
          x="11.96"
          y="16.5981"
          width="5.90385"
          height="1.37756"
          rx="0.688782"
          fill="#F1EEE0"
        />
        <rect
          x="14.2229"
          y="14.335"
          width="1.37756"
          height="5.90385"
          rx="0.688782"
          fill="#F1EEE0"
        />
      </g>
      <g filter={`url(#${uid}-filter1_d_2321_2324)`}>
        <rect
          width="26.2052"
          height="32.592"
          rx="2.75513"
          transform="matrix(0.99148 0.130261 -0.0837876 0.996484 40.3745 14.8438)"
          fill="#A4D6A3"
          shapeRendering="crispEdges"
        />
        <rect
          width="5.90385"
          height="1.37756"
          rx="0.688782"
          transform="matrix(0.99148 0.130261 -0.0837876 0.996484 42.4175 19.8706)"
          fill="#1F5E34"
        />
      </g>
      <g filter={`url(#${uid}-filter2_d_2321_2324)`}>
        <rect
          width="26.1808"
          height="32.6116"
          rx="2.75513"
          transform="matrix(0.994073 -0.108713 0.0698203 0.99756 10.687 48.9844)"
          fill="#1F5E34"
          shapeRendering="crispEdges"
        />
        <rect
          width="5.90385"
          height="1.18077"
          rx="0.590385"
          transform="matrix(0.994073 -0.108713 0.0698203 0.99756 13.3933 52.4469)"
          fill="#A4D6A3"
        />
        <rect
          width="5.90385"
          height="1.18077"
          rx="0.590385"
          transform="matrix(0.994073 -0.108713 0.0698203 0.99756 13.5444 54.6064)"
          fill="#A4D6A3"
        />
      </g>
      <g filter={`url(#${uid}-filter3_d_2321_2324)`}>
        <rect
          width="26.1607"
          height="32.6276"
          rx="2.75513"
          transform="matrix(0.996202 0.0870763 -0.055854 0.998439 37.9995 50.4688)"
          fill="#F1EEE0"
          shapeRendering="crispEdges"
        />
        <rect
          width="5.90385"
          height="1.37756"
          rx="0.688782"
          transform="matrix(0.996202 0.0870763 -0.055854 0.998439 40.1863 55.3987)"
          fill="#EF99A4"
        />
        <circle
          cx="0.688782"
          cy="0.688782"
          r="0.688782"
          transform="matrix(0.996202 0.0870763 -0.055854 0.998439 42.5835 53.0414)"
          fill="#EF99A4"
        />
        <circle
          cx="0.688782"
          cy="0.688782"
          r="0.688782"
          transform="matrix(0.996202 0.0870763 -0.055854 0.998439 42.2976 58.15)"
          fill="#EF99A4"
        />
      </g>
      <defs>
        <filter
          id={`${uid}-filter0_d_2321_2324`}
          x="7.92564"
          y="10.6942"
          width="29.2737"
          height="35.805"
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
            result="effect1_dropShadow_2321_2324"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_2321_2324"
            result="shape"
          />
        </filter>
        <filter
          id={`${uid}-filter1_d_2321_2324`}
          x="36.0694"
          y="13.663"
          width="31.8614"
          height="39.0396"
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
            result="effect1_dropShadow_2321_2324"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_2321_2324"
            result="shape"
          />
        </filter>
        <filter
          id={`${uid}-filter2_d_2321_2324`}
          x="9.11265"
          y="44.9574"
          width="31.4512"
          height="38.5269"
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
            result="effect1_dropShadow_2321_2324"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_2321_2324"
            result="shape"
          />
        </filter>
        <filter
          id={`${uid}-filter3_d_2321_2324`}
          x="34.6029"
          y="49.288"
          width="31.0323"
          height="38.0035"
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
            result="effect1_dropShadow_2321_2324"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_2321_2324"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};
MathCoverIconReadingFluency.displayName = 'MathCoverIconReadingFluency';
