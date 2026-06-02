import type { ReactNode } from 'react';

import { MenuItem, MenuOverflow } from '../Menu/Menu';
import { PageContainer } from '../PageContainer/PageContainer';

export interface AppLayoutMenuItem {
  /** Unique value used to compute `activeMenuValue` and dispatch clicks. */
  value: string;
  /** Visible label rendered below the icon. */
  label: string;
  /** Icon shown above the label. */
  icon: ReactNode;
  /**
   * When `false`, the item is hidden (useful for feature flags).
   * Default: `true`.
   */
  visible?: boolean;
}

export interface AppLayoutProps {
  /**
   * Header element rendered at the top of the layout.
   * Usually a wrapper around `AppHeader`.
   */
  header: ReactNode;
  /** Items shown in the navigation carousel. */
  menuItems: AppLayoutMenuItem[];
  /** Value of the currently active item. */
  activeMenuValue: string;
  /** Called when the user clicks a menu item; receives the item's `value`. */
  onMenuItemClick: (value: string) => void;
  /**
   * Tailwind class overriding the default `max-w-[1000px]` of the menu.
   * Pass e.g. `max-w-[1150px]` to widen for roles with more items.
   */
  menuMaxWidth?: string;
  /**
   * Tailwind class overriding the default `max-w-[1000px]` of the page content
   * (forwarded to `PageContainer`'s `innerClassName`). Pass e.g.
   * `max-w-[1280px]` to widen the content area. When omitted, the default
   * `max-w-[1000px]` is kept, so other consumers are unaffected.
   */
  contentMaxWidth?: string;
  /** Page content (e.g. `<Outlet />`). */
  children: ReactNode;
  /**
   * Optional slot rendered at the very end of the layout (after the page
   * content). Use for floating widgets like `<ZendeskWidget />`.
   */
  bottomSlot?: ReactNode;
}

/**
 * Shared application layout used by every analytica frontend (aluno, gestor,
 * professor). It composes the header, the responsive navigation carousel
 * (`MenuOverflow` + `MenuItem` variant `menu-overflow-col`) and a
 * `PageContainer` wrapping the page content.
 *
 * Business rules (feature flags, Zendesk handoff, route mapping) live in the
 * consumer — the layout is intentionally agnostic.
 */
export const AppLayout = ({
  header,
  menuItems,
  activeMenuValue,
  onMenuItemClick,
  menuMaxWidth,
  contentMaxWidth,
  children,
  bottomSlot,
}: AppLayoutProps) => {
  const visibleItems = menuItems.filter((item) => item.visible !== false);

  return (
    <div
      data-component="AppLayout"
      className="w-screen min-h-[100dvh] md:h-[100dvh] bg-secondary-50 flex flex-col items-center overflow-x-hidden md:overflow-hidden"
    >
      {header}
      <MenuOverflow
        value={activeMenuValue}
        defaultValue=""
        className={`z-10 ${menuMaxWidth ?? 'max-w-[1000px]'}`}
        onValueChange={onMenuItemClick}
      >
        {visibleItems.map((item) => (
          <MenuItem
            key={item.value}
            variant="menu-overflow-col"
            value={item.value}
          >
            {item.icon}
            {item.label}
          </MenuItem>
        ))}
      </MenuOverflow>
      <div className="md:[height:calc(100dvh-120px)] md:overflow-auto w-full">
        <PageContainer innerClassName={contentMaxWidth}>
          {children}
        </PageContainer>
      </div>
      {bottomSlot}
    </div>
  );
};

export default AppLayout;
