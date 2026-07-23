import type { FC } from 'react';
import type { PapoleIconProps } from './types';

/**
 * Parar (quadrado arredondado) — tema Papolê. Cor marrom `#604903` (fixa da
 * arte). `aria-hidden` por ser decorativo; quem usa em botão deve prover o rótulo.
 */
export const StopIconPapole: FC<PapoleIconProps> = ({
  size = 24,
  className,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M9.19373 3.02192C9.23924 3.01968 9.28477 3.01795 9.3303 3.01669C10.3859 2.98615 11.5022 3.00736 12.5695 3.00486C14.1845 3.02035 15.7972 2.94773 17.3862 3.2905C20.5781 3.97907 20.9146 6.66832 20.9808 9.41075C20.9978 10.5335 21.003 11.6565 20.996 12.7793C20.9942 14.8218 21.144 17.7223 19.7633 19.3629C18.5786 20.7708 16.5405 20.9308 14.8126 20.9714C13.7196 21.0046 12.4391 21.0064 11.3323 20.9895C9.21141 20.9573 6.22451 21.2041 4.55526 19.6974C3.28925 18.5546 3.06985 16.632 3.02355 15.0153C2.99244 13.9292 2.99703 12.6416 3.00958 11.5439C3.03437 9.37514 2.76331 6.22534 4.32955 4.52291C5.55279 3.19327 7.51307 3.08323 9.19373 3.02192Z"
      fill="#604903"
    />
  </svg>
);
StopIconPapole.displayName = 'StopIconPapole';
