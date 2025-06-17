'use client';

import { SignOut, User } from 'phosphor-react';
import {
  createContext,
  useState,
  useCallback,
  useContext,
  forwardRef,
  ReactNode,
  ButtonHTMLAttributes,
  useEffect,
  useRef,
  HTMLAttributes,
  MouseEvent,
  KeyboardEvent,
  useMemo,
} from 'react';
import Button from '../Button/Button';

type DropdownMenuContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DropdownMenuContext = createContext<DropdownMenuContextType | undefined>(
  undefined
);

interface DropdownMenuProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DropdownProfileMenu = ({
  children,
  open,
  onOpenChange,
}: DropdownMenuProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const currentOpen = isControlled ? open : internalOpen;

  const setOpen = useCallback(
    (newOpen: boolean) => {
      if (onOpenChange) onOpenChange(newOpen);
      if (!isControlled) setInternalOpen(newOpen);
    },
    [isControlled, onOpenChange]
  );

  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleArrowDownOrArrowUp = (event: globalThis.KeyboardEvent) => {
    const menuContent = menuRef.current?.querySelector('[role="menu"]');
    if (menuContent) {
      event.preventDefault();

      const items = Array.from(
        menuContent.querySelectorAll(
          '[role="menu-profile-settings-itens"]:not([aria-disabled="true"])'
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
    if (currentOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleDownkey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleDownkey);
    };
  }, [currentOpen]);

  const value = useMemo(
    () => ({ open: currentOpen, setOpen }),
    [currentOpen, setOpen]
  );
  return (
    <DropdownMenuContext.Provider value={value}>
      <div className="relative" ref={menuRef}>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
};

const ProfileMenuTrigger = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
  const context = useContext(DropdownMenuContext);
  if (!context)
    throw new Error(
      'DropdownMenuTrigger must be used within a DropdownProfileMenu'
    );

  const { open, setOpen } = context;

  return (
    <button
      ref={ref}
      className={`rounded-lg size-10 bg-exam-1 flex items-center justify-center ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        setOpen(!open);
        if (onClick) onClick(e);
      }}
      aria-expanded={open}
      {...props}
    >
      <span className="size-6 rounded-full bg-[#BBDCF7] flex items-center justify-center">
        <User className="text-[#124393]" size={18} />
      </span>
    </button>
  );
});
ProfileMenuTrigger.displayName = 'ProfileMenuTrigger';

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

const ProfileMenuContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    align?: 'start' | 'center' | 'end';
    side?: 'top' | 'right' | 'bottom' | 'left';
    sideOffset?: number;
  }
>(
  (
    {
      className,
      align = 'start',
      side = 'bottom',
      sideOffset = 4,
      children,
      ...props
    },
    ref
  ) => {
    const { open } = useContext(DropdownMenuContext)!;
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

    return (
      <div
        ref={ref}
        role="menu"
        className={`
        bg-background z-50 min-w-[320px] overflow-hidden rounded-md border bg-popover py-6 px-6 text-popover-foreground shadow-md border-border-100
        ${open ? 'animate-in fade-in-0 zoom-in-95' : 'animate-out fade-out-0 zoom-out-95'}
        ${getPositionClasses()}
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

ProfileMenuContent.displayName = 'ProfileMenuContent';

const ProfileMenuHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    name: string;
    email: string;
  }
>(({ className, name, email, ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="ProfileMenuHeader"
      className={`
          flex flex-row gap-4 items-center
          ${className}
        `}
      {...props}
    >
      <span className="size-16 bg-[#BBDCF7] rounded-full flex items-center justify-center">
        <User size={34} className="text-[#124393]" />
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
  HTMLAttributes<HTMLDivElement> & {}
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="ProfileMenuHeader"
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

const ProfileMenuItem = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    inset?: boolean;
    size?: 'small' | 'medium';
    iconLeft?: ReactNode;
    iconRight?: ReactNode;
    disabled?: boolean;
  }
>(
  (
    {
      className,
      inset,
      size = 'small',
      children,
      iconRight,
      iconLeft,
      disabled = false,
      onClick,
      ...props
    },
    ref
  ) => {
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
    };

    return (
      <div
        ref={ref}
        role="menu-profile-settings-itens"
        aria-disabled={disabled}
        className={`
          focus-visible:bg-background-50
          relative flex flex-row justify-between select-none items-center gap-2 rounded-sm p-3 text-sm outline-none transition-colors [&>svg]:size-6 [&>svg]:shrink-0
          ${inset && 'pl-8'}
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
        {children}
        {iconRight}
      </div>
    );
  }
);
ProfileMenuItem.displayName = 'ProfileMenuItem';

const ProfileMenuFooter = forwardRef<
  HTMLButtonElement,
  HTMLAttributes<HTMLButtonElement> & {
    disabled?: boolean;
  }
>(({ className, disabled = false, onClick, ...props }) => {
  return (
    <Button
      iconLeft={<SignOut />}
      className={`w-full ${className}`}
      variant="outline"
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      Sair
    </Button>
  );
});
ProfileMenuFooter.displayName = 'ProfileMenuFooter';

const ProfileMenuSeparator = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`my-1 h-px bg-border-200 ${className}`}
    {...props}
  />
));
ProfileMenuSeparator.displayName = 'ProfileMenuSeparator';

export default DropdownProfileMenu;
export {
  ProfileMenuTrigger,
  ProfileMenuContent,
  ProfileMenuSeparator,
  ProfileMenuHeader,
  ProfileMenuSection,
  ProfileMenuItem,
  ProfileMenuFooter,
};
