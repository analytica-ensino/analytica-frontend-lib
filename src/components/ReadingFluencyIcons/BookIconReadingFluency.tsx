import { useId, type FC } from 'react';
import type { ReadingFluencyIconProps } from './types';

/**
 * Ícone do modo LER do Papolê — o livrinho rosa com a letra "A" (o "Book"
 * da arte). Ilustração multicolor com cores fixas, viewBox nativo 32×32.
 * Usado no seletor de modo (`ModeToggleReadingFluency`).
 *
 * `size` define largura e altura (é quadrado); sem `size`, usa o tamanho
 * nativo. Os ids dos filtros/recortes levam o `useId` para que várias instâncias
 * na mesma página não colidam. `aria-hidden` por ser decorativo — quem usa em
 * botão deve prover o rótulo.
 */
export const BookIconReadingFluency: FC<ReadingFluencyIconProps> = ({
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
      <rect
        x="6.36866"
        y="5.53387"
        width="17.5646"
        height="21.6974"
        rx="2.4797"
        transform="rotate(-5.99999 6.36866 5.53387)"
        fill="#1A4E2B"
      />
      <path
        d="M17.0198 21.8679L20.3079 21.5223L20.7183 25.427C20.7899 26.108 20.2959 26.7181 19.6149 26.7897L18.7928 26.8761C18.1118 26.9476 17.5018 26.4536 17.4302 25.7726L17.0198 21.8679Z"
        fill="#287842"
      />
      <rect
        x="6.77906"
        y="5.49072"
        width="16.5314"
        height="20.6642"
        rx="1.85978"
        transform="rotate(-5.99999 6.77906 5.49072)"
        fill="#FCFBF8"
      />
      <rect
        x="21.3811"
        y="6.03381"
        width="1.23985"
        height="0.413284"
        rx="0.206642"
        transform="rotate(-5.99999 21.3811 6.03381)"
        fill="#262522"
        fillOpacity="0.121569"
      />
      <rect
        x="21.5972"
        y="8.08893"
        width="1.23985"
        height="0.413284"
        rx="0.206642"
        transform="rotate(-5.99999 21.5972 8.08893)"
        fill="#262522"
        fillOpacity="0.121569"
      />
      <rect
        x="21.8132"
        y="10.144"
        width="1.23985"
        height="0.413284"
        rx="0.206642"
        transform="rotate(-5.99999 21.8132 10.144)"
        fill="#262522"
        fillOpacity="0.121569"
      />
      <rect
        x="22.0288"
        y="12.1991"
        width="1.23985"
        height="0.413284"
        rx="0.206642"
        transform="rotate(-5.99999 22.0288 12.1991)"
        fill="#262522"
        fillOpacity="0.121569"
      />
      <rect
        x="22.2449"
        y="14.2542"
        width="1.23985"
        height="0.413284"
        rx="0.206642"
        transform="rotate(-5.99999 22.2449 14.2542)"
        fill="#262522"
        fillOpacity="0.121569"
      />
      <rect
        x="22.4612"
        y="16.3093"
        width="1.23985"
        height="0.413284"
        rx="0.206642"
        transform="rotate(-5.99999 22.4612 16.3093)"
        fill="#262522"
        fillOpacity="0.121569"
      />
      <rect
        x="22.6773"
        y="18.3644"
        width="1.23985"
        height="0.413284"
        rx="0.206642"
        transform="rotate(-5.99999 22.6773 18.3644)"
        fill="#262522"
        fillOpacity="0.121569"
      />
      <rect
        x="22.8928"
        y="20.4195"
        width="1.23985"
        height="0.413284"
        rx="0.206642"
        transform="rotate(-5.99999 22.8928 20.4195)"
        fill="#262522"
        fillOpacity="0.121569"
      />
      <g filter={`url(#${uid}-filter0_d_2321_7963)`}>
        <rect
          x="5.27613"
          y="5.02539"
          width="17.3579"
          height="22.1107"
          rx="2.4797"
          transform="rotate(-5.99999 5.27613 5.02539)"
          fill="#EF99A4"
          shapeRendering="crispEdges"
        />
        <rect
          x="6.00025"
          y="5.9881"
          width="0.826568"
          height="20.0443"
          rx="0.413284"
          transform="rotate(-5.99999 6.00025 5.9881)"
          fill="#F8F8F7"
          fillOpacity="0.25098"
        />
        <rect
          opacity="0.7"
          x="8.00098"
          y="7.2323"
          width="12.3985"
          height="0.619926"
          rx="0.309963"
          transform="rotate(-5.99999 8.00098 7.2323)"
          fill="#F1EEE0"
        />
        <rect
          opacity="0.7"
          x="9.72925"
          y="23.6731"
          width="12.3985"
          height="0.619926"
          rx="0.309963"
          transform="rotate(-5.99999 9.72925 23.6731)"
          fill="#F1EEE0"
        />
        <path
          d="M14.6099 10.2317C14.7677 10.2152 14.9176 10.2482 15.0592 10.3308C15.2086 10.4038 15.3226 10.5207 15.4014 10.6808L19.4456 18.0484C19.5013 18.1576 19.5347 18.2608 19.5449 18.3571C19.5697 18.5938 19.5105 18.7914 19.3674 18.9482C19.2331 19.104 19.0733 19.1913 18.8893 19.2106C18.7317 19.227 18.5824 19.1939 18.4409 19.1114C18.3081 19.0278 18.1976 18.9066 18.11 18.7475L17.2589 17.2266L13.3371 17.6388L12.824 19.3149C12.7801 19.4878 12.6974 19.6303 12.5761 19.7406C12.4626 19.8411 12.3309 19.8989 12.182 19.9145C11.9452 19.9394 11.7626 19.8922 11.6348 19.7727C11.5072 19.6532 11.4331 19.4968 11.4128 19.3041C11.4045 19.2252 11.4092 19.1397 11.4263 19.0493L13.8756 10.8411C13.9273 10.6586 14.0184 10.5112 14.1484 10.4C14.2873 10.288 14.4415 10.2317 14.6099 10.2317ZM13.8211 16.059L16.4512 15.7826L14.8068 12.8436L13.8211 16.059Z"
          fill="#1A4E2B"
        />
      </g>
      <defs>
        <filter
          id={`${uid}-filter0_d_2321_7963`}
          x="3.62299"
          y="2.38443"
          width="22.0537"
          height="26.2837"
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
          <feOffset dx="-0.413284" dy="0.413284" />
          <feGaussianBlur stdDeviation="0.619925" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0470588 0 0 0 0 0.0470588 0 0 0 0 0.0509804 0 0 0 0.101961 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_2321_7963"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_2321_7963"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};
BookIconReadingFluency.displayName = 'BookIconReadingFluency';
