import { type ReactNode } from 'react';
import Text from '../Text/Text';
import Button from '../Button/Button';
import { useMobile } from '../../hooks/useMobile';

export interface EmptyStateProps {
  /**
   * Image source for the illustration (optional)
   * Can be a string (URL) or a ReactNode (component)
   */
  image?: string | ReactNode;
  /**
   * Title text to display
   * @default "Nenhum dado disponível"
   */
  title?: string;
  /**
   * Description text to display below the title
   * @default "Não há dados para exibir no momento."
   */
  description?: string;
  /**
   * Button text (optional - if not provided, button won't be displayed)
   */
  buttonText?: string;
  /**
   * Icon to display on the left side of the button
   */
  buttonIcon?: ReactNode;
  /**
   * Callback function when button is clicked
   */
  onButtonClick?: () => void;
  /**
   * Button variant
   * @default "solid"
   */
  buttonVariant?: 'solid' | 'outline' | 'link';
  /**
   * Button action color
   * @default "primary"
   */
  buttonAction?: 'primary' | 'positive' | 'negative';
  /**
   * Text size variant
   * @default "large"
   */
  size?: 'compact' | 'large';
}

/**
 * Component displayed when there is no data to show (empty state)
 * Shows an illustration with customizable title, description, and optional button in horizontal layout
 *
 * @example
 * ```tsx
 * import { EmptyState } from 'analytica-frontend-lib';
 * import activityImage from './assets/activity.png';
 * import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus';
 *
 * // Large variant (default) - for main page empty states
 * <EmptyState
 *   image={activityImage}
 *   title="Incentive sua turma ao aprendizado"
 *   description="Crie uma nova atividade e ajude seus alunos a colocarem o conteúdo em prática!"
 *   buttonText="Criar atividade"
 *   buttonIcon={<PlusIcon size={18} />}
 *   buttonVariant="outline"
 *   onButtonClick={handleCreateActivity}
 * />
 *
 * // Compact variant - for inline/contextual empty states
 * <EmptyState
 *   image={activityImage}
 *   title="Nenhum resultado encontrado"
 *   description="Utilize o filtro ao lado para encontrar questões."
 *   size="compact"
 * />
 * ```
 */
const EmptyState = ({
  image,
  title,
  description,
  buttonText,
  buttonIcon,
  onButtonClick,
  buttonVariant = 'solid',
  buttonAction = 'primary',
  size = 'large',
}: EmptyStateProps) => {
  const { isMobile } = useMobile();
  const displayTitle = title || 'Nenhum dado disponível';
  const displayDescription =
    description || 'Não há dados para exibir no momento.';

  const titleClassName =
    size === 'compact'
      ? 'text-text-600 text-sm font-semibold text-center'
      : 'text-text-950 text-3xl font-semibold text-center';

  const descriptionClassName =
    size === 'compact'
      ? 'text-text-600 text-sm font-normal text-center'
      : 'text-text-600 text-[18px] font-normal text-center';

  // Compact variant must never shrink below its content when rendered as a
  // flex item inside a fixed-height column (e.g. LessonPreview/ActivityPreview
  // with overflow-y-auto); otherwise the centered content overflows both ends.
  const containerSizeClass = size === 'compact' ? 'shrink-0' : 'min-h-[705px]';

  // Tighter spacing on mobile so the text column keeps a readable width
  const containerPadding = isMobile ? 'p-3' : 'p-6';
  const textPadding = isMobile ? 'px-0' : 'px-6';

  return (
    <div
      className={`flex flex-col justify-center items-center gap-6 w-full ${containerSizeClass} bg-background rounded-xl ${containerPadding}`}
    >
      {/* Illustration */}
      {image && (
        <div className="w-full max-w-[170px] max-h-[150px] flex items-center justify-center">
          {typeof image === 'string' ? (
            <img
              src={image}
              alt={displayTitle}
              className="w-full h-full max-w-[170px] max-h-[150px]"
            />
          ) : (
            <div className="w-full max-w-[170px] h-[150px] flex items-center justify-center [&>svg]:max-w-full [&>svg]:h-auto">
              {image}
            </div>
          )}
        </div>
      )}

      {/* Text Content Container */}
      <div
        className={`flex flex-col items-center gap-4 w-full max-w-[600px] ${textPadding}`}
      >
        {/* Title */}
        <Text as="h2" className={titleClassName}>
          {displayTitle}
        </Text>

        {/* Description */}
        <Text className={descriptionClassName}>{displayDescription}</Text>
      </div>

      {/* Button */}
      {buttonText && onButtonClick && (
        <Button
          variant={buttonVariant}
          action={buttonAction}
          size="large"
          onClick={onButtonClick}
          iconLeft={buttonIcon}
          className="rounded-full px-5 py-2.5"
        >
          {buttonText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
