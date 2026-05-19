import type { ReactElement } from 'react';
import { TruncatedText } from '../components/TruncatedText/TruncatedText';

/**
 * Renders a table cell displaying text. Uses TruncatedText so the design-system
 * Tooltip appears only when the text actually overflows the cell width.
 * Useful as a render function for TableProvider column configurations.
 *
 * @param value - Raw cell value from the table row (coerced to string)
 * @returns TruncatedText element showing the string value
 */
export const renderTextCell = (value: unknown): ReactElement => {
  const text = typeof value === 'string' ? value : '';
  return <TruncatedText size="md">{text}</TruncatedText>;
};
