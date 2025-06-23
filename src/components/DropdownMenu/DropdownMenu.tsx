import { SignOut, User } from 'phosphor-react';
import {
  forwardRef,
  ReactNode,
  ButtonHTMLAttributes,
  useEffect,
  useRef,
  HTMLAttributes,
  MouseEvent,
  KeyboardEvent,
  isValidElement,
  Children,
  cloneElement,
  ReactElement,
  useState,
} from 'react';
import { create, StoreApi, useStore } from 'zustand';
import Button from '../Button/Button';

interface DropdownStore {
  open: boolean;
  setOpen: (open: boolean) => void;
}

type DropdownStoreApi = StoreApi<DropdownStore>;

export function createDropdownStore(): DropdownStoreApi {
  return create<DropdownStore>((set) => ({
    open: false,
    setOpen: (open) => set({ open }),
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

      const newProps: Partial<{
        store: DropdownStoreApi;
        children: ReactNode;
      }> = {
        store,
      };

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

const DropdownMenu = ({ children, open, onOpenChange }: DropdownMenuProps) => {
  const storeRef = useRef<DropdownStoreApi | null>(null);
  storeRef.current ??= createDropdownStore();
  const store = storeRef.current;
  const isControlled = open !== undefined;
  const uncontrolledOpen = useStore(store, (s) => s.open);
  const currentOpen = isControlled ? open : uncontrolledOpen;

  const setOpen = (newOpen: boolean) => {
    onOpenChange?.(newOpen);
    if (!isControlled) store.setState({ open: newOpen });
  };

  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleArrowDownOrArrowUp = (event: globalThis.KeyboardEvent) => {
    const menuContent = menuRef.current?.querySelector('[role="menu"]');
    if (menuContent) {
      event.preventDefault();

      const items = Array.from(
        menuContent.querySelectorAll(
          '[role="menuitem"]:not([aria-disabled="true"])'
        )
      ).filter((el): el is HTMLElement => el instanceof HTMLElement);

      if (items.length === 0) return;

      const focusedItem = document.activeElement as HTMLElement;
      const currentIndex = items.findIndex((item) => item === focusedItem);

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

  const handleClickOutside = (event: globalThis.MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    onOpenChange?.(currentOpen);
    if (currentOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleDownkey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleDownkey);
    };
  }, [currentOpen]);

  useEffect(() => {
    if (isControlled) {
      store.setState({ open: open });
    }
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {injectStore(children, store)}
    </div>
  );
};

// Componentes genéricos do DropdownMenu
const DropdownMenuTrigger = ({
  className,
  children,
  onClick,
  store: externalStore,
  ...props
}: HTMLAttributes<HTMLButtonElement> & {
  disabled?: boolean;
  store?: DropdownStoreApi;
}) => {
  const store = useDropdownStore(externalStore);

  const open = useStore(store, (s) => s.open);
  const toggleOpen = () => store.setState({ open: !open });

  return (
    <Button
      variant="outline"
      onClick={(e) => {
        e.stopPropagation();
        toggleOpen();
        if (onClick) onClick(e);
      }}
      aria-expanded={open}
      className={`${className}`}
      {...props}
    >
      {children}
    </Button>
  );
};
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

const MENUCONTENT_VARIANT_CLASSES = {
  menu: 'p-1',
  profile: 'p-6',
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
      className={`text-sm w-full ${inset ? 'pl-8' : ''} ${className ?? ''}`}
      {...props}
    />
  );
});
MenuLabel.displayName = 'MenuLabel';

const MenuContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    align?: 'start' | 'center' | 'end';
    side?: 'top' | 'right' | 'bottom' | 'left';
    variant?: 'menu' | 'profile';
    sideOffset?: number;
    store?: DropdownStoreApi;
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
      ...props
    },
    ref
  ) => {
    const store = useDropdownStore(externalStore);
    const open = useStore(store, (s) => s.open);
    const [isVisible, setIsVisible] = useState(open);

    useEffect(() => {
      if (open) {
        setIsVisible(true);
      } else {
        const timer = setTimeout(() => setIsVisible(false), 200);
        return () => clearTimeout(timer);
      }
    }, [open]);

    if (!isVisible) return null;

    const getPositionClasses = () => {
      const vertical = SIDE_CLASSES[side];
      const horizontal = ALIGN_CLASSES[align];

      return `absolute ${vertical} ${horizontal}`;
    };

    const variantClasses = MENUCONTENT_VARIANT_CLASSES[variant];
    return (
      <div
        ref={ref}
        role="menu"
        className={`
        bg-background z-50 min-w-[210px] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md border-border-100
        ${open ? 'animate-in fade-in-0 zoom-in-95' : 'animate-out fade-out-0 zoom-out-95'}
        ${getPositionClasses()}
        ${variantClasses}
        ${className}
      `}
        style={{
          marginTop: side === 'bottom' ? sideOffset : undefined,
          marginBottom: side === 'top' ? sideOffset : undefined,
          marginLeft: side === 'right' ? sideOffset : undefined,
          marginRight: side === 'left' ? sideOffset : undefined,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
MenuContent.displayName = 'MenuContent';

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
      onClick?.(e as MouseEvent<HTMLDivElement>);
      setOpen(false);
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
          if (e.key === 'Enter' || e.key === ' ') handleClick(e);
        }}
        tabIndex={disabled ? -1 : 0}
        {...props}
      >
        {iconLeft}
        <span className="w-full text-md">{children}</span>
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
    className={`my-1 h-px bg-border-200 ${className}`}
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
      className={`rounded-lg size-10 bg-background-50 flex items-center justify-center ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        toggleOpen();
        onClick?.(e);
      }}
      aria-expanded={open}
      {...props}
    >
      <span className="size-6 rounded-full bg-background-100 flex items-center justify-center">
        <User className="text-background-950" size={18} />
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
    store?: DropdownStoreApi;
  }
>(({ className, name, email, store: _store, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-component="ProfileMenuHeader"
      className={`
          flex flex-row gap-4 items-center
          ${className}
        `}
      {...props}
    >
      <span className="size-16 bg-background-100 rounded-full flex items-center justify-center">
        <User size={34} className="text-background-950" />
      </span>
      <div className="flex flex-col ">
        <p className="text-xl font-bold text-text-950">{name}</p>
        <p className="text-md text-text-600">{email}</p>
      </div>
    </div>
  );
});
ProfileMenuHeader.displayName = 'ProfileMenuHeader';

const ProfileMenuSection = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { store?: DropdownStoreApi }
>(({ className, children, store: _store, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`
          flex flex-col p-2
          ${className}
        `}
      {...props}
    >
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
      className={`w-full ${className}`}
      disabled={disabled}
      onClick={(e) => {
        setOpen(false);
        onClick?.(e);
      }}
      {...props}
    >
      <span className="mr-2 flex items-center">
        <SignOut />
      </span>
      <span>Sair</span>
    </Button>
  );
};
ProfileMenuFooter.displayName = 'ProfileMenuFooter';

// Exportações
export default DropdownMenu;
export {
  // Componentes genéricos
  DropdownMenuTrigger,
  MenuContent,
  DropdownMenuItem,
  MenuLabel,
  DropdownMenuSeparator,

  // Componentes específicos do ProfileMenu
  ProfileMenuTrigger,
  ProfileMenuHeader,
  ProfileMenuSection,
  ProfileMenuFooter,
};
