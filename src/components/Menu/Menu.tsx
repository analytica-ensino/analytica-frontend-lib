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
import { CaretRight } from 'phosphor-react';

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
    throw new Error('Component must be used within a Menu (store is missing)');
  }

  return externalStore;
};

interface MenuProps {
  children: ReactNode;
  defaultValue: string;
  value?: string;
  variant?: 'menu' | 'menu2' | 'breadcrumb';
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
  variant = 'menu',
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
    <ul
      className={`
        w-full flex flex-row items-center gap-2 py-2 px-6 
        ${variant == 'menu' ? 'bg-background shadow-soft-shadow-1' : ''}
      `}
    >
      {injectStore(children, store)}
    </ul>
  );
};

interface MenuItemProps extends HTMLAttributes<HTMLLIElement> {
  value: string;
  disabled?: boolean;
  store?: MenuStoreApi;
  variant?: 'menu' | 'menu2' | 'breadcrumb';
}

const MenuItem = forwardRef<HTMLLIElement, MenuItemProps>(
  (
    {
      className,
      children,
      value,
      disabled = false,
      store: externalStore,
      variant = 'menu',
      ...props
    },
    ref
  ) => {
    const store = useMenuStore(externalStore);
    const { value: selectedValue, setValue } = useStore(store, (s) => s);

    const handleClick = (
      e: MouseEvent<HTMLLIElement> | KeyboardEvent<HTMLLIElement>
    ) => {
      if (!disabled) {
        setValue(value);
      }
      props.onClick?.(e as MouseEvent<HTMLLIElement>);
    };

    const commonProps = {
      role: 'menuitem',
      'aria-disabled': disabled,
      ref,
      onClick: handleClick,
      onKeyDown: (e: KeyboardEvent<HTMLLIElement>) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick(e);
      },
      tabIndex: disabled ? -1 : 0,
      ...props,
    };

    const variantRender: Record<string, ReactNode> = {
      menu: (
        <li
          data-variant="menu"
          className={`
            w-full flex flex-col gap-0.5 items-center py-1 px-2 rounded-sm font-medium text-xs
            [&>svg]:size-6 cursor-pointer hover:bg-primary-600 hover:text-text
            focus:outline-none focus:border-2-indicator-info focus:border-2
            ${selectedValue === value ? 'bg-primary-50 text-primary-950' : 'text-text-950'}
            ${className}
          `}
          {...commonProps}
        >
          {children}
        </li>
      ),
      breadcrumb: (
        <li
          data-variant="breadcrumb"
          className={`
            p-2 rounded-lg hover:text-primary-600 cursor-pointer font-bold text-xs
            focus:outline-none focus:border-indicator-info focus:border-2
            ${selectedValue === value ? 'text-primary-950' : 'text-text-600'}
            ${className}
          `}
          {...commonProps}
        >
          <span
            className={`
              border-b border-text-600 hover:border-primary-600 text-inherit
              ${selectedValue === value ? 'border-b-primary-950' : 'border-b-primary-600'}
            `}
          >
            {children}
          </span>
        </li>
      ),
    };

    return variantRender[variant];
  }
);

MenuItem.displayName = 'MenuItem';

const MenuSeparator = forwardRef<HTMLLIElement, HTMLAttributes<HTMLLIElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <li
        ref={ref}
        role="presentation"
        aria-hidden="true"
        className={`[&>svg]:w-4 [&>svg]:h-4 text-text-600 ${className}`}
        {...props}
      >
        {children ?? <CaretRight />}
      </li>
    );
  }
);
export default Menu;
export { Menu, MenuItem, MenuSeparator };
