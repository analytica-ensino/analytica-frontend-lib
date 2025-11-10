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
    <div className="flex flex-col justify-center items-center gap-6 w-full min-h-[705px] bg-background rounded-xl p-6">
      {/* Illustration */}
      <img src={image} alt={displayTitle} className="w-[170px] h-[150px]" />

      {/* Text Content Container */}
      <div className="flex flex-col items-center gap-4 w-full max-w-[600px] px-6">
        {/* Title */}
        <Text
          as="h2"
          className="text-text-950 font-semibold text-3xl leading-[35px] text-center"
        >
          {displayTitle}
        </Text>

        {/* Description */}
        <Text className="text-text-600 font-normal text-[18px] leading-[27px] text-center">
          {displayDescription}
        </Text>
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
