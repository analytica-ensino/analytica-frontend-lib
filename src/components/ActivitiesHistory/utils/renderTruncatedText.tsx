import type { ReactNode } from 'react';
import Text from '../../Text/Text';

/**
 * Render a truncated text cell for table columns
 * @param value - The value to render (will be converted to string)
 * @returns React node for the truncated text
 */
export const renderTruncatedText = (value: unknown): ReactNode => {
  const text = typeof value === 'string' ? value : '';
  return (
    <Text size="sm" title={text}>
      {text}
    </Text>
  );
};
