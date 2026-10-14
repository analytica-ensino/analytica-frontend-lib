import type { FC } from 'react';
import type { ReadingFluencyIconProps } from './types';

/**
 * Seta "avançar" arredondada do Papolê (o "Next" da arte), usada no botão
 * PRÓXIMA. Monocromática: pinta com `currentColor`, então herda a cor do
 * texto do botão (na arte, o `primary-900` do `ButtonReadingFluency`).
 *
 * `size` define largura e altura (é quadrado); sem `size`, usa o tamanho
 * nativo. `aria-hidden` por ser decorativo — quem usa em botão deve prover o
 * rótulo.
 */
export const NextIconReadingFluency: FC<ReadingFluencyIconProps> = ({
  size,
  className,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size ?? 24}
    height={size ?? 24}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M14.0282 3.51334C14.3965 3.43407 15.1113 3.72472 15.4026 3.94514C15.9231 4.33902 16.382 4.77858 16.8578 5.21599C18.4291 6.66048 19.8897 8.21962 21.078 9.96481C21.4138 10.4578 21.9016 11.17 21.9823 11.7469C22.0211 12.0283 21.996 12.3144 21.9088 12.586C21.6712 13.3176 20.5267 14.8541 20.0174 15.484C19.0301 16.7053 17.8894 17.878 16.7154 18.9448C16.2501 19.361 15.7727 19.8357 15.238 20.1719C14.4685 20.6557 13.3704 20.591 12.6431 20.0665C11.8047 19.4618 11.7531 18.4409 11.6337 17.5327C11.5291 17.0697 11.5221 16.4779 11.4618 15.9992C11.4163 15.6392 11.473 14.8666 10.8835 14.8808C10.3894 14.8927 9.83751 14.9808 9.34903 15.0385L6.47608 15.3815C5.8907 15.4531 5.32628 15.5268 4.72774 15.5787C3.30582 15.7018 2.05601 14.7094 2.009 13.3524C1.99234 12.8723 2.01123 12.3633 2.00762 11.8898C2.01503 10.887 1.85884 9.96767 2.66522 9.1827C3.62837 8.2451 4.52102 8.40453 5.75326 8.5496L9.25062 8.96184C9.41281 8.98127 9.68774 9.01454 9.81981 9.03329C11.1393 9.2208 11.4186 9.31577 11.4714 7.91377C11.4999 7.6812 11.5069 7.43989 11.5403 7.20844C11.7821 5.5349 11.6663 3.64695 14.0282 3.51334Z"
      fill="currentColor"
    />
  </svg>
);
NextIconReadingFluency.displayName = 'NextIconReadingFluency';
