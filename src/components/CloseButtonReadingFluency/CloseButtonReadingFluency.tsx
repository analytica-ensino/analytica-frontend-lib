import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/utils';
import { CloseIconReadingFluency } from '../ReadingFluencyIcons';

export interface CloseButtonReadingFluencyProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Lado do ícone em pixels. Default: 37 (tamanho nativo da arte). */
  iconSize?: number;
  /** Classes extras (posicionamento fica com quem usa). */
  className?: string;
}

/**
 * Botão de fechar do tema Reading Fluency: alvo clicável de no mínimo 42×42
 * envolvendo o `CloseIconReadingFluency` (disco visível de ~29px no box de 37).
 *
 * Substitui a composição antiga `ButtonReadingFluency variant="icon"` + `XIcon`
 * do phosphor, que montava o disco em CSS (`bg-error-500`, borda `primary-200`,
 * glifo 14px). Aquele caminho dependia de `--color-error-500`, que **o tema
 * papole light não define** — o rosa da arte não saía. Aqui as cores vêm do
 * próprio SVG, como no resto da família de ícones.
 *
 * `aria-label` já vem com "Fechar" (o ícone é decorativo); passe outro pra
 * sobrescrever. O alvo é um **mínimo** de 42×42 — preserva o toque do botão
 * anterior com o disco menor e cresce junto se `iconSize` passar de 42, em vez
 * de deixar o ícone estourar a área clicável.
 *
 * Estados: a spec só entregou o `default`, então hover/pressed usam realce e
 * recuo neutros (brilho + escala), que funcionam sobre o header verde e sobre o
 * corpo branco sem inventar cor nova. Foco reaproveita o `secondary-600` que o
 * resto dos botões Reading Fluency já usa.
 */
const BASE_CLASSES =
  'inline-flex min-h-[42px] min-w-[42px] shrink-0 cursor-pointer items-center justify-center rounded-full ' +
  'transition-[transform,filter] duration-100 ' +
  'hover:brightness-105 ' +
  'active:scale-95 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-600 ' +
  'disabled:cursor-not-allowed disabled:opacity-40 ' +
  'disabled:hover:brightness-100 disabled:active:scale-100';

export const CloseButtonReadingFluency = forwardRef<
  HTMLButtonElement,
  CloseButtonReadingFluencyProps
>(
  (
    {
      iconSize = 37,
      className,
      type = 'button',
      'aria-label': ariaLabel = 'Fechar',
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      aria-label={ariaLabel}
      className={cn(BASE_CLASSES, className)}
      {...props}
    >
      <CloseIconReadingFluency size={iconSize} />
    </button>
  )
);
CloseButtonReadingFluency.displayName = 'CloseButtonReadingFluency';
