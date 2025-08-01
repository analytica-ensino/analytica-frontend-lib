import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '../../utils/utils';

/**
 * IconButton component props interface
 */
export type IconButtonProps = {
  /** Ícone a ser exibido no botão */
  icon: ReactNode;
  /** Tamanho do botão */
  size?: 'sm' | 'md';
  /** Estado de seleção/ativo do botão - permanece ativo até ser clicado novamente ou outro botão ser ativado */
  active?: boolean;
  /** Additional CSS classes to apply */
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * IconButton component for Analytica Ensino platforms
 *
 * Um botão compacto apenas com ícone, ideal para menus dropdown,
 * barras de ferramentas e ações secundárias.
 * Oferece dois tamanhos com estilo consistente.
 * Estado ativo permanece até ser clicado novamente ou outro botão ser ativado.
 * Suporta forwardRef para acesso programático ao elemento DOM.
 *
 * @param icon - O ícone a ser exibido no botão
 * @param size - Tamanho do botão (sm, md)
 * @param active - Estado ativo/selecionado do botão
 * @param className - Classes CSS adicionais
 * @param props - Todos os outros atributos HTML padrão de button
 * @returns Um elemento button compacto estilizado apenas com ícone
 *
 * @example
 * ```tsx
 * <IconButton
 *   icon={<MoreVerticalIcon />}
 *   size="sm"
 *   onClick={() => openMenu()}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Botão ativo em uma barra de ferramentas - permanece ativo até outro clique
 * <IconButton
 *   icon={<BoldIcon />}
 *   active={isBold}
 *   onClick={toggleBold}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Usando ref para controle programático
 * const buttonRef = useRef<HTMLButtonElement>(null);
 *
 * <IconButton
 *   ref={buttonRef}
 *   icon={<EditIcon />}
 *   size="md"
 *   onClick={() => startEditing()}
 * />
 * ```
 */
const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { icon, size = 'md', active = false, className = '', disabled, ...props },
    ref
  ) => {
    // Classes base para todos os estados
    const baseClasses = [
      'inline-flex',
      'items-center',
      'justify-center',
      'rounded-lg',
      'font-medium',
      'bg-transparent',
      'text-text-950',
      'cursor-pointer',
      'hover:bg-primary-600',
      'hover:text-text',
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-offset-0',
      'focus-visible:ring-indicator-info',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'disabled:pointer-events-none',
    ];

    // Classes de tamanho
    const sizeClasses = {
      sm: ['w-6', 'h-6', 'text-sm'],
      md: ['w-10', 'h-10', 'text-base'],
    };

    // Classes de estado ativo
    const activeClasses = active
      ? ['!bg-primary-50', '!text-primary-950', 'hover:!bg-primary-100']
      : [];

    const allClasses = [
      ...baseClasses,
      ...sizeClasses[size],
      ...activeClasses,
    ].join(' ');

    // Garantir acessibilidade com aria-label padrão
    const ariaLabel = props['aria-label'] ?? 'Botão de ação';

    return (
      <button
        ref={ref}
        type="button"
        className={cn(allClasses, className)}
        disabled={disabled}
        aria-pressed={active}
        aria-label={ariaLabel}
        {...props}
      >
        <span className="flex items-center justify-center">{icon}</span>
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export default IconButton;
