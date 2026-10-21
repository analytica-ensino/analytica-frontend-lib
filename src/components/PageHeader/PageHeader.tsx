import type { ReactNode } from 'react';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';

export interface PageHeaderProps {
  /** Page title, rendered as the page's `h1`. */
  title: ReactNode;
  /**
   * What sits beside the title (tabs, a select, a search). Wrap it in an
   * element with `sm:self-end` so it lines up with the title's base.
   */
  children?: ReactNode;
  /** Extra classes for the header row. */
  className?: string;
}

/**
 * Header of a student page, as the Simulados page draws it: the `h1` title
 * aligned by the base of a 64px row — the height of the tabs that sit beside
 * it there — then 16px down to the content. A page with nothing beside its
 * title still gets the same row, so the title and the content start at the
 * same height on every page.
 *
 * On phones the row centres its items and the title keeps a 16px top margin,
 * as on Simulados.
 *
 * @example
 * ```tsx
 * <PageHeader title="Simulados">
 *   <div className="sm:flex-shrink-0 sm:self-end">
 *     <Menu ... />
 *   </div>
 * </PageHeader>
 * ```
 */
export function PageHeader({
  title,
  children,
  className,
}: Readonly<PageHeaderProps>) {
  return (
    <div
      className={cn(
        'flex w-full mb-4 min-h-16 flex-row items-center justify-between not-lg:gap-4 lg:gap-6',
        className
      )}
    >
      <Text
        as="h1"
        size="lg"
        weight="bold"
        className="text-text-950 mt-4 sm:flex-1 sm:self-end sm:mt-0"
      >
        {title}
      </Text>
      {children}
    </div>
  );
}

export default PageHeader;
