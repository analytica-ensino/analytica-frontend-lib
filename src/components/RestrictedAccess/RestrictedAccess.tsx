import Text from '../Text/Text';
import Button from '../Button/Button';
import { cn } from '../../utils/utils';
import { ShieldCheck } from 'phosphor-react';

/**
 * Props interface for the RestrictedAccess component
 *
 * @interface RestrictedAccessProps
 * @property {string} [title] - Custom title text (default: "Área Restrita")
 * @property {string} [description] - Custom description text
 * @property {string} [buttonText] - Custom button text (default: "Fazer Login")
 * @property {() => void} [onLoginClick] - Callback function for login button click
 * @property {string} [loginUrl] - URL to redirect for login (alternative to onLoginClick)
 * @property {string} [logoSrc] - Logo image source URL
 * @property {string} [logoAlt] - Logo image alt text
 * @property {string} [footerText] - Footer text to display
 * @property {string} [className] - Additional CSS classes for the container
 */
export interface RestrictedAccessProps {
  title?: string;
  description?: string;
  buttonText?: string;
  onLoginClick?: () => void;
  loginUrl?: string;
  logoSrc?: string;
  logoAlt?: string;
  footerText?: string;
  className?: string;
}

/**
 * RestrictedAccess component for displaying login/authentication required pages
 *
 * A reusable component for displaying restricted access pages with configurable
 * content, logo, and login action.
 *
 * @param {RestrictedAccessProps} props - The component props
 * @returns {JSX.Element} The RestrictedAccess component
 *
 * @example
 * ```typescript
 * // With callback function
 * <RestrictedAccess
 *   onLoginClick={() => redirectToLogin()}
 *   logoSrc="/logo.png"
 *   footerText="My Application"
 * />
 *
 * // With URL redirect
 * <RestrictedAccess
 *   loginUrl="https://auth.example.com/login"
 *   title="Acesso Restrito"
 *   description="Faça login para continuar"
 * />
 * ```
 */
const RestrictedAccess = ({
  title = 'Área Restrita',
  description = 'Este é um painel administrativo. Faça login para acessar o sistema.',
  buttonText = 'Fazer Login',
  onLoginClick,
  loginUrl,
  logoSrc,
  logoAlt = 'Logo',
  footerText,
  className = '',
}: RestrictedAccessProps) => {
  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    } else if (loginUrl) {
      globalThis.location.href = loginUrl;
    }
  };

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
            <ShieldCheck size={48} className="text-primary-800" />
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            <Text size="xl" weight="bold">
              {title}
            </Text>
            <Text size="md" color="text-text-500">
              {description}
            </Text>
          </div>

          {(onLoginClick || loginUrl) && (
            <Button onClick={handleLoginClick} className="w-full">
              {buttonText}
            </Button>
          )}
        </div>

        {footerText && (
          <Text size="sm" color="text-primary-200">
            {footerText}
          </Text>
        )}
      </div>
    </div>
  );
};

export default RestrictedAccess;
