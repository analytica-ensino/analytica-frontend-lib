import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';

/**
 * SelectionButton component props interface
 */
type SelectionButtonProps = {
  /** Ícone a ser exibido no botão */
  icon: ReactNode;
  /** Texto/label a ser exibido ao lado do ícone */
  label: string;
  /** Additional CSS classes to apply */
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * SelectionButton component for Analytica Ensino platforms
 *
 * Um botão com ícone e texto para ações e navegação.
 * Ideal para filtros, tags, categorias, etc.
 * Compatível com Next.js 15 e React 19.
 * Suporta forwardRef para acesso programático ao elemento DOM.
 *
 * @param icon - O ícone a ser exibido no botão
 * @param label - O texto/label a ser exibido
 * @param className - Classes CSS adicionais
 * @param props - Todos os outros atributos HTML padrão de button
 * @returns Um elemento button estilizado
 *
 * @example
 * ```tsx
 * <SelectionButton
 *   icon={<TagIcon />}
 *   label="Categoria"
 *   onClick={() => handleAction()}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Usando ref para foco programático
 * const buttonRef = useRef<HTMLButtonElement>(null);
 *
 * const handleFocus = () => {
 *   buttonRef.current?.focus();
 * };
 *
 * <SelectionButton
 *   ref={buttonRef}
 *   icon={<TagIcon />}
 *   label="Categoria"
 *   onClick={() => handleAction()}
 * />
 * ```
 */
export const SelectionButton = forwardRef<
  HTMLButtonElement,
  SelectionButtonProps
>(({ icon, label, className = '', disabled, ...props }, ref) => {
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-start',
    'gap-2',
    'p-4',
    'rounded-xl',
    'cursor-pointer',
    'border',
    'border-border-50',
    'bg-background',
    'text-sm',
    'text-text-700',
    'font-bold',
    'shadow-soft-shadow-1',
    'hover:bg-background-100',
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-indicator-info',
    'focus-visible:ring-offset-0',
    'focus-visible:shadow-none',
    'active:ring-2',
    'active:ring-primary-950',
    'active:ring-offset-0',
    'active:shadow-none',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
  ].join(' ');

  return (
    <button
      ref={ref}
      type="button"
      className={`${baseClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      <span className="flex items-center justify-center w-6 h-6">{icon}</span>
      <span>{label}</span>
    </button>
  );
});

SelectionButton.displayName = 'SelectionButton';
