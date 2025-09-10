import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '../../utils/utils';
import { useTheme } from '../../hooks/useTheme';

/**
 * ThemeToggle component props interface
 */
export type ThemeToggleProps = {
  /** Modo de exibição do toggle */
  variant?: 'simple' | 'detailed' | 'buttons';
  /** Tamanho do componente */
  size?: 'sm' | 'md' | 'lg';
  /** Mostrar ícones nos botões */
  showIcons?: boolean;
  /** Mostrar labels nos botões */
  showLabels?: boolean;
  /** Classes CSS adicionais */
  className?: string;
  /** Conteúdo customizado para o botão simples */
  children?: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>;

/**
 * ThemeToggle component for Analytica Ensino platforms
 *
 * Componente para alternar entre temas light, dark e system.
 * Oferece diferentes variantes de exibição e tamanhos.
 * Integra com o hook useTheme para gerenciamento de estado.
 * Suporta forwardRef para acesso programático ao elemento DOM.
 *
 * @param variant - Modo de exibição (simple, detailed, buttons)
 * @param size - Tamanho do componente (sm, md, lg)
 * @param showIcons - Mostrar ícones nos botões
 * @param showLabels - Mostrar labels nos botões
 * @param className - Classes CSS adicionais
 * @param children - Conteúdo customizado para o botão simples
 */
export const ThemeToggle = forwardRef<HTMLButtonElement, ThemeToggleProps>(
  (
    {
      variant = 'simple',
      size = 'md',
      showIcons = true,
      showLabels = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { themeMode, isDark, toggleTheme, setTheme } = useTheme();

    // Classes base para tamanhos
    const sizeClasses = {
      sm: 'text-sm px-3 py-1.5',
      md: 'text-md px-4 py-2',
      lg: 'text-lg px-5 py-2.5',
    };

    // Classes para botões ativos
    const activeClasses = 'bg-primary-500 text-white';
    const inactiveClasses =
      'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600';

    // Renderizar botão simples
    if (variant === 'simple') {
      return (
        <button
          ref={ref}
          onClick={toggleTheme}
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            sizeClasses[size],
            className
          )}
          {...props}
        >
          {children || (
            <>
              {showIcons && (isDark ? '☀️' : '🌙')}
              {showLabels && (isDark ? 'Claro' : 'Escuro')}
            </>
          )}
        </button>
      );
    }

    // Renderizar botões detalhados
    if (variant === 'detailed') {
      return (
        <div className={cn('flex flex-col gap-2', className)}>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tema:{' '}
            {themeMode === 'system' ? 'Sistema' : isDark ? 'Escuro' : 'Claro'}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setTheme('light')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                themeMode === 'light' ? activeClasses : inactiveClasses
              )}
            >
              {showIcons && '☀️ '}
              {showLabels && 'Claro'}
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                themeMode === 'dark' ? activeClasses : inactiveClasses
              )}
            >
              {showIcons && '🌙 '}
              {showLabels && 'Escuro'}
            </button>
            <button
              onClick={() => setTheme('system')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                themeMode === 'system' ? activeClasses : inactiveClasses
              )}
            >
              {showIcons && '⚙️ '}
              {showLabels && 'Sistema'}
            </button>
          </div>
        </div>
      );
    }

    // Renderizar botões separados
    if (variant === 'buttons') {
      return (
        <div className={cn('flex gap-2', className)}>
          <button
            onClick={() => setTheme('light')}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              sizeClasses[size],
              themeMode === 'light' ? activeClasses : inactiveClasses
            )}
            {...props}
          >
            {showIcons && '☀️'}
            {showLabels && 'Claro'}
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              sizeClasses[size],
              themeMode === 'dark' ? activeClasses : inactiveClasses
            )}
            {...props}
          >
            {showIcons && '🌙'}
            {showLabels && 'Escuro'}
          </button>
          <button
            onClick={() => setTheme('system')}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              sizeClasses[size],
              themeMode === 'system' ? activeClasses : inactiveClasses
            )}
            {...props}
          >
            {showIcons && '⚙️'}
            {showLabels && 'Sistema'}
          </button>
        </div>
      );
    }

    return null;
  }
);

ThemeToggle.displayName = 'ThemeToggle';
