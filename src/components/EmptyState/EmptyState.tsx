import { type ReactNode } from 'react';
import Text from '../Text/Text';
import Button from '../Button/Button';

export interface EmptyStateProps {
  /**
   * Image source for the illustration
   */
  image: string;
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
}

/**
 * Component displayed when there is no data to show (empty state)
 * Shows an illustration with customizable title, description, and optional button in horizontal layout
 *
 * @example
 * ```tsx
 * import { EmptyState } from 'analytica-frontend-lib';
 * import activityImage from './assets/activity.png';
 * import { Plus } from 'phosphor-react';
 *
 * <EmptyState
 *   image={activityImage}
 *   title="Incentive sua turma ao aprendizado"
 *   description="Crie uma nova atividade e ajude seus alunos a colocarem o conteúdo em prática!"
 *   buttonText="Criar atividade"
 *   buttonIcon={<Plus size={18} />}
 *   buttonVariant="outline"
 *   onButtonClick={handleCreateActivity}
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
}: EmptyStateProps) => {
  const displayTitle = title || 'Nenhum dado disponível';
  const displayDescription =
    description || 'Não há dados para exibir no momento.';

  return (
    <div className="flex flex-row justify-center items-center gap-8 w-full max-w-4xl min-h-96">
      {/* Illustration */}
      <div className="w-72 h-72 flex-shrink-0 relative">
        <img
          src={image}
          alt={displayTitle}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Text Content */}
      <div className="flex flex-col items-start w-full max-w-md gap-4">
        {/* Header Container */}
        <div className="flex flex-row justify-between items-end px-6 pt-6 pb-4 w-full rounded-t-xl">
          {/* Title */}
          <Text
            as="h2"
            className="text-text-950 font-semibold text-3xl leading-tight w-full flex items-center"
          >
            {displayTitle}
          </Text>
        </div>

        {/* Description Container */}
        <div className="flex flex-row justify-center items-center px-6 gap-2 w-full">
          {/* Description */}
          <Text className="text-text-600 font-normal text-lg leading-relaxed w-full text-justify">
            {displayDescription}
          </Text>
        </div>

        {/* Button Container */}
        {buttonText && onButtonClick && (
          <div className="flex flex-row justify-center items-center px-6 w-full mt-2">
            <Button
              variant={buttonVariant}
              action={buttonAction}
              size="large"
              onClick={onButtonClick}
              iconLeft={buttonIcon}
            >
              {buttonText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
