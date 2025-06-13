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
    'w-8',
    'h-8',
    'rounded-full',
    'cursor-pointer',
    'border',
    'border-background-200',
    'bg-background',
    'text-text-950',
    'hover:shadow-hard-shadow-1',
    'focus-visible:shadow-hard-shadow-1',
    'focus-visible:border-2',
    'focus-visible:border-indicator-info',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
  ].join(' ');

  return (
    <button
      type="button"
      className={`${baseClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      <span className="flex items-center justify-center w-5 h-5">{icon}</span>
    </button>
  );
};
