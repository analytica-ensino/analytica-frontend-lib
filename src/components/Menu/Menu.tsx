'use client';

import { create, StoreApi, useStore } from 'zustand';
import {
  ReactNode,
  useEffect,
  useRef,
  forwardRef,
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  isValidElement,
  Children,
  cloneElement,
} from 'react';

interface MenuStore {
  value: string;
  setValue: (value: string) => void;
}

type MenuStoreApi = StoreApi<MenuStore>;

function createMenuStore(): MenuStoreApi {
  return create<MenuStore>((set) => ({
    value: '',
    setValue: (value) => set({ value }),
  }));
}

export const useMenuStore = (externalStore?: MenuStoreApi) => {
  if (!externalStore) {
    throw new Error(
      'Component must be used within a Menu (store is missing)'
    );
  }

  return externalStore;
};

interface MenuProps {
  children: ReactNode;
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

const injectStore = (children: ReactNode, store: MenuStoreApi): ReactNode => {
  return Children.map(children, (child) => {
    if (isValidElement(child)) {
      const typedChild = child as ReactElement<{
        store?: MenuStoreApi;
        children?: ReactNode;
      }>;

      const newProps: Partial<{ store: MenuStoreApi; children: ReactNode }> = {
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

const Menu = ({
  children,
  defaultValue,
  value: propValue,
  onValueChange,
}: MenuProps) => {
  const storeRef = useRef<MenuStoreApi | null>(null);
  storeRef.current ??= createMenuStore();
  const store = storeRef.current;

  const { setValue, value } = useStore(store, (s) => s);

  useEffect(() => {
    if (propValue === undefined) {
      setValue(defaultValue);
    }
  }, [defaultValue, propValue]);

  useEffect(() => {
    if (propValue !== undefined) {
      setValue(propValue);
    }
  }, [propValue]);

  useEffect(() => {
    onValueChange?.(value);
  }, [value]);

  return (
    <div
      className={`w-full flex flex-row gap-2 py-2 px-6 bg-background shadow-soft-shadow-1`}
    >
      {injectStore(children, store)}
    </div>
  );
};

interface MenuItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
  store?: MenuStoreApi;
}

const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(
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
    const store = useMenuStore(externalStore);
    const { value: selectedValue, setValue } = useStore(store, (s) => s);

    const handleClick = (
      e: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>
    ) => {
      if (!disabled) {
        setValue(value);
      }
      props.onClick?.(e as MouseEvent<HTMLDivElement>);
    };

    return (
      <div
        role="menuitem"
        aria-disabled={disabled}
        ref={ref}
        className={`
          w-full flex flex-col gap-0.5 items-center py-1 px-2 rounded-sm font-medium text-xs [&>svg]:size-6 cursor-pointer hover:bg-primary-600 hover:text-text
          focus:outline-none focus:border-indicator-info focus:border
          ${selectedValue === value ? 'bg-primary-50 text-primary-950' : 'text-text-950'}
          ${className}
        `}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleClick(e);
        }}
        tabIndex={disabled ? -1 : 0}
        {...props}
      >
        {children}
      </div>
    );
  }
);

MenuItem.displayName = 'MenuItem';

export default Menu;
export { Menu, MenuItem };
