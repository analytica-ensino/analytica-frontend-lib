import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/utils';

export interface SelectionButtonReadingFluencyProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Alternativa escolhida — vira o estado "Selected" da arte. */
  selected?: boolean;
  /**
   * Imagem da alternativa (ex.: o bolo com 3 velinhas). Quando vem junto com o
   * rótulo, aparece acima dele.
   */
  imageSrc?: string | null;
  /** Texto alternativo da imagem. Sem rótulo, é o que nomeia o botão. */
  imageAlt?: string;
  /** Rótulo (renderizado em MAIÚSCULAS). */
  children?: ReactNode;
}

/**
 * O Figma mede o padding a partir da borda externa (o traço fica por dentro e
 * não ocupa espaço); no CSS a borda soma. Por isso o padding de cada estado
 * desconta a própria borda: 22,5px/16px da arte − 4px (default) ou − 2px
 * (selected), e o botão mantém os 70px de altura da arte nos dois estados.
 */
const STATE_CLASSES = {
  default:
    'border-4 border-background-400 bg-background-100 px-3 py-[18.5px] hover:bg-background-200 ' +
    '[box-shadow:0px_4px_0px_0px_#D2C99C,0px_0px_4px_0px_#00000021] ' +
    'active:[box-shadow:0px_2px_0px_0px_#D2C99C,0px_0px_4px_0px_#00000021]',
  selected:
    'border-2 border-secondary-600 bg-secondary-200 px-3.5 py-[20.5px] ' +
    '[box-shadow:0px_2px_0px_0px_#31A34D,0px_0px_4px_0px_#00000021]',
} as const;

/**
 * Alternativa de uma questão do modo CONTAR (o "Selection button, xl" da arte):
 * bege com aresta "3D" (`#D2C99C`) no default e verde-claro com borda
 * `secondary-600` quando escolhida. A aresta cai de 4px→2px no pressed, como nos
 * outros botões do Papolê. Rótulo em "Bold/Upper/Bold 20" (`background-900`).
 *
 * Não diz se a alternativa está certa: o gabarito nunca chega ao aluno. O
 * `selected` só marca a escolha.
 *
 * Dentro de um grupo (ex.: `MathQuestionCardReadingFluency`) passe
 * `role="radio"` + `aria-checked`; sozinho, o botão anuncia `aria-pressed`.
 */
export const SelectionButtonReadingFluency = forwardRef<
  HTMLButtonElement,
  SelectionButtonReadingFluencyProps
>(
  (
    {
      selected = false,
      imageSrc,
      imageAlt = '',
      children,
      className,
      type = 'button',
      role,
      ...props
    },
    ref
  ) => {
    // Um botão de rádio comunica o estado por `aria-checked` (vem do grupo);
    // fora de um grupo, é um botão alternável.
    const pressedProps =
      role === 'radio' ? {} : { 'aria-pressed': selected as boolean };

    return (
      <button
        ref={ref}
        type={type}
        role={role}
        {...pressedProps}
        className={cn(
          'inline-flex min-h-[70px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-[20px]',
          'font-quicksand text-[20px] font-bold uppercase leading-none text-background-900 transition-colors',
          'focus-visible:outline-none focus-visible:border-secondary-600',
          'disabled:cursor-not-allowed disabled:opacity-40',
          STATE_CLASSES[selected ? 'selected' : 'default'],
          className
        )}
        {...props}
      >
        {imageSrc && (
          <img
            src={imageSrc}
            alt={imageAlt}
            draggable={false}
            className="max-h-[72px] w-auto max-w-full select-none object-contain"
          />
        )}
        {children != null && <span>{children}</span>}
      </button>
    );
  }
);
SelectionButtonReadingFluency.displayName = 'SelectionButtonReadingFluency';
