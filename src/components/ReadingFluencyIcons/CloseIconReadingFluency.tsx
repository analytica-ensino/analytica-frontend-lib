import { useId, type FC } from 'react';
import type { ReadingFluencyIconProps } from './types';

/**
 * Fechar (X creme num disco rosa com contorno creme) — tema Reading Fluency.
 * Cores fixas da arte (`#EA909A` + `#FDEFC4` + `#FBF0CE`), como no resto da
 * família. `aria-hidden`; quem usa em botão dá o rótulo — ver
 * `CloseButtonReadingFluency`.
 *
 * O disco visível ocupa 29 dos 37 do box: a arte fica 1u acima do centro
 * vertical (centro em y=17,5) pra abrir espaço pra sombra, que desce 1u. Como o
 * borrão da sombra alcança ~y=39, a barra de baixo dela é cortada pelo box de
 * 37 — a 5%/10% de preto isso é imperceptível, e alargar o box encolheria a
 * arte, então fica como a designer entregou.
 *
 * O `filter` da sombra usa id único (via `useId`) pra não colidir entre
 * instâncias — mesmo cuidado do `PauseIconReadingFluency`.
 */
export const CloseIconReadingFluency: FC<ReadingFluencyIconProps> = ({
  size = 37,
  className,
}) => {
  // id único (sem ":") pra o `filter` não colidir entre instâncias.
  const filterId = `reading-fluency-close-shadow-${useId().replaceAll(':', '')}`;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 37 37"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g filter={`url(#${filterId})`}>
        {/* Disco rosa com contorno creme. `strokeLinejoin` arredondado porque o
            path traz micro-segmentos quase degenerados do Figma (`V4.50145`,
            `V30.4614`) que viram farpas com o `miter` default. */}
        <path
          d="M18.3393 4.50145C18.6632 4.49328 19.0833 4.525 19.2309 4.53075C19.3571 4.53565 19.6589 4.53951 19.896 4.55809C20.512 4.60634 21.1133 4.70917 21.6665 4.82372C23.9818 5.30311 26.0685 6.30892 27.8286 7.98582L27.8296 7.9868C28.0478 8.19497 28.3029 8.50457 28.3628 8.57176L28.5171 8.73973C28.5904 8.82056 28.6752 8.91638 28.7407 8.99754C29.1275 9.47701 29.4543 9.99376 29.729 10.4731C29.9749 10.8961 30.197 11.3329 30.393 11.7807L30.5805 12.2319L30.5844 12.2427L30.6919 12.5347C31.2127 14.0062 31.4554 15.6151 31.4936 17.0884C31.5837 20.5692 30.5961 24.3495 27.8491 27.0073C26.0096 28.7872 23.6491 29.8392 21.2397 30.2593L21.2329 30.2612L21.226 30.2622C20.4284 30.3935 19.6221 30.4649 18.8139 30.48C18.5571 30.5059 18.3011 30.4988 18.1469 30.4917C18.0386 30.4866 17.9315 30.4796 17.8452 30.4741C17.7517 30.4682 17.6873 30.4644 17.6372 30.4624V30.4614C15.516 30.3925 13.4409 29.826 11.5796 28.8071L11.5727 28.8042L11.5669 28.8003C7.8651 26.7266 5.89682 22.9161 5.56003 18.9487C5.2757 15.599 5.96732 11.7362 8.35104 8.90868L8.35397 8.90575C10.2531 6.66533 12.8945 5.18306 15.7964 4.72801V4.72704C16.2826 4.64864 16.8342 4.57081 17.393 4.54442C17.7615 4.52704 17.9272 4.53156 18.1655 4.51024L18.1928 4.50829C18.2419 4.50479 18.2907 4.50359 18.3393 4.50243V4.50145Z"
          fill="#EA909A"
          stroke="#FDEFC4"
          strokeWidth={3}
          strokeLinejoin="round"
        />
        {/* Glifo X (10×10, centrado em ~18,1 / 17,1). */}
        <path
          d="M18.1454 15.3852C18.1993 15.3141 18.2759 15.234 18.3387 15.1706L20.1715 13.3386C20.4228 13.0873 20.9998 12.4544 21.2762 12.2963C22.0778 11.8376 23.1941 12.4592 23.1404 13.4209C23.1094 13.9774 22.8929 14.1713 22.5218 14.5401L21.937 15.1227C21.2706 15.7874 20.5934 16.4821 19.9169 17.1332L21.9604 19.1703L22.5612 19.7688C22.8649 20.0719 23.0725 20.2298 23.1299 20.6766C23.1757 21.0212 23.0813 21.3699 22.8677 21.6444C22.6253 21.9541 22.3339 22.0783 21.957 22.1262C21.9307 22.1273 21.9237 22.1458 21.8894 22.1418C21.6884 22.1179 21.3947 22.0724 21.2299 21.9462C20.8246 21.6362 20.4882 21.228 20.1169 20.8779C19.4629 20.217 18.7929 19.5668 18.1454 18.9046C17.9687 19.1005 17.7217 19.3346 17.5308 19.5258L16.3611 20.6955L15.6407 21.4168C15.2888 21.7686 15.0409 22.0827 14.5141 22.1267C13.6999 22.1944 13.0203 21.4341 13.1678 20.6329C13.2635 20.1137 13.7235 19.7838 14.085 19.4216L15.6099 17.8969C15.8251 17.6821 16.1838 17.3474 16.3736 17.1301C16.1813 16.929 15.9385 16.7023 15.7366 16.5008L14.2443 15.0104C13.9882 14.7549 13.5494 14.3713 13.3597 14.0876C12.8052 13.2582 13.3802 12.2545 14.305 12.1533C15.0134 12.128 15.178 12.3901 15.645 12.8586L16.5126 13.7277L17.5884 14.8014C17.729 14.9419 18.0421 15.2401 18.1454 15.3852Z"
          fill="#FBF0CE"
        />
      </g>
      <defs>
        {/* "Drop Shadow/200" da arte: duas sombras empilhadas (5% e 10% de
            #0C0C0D), ambas dy=1 / blur 2. */}
        <filter
          id={filterId}
          x="-0.857773"
          y="-0.857758"
          width="38"
          height="38"
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
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0470588 0 0 0 0 0.0470588 0 0 0 0 0.0509804 0 0 0 0.05 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0470588 0 0 0 0 0.0470588 0 0 0 0 0.0509804 0 0 0 0.1 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow"
            result="effect2_dropShadow"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};
CloseIconReadingFluency.displayName = 'CloseIconReadingFluency';
