import type { ReactElement } from 'react';
import Text from '../components/Text/Text';

/**
 * Renders a table cell displaying text with a tooltip title.
 * Useful as a render function for TableProvider column configurations.
 *
 * @param value - Raw cell value from the table row (coerced to string)
 * @returns Text element showing the string value with a title attribute for overflow tooltip
 */
export const renderTextCell = (value: unknown): ReactElement => {
  const text = typeof value === 'string' ? value : '';
  return (
    <Text as="span" title={text}>
      {text}
    </Text>
  );
};
