import Text from '../Text/Text';
import { cn } from '../../utils/utils';
import { CircleNotch } from 'phosphor-react';

/**
 * Props interface for the TokenValidation component
 *
 * @interface TokenValidationProps
 * @property {string} [title] - Custom title text (default: "Validando acesso...")
 * @property {string} [description] - Custom description text
 * @property {string} [logoSrc] - Logo image source URL
 * @property {string} [logoAlt] - Logo image alt text
 * @property {string} [className] - Additional CSS classes for the container
 */
export interface TokenValidationProps {
  title?: string;
  description?: string;
  logoSrc?: string;
  logoAlt?: string;
  className?: string;
}

/**
 * TokenValidation component for displaying a loading state while validating tokens
 *
 * A reusable component for displaying a loading screen during token validation
 * with configurable content and logo.
 *
 * @param {TokenValidationProps} props - The component props
 * @returns {JSX.Element} The TokenValidation component
 *
 * @example
 * ```typescript
 * <TokenValidation
 *   logoSrc="/logo.png"
 *   title="Autenticando..."
 *   description="Por favor, aguarde enquanto validamos seu acesso."
 * />
 * ```
 */
const TokenValidation = ({
  title = 'Validando acesso...',
  description = 'Por favor, aguarde enquanto verificamos suas credenciais.',
  logoSrc,
  logoAlt = 'Logo',
  className = '',
}: TokenValidationProps) => {
  return (
    <div
      className={cn(
        'min-h-screen w-full bg-primary-800 flex flex-col items-center justify-center p-4',
        className
      )}
    >
      <div className="flex flex-col items-center gap-8 max-w-md w-full">
        {logoSrc && (
          <img src={logoSrc} alt={logoAlt} className="h-12 object-contain" />
        )}

        <div className="bg-background rounded-xl p-8 w-full flex flex-col items-center gap-6 shadow-lg">
          <div className="bg-primary-100 p-4 rounded-full">
            <CircleNotch size={48} className="text-primary-800 animate-spin" />
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            <Text size="xl" weight="bold">
              {title}
            </Text>
            <Text size="md" color="text-text-500">
              {description}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenValidation;
