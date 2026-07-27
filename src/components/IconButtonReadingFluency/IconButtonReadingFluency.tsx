import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '../../utils/utils';
import { VoiceIconReadingFluency } from '../ReadingFluencyIcons';

export interface IconButtonReadingFluencyProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Ícone dentro do botão. **Default:** o `VoiceIconReadingFluency` (ícone de voz).
   * Passe seu próprio ícone (ReactNode) pra trocar.
   */
  children?: ReactNode;
  /** Classes extras. */
  className?: string;
}

/**
 * Botão de ícone sólido "xl" do tema Reading Fluency (o "Solid Icon button, xl" da arte).
 *
 * Caixa ~91×70, cantos 20px, borda 4px e a sombra "3D" (`#30A34D`) que **cai de
 * 4px→2px no pressed** (mesmo mecanismo dos botões Reading Fluency). Estados via
 * pseudo-classes:
 * - **default**: `secondary-400` + borda `secondary-200`;
 * - **hover**: `secondary-500`;
 * - **pressed** (`active`): `secondary-600` + aresta 2px;
 * - **focus** (`focus-visible`): borda `secondary-600` (sem mudar o fundo).
 *
 * É só ícone — **passe `aria-label`** descrevendo a ação (o ícone é decorativo).
 */
const BASE_CLASSES =
  'inline-flex h-[70px] w-[91px] cursor-pointer items-center justify-center gap-2 rounded-[20px] border-4 p-4 ' +
  'bg-secondary-400 border-secondary-200 ' +
  'hover:bg-secondary-500 ' +
  'focus-visible:outline-none focus-visible:border-secondary-600 ' +
  'active:bg-secondary-600 ' +
  'disabled:opacity-40 disabled:cursor-not-allowed ' +
  '[box-shadow:0px_4px_0px_0px_#30A34D,0px_0px_4px_0px_#00000021] ' +
  'active:[box-shadow:0px_2px_0px_0px_#30A34D,0px_0px_4px_0px_#00000021]';

export const IconButtonReadingFluency = forwardRef<
  HTMLButtonElement,
  IconButtonReadingFluencyProps
>(({ children, className, type = 'button', ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    className={cn(BASE_CLASSES, className)}
    {...props}
  >
    {children ?? <VoiceIconReadingFluency className="h-full w-full" />}
  </button>
));
IconButtonReadingFluency.displayName = 'IconButtonReadingFluency';
