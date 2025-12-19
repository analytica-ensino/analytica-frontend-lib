import Text from '../../Text/Text';

/**
 * Props for the ErrorDisplay component
 */
interface ErrorDisplayProps {
  /** Error message to display */
  error: string;
}

/**
 * Component to display error messages in the activities history
 * @param props - ErrorDisplay props
 * @returns Error display component
 */
export const ErrorDisplay = ({ error }: ErrorDisplayProps) => (
  <div className="flex items-center justify-center bg-background rounded-xl w-full min-h-[705px]">
    <Text size="lg" color="text-error-500">
      {error}
    </Text>
  </div>
);
