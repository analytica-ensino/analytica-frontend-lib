import React from 'react';
import { WarningCircle as WarningCircleIcon } from 'phosphor-react';
import Text from '../../../Text/Text';

/**
 * Props for SendModalError component
 */
export interface SendModalErrorProps {
  /** Error message to display */
  error?: string;
  /** Optional test ID */
  testId?: string;
}

/**
 * Error display component for SendModal validation errors
 * Renders a text message with warning icon when error is present
 */
export const SendModalError: React.FC<SendModalErrorProps> = ({
  error,
  testId,
}) => {
  if (!error) return null;

  return (
    <Text
      as="p"
      size="sm"
      color="text-error-600"
      className="flex items-center gap-1 mt-1"
      data-testid={testId}
    >
      <WarningCircleIcon size={16} />
      {error}
    </Text>
  );
};

export default SendModalError;
