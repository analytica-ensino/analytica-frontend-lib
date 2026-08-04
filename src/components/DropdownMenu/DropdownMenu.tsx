import { CaretRightIcon } from '@phosphor-icons/react/dist/csr/CaretRight';
import { SignOutIcon } from '@phosphor-icons/react/dist/csr/SignOut';
import { UserIcon } from '@phosphor-icons/react/dist/csr/User';
import {
  forwardRef,
  ReactNode,
  ButtonHTMLAttributes,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  HTMLAttributes,
  MouseEvent,
  KeyboardEvent,
  isValidElement,
  Children,
  cloneElement,
  ReactElement,
  useState,
  Ref,
  RefObject,
  CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';
import { create, StoreApi, useStore } from 'zustand';
import Button, { ButtonReadingFluency } from '../Button/Button';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';
import readingFluencyBird from '../../assets/img/readingFluencyBird.png';
import Modal from '../Modal/Modal';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import type { ThemeMode } from '@/hooks/useTheme';
import { useTheme } from '../../hooks/useTheme';

interface DropdownStore {
  open: boolean;
  setOpen: (open: boolean) => void;
}

type DropdownStoreApi = StoreApi<DropdownStore>;

export function createDropdownStore(): DropdownStoreApi {
  return create<DropdownStore>((set) => ({
    open: false,
    // Bail out when the value didn't change. Skipping `set` here prevents
    // zustand from creating a new state object, which in turn keeps
    // `useStore(store, (s) => s)` subscribers from re-rendering on no-op
    // syncs (e.g. the `useEffect [propOpen]` controlled-mode bridge).
    setOpen: (open) => set((state) => (state.open === open ? state : { open })),
  }));
}

export const useDropdownStore = (externalStore?: DropdownStoreApi) => {
  if (!externalStore) {
    throw new Error(
      'Component must be used within a DropdownMenu (store is missing)'
    );
  }

  return externalStore;
};

/**
 * Keep the same style object when nothing moved — a fresh object on every
 * scroll event would re-render the menu at 60fps for no reason.
 */
const PORTAL_STYLE_KEYS = [
  'top',
  'bottom',
  'left',
  'right',
  'transform',
  'maxHeight',
] as const;

const isSamePortalStyle = (a: CSSProperties, b: CSSProperties): boolean =>
  PORTAL_STYLE_KEYS.every((key) => a[key] === b[key]);

/** Tallest a portaled menu gets when there is room for it. */
const DEFAULT_PORTAL_MAX_HEIGHT = 320;

/** Breathing room between the menu and the edge of the viewport. */
const VIEWPORT_MARGIN = 8;

/**
 * Never shrink a menu below this, however cramped the trigger is: a 20px-tall
 * scroller is worse than one that overhangs a little.
 */
const MIN_PORTAL_MAX_HEIGHT = 120;

type PortalSide = 'top' | 'right' | 'bottom' | 'left';
type PortalAlign = 'start' | 'center' | 'end';

interface PortalPlacement {
  side: PortalSide;
  align: PortalAlign;
  sideOffset: number;
  maxHeight: number;
}

/**
 * Height cap for a portaled menu, given the room it has.
 *
 * The minimum is a floor on the *viewport-derived* room only — it keeps a menu
 * squeezed against an edge from collapsing into a sliver. A caller that asks
 * for a shorter menu than the minimum still gets what it asked for: its value
 * is the ceiling, never something to be raised.
 *
 * @param available - Room in px between the trigger and the viewport edge
 * @param maxHeight - Tallest the caller allows the menu to be
 * @returns The `max-height` to apply, in px
 */
const clampMenuHeight = (available: number, maxHeight: number): number =>
  Math.min(maxHeight, Math.max(available, MIN_PORTAL_MAX_HEIGHT));

/**
 * Horizontal edge the menu lines up with, for the `top`/`bottom` sides.
 *
 * @param rect - Trigger bounding rect
 * @param align - Requested alignment
 * @returns The horizontal part of the portal style
 */
const alignPortalStyle = (rect: DOMRect, align: PortalAlign): CSSProperties => {
  if (align === 'end') return { right: window.innerWidth - rect.right };
  if (align === 'center') {
    return {
      left: rect.left + rect.width / 2,
      transform: 'translateX(-50%)',
    };
  }
  return { left: rect.left };
};

/**
 * Place a menu above or below its trigger, sized to the room that exists.
 *
 * A portaled menu is `position: fixed`, so whatever falls past the edge of the
 * viewport can never be scrolled to. The menu therefore takes the space it
 * actually has and scrolls inside it, and turns over to the other side when
 * clamping alone would still leave it overhanging.
 *
 * The flip threshold is the minimum height rather than the maximum: turning
 * over as soon as the menu could not open at full height would send it over the
 * content on any trigger past the middle of the screen, which reads as a
 * glitch. `side="top"` always opens above — the caller asked for it.
 *
 * @param rect - Trigger bounding rect
 * @param placement - Requested side/alignment, offset and height ceiling
 * @returns Style for a fixed menu anchored to the trigger's top or bottom edge
 */
const verticalPortalStyle = (
  rect: DOMRect,
  { side, align, sideOffset, maxHeight }: PortalPlacement
): CSSProperties => {
  const spaceBelow =
    window.innerHeight - rect.bottom - sideOffset - VIEWPORT_MARGIN;
  const spaceAbove = rect.top - sideOffset - VIEWPORT_MARGIN;
  const openAbove =
    side === 'top' ||
    (spaceBelow < Math.min(maxHeight, MIN_PORTAL_MAX_HEIGHT) &&
      spaceAbove > spaceBelow);

  return {
    maxHeight: clampMenuHeight(openAbove ? spaceAbove : spaceBelow, maxHeight),
    overflowY: 'auto',
    ...(openAbove
      ? { bottom: window.innerHeight - rect.top + sideOffset }
      : { top: rect.bottom + sideOffset }),
    ...alignPortalStyle(rect, align),
  };
};

/**
 * Place a menu beside its trigger, sized to the room below the trigger's top.
 *
 * Anchored by the edge that faces the trigger: a `left` for `side="left"` would
 * grow the menu back over the trigger it was meant to sit outside of. It runs
 * downwards from the trigger's top, so it needs the same clamping as a menu
 * opening below — without it a long list disappears past the viewport bottom.
 *
 * @param rect - Trigger bounding rect
 * @param placement - Requested side, offset and height ceiling
 * @returns Style for a fixed menu anchored to the trigger's left or right edge
 */
const horizontalPortalStyle = (
  rect: DOMRect,
  { side, sideOffset, maxHeight }: PortalPlacement
): CSSProperties => ({
  top: rect.top,
  maxHeight: clampMenuHeight(
    window.innerHeight - rect.top - VIEWPORT_MARGIN,
    maxHeight
  ),
  overflowY: 'auto',
  ...(side === 'left'
    ? { right: window.innerWidth - rect.left + sideOffset }
    : { left: rect.right + sideOffset }),
});

/**
 * Merge two refs into one. Returns the single ref when only one is set (no
 * callback churn), or `undefined` when neither is — so a cloned child without a
 * ref stays refless.
 */
const mergeRefs = <T,>(
  a: Ref<T> | undefined,
  b: Ref<T> | undefined
): Ref<T> | undefined => {
  if (!a) return b;
  if (!b) return a;
  return (node: T | null) => {
    for (const r of [a, b]) {
      if (typeof r === 'function') r(node);
      else (r as RefObject<T | null>).current = node;
    }
  };
};

const injectStore = (
  children: ReactNode,
  store: DropdownStoreApi
): ReactNode => {
  return Children.map(children, (child) => {
    if (isValidElement(child)) {
      const typedChild = child as ReactElement<{
        store?: DropdownStoreApi;
        children?: ReactNode;
      }>;

      // Aqui tu checa o displayName do componente
      const displayName = (
        typedChild.type as unknown as { displayName: string }
      ).displayName;

      // Lista de componentes que devem receber o store
      const allowed = [
        'DropdownMenuTrigger',
        'DropdownContent',
        'DropdownMenuContent',
        'DropdownMenuSeparator',
        'DropdownMenuItem',
        'MenuLabel',
        'ProfileMenuTrigger',
        'ProfileMenuHeader',
        'ProfileMenuFooter',
        'ProfileToggleTheme',
        'ProfileMenuReadingFluencyTrigger',
        'ProfileMenuReadingFluencyFooter',
      ];

      let newProps: Partial<{
        store: DropdownStoreApi;
        children: ReactNode;
      }> = {};

      if (allowed.includes(displayName)) {
        newProps.store = store;
      }

      if (typedChild.props.children) {
        newProps.children = injectStore(typedChild.props.children, store);
      }

      return cloneElement(typedChild, newProps);
    }

    return child;
  });
};

interface DropdownMenuProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DropdownMenu = ({
  children,
  open: propOpen,
  onOpenChange,
}: DropdownMenuProps) => {
  const storeRef = useRef<DropdownStoreApi | null>(null);
  storeRef.current ??= createDropdownStore();
  const store = storeRef.current;
  const { open, setOpen: storeSetOpen } = useStore(store, (s) => s);

  const setOpen = (newOpen: boolean) => {
    storeSetOpen(newOpen);
  };

  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleArrowDownOrArrowUp = (event: globalThis.KeyboardEvent) => {
    // A portaled content lives in document.body, outside menuRef — look it up
    // globally in that case. Only the open menu carries data-open="true"
    // (a closing one keeps rendering for the 200ms fade-out).
    const menuContent =
      menuRef.current?.querySelector('[role="menu"]') ??
      document.querySelector(
        '[data-dropdown-content="true"][data-open="true"]'
      );
    if (menuContent) {
      event.preventDefault();

      const items = Array.from(
        menuContent.querySelectorAll(
          '[role="menuitem"]:not([aria-disabled="true"])'
        )
      ).filter((el): el is HTMLElement => el instanceof HTMLElement);

      if (items.length === 0) return;

      const focusedItem = document.activeElement as HTMLElement;
      const currentIndex = items.indexOf(focusedItem);

      let nextIndex;
      if (event.key === 'ArrowDown') {
        nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % items.length;
      } else {
        // ArrowUp
        nextIndex =
          currentIndex === -1
            ? items.length - 1
            : (currentIndex - 1 + items.length) % items.length;
      }

      items[nextIndex]?.focus();
    }
  };

  const handleDownkey = (event: globalThis.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setOpen(false);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      handleArrowDownOrArrowUp(event);
    }
  };

  const handleClickOutside = (event: Event) => {
    const target = event.target as Node;

    if (menuRef.current?.contains(target)) {
      return;
    }

    if (
      target instanceof Element &&
      target.closest('[data-dropdown-content="true"]')
    ) {
      return;
    }

    setOpen(false);
  };

  useEffect(() => {
    if (open) {
      document.addEventListener('pointerdown', handleClickOutside);
      document.addEventListener('keydown', handleDownkey);
    }

    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleDownkey);
    };
  }, [open]);

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (propOpen !== undefined) {
      setOpen(propOpen);
    }
  }, [propOpen]);

  return (
    <div className="relative" ref={menuRef}>
      {injectStore(children, store)}
    </div>
  );
};

// Componentes genéricos do DropdownMenu
const DropdownMenuTrigger = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    disabled?: boolean;
    store?: DropdownStoreApi;
    /**
     * Render the single child as the trigger instead of wrapping it in a
     * `<button>`. Use when the child is itself a button/interactive element, so
     * the trigger doesn't nest one button inside another (invalid HTML). The
     * child keeps its own props; the toggle behaviour and `aria-expanded` are
     * merged in.
     */
    asChild?: boolean;
  }
>(
  (
    { className, children, onClick, store: externalStore, asChild, ...props },
    ref
  ) => {
    const store = useDropdownStore(externalStore);

    const open = useStore(store, (s) => s.open);
    const toggleOpen = () => store.setState({ open: !open });

    const handleTriggerClick = (e: MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      toggleOpen();
      onClick?.(e as MouseEvent<HTMLButtonElement>);
    };

    // `injectStore` re-wraps children through Children.map, so `children` may be
    // a single-element array rather than a bare element — unwrap it here.
    const asChildElement = asChild
      ? (Children.toArray(children).find(isValidElement) as
          | ReactElement<{
              className?: string;
              onClick?: (e: MouseEvent<HTMLElement>) => void;
              ref?: Ref<HTMLElement>;
            }>
          | undefined)
      : undefined;

    if (asChildElement) {
      const child = asChildElement;
      return cloneElement(child, {
        ...props,
        ref: mergeRefs(ref, child.props.ref),
        className: cn(child.props.className, className),
        'aria-expanded': open,
        onClick: (e: MouseEvent<HTMLElement>) => {
          // Keep the child's own handler, then run the trigger's toggle — same
          // order as the previous nested-button version.
          child.props.onClick?.(e);
          handleTriggerClick(e);
        },
      } as Partial<HTMLAttributes<HTMLElement>> & { store?: DropdownStoreApi });
    }

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleTriggerClick}
        aria-expanded={open}
        className={cn(
          'appearance-none bg-transparent border-none p-0',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

const ITEM_SIZE_CLASSES = {
  small: 'text-sm',
  medium: 'text-md',
} as const;

const SIDE_CLASSES = {
  top: 'bottom-full',
  right: 'top-full',
  bottom: 'top-full',
  left: 'top-full',
};

const ALIGN_CLASSES = {
  start: 'left-0',
  center: 'left-1/2 -translate-x-1/2',
  end: 'right-0',
};

// O "chrome" do card (bg/borda/rounded/shadow) fica por variante para que a
// variante `papole` possa ter o seu próprio (fundo secondary-500, sem borda,
// sombra das vars --sds-* do Figma traduzidas: 0 8px 8px -2px, preto 10% + 20%).
// `menu`/`profile` mantêm exatamente o visual de antes.
const MENUCONTENT_VARIANT_CLASSES = {
  menu: 'bg-background rounded-md border bg-popover text-popover-foreground shadow-md border-border-100 p-1',
  profile:
    'bg-background rounded-md border bg-popover text-popover-foreground shadow-md border-border-100 p-6',
  papole:
    'flex flex-col gap-4 bg-secondary-500 rounded-[20px] pt-6 px-6 pb-8 [box-shadow:0px_8px_8px_-2px_#0000001a,0px_8px_8px_-2px_#00000033]',
};

const MenuLabel = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    inset?: boolean;
    store?: DropdownStoreApi;
  }
>(({ className, inset, store: _store, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('text-sm w-full', inset ? 'pl-8' : '', className)}
      {...props}
    />
  );
});
MenuLabel.displayName = 'MenuLabel';

const DropdownMenuContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    align?: 'start' | 'center' | 'end';
    side?: 'top' | 'right' | 'bottom' | 'left';
    variant?: 'menu' | 'profile' | 'papole';
    sideOffset?: number;
    store?: DropdownStoreApi;
    portal?: boolean;
    triggerRef?: RefObject<HTMLElement | null>;
    /**
     * Tallest the menu gets, in px, when the viewport allows it. Portaled menus
     * only — it is capped by the space actually available around the trigger.
     */
    maxHeight?: number;
  }
>(
  (
    {
      className,
      align = 'start',
      side = 'bottom',
      variant = 'menu',
      sideOffset = 4,
      children,
      store: externalStore,
      portal = false,
      triggerRef,
      maxHeight = DEFAULT_PORTAL_MAX_HEIGHT,
      ...props
    },
    ref
  ) => {
    const store = useDropdownStore(externalStore);
    const open = useStore(store, (s) => s.open);
    const [isVisible, setIsVisible] = useState(open);
    const [portalStyle, setPortalStyle] = useState<CSSProperties>({});
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (open) {
        setIsVisible(true);
      } else {
        const timer = setTimeout(() => setIsVisible(false), 200);
        return () => clearTimeout(timer);
      }
    }, [open]);

    const updatePortalPosition = useCallback(() => {
      if (!portal || !triggerRef?.current) return;

      const rect = triggerRef.current.getBoundingClientRect();
      const placement = { side, align, sideOffset, maxHeight };
      const style =
        side === 'left' || side === 'right'
          ? horizontalPortalStyle(rect, placement)
          : verticalPortalStyle(rect, placement);

      setPortalStyle((prev) => (isSamePortalStyle(prev, style) ? prev : style));
    }, [portal, triggerRef, align, side, sideOffset, maxHeight]);

    useLayoutEffect(() => {
      if (open) updatePortalPosition();
    }, [open, updatePortalPosition]);

    // A portaled menu is position:fixed, so it doesn't follow the trigger when
    // an ancestor scrolls. Tables wrap their body in `overflow-x-auto`, so a
    // menu anchored to a column header would drift away from its <th> on any
    // horizontal scroll. Capture-phase catches scrolls on any ancestor, not
    // just the window.
    useEffect(() => {
      if (!portal || !open) return;

      const reposition = () => updatePortalPosition();
      window.addEventListener('scroll', reposition, true);
      window.addEventListener('resize', reposition);

      return () => {
        window.removeEventListener('scroll', reposition, true);
        window.removeEventListener('resize', reposition);
      };
    }, [portal, open, updatePortalPosition]);

    if (!isVisible) return null;

    const getPositionClasses = () => {
      if (portal) {
        return 'fixed';
      }
      const vertical = SIDE_CLASSES[side];
      const horizontal = ALIGN_CLASSES[align];

      return `absolute ${vertical} ${horizontal}`;
    };

    const variantClasses = MENUCONTENT_VARIANT_CLASSES[variant];

    const content = (
      <div
        ref={portal ? contentRef : ref}
        role="menu"
        data-dropdown-content="true"
        data-open={open}
        className={`
        z-50 min-w-[210px] overflow-hidden
        ${open ? 'animate-in fade-in-0 zoom-in-95' : 'animate-out fade-out-0 zoom-out-95'}
        ${getPositionClasses()}
        ${variantClasses}
        ${className}
      `}
        style={{
          ...(portal
            ? portalStyle
            : {
                marginTop: side === 'bottom' ? sideOffset : undefined,
                marginBottom: side === 'top' ? sideOffset : undefined,
                marginLeft: side === 'right' ? sideOffset : undefined,
                marginRight: side === 'left' ? sideOffset : undefined,
              }),
        }}
        {...props}
      >
        {children}
      </div>
    );

    if (portal && typeof document !== 'undefined') {
      return createPortal(content, document.body);
    }

    return content;
  }
);
DropdownMenuContent.displayName = 'DropdownMenuContent';

const DropdownMenuItem = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    inset?: boolean;
    size?: 'small' | 'medium';
    iconLeft?: ReactNode;
    iconRight?: ReactNode;
    disabled?: boolean;
    variant?: 'profile' | 'menu';
    store?: DropdownStoreApi;
    preventClose?: boolean;
  }
>(
  (
    {
      className,
      size = 'small',
      children,
      iconRight,
      iconLeft,
      disabled = false,
      onClick,
      variant = 'menu',
      store: externalStore,
      preventClose = false,
      ...props
    },
    ref
  ) => {
    const store = useDropdownStore(externalStore);
    const setOpen = useStore(store, (s) => s.setOpen);
    const sizeClasses = ITEM_SIZE_CLASSES[size];

    const handleClick = (
      e: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>
    ) => {
      if (disabled) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (e.type === 'click') {
        onClick?.(e as MouseEvent<HTMLDivElement>);
      } else if (e.type === 'keydown') {
        // For keyboard events, trigger click if Enter or Space was pressed
        const keyEvent = e as KeyboardEvent<HTMLDivElement>;
        if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
          (e.currentTarget as HTMLElement).click();
        }
        // honor any user-provided key handler
        props.onKeyDown?.(keyEvent);
      }
      if (!preventClose) {
        setOpen(false);
      }
    };

    const getVariantClasses = () => {
      if (variant === 'profile') {
        return 'relative flex flex-row justify-between select-none items-center gap-2 rounded-sm p-4 text-sm outline-none transition-colors [&>svg]:size-6 [&>svg]:shrink-0';
      }
      return 'relative flex select-none items-center gap-2 rounded-sm p-3 text-sm outline-none transition-colors [&>svg]:size-4 [&>svg]:shrink-0';
    };

    const getVariantProps = () => {
      return variant === 'profile' ? { 'data-variant': 'profile' } : {};
    };

    return (
      <div
        ref={ref}
        role="menuitem"
        {...getVariantProps()}
        aria-disabled={disabled}
        className={`
          focus-visible:bg-background-50
           ${getVariantClasses()}
          ${sizeClasses}
          ${className}
          ${
            disabled
              ? 'cursor-not-allowed text-text-400'
              : 'cursor-pointer hover:bg-background-50 text-text-700 focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground'
          }
        `}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            handleClick(e);
          }
        }}
        tabIndex={disabled ? -1 : 0}
        {...props}
      >
        {iconLeft}
        <div className="w-full">{children}</div>
        {iconRight}
      </div>
    );
  }
);
DropdownMenuItem.displayName = 'DropdownMenuItem';

const DropdownMenuSeparator = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { store?: DropdownStoreApi }
>(({ className, store: _store, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('my-1 h-px bg-border-200', className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

// Componentes específicos do ProfileMenu
const ProfileMenuTrigger = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { store?: DropdownStoreApi }
>(({ className, onClick, store: externalStore, ...props }, ref) => {
  const store = useDropdownStore(externalStore);
  const open = useStore(store, (s) => s.open);
  const toggleOpen = () => store.setState({ open: !open });

  return (
    <button
      ref={ref}
      className={cn(
        'rounded-lg size-10 bg-primary-50 flex items-center justify-center cursor-pointer',
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        toggleOpen();
        onClick?.(e);
      }}
      aria-expanded={open}
      {...props}
    >
      <span className="size-6 rounded-full bg-primary-100 flex items-center justify-center">
        <UserIcon className="text-primary-950" size={18} />
      </span>
    </button>
  );
});
ProfileMenuTrigger.displayName = 'ProfileMenuTrigger';

const ProfileMenuHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    name: string;
    email: string;
    photoUrl?: string | null;
    store?: DropdownStoreApi;
  }
>(({ className, name, email, photoUrl, store: _store, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-component="ProfileMenuHeader"
      className={cn(
        'flex flex-row gap-4 items-center min-w-[280px]',
        className
      )}
      {...props}
    >
      <span className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="Foto de perfil"
            className="w-full h-full object-cover"
          />
        ) : (
          <UserIcon size={34} className="text-primary-800" />
        )}
      </span>
      <div className="flex flex-col min-w-0">
        <Text
          size="xl"
          weight="bold"
          color="text-text-950"
          className="truncate"
        >
          {name}
        </Text>
        <Text size="md" color="text-text-600" className="truncate">
          {email}
        </Text>
      </div>
    </div>
  );
});
ProfileMenuHeader.displayName = 'ProfileMenuHeader';

const ProfileMenuInfo = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    schoolName: string;
    classYearName: string;
    schoolYearName: string;
    store?: DropdownStoreApi;
  }
>(
  (
    {
      className,
      schoolName,
      classYearName,
      schoolYearName,
      store: _store,
      ...props
    },
    ref
  ) => {
    if (!schoolName && !classYearName && !schoolYearName) {
      return null;
    }

    return (
      <div
        ref={ref}
        data-component="ProfileMenuInfo"
        className={cn('flex flex-row gap-4 items-center', className)}
        {...props}
      >
        <span className="w-16 h-16" />
        <div className="flex flex-col ">
          {schoolName && (
            <Text size="md" color="text-text-600">
              {schoolName}
            </Text>
          )}

          {(classYearName || schoolYearName) && (
            <span className="flex flex-row items-center gap-2">
              {classYearName && (
                <Text size="md" color="text-text-600">
                  {classYearName}
                </Text>
              )}
              {classYearName && schoolYearName && (
                <Text size="md" color="text-text-600">
                  ●
                </Text>
              )}
              {schoolYearName && (
                <Text size="md" color="text-text-600">
                  {schoolYearName}
                </Text>
              )}
            </span>
          )}
        </div>
      </div>
    );
  }
);
ProfileMenuInfo.displayName = 'ProfileMenuInfo';

const ProfileToggleTheme = ({
  store: externalStore,
  ...props
}: HTMLAttributes<HTMLDivElement> & { store?: DropdownStoreApi }) => {
  const { themeMode, setTheme, isThemeLocked } = useTheme();
  const [modalThemeToggle, setModalThemeToggle] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>(themeMode);

  const internalStoreRef = useRef<DropdownStoreApi | null>(null);
  internalStoreRef.current ??= createDropdownStore();
  const store = externalStore ?? internalStoreRef.current;
  const setOpen = useStore(store, (s) => s.setOpen);

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setModalThemeToggle(true);
  };

  const handleSave = () => {
    setTheme(selectedTheme);
    setModalThemeToggle(false);
    setOpen(false); // Close dropdown after saving
  };

  const handleCancel = () => {
    setSelectedTheme(themeMode); // Reset to current theme
    setModalThemeToggle(false);
    setOpen(false); // Close dropdown after canceling
  };

  // Tema travado pelo produto (ex.: Fluência Leitora): esconde a entrada do
  // menu inteira. Deixá-la visível daria um modal que salva e não muda nada.
  if (isThemeLocked) return null;

  return (
    <>
      <DropdownMenuItem
        variant="profile"
        preventClose={true}
        store={store}
        iconLeft={
          <svg
            width="24"
            height="24"
            viewBox="0 0 25 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.5 2.75C15.085 2.75276 17.5637 3.78054 19.3916 5.6084C21.2195 7.43628 22.2473 9.915 22.25 12.5C22.25 14.4284 21.6778 16.3136 20.6064 17.917C19.5352 19.5201 18.0128 20.7699 16.2314 21.5078C14.4499 22.2458 12.489 22.4387 10.5977 22.0625C8.70642 21.6863 6.96899 20.758 5.60547 19.3945C4.24197 18.031 3.31374 16.2936 2.9375 14.4023C2.56129 12.511 2.75423 10.5501 3.49219 8.76855C4.23012 6.98718 5.47982 5.46483 7.08301 4.39355C8.68639 3.32221 10.5716 2.75 12.5 2.75ZM11.75 4.28516C9.70145 4.47452 7.7973 5.42115 6.41016 6.94043C5.02299 8.4599 4.25247 10.4426 4.25 12.5C4.25247 14.5574 5.02299 16.5401 6.41016 18.0596C7.7973 19.5789 9.70145 20.5255 11.75 20.7148V4.28516Z"
              fill="currentColor"
            />
          </svg>
        }
        iconRight={<CaretRightIcon />}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            setModalThemeToggle(true);
          }
        }}
        {...props}
      >
        <Text size="md" color="text-text-700">
          Aparência
        </Text>
      </DropdownMenuItem>

      <Modal
        isOpen={modalThemeToggle}
        onClose={handleCancel}
        title="Aparência"
        size="md"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button variant="solid" onClick={handleSave}>
              Salvar
            </Button>
          </div>
        }
      >
        <div className="flex flex-col">
          <p className="text-sm text-text-500">Escolha o tema:</p>
          <ThemeToggle variant="with-save" onToggle={setSelectedTheme} />
        </div>
      </Modal>
    </>
  );
};
ProfileToggleTheme.displayName = 'ProfileToggleTheme';

const ProfileMenuSection = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { store?: DropdownStoreApi }
>(({ className, children, store: _store, ...props }, ref) => {
  return (
    <div ref={ref} className={cn('flex flex-col p-2', className)} {...props}>
      {children}
    </div>
  );
});
ProfileMenuSection.displayName = 'ProfileMenuSection';

const ProfileMenuFooter = ({
  className,
  disabled = false,
  onClick,
  store: externalStore,
  ...props
}: HTMLAttributes<HTMLButtonElement> & {
  disabled?: boolean;
  store?: DropdownStoreApi;
}) => {
  const store = useDropdownStore(externalStore);
  const setOpen = useStore(store, (s) => s.setOpen);

  return (
    <Button
      variant="outline"
      className={cn('w-full', className)}
      disabled={disabled}
      onClick={(e) => {
        setOpen(false);
        onClick?.(e);
      }}
      {...props}
    >
      <span className="mr-2 flex items-center">
        <SignOutIcon className="text-inherit" />
      </span>
      <Text color="inherit">Sair</Text>
    </Button>
  );
};
ProfileMenuFooter.displayName = 'ProfileMenuFooter';

// ======================================================================
// Componentes do ProfileMenu Reading Fluency (usados com variant="papole")
// ======================================================================

// Trigger de perfil Reading Fluency: ícone circular de 42px. Mostra a foto do usuário
// (`photoUrl`) e cai no passarinho quando não houver.
const ProfileMenuReadingFluencyTrigger = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    photoUrl?: string | null;
    store?: DropdownStoreApi;
  }
>(({ className, onClick, photoUrl, store: externalStore, ...props }, ref) => {
  const store = useDropdownStore(externalStore);
  const open = useStore(store, (s) => s.open);
  const toggleOpen = () => store.setState({ open: !open });

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'size-[42px] rounded-full overflow-hidden cursor-pointer bg-secondary-600 flex items-center justify-center',
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        toggleOpen();
        onClick?.(e);
      }}
      aria-expanded={open}
      aria-label="Abrir menu de perfil"
      {...props}
    >
      <img
        src={photoUrl ?? readingFluencyBird}
        alt="Foto de perfil"
        className="w-full h-full object-cover"
      />
    </button>
  );
});
ProfileMenuReadingFluencyTrigger.displayName =
  'ProfileMenuReadingFluencyTrigger';

// Card de informações do aluno (fundo secondary-600). Dois blocos texto1/texto2:
// nome/email (sempre) e escola/turma (quando houver).
const ProfileMenuReadingFluencyInfo = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    name: string;
    email: string;
    schoolName?: string;
    classYearName?: string;
    schoolYearName?: string;
    store?: DropdownStoreApi;
  }
>(
  (
    {
      className,
      name,
      email,
      schoolName,
      classYearName,
      schoolYearName,
      store: _store,
      ...props
    },
    ref
  ) => {
    const hasSchoolBlock = !!(schoolName || classYearName || schoolYearName);

    return (
      <div
        ref={ref}
        data-component="ProfileMenuReadingFluencyInfo"
        className={cn(
          'font-quicksand flex flex-col gap-4 rounded-[20px] bg-secondary-600 p-4',
          className
        )}
        {...props}
      >
        <div className="flex flex-col">
          <Text size="md" className="font-bold text-text-100 truncate">
            {name}
          </Text>
          <Text size="sm" className="font-medium text-secondary-300 truncate">
            {email}
          </Text>
        </div>

        {hasSchoolBlock && (
          <div className="flex flex-col">
            {schoolName && (
              <Text size="md" className="font-bold text-text-100 truncate">
                {schoolName}
              </Text>
            )}
            {(classYearName || schoolYearName) && (
              <Text
                size="sm"
                className="font-medium text-secondary-300 truncate"
              >
                {[classYearName, schoolYearName].filter(Boolean).join(' • ')}
              </Text>
            )}
          </div>
        )}
      </div>
    );
  }
);
ProfileMenuReadingFluencyInfo.displayName = 'ProfileMenuReadingFluencyInfo';

// Rodapé Reading Fluency: botão "Sair" (ButtonReadingFluency outline md). Fecha o menu e repassa
// o onClick (logout).
const ProfileMenuReadingFluencyFooter = ({
  className,
  disabled = false,
  onClick,
  store: externalStore,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  disabled?: boolean;
  store?: DropdownStoreApi;
}) => {
  const store = useDropdownStore(externalStore);
  const setOpen = useStore(store, (s) => s.setOpen);

  return (
    <ButtonReadingFluency
      variant="outline-inverse"
      size="medium"
      className={cn('w-full', className)}
      disabled={disabled}
      onClick={(e) => {
        setOpen(false);
        onClick?.(e);
      }}
      {...props}
    >
      Sair
    </ButtonReadingFluency>
  );
};
ProfileMenuReadingFluencyFooter.displayName = 'ProfileMenuReadingFluencyFooter';

// Exportações
export default DropdownMenu;
export {
  // Componentes genéricos
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  MenuLabel,
  DropdownMenuSeparator,

  // Componentes específicos do ProfileMenu
  ProfileMenuTrigger,
  ProfileMenuHeader,
  ProfileMenuSection,
  ProfileMenuFooter,
  ProfileToggleTheme,
  ProfileMenuInfo,

  // Componentes do ProfileMenu Reading Fluency
  ProfileMenuReadingFluencyTrigger,
  ProfileMenuReadingFluencyInfo,
  ProfileMenuReadingFluencyFooter,
};
