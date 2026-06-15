import { create, StoreApi, useStore } from 'zustand';
import {
  ReactNode,
  useEffect,
  useRef,
  useState,
  useCallback,
  ButtonHTMLAttributes,
  forwardRef,
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  isValidElement,
  Children,
  cloneElement,
  useId,
  CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';
import { CaretDown, Check, WarningCircle } from 'phosphor-react';
import { cn } from '../../utils/utils';

const VARIANT_CLASSES = {
  outlined: 'border-2 rounded-lg focus:border-primary-950',
  underlined: 'border-b-2 focus:border-primary-950',
  rounded: 'border-2 rounded-full focus:border-primary-950',
} as const;

const SIZE_CLASSES = {
  small: 'text-sm',
  medium: 'text-md',
  large: 'text-lg',
  'extra-large': 'text-lg',
} as const;

const HEIGHT_CLASSES = {
  small: 'h-8',
  medium: 'h-9',
  large: 'h-10',
  'extra-large': 'h-12',
} as const;

const PADDING_CLASSES = {
  small: 'px-2 py-1',
  medium: 'px-3 py-2',
  large: 'px-4 py-3',
  'extra-large': 'px-5 py-4',
} as const;

interface TriggerRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

type SelectAlign = 'start' | 'center' | 'end';

interface SelectStore {
  open: boolean;
  setOpen: (open: boolean) => void;
  value: string;
  setValue: (value: string) => void;
  selectedLabel: ReactNode;
  setSelectedLabel: (label: ReactNode) => void;
  onValueChange?: (value: string) => void;
  triggerRect: TriggerRect | null;
  setTriggerRect: (rect: TriggerRect | null) => void;
}

type SelectStoreApi = StoreApi<SelectStore>;

export function createSelectStore(
  onValueChange?: (value: string) => void
): SelectStoreApi {
  return create<SelectStore>((set) => ({
    open: false,
    setOpen: (open) => set({ open }),
    value: '',
    setValue: (value) => set({ value }),
    selectedLabel: '',
    setSelectedLabel: (label) => set({ selectedLabel: label }),
    onValueChange,
    triggerRect: null,
    setTriggerRect: (rect) => set({ triggerRect: rect }),
  }));
}

export const useSelectStore = (externalStore?: SelectStoreApi) => {
  if (!externalStore) {
    throw new Error(
      'Component must be used within a Select (store is missing)'
    );
  }

  return externalStore;
};

export function getLabelAsNode(children: ReactNode): ReactNode {
  if (typeof children === 'string' || typeof children === 'number') {
    return children;
  }
  const flattened = Children.toArray(children);

  if (flattened.length === 1) return flattened[0];

  return <>{flattened}</>;
}

interface SelectProps {
  className?: string;
  children: ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  size?: 'small' | 'medium' | 'large' | 'extra-large';
  label?: string;
  helperText?: string;
  errorMessage?: string;
  id?: string;
}

const injectStore = (
  children: ReactNode,
  store: SelectStoreApi,
  size: string,
  selectId: string
): ReactNode => {
  return Children.map(children, (child) => {
    if (isValidElement(child)) {
      const typedChild = child as ReactElement<{
        store?: SelectStoreApi;
        children?: ReactNode;
        size?: string;
        selectId?: string;
      }>;

      const newProps: Partial<{
        store: SelectStoreApi;
        children: ReactNode;
        size: string;
        selectId: string;
      }> = {
        store,
      };

      // Pass size to SelectTrigger, selectId to both Trigger and Content
      if (typedChild.type === SelectTrigger) {
        newProps.size = size;
        newProps.selectId = selectId;
      }

      if (typedChild.type === SelectContent) {
        newProps.selectId = selectId;
      }

      if (typedChild.props.children) {
        newProps.children = injectStore(
          typedChild.props.children,
          store,
          size,
          selectId
        );
      }

      return cloneElement(typedChild, newProps);
    }
    return child;
  });
};

const Select = ({
  children,
  defaultValue = '',
  className,
  value: propValue,
  onValueChange,
  size = 'small',
  label,
  helperText,
  errorMessage,
  id,
}: SelectProps) => {
  const storeRef = useRef<SelectStoreApi | null>(null);
  storeRef.current ??= createSelectStore(onValueChange);
  const store = storeRef.current;

  const selectRef = useRef<HTMLDivElement>(null);
  const { open, setOpen, setValue, selectedLabel } = useStore(store, (s) => s);

  // Generate unique ID if not provided
  const generatedId = useId();
  const selectId = id ?? `select-${generatedId}`;

  const findLabelForValue = (
    children: ReactNode,
    targetValue: string
  ): ReactNode | null => {
    let found: ReactNode | null = null;
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
          // Use getLabelAsNode to handle both string and ReactNode children
          found = getLabelAsNode(typedChild.props.children);
        }
        if (typedChild.props.children && !found)
          search(typedChild.props.children);
      });
    };
    search(children);
    return found;
  };

  useEffect(() => {
    if (!selectedLabel && defaultValue) {
      const label = findLabelForValue(children, defaultValue);
      if (label) store.setState({ selectedLabel: label });
    }
  }, [children, defaultValue, selectedLabel]);

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      const target = event.target as Node;
      // Check if click is inside the trigger container
      const isInsideTrigger = selectRef.current?.contains(target);
      // Check if click is inside the portaled content (scoped to this Select instance)
      const portaledMenu = document.body.querySelector(
        `[role="menu"][data-select-id="${selectId}"]`
      );
      const isInsidePortaledMenu = portaledMenu?.contains(target);

      if (!isInsideTrigger && !isInsidePortaledMenu) {
        setOpen(false);
      }
    };

    const handleArrowKeys = (event: globalThis.KeyboardEvent) => {
      // Find the portaled menu in the body (scoped to this Select instance)
      const selectContent = document.body.querySelector(
        `[role="menu"][data-select-id="${selectId}"]`
      );
      if (selectContent) {
        event.preventDefault();
        const items = Array.from(
          selectContent.querySelectorAll(
            '[role="menuitem"]:not([aria-disabled="true"])'
          )
        ).filter((el): el is HTMLElement => el instanceof HTMLElement);

        const focused = document.activeElement as HTMLElement;
        const currentIndex = items.findIndex((item) => item === focused);

        let nextIndex: number;
        if (event.key === 'ArrowDown') {
          nextIndex =
            currentIndex === -1 ? 0 : (currentIndex + 1) % items.length;
        } else {
          nextIndex =
            currentIndex === -1
              ? items.length - 1
              : (currentIndex - 1 + items.length) % items.length;
        }
        items[nextIndex]?.focus();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleArrowKeys);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleArrowKeys);
    };
  }, [open, selectId, setOpen]);

  useEffect(() => {
    // Skip when the consumer isn't using controlled mode
    if (propValue === undefined) return;
    setValue(propValue);
    // Resolve the label for the new value; if it can't be resolved (empty
    // value, or a value with no matching SelectItem), clear the stale label
    // so the placeholder takes over.
    const label = findLabelForValue(children, propValue);
    store.setState({ selectedLabel: label ?? '' });
  }, [propValue, children]);

  const sizeClasses = SIZE_CLASSES[size];

  return (
    <div className={cn('w-full', className)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={selectId}
          className={cn('block font-bold text-text-900 mb-1.5', sizeClasses)}
        >
          {label}
        </label>
      )}

      {/* Select Container */}
      <div className={cn('relative w-full')} ref={selectRef}>
        {injectStore(children, store, size, selectId)}
      </div>

      {/* Helper Text or Error Message */}
      {(helperText || errorMessage) && (
        <div className="mt-1.5 gap-1.5">
          {helperText && <p className="text-sm text-text-500">{helperText}</p>}
          {errorMessage && (
            <p className="flex gap-1 items-center text-sm text-indicator-error">
              <WarningCircle size={16} /> {errorMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const SelectValue = ({
  placeholder,
  store: externalStore,
}: {
  placeholder?: string;
  store?: SelectStoreApi;
}) => {
  const store = useSelectStore(externalStore);

  const selectedLabel = useStore(store, (s) => s.selectedLabel);
  const value = useStore(store, (s) => s.value);
  return (
    <span className="text-inherit flex gap-2 items-center">
      {selectedLabel || placeholder || value}
    </span>
  );
};

interface SelectTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  invalid?: boolean;
  variant?: 'outlined' | 'underlined' | 'rounded';
  store?: SelectStoreApi;
  size?: 'small' | 'medium' | 'large' | 'extra-large';
  selectId?: string;
}

const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  (
    {
      className,
      invalid = false,
      variant = 'outlined',
      store: externalStore,
      disabled,
      size = 'medium',
      selectId,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const store = useSelectStore(externalStore);
    const open = useStore(store, (s) => s.open);
    const internalRef = useRef<HTMLButtonElement>(null);

    const setRefs = useCallback(
      (element: HTMLButtonElement | null) => {
        internalRef.current = element;
        if (typeof ref === 'function') {
          ref(element);
        } else if (ref) {
          ref.current = element;
        }
      },
      [ref]
    );

    const updateTriggerRect = useCallback(() => {
      if (internalRef.current) {
        const rect = internalRef.current.getBoundingClientRect();
        store.setState({
          triggerRect: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          },
        });
      }
    }, [store]);

    // Update triggerRect on scroll/resize while open
    useEffect(() => {
      if (!open) return;

      const handleUpdate = () => {
        updateTriggerRect();
      };

      window.addEventListener('scroll', handleUpdate, true);
      window.addEventListener('resize', handleUpdate);

      return () => {
        window.removeEventListener('scroll', handleUpdate, true);
        window.removeEventListener('resize', handleUpdate);
      };
    }, [open, updateTriggerRect]);

    const toggleOpen = () => {
      const newOpen = !open;
      if (newOpen) {
        updateTriggerRect();
      }
      store.setState({ open: newOpen });
    };

    const variantClasses = VARIANT_CLASSES[variant];
    const heightClasses = HEIGHT_CLASSES[size];
    const paddingClasses = PADDING_CLASSES[size];

    return (
      <button
        ref={setRefs}
        id={selectId}
        type={type}
        className={cn(
          'flex w-full items-center justify-between border-border-300',
          heightClasses,
          paddingClasses,
          invalid &&
            `${variant == 'underlined' ? 'border-b-2' : 'border-2'} border-indicator-error text-text-600`,
          disabled
            ? 'cursor-not-allowed text-text-400 pointer-events-none opacity-50'
            : 'cursor-pointer hover:bg-background-50 focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground',
          !invalid && !disabled ? 'text-text-700' : '',
          variantClasses,
          className
        )}
        onClick={toggleOpen}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? 'select-content' : undefined}
        {...props}
      >
        {props.children}
        <CaretDown
          className={cn(
            'h-[1em] w-[1em] opacity-50 transition-transform',
            open ? 'rotate-180' : ''
          )}
        />
      </button>
    );
  }
);
SelectTrigger.displayName = 'SelectTrigger';

function applyVerticalPosition(
  styles: CSSProperties,
  triggerRect: TriggerRect,
  side: 'top' | 'bottom',
  align: SelectAlign,
  gap: number
): void {
  styles.top =
    side === 'top'
      ? triggerRect.top - gap
      : triggerRect.top + triggerRect.height + gap;
  styles.transform = side === 'top' ? 'translateY(-100%)' : undefined;

  if (align === 'start') {
    styles.left = triggerRect.left;
  } else if (align === 'center') {
    styles.left = triggerRect.left + triggerRect.width / 2;
    styles.transform =
      side === 'top' ? 'translate(-50%, -100%)' : 'translateX(-50%)';
  } else {
    styles.left = triggerRect.left + triggerRect.width;
    styles.transform =
      side === 'top' ? 'translate(-100%, -100%)' : 'translateX(-100%)';
  }
}

function applyHorizontalPosition(
  styles: CSSProperties,
  triggerRect: TriggerRect,
  side: 'left' | 'right',
  align: SelectAlign,
  gap: number
): void {
  styles.left =
    side === 'left'
      ? triggerRect.left - gap
      : triggerRect.left + triggerRect.width + gap;
  styles.transform = side === 'left' ? 'translateX(-100%)' : undefined;

  if (align === 'start') {
    styles.top = triggerRect.top;
  } else if (align === 'center') {
    styles.top = triggerRect.top + triggerRect.height / 2;
    styles.transform =
      side === 'left' ? 'translate(-100%, -50%)' : 'translateY(-50%)';
  } else {
    styles.top = triggerRect.top + triggerRect.height;
    styles.transform =
      side === 'left' ? 'translate(-100%, -100%)' : 'translateY(-100%)';
  }
}

interface SelectContentProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  store?: SelectStoreApi;
  selectId?: string;
}

const SelectContent = forwardRef<HTMLDivElement, SelectContentProps>(
  (
    {
      children,
      className,
      align = 'start',
      side = 'bottom',
      store: externalStore,
      selectId,
      ...props
    },
    ref
  ) => {
    const store = useSelectStore(externalStore);
    const open = useStore(store, (s) => s.open);
    const triggerRect = useStore(store, (s) => s.triggerRect);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    if (!open || !mounted) return null;

    // Calculate position based on trigger rect
    const getPositionStyles = (): CSSProperties => {
      if (!triggerRect) {
        return {};
      }

      const gap = 4;
      const styles: CSSProperties = {
        position: 'fixed',
        zIndex: 9999,
      };

      const isVertical = side === 'top' || side === 'bottom';

      if (isVertical) {
        applyVerticalPosition(styles, triggerRect, side, align, gap);
      } else {
        applyHorizontalPosition(styles, triggerRect, side, align, gap);
      }

      return styles;
    };

    const content = (
      <div
        role="menu"
        ref={ref}
        data-select-id={selectId}
        style={getPositionStyles()}
        className={cn(
          'bg-secondary min-w-[210px] max-h-[300px] overflow-y-auto overflow-x-hidden rounded-md border p-1 shadow-md border-border-100',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );

    // Render using portal to escape overflow constraints
    return createPortal(content, document.body);
  }
);
SelectContent.displayName = 'SelectContent';

interface SelectItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
  store?: SelectStoreApi;
  truncate?: boolean;
}

const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  (
    {
      className,
      children,
      value,
      disabled = false,
      store: externalStore,
      truncate = false,
      ...props
    },
    ref
  ) => {
    const store = useSelectStore(externalStore);
    const {
      value: selectedValue,
      setValue,
      setOpen,
      setSelectedLabel,
      onValueChange,
    } = useStore(store, (s) => s);

    const handleClick = (
      e: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>
    ) => {
      const labelNode = getLabelAsNode(children);
      if (!disabled) {
        // Always set the clicked value, even if it's already selected
        setValue(value);
        setSelectedLabel(labelNode);
        setOpen(false);
        onValueChange?.(value);
      }
      props.onClick?.(e as MouseEvent<HTMLDivElement>);
    };

    return (
      <div
        role="menuitem"
        aria-disabled={disabled}
        ref={ref}
        className={`
          bg-secondary focus-visible:bg-background-50
          relative flex select-none items-center gap-2 rounded-sm p-3 outline-none transition-colors [&>svg]:size-4 [&>svg]:shrink-0
          ${className}
          ${
            disabled
              ? 'cursor-not-allowed text-text-400 pointer-events-none opacity-50'
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
          {selectedValue === value && <Check className="" />}
        </span>
        {truncate ? (
          <span className="truncate block max-w-[200px]">{children}</span>
        ) : (
          children
        )}
      </div>
    );
  }
);

SelectItem.displayName = 'SelectItem';

export default Select;
export { SelectTrigger, SelectContent, SelectItem, SelectValue };
