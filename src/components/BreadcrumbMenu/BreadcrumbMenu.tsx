import { Menu, MenuContent, MenuItem } from '../Menu/Menu';
import { useNavigate } from 'react-router-dom';
import { type BreadcrumbItem } from './breadcrumbStore';

/**
 * Props do componente BreadcrumbMenu
 */
export interface BreadcrumbMenuProps {
  /** Lista de breadcrumbs a serem exibidos */
  breadcrumbs: BreadcrumbItem[];
  /** Callback quando um breadcrumb é clicado */
  onBreadcrumbClick?: (breadcrumb: BreadcrumbItem, index: number) => void;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * Componente reutilizável para renderizar um menu de breadcrumbs
 *
 * @example
 * ```tsx
 * <BreadcrumbMenu
 *   breadcrumbs={breadcrumbs}
 *   onBreadcrumbClick={(breadcrumb, index) => {
 *     console.log('Clicked:', breadcrumb, 'at index:', index);
 *   }}
 * />
 * ```
 */
export const BreadcrumbMenu = ({
  breadcrumbs,
  onBreadcrumbClick,
  className = '!px-0 py-4 flex-wrap w-full',
}: BreadcrumbMenuProps) => {
  const navigate = useNavigate();

  const handleClick = (breadcrumb: BreadcrumbItem, index: number) => {
    if (onBreadcrumbClick) {
      onBreadcrumbClick(breadcrumb, index);
    }
    navigate(breadcrumb.url);
  };

  return (
    <Menu
      value={`breadcrumb-${breadcrumbs.length - 1}`}
      defaultValue="breadcrumb-0"
      variant="breadcrumb"
      className={className}
    >
      <MenuContent className="w-full flex flex-row flex-wrap gap-2 !px-0">
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const hasSeparator = !isLast;

          return (
            <MenuItem
              key={breadcrumb.id}
              variant="breadcrumb"
              value={`breadcrumb-${index}`}
              className="!p-0 whitespace-nowrap"
              onClick={() => handleClick(breadcrumb, index)}
              separator={hasSeparator}
            >
              {breadcrumb.name}
            </MenuItem>
          );
        })}
      </MenuContent>
    </Menu>
  );
};
