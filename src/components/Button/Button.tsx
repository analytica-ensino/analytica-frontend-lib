import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '../../utils/utils';

/**
 * Lookup table for variant and action class combinations
 */
const VARIANT_ACTION_CLASSES = {
  solid: {
    primary:
      'bg-primary-950 text-text border border-primary-950 hover:bg-primary-800 hover:border-primary-800 focus-visible:outline-none focus-visible:bg-primary-950 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-indicator-info active:bg-primary-700 active:border-primary-700 disabled:bg-primary-500 disabled:border-primary-500 disabled:opacity-40 disabled:cursor-not-allowed',
    secondary:
      'bg-text-950 text-text border border-text-800 hover:bg-text-800 hover:border-text-950 focus-visible:outline-none focus-visible:bg-text-900 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-indicator-info active:bg-text-700 active:border-text-700 disabled:bg-text-500 disabled:border-text-500 disabled:opacity-40 disabled:cursor-not-allowed',
    positive:
      'bg-success-500 text-text border border-success-500 hover:bg-success-600 hover:border-success-600 focus-visible:outline-none focus-visible:bg-success-500 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-indicator-info active:bg-success-700 active:border-success-700 disabled:bg-success-500 disabled:border-success-500 disabled:opacity-40 disabled:cursor-not-allowed',
    negative:
      'bg-error-500 text-text border border-error-500 hover:bg-error-600 hover:border-error-600 focus-visible:outline-none focus-visible:bg-error-500 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-indicator-info active:bg-error-700 active:border-error-700 disabled:bg-error-500 disabled:border-error-500 disabled:opacity-40 disabled:cursor-not-allowed',
  },
  outline: {
    primary:
      'bg-transparent text-primary-950 border border-primary-950 hover:bg-background-50 hover:text-primary-400 hover:border-primary-400 focus-visible:border-0 focus-visible:outline-none focus-visible:text-primary-600 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-indicator-info active:text-primary-700 active:border-primary-700 disabled:opacity-40 disabled:cursor-not-allowed',
    secondary:
      'bg-transparent text-text-950 border border-text-800 hover:bg-background-50 hover:text-text-700 hover:border-text-700 focus-visible:border-0 focus-visible:outline-none focus-visible:text-text-900 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-indicator-info active:text-text-700 active:border-text-700 disabled:opacity-40 disabled:cursor-not-allowed',
    positive:
      'bg-transparent text-success-500 border border-success-300 hover:bg-background-50 hover:text-success-400 hover:border-success-400 focus-visible:border-0 focus-visible:outline-none focus-visible:text-success-600 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-indicator-info active:text-success-700 active:border-success-700 disabled:opacity-40 disabled:cursor-not-allowed',
    negative:
      'bg-transparent text-error-500 border border-error-300 hover:bg-background-50 hover:text-error-400 hover:border-error-400 focus-visible:border-0 focus-visible:outline-none focus-visible:text-error-600 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-indicator-info active:text-error-700 active:border-error-700 disabled:opacity-40 disabled:cursor-not-allowed',
  },
  link: {
    primary:
      'bg-transparent text-primary-950 hover:text-primary-400 focus-visible:outline-none focus-visible:text-primary-600 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-indicator-info active:text-primary-700 disabled:opacity-40 disabled:cursor-not-allowed',
    secondary:
      'bg-transparent text-text-950 hover:text-text-800 focus-visible:outline-none focus-visible:text-text-900 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-indicator-info active:text-text-700 disabled:opacity-40 disabled:cursor-not-allowed',
    positive:
      'bg-transparent text-success-500 hover:text-success-400 focus-visible:outline-none focus-visible:text-success-600 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-indicator-info active:text-success-700 disabled:opacity-40 disabled:cursor-not-allowed',
    negative:
      'bg-transparent text-error-500 hover:text-error-400 focus-visible:outline-none focus-visible:text-error-600 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-indicator-info active:text-error-700 disabled:opacity-40 disabled:cursor-not-allowed',
  },
} as const;

/**
 * Lookup table for size classes
 */
const SIZE_CLASSES = {
  'extra-small': 'text-xs px-3.5 py-2',
  small: 'text-sm px-4 py-2.5',
  medium: 'text-md px-5 py-2.5',
  large: 'text-lg px-6 py-3',
  'extra-large': 'text-lg px-7 py-3.5',
} as const;

/**
 * Button component props interface
 */
type ButtonProps = {
  /** Content to be displayed inside the button */
  children: ReactNode;
  /** Ícone à esquerda do texto */
  iconLeft?: ReactNode;
  /** Ícone à direita do texto */
  iconRight?: ReactNode;
  /** Size of the button */
  size?: 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large';
  /** Visual variant of the button. Use 'raw' for no default styling */
  variant?: 'solid' | 'outline' | 'link' | 'raw';
  /** Action type of the button */
  action?: 'primary' | 'secondary' | 'positive' | 'negative';
  /** Additional CSS classes to apply */
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Button component for Analytica Ensino platforms
 *
 * A flexible button component with multiple variants, sizes and actions.
 *
 * @param children - The content to display inside the button
 * @param size - The size variant (extra-small, small, medium, large, extra-large)
 * @param variant - The visual style variant (solid, outline, link)
 * @param action - The action type (primary, secondary, positive, negative)
 * @param className - Additional CSS classes
 * @param props - All other standard button HTML attributes
 * @returns A styled button element
 *
 * @example
 * ```tsx
 * <Button variant="solid" action="primary" size="medium" onClick={() => console.log('clicked')}>
 *   Click me
 * </Button>
 * ```
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      iconLeft,
      iconRight,
      size = 'medium',
      variant = 'solid',
      action = 'primary',
      className = '',
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Raw variant: no default styling, only className
    if (variant === 'raw') {
      return (
        <button
          ref={ref}
          className={className}
          disabled={disabled}
          type={type}
          {...props}
        >
          {iconLeft && (
            <span className="mr-2 flex items-center">{iconLeft}</span>
          )}
          {children}
          {iconRight && (
            <span className="ml-2 flex items-center">{iconRight}</span>
          )}
        </button>
      );
    }

    // Get classes from lookup tables
    const sizeClasses = SIZE_CLASSES[size];
    const variantClasses = VARIANT_ACTION_CLASSES[variant][action];

    const baseClasses =
      'inline-flex items-center justify-center rounded-full cursor-pointer font-medium';

    return (
      <button
        ref={ref}
        className={cn(baseClasses, variantClasses, sizeClasses, className)}
        disabled={disabled}
        type={type}
        {...props}
      >
        {iconLeft && <span className="mr-2 flex items-center">{iconLeft}</span>}
        {children}
        {iconRight && (
          <span className="ml-2 flex items-center">{iconRight}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

// ======================================================================
// ButtonPapole — botão da variante Papolê (variantes: solid, outline, link)
// ======================================================================

/**
 * Classes por variante do botão Papolê — todos os estados numa única string, no
 * mesmo formato do `VARIANT_ACTION_CLASSES` do `Button`. As duas sombras (aresta
 * "3D" + ambiente) vão como propriedade arbitrária (`[box-shadow:...]`) pra
 * poderem variar por estado — no `outline` a aresta cai de 4px→2px no pressed.
 * O `link` é só texto (sem sombra/borda); apenas o foco adiciona a borda
 * `secondary-600`. `disabled` não veio na arte (padrão mínimo da lib).
 */
const PAPOLE_VARIANT_CLASSES = {
  solid:
    'bg-primary-500 border-4 border-primary-200 text-primary-900 hover:bg-primary-600 focus-visible:outline-none focus-visible:border-secondary-600 active:bg-primary-700 active:border-2 active:text-primary-100 disabled:opacity-40 disabled:cursor-not-allowed [box-shadow:0px_4px_0px_0px_#D4A82E,0px_0px_4px_0px_#00000021]',
  outline:
    'bg-transparent border-4 border-primary-200 text-primary-900 hover:bg-primary-100 focus-visible:outline-none focus-visible:border-secondary-600 active:bg-primary-200 active:border-2 active:border-primary-700 disabled:opacity-40 disabled:cursor-not-allowed [box-shadow:0px_4px_0px_0px_#F9CB3B,0px_0px_4px_0px_#00000021] active:[box-shadow:0px_2px_0px_0px_#F9CB3B,0px_0px_4px_0px_#00000021]',
  // Inverso do outline p/ fundo escuro (ex.: SAIR no menu de perfil): texto
  // claro (primary-100) por cima; no hover/pressed preenche dourado e escurece o
  // texto p/ manter contraste; foco com borda clara (secondary-300). Valores por
  // estado são uma proposta coerente — ajustar na story se necessário.
  'outline-inverse':
    'bg-transparent border-4 border-primary-200 text-primary-100 hover:bg-primary-100 hover:text-primary-900 focus-visible:outline-none focus-visible:border-secondary-300 active:bg-primary-200 active:text-primary-900 active:border-2 active:border-primary-700 disabled:opacity-40 disabled:cursor-not-allowed [box-shadow:0px_4px_0px_0px_#F9CB3B,0px_0px_4px_0px_#00000021] active:[box-shadow:0px_2px_0px_0px_#F9CB3B,0px_0px_4px_0px_#00000021]',
  link: 'bg-transparent border-4 border-transparent text-primary-900 hover:text-primary-700 focus-visible:outline-none focus-visible:border-secondary-600 active:text-primary-800 disabled:opacity-40 disabled:cursor-not-allowed',
} as const;

/**
 * Classes por tamanho do botão Papolê — padding (px = 2 × py), gap, radius e o
 * tamanho do texto e do ícone. `xl` = texto 20px / ícone 24px; `medium` = texto
 * 16px / ícone 20px; `small` = texto 14px / ícone 16px. Os valores de `medium` e
 * `small` foram assumidos seguindo a progressão — confirmar com a arte.
 */
const PAPOLE_SIZE_CLASSES = {
  xl: 'px-8 py-4 gap-2 rounded-[20px] text-[20px] [&_svg]:size-6',
  medium: 'px-8 py-4 gap-2 rounded-2xl text-[16px] [&_svg]:size-5',
  small: 'px-6 py-3 gap-2 rounded-xl text-[14px] [&_svg]:size-4',
} as const;

/**
 * Círculo visível da variante `icon` (30px). A arte usa fundo `error-500`, borda
 * 3px `primary-200` e ícone `primary-200` (10px). A sombra é a tradução das vars
 * `--sds-*` do Figma para valores concretos: `0 2px 8px` com preto 10% + 20%.
 * Só o `default` veio na spec (hover/pressed/focus pendentes); os tamanhos
 * (círculo 30px, ícone 10px) foram os que você passou — confirmar se necessário.
 */
const PAPOLE_ICON_CIRCLE_CLASSES =
  'inline-flex items-center justify-center size-[30px] rounded-full bg-error-500 border-[3px] border-primary-200 text-primary-200 [&_svg]:size-[10px] [box-shadow:0px_2px_8px_0px_#0000001a,0px_2px_8px_0px_#00000033]';

type ButtonPapoleProps = {
  /** Conteúdo do botão: texto nas variantes de texto; o ícone na variante `icon`. */
  children: ReactNode;
  /** Ícone à esquerda do texto (tamanho conforme `size`). Ignorado no `icon`. */
  iconLeft?: ReactNode;
  /** Variante visual do botão (default: 'solid'). */
  variant?: keyof typeof PAPOLE_VARIANT_CLASSES | 'icon';
  /** Tamanho do botão (default: 'xl'). */
  size?: keyof typeof PAPOLE_SIZE_CLASSES;
  /** Classes adicionais. */
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Botão da variante Papolê. `variant` seleciona o estilo
 * (`solid` | `outline` | `outline-inverse` | `link` | `icon`) e `size` o tamanho
 * (`xl` | `medium` | `small`; ignorado no `icon`).
 *
 * Estados via pseudo-classes (hover / focus-visible / active) — ver
 * `PAPOLE_VARIANT_CLASSES`. As cores seguem os tokens do tema ativo.
 */
const ButtonPapole = forwardRef<HTMLButtonElement, ButtonPapoleProps>(
  (
    {
      children,
      iconLeft,
      variant = 'solid',
      size = 'xl',
      className = '',
      type = 'button',
      disabled,
      ...props
    },
    ref
  ) => {
    // Variante ícone: alvo clicável 42×42 envolvendo o círculo visível de 30px.
    // `children` é o ícone (dimensionado a 10px pela classe do círculo).
    if (variant === 'icon') {
      return (
        <button
          ref={ref}
          type={type}
          disabled={disabled}
          className={cn(
            'inline-flex size-[42px] items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        >
          <span className={PAPOLE_ICON_CIRCLE_CLASSES}>{children}</span>
        </button>
      );
    }

    const baseClasses =
      'inline-flex items-center justify-center cursor-pointer font-quicksand font-bold uppercase leading-none';
    const variantClasses = PAPOLE_VARIANT_CLASSES[variant];
    const sizeClasses = PAPOLE_SIZE_CLASSES[size];

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(baseClasses, variantClasses, sizeClasses, className)}
        {...props}
      >
        {iconLeft && <span className="flex items-center">{iconLeft}</span>}
        {children}
      </button>
    );
  }
);

ButtonPapole.displayName = 'ButtonPapole';

export { ButtonPapole };
export type { ButtonPapoleProps };
