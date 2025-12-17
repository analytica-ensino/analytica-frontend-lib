import { CaretRightIcon } from '@phosphor-icons/react';
import Text from '../../Text/Text';
import type { BreadcrumbItem } from '../types';

/**
 * Props for Breadcrumb component
 */
interface BreadcrumbProps {
  /** Breadcrumb items to display */
  items: BreadcrumbItem[];
  /** Callback when a breadcrumb item is clicked */
  onItemClick?: (path: string) => void;
}

/**
 * Breadcrumb navigation component
 * Displays a path of navigation items with optional click handlers
 */
export const Breadcrumb = ({ items, onItemClick }: BreadcrumbProps) => (
  <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
    {items.map((item, index) => (
      <Text
        key={item.path ?? item.label}
        as="span"
        className="flex items-center gap-2"
      >
        {index > 0 && <CaretRightIcon size={14} className="text-text-500" />}
        {item.path ? (
          <button
            onClick={() => onItemClick?.(item.path!)}
            className="text-text-600 hover:text-primary-700 transition-colors"
          >
            {item.label}
          </button>
        ) : (
          <Text as="span" className="text-text-950 font-medium">
            {item.label}
          </Text>
        )}
      </Text>
    ))}
  </nav>
);

export default Breadcrumb;
