'use client';

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

const DropdownMenu = ({ children, open, onOpenChange }: DropdownMenuProps) => {
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

const DropdownMenuTrigger = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, onClick, ...props }, ref) => {
  const context = useContext(DropdownMenuContext);
  if (!context)
    throw new Error('DropdownMenuTrigger must be used within a DropdownMenu');

  const { open, setOpen } = context;

  return (
    <button
      ref={ref}
      className={`border border-border-200 cursor-pointer bg-background-muted hover:bg-background-200 transition-colors px-4 py-2 rounded-sm ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        setOpen(!open);
        if (onClick) onClick(e);
      }}
      aria-expanded={open}
      {...props}
    >
      {children}
    </button>
  );
});
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

const MenuLabel = forwardRef<
  HTMLFieldSetElement,
  HTMLAttributes<HTMLFieldSetElement> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <fieldset
    ref={ref}
    role="group"
    className={`text-sm w-full ${inset ? 'pl-8' : ''} ${className ?? ''}`}
    {...props}
  />
));
MenuLabel.displayName = 'MenuLabel';

const MenuContent = forwardRef<
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
        bg-background z-50 min-w-[210px] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md border-border-100
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

MenuContent.displayName = 'MenuContent';

const MenuItem = forwardRef<
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
        role="menuitem"
        aria-disabled={disabled}
        className={`
          focus-visible:bg-background-50
          relative flex select-none items-center gap-2 rounded-sm p-3 text-sm outline-none transition-colors [&>svg]:size-4 [&>svg]:shrink-0
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
MenuItem.displayName = 'MenuItem';

const MenuSeparator = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`my-1 h-px bg-border-200 ${className}`}
    {...props}
  />
));
MenuSeparator.displayName = 'MenuSeparator';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuSeparator,
};
