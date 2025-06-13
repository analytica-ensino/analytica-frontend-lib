import { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * IconRoundedButton component props interface
 */
type IconRoundedButtonProps = {
  /** Ícone a ser exibido no botão */
  icon: ReactNode;
  /** Additional CSS classes to apply */
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * IconRoundedButton component for Analytica Ensino platforms
 *
 * Um botão redondo simples que exibe apenas um ícone.
 * Ideal para ações como navegação, fechar, editar, etc.
 * Compatível com Next.js 15 e React 19.
 *
 * @param icon - O ícone a ser exibido no botão
 * @param className - Classes CSS adicionais
 * @param props - Todos os outros atributos HTML padrão de button
 * @returns Um elemento button estilizado e redondo
 *
 * @example
 * ```tsx
 * <IconRoundedButton
 *   icon={<ChevronRightIcon />}
 *   onClick={() => console.log('clicked')}
 * />
 * ```
 */
export const IconRoundedButton = ({
  icon,
  className = '',
  disabled,
  ...props
}: IconRoundedButtonProps) => {
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'w-10',
    'h-10',
    'rounded-full',
    'cursor-pointer',
    'border-2',
    'border-primary-950',
    'bg-transparent',
    'text-primary-950',
    'hover:bg-background-50',
    'hover:text-primary-400',
    'hover:border-primary-400',
    'focus:text-primary-600',
    'focus:border-indicator-info',
    'active:text-primary-700',
    'active:border-primary-700',
    'disabled:opacity-40',
    'disabled:cursor-not-allowed',
    'transition-colors',
    'duration-200',
  ].join(' ');

  return (
    <button
      className={`${baseClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      <span className="flex items-center justify-center w-5 h-5">{icon}</span>
    </button>
  );
};
