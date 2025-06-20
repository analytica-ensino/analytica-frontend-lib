// app/components/Select.tsx
'use client';

import { create, StoreApi, useStore } from 'zustand';
import {
  ReactNode,
  useEffect,
  useRef,
  ButtonHTMLAttributes,
  forwardRef,
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  isValidElement,
  Children,
  cloneElement,
} from 'react';
import { CaretDown, Check } from 'phosphor-react';

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

interface SelectStore {
  open: boolean;
  setOpen: (open: boolean) => void;
  value: string;
  setValue: (value: string) => void;
  selectedLabel: ReactNode;
  setSelectedLabel: (label: ReactNode) => void;
}

type SelectStoreApi = StoreApi<SelectStore>;

export function createSelectStore(): SelectStoreApi {
  return create<SelectStore>((set) => ({
    open: false,
    setOpen: (open) => set({ open }),
    value: '',
    setValue: (value) => set({ value }),
    selectedLabel: '',
    setSelectedLabel: (label) => set({ selectedLabel: label }),
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
  const flattened = Children.toArray(children).map((child) => {
    if (typeof child === 'string' || typeof child === 'number') {
      return child;
    }
    return child;
  });

  if (flattened.length === 1) return flattened[0];

  return <>{flattened}</>;
}

interface SelectProps {
  children: ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  size?: 'small' | 'medium' | 'large';
}

const injectStore = (children: ReactNode, store: SelectStoreApi): ReactNode => {
  return Children.map(children, (child) => {
    if (isValidElement(child)) {
      const typedChild = child as ReactElement<{
        store?: SelectStoreApi;
        children?: ReactNode;
      }>;

      const newProps: Partial<{ store: SelectStoreApi; children: ReactNode }> =
        {
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

const Select = ({
  children,
  defaultValue = '',
  value: propValue,
  onValueChange,
  size = 'small',
}: SelectProps) => {
  const storeRef = useRef<SelectStoreApi | null>(null);
  if (!storeRef.current) storeRef.current = createSelectStore();
  const store = storeRef.current;

  const selectRef = useRef<HTMLDivElement>(null);
  const { open, setOpen, setValue, value, selectedLabel } = useStore(
    store,
    (s) => s
  );

  const isControlled = propValue !== undefined;
  const currentValue = isControlled ? propValue : value;

  const findLabelForValue = (
    children: ReactNode,
    targetValue: string
  ): string | null => {
    let found: string | null = null;
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
          if (typeof typedChild.props.children === 'string')
            found = typedChild.props.children;
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
    setValue(currentValue);
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleArrowKeys = (event: globalThis.KeyboardEvent) => {
      const selectContent = selectRef.current?.querySelector('[role="menu"]');
      if (selectContent) {
        event.preventDefault();
        const items = Array.from(
          selectContent.querySelectorAll(
            '[role="menuitem"]:not([aria-disabled="true"])'
          )
        ).filter((el): el is HTMLElement => el instanceof HTMLElement);

        const focused = document.activeElement as HTMLElement;
        const currentIndex = items.findIndex((item) => item === focused);

        let nextIndex = 0;
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
  }, [open]);

  useEffect(() => {
    if (onValueChange) {
      onValueChange(value);
    }
  }, [value]);

  const sizeClasses = SIZE_CLASSES[size];

  return (
    <div className={`relative ${sizeClasses} w-[288px]`} ref={selectRef}>
      {injectStore(children, store)}
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
    <span className="text-inherit">
      {selectedLabel ? selectedLabel : (placeholder ?? value)}
    </span>
  );
};

interface SelectTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  invalid?: boolean;
  variant?: 'outlined' | 'underlined' | 'rounded';
  store?: SelectStoreApi;
}

const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  (
    {
      className,
      invalid = false,
      variant = 'outlined',
      store: externalStore,
      disabled,
      ...props
    },
    ref
  ) => {
    const store = useSelectStore(externalStore);

    const open = useStore(store, (s) => s.open);
    const toggleOpen = () => store.setState({ open: !open });

    const variantClasses = VARIANT_CLASSES[variant];

    return (
      <button
        ref={ref}
        className={`
        flex h-9 min-w-[220px] w-full items-center justify-between border-border-300 px-3 py-2
        ${invalid && 'border-indicator-error'}
        ${
          disabled
            ? 'cursor-not-allowed text-text-400 pointer-events-none opacity-50'
            : 'cursor-pointer hover:bg-background-50 text-text-700 focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground'
        }
        ${variantClasses}
        ${className}
      `}
        onClick={toggleOpen}
        aria-expanded={open}
        {...props}
      >
        {props.children}
        <CaretDown
          className={`h-[1em] w-[1em] opacity-50 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
    );
  }
);
SelectTrigger.displayName = 'SelectTrigger';

interface SelectContentProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  store?: SelectStoreApi;
}

const SelectContent = forwardRef<HTMLDivElement, SelectContentProps>(
  (
    {
      children,
      className,
      align = 'start',
      side = 'bottom',
      store: externalStore,
      ...props
    },
    ref
  ) => {
    const store = useSelectStore(externalStore);

    const open = useStore(store, (s) => s.open);
    if (!open) return null;

    const getPositionClasses = () =>
      `absolute ${SIDE_CLASSES[side]} ${ALIGN_CLASSES[align]}`;

    return (
      <div
        role="menu"
        ref={ref}
        className={`bg-background z-50 min-w-[210px] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md border-border-100 ${getPositionClasses()} ${className}`}
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
  store?: SelectStoreApi;
}

const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  (
    {
      className,
      children,
      value,
      disabled = false,
      store: externalStore,
      ...props
    },
    ref
  ) => {
    const store = useSelectStore(externalStore);

    const selectedValue = useStore(store, (s) => s.value);
    const { setValue, setSelectedLabel, setOpen } = store.getState();

    const handleClick = (
      e: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>
    ) => {
      const labelNode = getLabelAsNode(children);
      if (!disabled) {
        setValue(value);
        setSelectedLabel(labelNode);
        setOpen(false);
      }
      props.onClick?.(e as MouseEvent<HTMLDivElement>);
    };

    return (
      <div
        role="menuitem"
        aria-disabled={disabled}
        ref={ref}
        className={`
          focus-visible:bg-background-50
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
        {children}
      </div>
    );
  }
);

SelectItem.displayName = 'SelectItem';

export default Select;
export { SelectTrigger, SelectContent, SelectItem, SelectValue };
