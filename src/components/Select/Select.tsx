'use client';

import { CaretDown, Check } from 'phosphor-react';
import {
  createContext,
  useState,
  useContext,
  forwardRef,
  ReactNode,
  ButtonHTMLAttributes,
  HTMLAttributes,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  Children,
  ReactElement,
  isValidElement,
  KeyboardEvent,
  MouseEvent,
} from 'react';

const VARIANT_CLASSES = {
  outlined: 'border-2 rounded-sm focus:border-primary-950',
  underlined: 'border-b-2 focus:border-primary-950',
  rounded: 'border-2 rounded-4xl focus:border-primary-950',
} as const;

const SIZE_CLASSES = {
  small: 'text-sm',
  medium: 'text-md',
  large: 'text-lg',
} as const;

const SIDE_CLASSES = {
  top: 'bottom-full -translate-y-1',
  right: 'top-full translate-y-1',
  bottom: 'top-full translate-y-1',
  left: 'top-full translate-y-1',
};

const ALIGN_CLASSES = {
  start: 'left-0',
  center: 'left-1/2 -translate-x-1/2',
  end: 'right-0',
};

interface SelectContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  value: string;
  setValue: (value: string) => void;
  onValueChange?: (value: string) => void;
  setTriggerSize?: (size: keyof typeof SIZE_CLASSES) => void;
  selectedLabel: string;
  setSelectedLabel: (label: string) => void;
}

const SelectContext = createContext<SelectContextType | undefined>(undefined);

interface SelectProps {
  children: ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  size?: 'small' | 'medium' | 'large';
}

const Select = ({
  children,
  defaultValue = '',
  value: propValue,
  onValueChange,
  size = 'small',
}: SelectProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [selectedLabel, setSelectedLabel] = useState('');
  const [open, setOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const isControlled = propValue !== undefined;
  const value = isControlled ? propValue : internalValue;

  const handleArrowDownOrArrowUp = (event: globalThis.KeyboardEvent) => {
    const selectContent = selectRef.current?.querySelector(
      '[role="select-content"]'
    );
    if (selectContent) {
      event.preventDefault();
      const items = Array.from(
        selectContent.querySelectorAll(
          '[role="select-item"]:not([aria-disabled="true"])'
        )
      ).filter((el): el is HTMLElement => el instanceof HTMLElement);

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
  const handleValueChange = useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
      setOpen(false);
    },
    [isControlled, onValueChange]
  );

  const contextValue = useMemo(
    () => ({
      open,
      setOpen,
      value,
      setValue: handleValueChange,
      onValueChange,
      selectedLabel,
      setSelectedLabel,
    }),
    [open, value, handleValueChange, onValueChange, selectedLabel]
  );

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleArrowDownOrArrowUp);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleArrowDownOrArrowUp);
    };
  }, [open]);

  const sizeClasses = SIZE_CLASSES[size];

  const findLabelForValue = (
    children: ReactNode,
    targetValue: string
  ): string | null => {
    let foundLabel: string | null = null;

    const search = (nodes: ReactNode) => {
      Children.forEach(nodes, (child) => {
        if (!isValidElement(child)) return;
        const typedChild = child as ReactElement<{
          value?: string;
          children?: ReactNode;
        }>;

        if (
          typedChild.type === SelectItem &&
          typedChild.props.value === targetValue
        ) {
          if (typeof typedChild.props.children === 'string') {
            foundLabel = typedChild.props.children;
          }
        }

        if (typedChild.props.children && !foundLabel) {
          search(typedChild.props.children);
        }
      });
    };

    search(children);

    return foundLabel;
  };

  useEffect(() => {
    if (!selectedLabel && defaultValue) {
      const label = findLabelForValue(children, defaultValue);
      if (label) setSelectedLabel(label);
    }
  }, [children, defaultValue, selectedLabel, setSelectedLabel]);

  return (
    <SelectContext.Provider value={contextValue}>
      <div className={`relative ${sizeClasses} w-[288px]`} ref={selectRef}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const useSelectContext = () => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('Select components must be used within a Select');
  }
  return context;
};

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const { selectedLabel, value } = useSelectContext();
  return (
    <span className="text-inherit">
      {selectedLabel || placeholder || value}
    </span>
  );
};

interface SelectTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  className?: string;
  invalid?: boolean;
  variant?: 'outlined' | 'underlined' | 'rounded';
}

const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  (
    { className, children, invalid = false, variant = 'outlined', ...props },
    ref
  ) => {
    const { open, setOpen } = useSelectContext();
    const variantClasses = VARIANT_CLASSES[variant];

    return (
      <button
        ref={ref}
        className={`
          flex h-9 min-w-[220px] w-full items-center justify-between whitespace-nowrap border-border-300 hover:border-border-400 disabled:hover:border-border-300 bg-transparent px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1
          ${invalid && 'border-indicator-error'}
          ${variantClasses}
          ${className}
        `}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        {...props}
      >
        {children}
        <CaretDown
          className={`h-[1em] w-[1em] opacity-50 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
    );
  }
);
SelectTrigger.displayName = 'SelectTrigger';

interface SelectContentProps {
  children: ReactNode;
  className?: string;
  position?: 'popper' | 'item-aligned';
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
}

const SelectContent = forwardRef<HTMLDivElement, SelectContentProps>(
  (
    { className, children, align = 'start', side = 'bottom', ...props },
    ref
  ) => {
    const { open } = useSelectContext();

    if (!open) return null;

    const getPositionClasses = () => {
      const vertical = SIDE_CLASSES[side];
      const horizontal = ALIGN_CLASSES[align];
      return `absolute ${vertical} ${horizontal}`;
    };

    return (
      <div
        role="select-content"
        ref={ref}
        className={`
          bg-background z-50 min-w-[210px] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md border-border-100
          ${getPositionClasses()}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SelectContent.displayName = 'SelectContent';

interface SelectItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
}

const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, disabled = false, ...props }, ref) => {
    const {
      value: selectedValue,
      setValue,
      selectedLabel,
      setSelectedLabel,
    } = useSelectContext();

    useEffect(() => {
      // Preencher o label se for o defaultValue
      if (selectedValue === value && !selectedLabel) {
        if (typeof children === 'string') {
          setSelectedLabel(children);
        }
      }
    }, [selectedValue, selectedLabel, value, children, setSelectedLabel]);

    const handleClick = (
      e: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>
    ) => {
      if (!disabled) {
        setValue(value);
        if (typeof children === 'string') {
          setSelectedLabel(children);
        }
      }
      props.onClick?.(e as MouseEvent<HTMLDivElement>);
    };

    return (
      <div
        role="select-item"
        ref={ref}
        className={`
          focus-visible:bg-background-50
          relative flex select-none items-center gap-2 rounded-sm p-3 outline-none transition-colors [&>svg]:size-4 [&>svg]:shrink-0
          ${disabled && 'pointer-events-none opacity-50'}
          ${className}
          ${
            disabled
              ? 'cursor-not-allowed text-text-400'
              : 'cursor-pointer hover:bg-background-50 text-text-700 focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground'
          }
          ${selectedValue === value && 'bg-background-50'}
        `}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleClick(e);
        }}
        tabIndex={disabled ? -1 : 0}
        {...props}
      >
        <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
          {selectedValue === value && <Check className="h-4 w-4" />}
        </span>
        {children}
      </div>
    );
  }
);
SelectItem.displayName = 'SelectItem';

interface SelectSeparatorProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const SelectSeparator = forwardRef<HTMLDivElement, SelectSeparatorProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`-mx-1 my-1 h-px bg-muted ${className}`}
        {...props}
      />
    );
  }
);
SelectSeparator.displayName = 'SelectSeparator';

export {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectSeparator,
};
