import { CaretRightIcon } from '@phosphor-icons/react/dist/csr/CaretRight';
import Text from '../../Text/Text';
import Button from '../../Button/Button';
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
  // Lista ordenada dentro de `nav`: o leitor anuncia "trilha de navegação,
  // lista, 2 itens" e a posição de cada nível. O último item é a página atual
  // (`aria-current`), não uma ação, e o separador é só decoração.
  <nav aria-label="Trilha de navegação">
    <ol className="flex flex-wrap items-center gap-2 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const path = item.path;
        return (
          <Text
            as="li"
            key={path ?? item.label}
            className="flex items-center gap-2"
          >
            {index > 0 && (
              <CaretRightIcon
                size={14}
                className="text-text-500"
                aria-hidden="true"
              />
            )}
            {path && !isLast ? (
              <Button
                variant="raw"
                onClick={() => onItemClick?.(path)}
                className="text-text-600 hover:text-primary-700 transition-colors"
              >
                {item.label}
              </Button>
            ) : (
              <Text
                as="span"
                aria-current={isLast ? 'page' : undefined}
                className="text-text-950 font-medium"
              >
                {item.label}
              </Text>
            )}
          </Text>
        );
      })}
    </ol>
  </nav>
);

export default Breadcrumb;
