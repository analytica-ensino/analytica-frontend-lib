import { CaretRight, SignOut, User } from 'phosphor-react';
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
import Text from '../Text/Text';
import { cn } from '../../utils/utils';
import Modal from '../Modal/Modal';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import type { ThemeMode } from '@/hooks/useTheme';
import { useTheme } from '@/hooks/useTheme';

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
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleDownkey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleDownkey);
    };
  }, [open]);

  useEffect(() => {
    setOpen(open);
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (propOpen) {
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
const DropdownMenuTrigger = ({
  className,
  children,
  onClick,
  store: externalStore,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  disabled?: boolean;
  store?: DropdownStoreApi;
}) => {
  const store = useDropdownStore(externalStore);

  const open = useStore(store, (s) => s.open);
  const toggleOpen = () => store.setState({ open: !open });

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleOpen();
        if (onClick) onClick(e);
      }}
      aria-expanded={open}
      className={cn(className)}
      {...props}
    >
      {children}
    </button>
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
        <User className="text-primary-950" size={18} />
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
      className={cn('flex flex-row gap-4 items-center', className)}
      {...props}
    >
      <span className="size-16 bg-primary-100 rounded-full flex items-center justify-center">
        <User size={34} className="text-primary-950" />
      </span>
      <div className="flex flex-col ">
        <Text size="xl" weight="bold" color="text-text-950">
          {name}
        </Text>
        <Text size="md" color="text-text-600">
          {email}
        </Text>
      </div>
    </div>
  );
});
ProfileMenuHeader.displayName = 'ProfileMenuHeader';

const ProfileToggleTheme = ({ ...props }: HTMLAttributes<HTMLDivElement>) => {
  const { themeMode, setTheme } = useTheme();
  const [modalThemeToggle, setModalThemeToggle] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>(themeMode);

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setModalThemeToggle(true);
  };

  const handleSave = () => {
    setTheme(selectedTheme);
    setModalThemeToggle(false);
  };

  return (
    <>
      <div
        role="menuitem"
        data-variant="profile"
        className="relative flex flex-row justify-between select-none items-center gap-2 rounded-sm p-4 text-sm outline-none transition-colors [&>svg]:size-6 [&>svg]:shrink-0 cursor-pointer hover:bg-background-50 text-text-700 focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground"
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            setModalThemeToggle(true);
          }
        }}
        tabIndex={0}
        {...props}
      >
        <svg
          width="25"
          height="25"
          viewBox="0 0 25 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.5 2.75C15.085 2.75276 17.5637 3.78054 19.3916 5.6084C21.2195 7.43628 22.2473 9.915 22.25 12.5C22.25 14.4284 21.6778 16.3136 20.6064 17.917C19.5352 19.5201 18.0128 20.7699 16.2314 21.5078C14.4499 22.2458 12.489 22.4387 10.5977 22.0625C8.70642 21.6863 6.96899 20.758 5.60547 19.3945C4.24197 18.031 3.31374 16.2936 2.9375 14.4023C2.56129 12.511 2.75423 10.5501 3.49219 8.76855C4.23012 6.98718 5.47982 5.46483 7.08301 4.39355C8.68639 3.32221 10.5716 2.75 12.5 2.75ZM11.75 4.28516C9.70145 4.47452 7.7973 5.42115 6.41016 6.94043C5.02299 8.4599 4.25247 10.4426 4.25 12.5C4.25247 14.5574 5.02299 16.5401 6.41016 18.0596C7.7973 19.5789 9.70145 20.5255 11.75 20.7148V4.28516Z"
            fill="#525252"
          />
        </svg>
        <Text className="w-full" size="md">
          Aparência
        </Text>
        <CaretRight />
      </div>

      <Modal
        isOpen={modalThemeToggle}
        onClose={() => setModalThemeToggle(false)}
        title="Aparência"
        size="md"
        footer={
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setModalThemeToggle(false)}
            >
              Cancelar
            </Button>
            <Button variant="solid" onClick={() => handleSave()}>
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
        <SignOut />
      </span>
      <Text>Sair</Text>
    </Button>
  );
};
ProfileMenuFooter.displayName = 'ProfileMenuFooter';

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
};
