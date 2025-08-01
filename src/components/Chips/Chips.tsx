import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Check } from 'phosphor-react';
import { cn } from '../../utils/utils';

/**
 * Lookup table for chip state classes
 */
const STATE_CLASSES = {
  default:
    'bg-background text-text-950 border border-border-100 hover:bg-secondary-50 hover:border-border-300',
  selected:
    'bg-info-background text-primary-950 border-2 border-primary-950 hover:bg-secondary-50 focus-visible:border-0',
} as const;

/**
 * Chips component props interface
 */
type ChipsProps = {
  /** Content to be displayed inside the chip */
  children: ReactNode;
  /** Se o chip está selecionado (mostra check automaticamente) */
  selected?: boolean;

  /** Additional CSS classes to apply */
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

/**
 * Chips component for Analytica Ensino platforms
 *
 * Um componente de chip seguindo exatamente o design do Figma.
 * Suporte a dois estados principais: default (sem ícone) e selected (com ícone de check).
 * Quando selecionado, automaticamente mostra o ícone de check.
 *
 * @param children - O conteúdo a ser exibido dentro do chip
 * @param selected - Se o chip está selecionado (mostra check automaticamente)
 * @param className - Classes CSS adicionais
 * @param props - Todos os outros atributos padrão de button HTML
 * @returns Um elemento de chip estilizado
 *
 * @example
 * ```tsx
 * <Chips onClick={() => console.log('clicked')}>
 *   Label
 * </Chips>
 *
 * <Chips selected onClick={() => console.log('selected')}>
 *   Selected Label
 * </Chips>
 * ```
 */
const Chips = ({
  children,
  selected = false,
  className = '',
  disabled,
  type = 'button',
  ...props
}: ChipsProps) => {
  // Get classes from lookup tables
  const stateClasses = selected
    ? STATE_CLASSES.selected
    : STATE_CLASSES.default;

  const baseClasses =
    'inline-flex items-center justify-center rounded-full cursor-pointer font-normal text-sm px-4 py-2 gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary-600 disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <button
      className={cn(baseClasses, stateClasses, className)}
      disabled={disabled}
      type={type}
      {...props}
    >
      {selected && (
        <span className={`flex items-center`}>
          <Check weight="bold" size={16} />
        </span>
      )}

      <span className="flex-1">{children}</span>
    </button>
  );
};

export default Chips;
