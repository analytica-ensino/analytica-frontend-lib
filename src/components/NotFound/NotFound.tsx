import { MouseEvent } from 'react';
import Text from '../Text/Text';
import Button from '../Button/Button';

/**
 * Props interface for the NotFound component
 *
 * @interface NotFoundProps
 * @property {string} [title] - Custom title text (default: "Página não encontrada")
 * @property {string} [description] - Custom description text
 * @property {string} [buttonText] - Custom button text (default: "Voltar")
 * @property {() => void} [onButtonClick] - Callback function for button click
 * @property {string} [className] - Additional CSS classes for the container
 * @property {'404' | '500' | 'custom'} [errorType] - Type of error to display (default: '404')
 * @property {string} [customErrorCode] - Custom error code when errorType is 'custom'
 */
export interface NotFoundProps {
  title?: string;
  description?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  className?: string;
  errorType?: '404' | '500' | 'custom';
  customErrorCode?: string;
}

/**
 * NotFound component for displaying error pages
 *
 * A reusable component for displaying 404, 500, or custom error pages
 * with configurable content and navigation button.
 *
 * @param {NotFoundProps} props - The component props
 * @returns {JSX.Element} The NotFound component
 *
 * @example
 * ```typescript
 * // Basic 404 page
 * <NotFound onButtonClick={() => navigate('/dashboard')} />
 *
 * // Custom error page
 * <NotFound
 *   errorType="500"
 *   title="Erro interno do servidor"
 *   description="Algo deu errado. Tente novamente mais tarde."
 *   buttonText="Tentar novamente"
 *   onButtonClick={() => window.location.reload()}
 * />
 *
 * // Custom error code
 * <NotFound
 *   errorType="custom"
 *   customErrorCode="403"
 *   title="Acesso negado"
 *   description="Você não tem permissão para acessar esta página."
 * />
 * ```
 */
const NotFound = ({
  title,
  description,
  buttonText = 'Voltar',
  onButtonClick,
  className = '',
  errorType = '404',
  customErrorCode,
}: NotFoundProps) => {
  const getErrorCode = () => {
    if (errorType === 'custom' && customErrorCode) {
      return customErrorCode;
    }
    return errorType;
  };

  const getDefaultTitle = () => {
    switch (errorType) {
      case '404':
        return 'Página não encontrada';
      case '500':
        return 'Erro interno do servidor';
      default:
        return 'Erro';
    }
  };

  const getDefaultDescription = () => {
    switch (errorType) {
      case '404':
        return 'Oops! A página que você está procurando não existe ou foi removida.';
      case '500':
        return 'Algo deu errado em nossos servidores. Tente novamente mais tarde.';
      default:
        return 'Ocorreu um erro inesperado.';
    }
  };

  const handleButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onButtonClick?.();
  };

  return (
    <div
      className={`flex flex-col w-full h-screen items-center justify-center bg-background-50 px-4 ${className}`}
    >
      <div className="flex flex-col items-center text-center max-w-md space-y-6">
        {/* Error Code */}
        <div className="text-8xl font-bold text-primary-300 select-none">
          {getErrorCode()}
        </div>

        {/* Main message */}
        <div className="space-y-2">
          <Text size="xl" weight="bold" className="text-text-950">
            {title || getDefaultTitle()}
          </Text>
          <Text size="md" className="text-text-600">
            {description || getDefaultDescription()}
          </Text>
        </div>

        {/* Back button */}
        {onButtonClick && (
          <Button
            onClick={handleButtonClick}
            variant="solid"
            size="medium"
            className="mt-8"
          >
            {buttonText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default NotFound;
