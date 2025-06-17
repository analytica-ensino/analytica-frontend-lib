import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';

/**
 * NavButton component props interface
 */
type NavButtonProps = {
  /** Ícone a ser exibido no botão */
  icon: ReactNode;
  /** Texto/label a ser exibido ao lado do ícone */
  label: string;
  /** Estado de seleção do botão */
  selected?: boolean;
  /** Additional CSS classes to apply */
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * NavButton component for Analytica Ensino platforms
 *
 * Um botão de navegação com ícone e texto para navegação principal.
 * Ideal para menus de navegação, sidebar, tabs de navegação, etc.
 * Compatível com Next.js 15 e React 19.
 * Suporta forwardRef para acesso programático ao elemento DOM.
 *
 * @param icon - O ícone a ser exibido no botão
 * @param label - O texto/label a ser exibido
 * @param selected - Estado de seleção do botão
 * @param className - Classes CSS adicionais
 * @param props - Todos os outros atributos HTML padrão de button
 * @returns Um elemento button estilizado para navegação
 *
 * @example
 * ```tsx
 * <NavButton
 *   icon={<HomeIcon />}
 *   label="Início"
 *   selected={false}
 *   onClick={() => navigate('/')}
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
 * <NavButton
 *   ref={buttonRef}
 *   icon={<HomeIcon />}
 *   label="Dashboard"
 *   selected={isActive}
 *   onClick={() => setActiveTab('dashboard')}
 * />
 * ```
 */
export const NavButton = forwardRef<HTMLButtonElement, NavButtonProps>(
  (
    { icon, label, selected = false, className = '', disabled, ...props },
    ref
  ) => {
    // Classes base para todos os estados
    const baseClasses = [
      'flex',
      'flex-col',
      'items-center',
      'justify-center',
      'gap-0.5',
      'px-12',
      'py-1',
      'rounded-sm',
      'cursor-pointer',
      'text-text-950',
      'text-xs',
      'font-medium',
      'hover:text-text',
      'hover:bg-primary-600',
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-offset-0',
      'focus-visible:ring-indicator-info',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'disabled:pointer-events-none',
    ];

    const stateClasses = selected ? ['bg-primary-50', 'text-primary-950'] : [];

    const allClasses = [...baseClasses, ...stateClasses].join(' ');

    return (
      <button
        ref={ref}
        type="button"
        className={`${allClasses} ${className}`}
        disabled={disabled}
        aria-pressed={selected}
        {...props}
      >
        <span className="flex items-center justify-center w-5 h-5">{icon}</span>
        <span className="whitespace-nowrap">{label}</span>
      </button>
    );
  }
);

NavButton.displayName = 'NavButton';
