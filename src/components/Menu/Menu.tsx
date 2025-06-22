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
  useState,
} from 'react';
import { CaretLeft, CaretRight } from 'phosphor-react';

interface MenuStore {
  value: string;
  setValue: (value: string) => void;
}

type MenuStoreApi = StoreApi<MenuStore>;

const createMenuStore = (): MenuStoreApi =>
  create<MenuStore>((set) => ({
    value: '',
    setValue: (value) => set({ value }),
  }));

export const useMenuStore = (externalStore?: MenuStoreApi) => {
  if (!externalStore) throw new Error('MenuItem must be inside Menu');
  return externalStore;
};

interface MenuProps extends HTMLAttributes<HTMLUListElement> {
  children: ReactNode;
  defaultValue: string;
  value?: string;
  variant?: 'menu' | 'menu2' | 'breadcrumb';
  onValueChange?: (value: string) => void;
}

const VARIANT_CLASSES = {
  menu: 'bg-background shadow-soft-shadow-1',
  menu2: 'overflow-x-auto scroll-smooth',
  breadcrumb: '',
};

const Menu = forwardRef<HTMLUListElement, MenuProps>(
  (
    {
      className,
      children,
      defaultValue,
      value: propValue,
      variant = 'menu',
      onValueChange,
      ...props
    },
    ref
  ) => {
    const storeRef = useRef<MenuStoreApi>(null);
    storeRef.current ??= createMenuStore();
    const store = storeRef.current;
    const { setValue, value } = useStore(store, (s) => s);

    useEffect(() => {
      setValue(propValue ?? defaultValue);
    }, [defaultValue, propValue, setValue]);

    useEffect(() => {
      onValueChange?.(value);
    }, [value, onValueChange]);

    const baseClasses = 'w-full flex flex-row items-center gap-2 py-2 px-6';

    const variantClasses = VARIANT_CLASSES[variant];

    return (
      <ul
        ref={ref}
        className={`
          ${baseClasses}
          ${variantClasses}
          ${className ?? ''}
        `}
        style={
          variant === 'menu2'
            ? { scrollbarWidth: 'none', msOverflowStyle: 'none' }
            : undefined
        }
        {...props}
      >
        {injectStore(children, store)}
      </ul>
    );
  }
);
Menu.displayName = 'Menu';

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
      if (!disabled) setValue(value);
      props.onClick?.(e as MouseEvent<HTMLLIElement>);
    };

    const commonProps = {
      role: 'menuitem',
      'aria-disabled': disabled,
      ref,
      onClick: handleClick,
      onKeyDown: (e: KeyboardEvent<HTMLLIElement>) => {
        if (['Enter', ' '].includes(e.key)) handleClick(e);
      },
      tabIndex: disabled ? -1 : 0,
      ...props,
    };

    const variants: Record<string, ReactNode> = {
      menu: (
        <li
          data-variant="menu"
          className={`
            w-full flex flex-col gap-0.5 items-center py-1 px-2 rounded-sm font-medium text-xs
            [&>svg]:size-6 cursor-pointer hover:bg-primary-600 hover:text-text
            focus:outline-none focus:border-2-indicator-info focus:border-2
            ${selectedValue === value ? 'bg-primary-50 text-primary-950' : 'text-text-950'}
            ${className ?? ''}
          `}
          {...commonProps}
        >
          {children}
        </li>
      ),
      menu2: (
        <li
          data-variant="menu2"
          className={`
            flex flex-row items-center p-4 gap-2 border-b-2 border-transparent text-text-950 text-sx font-bold cursor-pointer
            ${selectedValue === value ? 'border-b-primary-950' : ''}
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
            ${className ?? ''}
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

    return variants[variant] ?? variants['menu'];
  }
);
MenuItem.displayName = 'MenuItem';

const MenuItemIcon = ({
  className,
  icon,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { icon: ReactNode }) => (
  <span
    className={`
      bg-background-500 w-[21px] h-[21px] flex items-center justify-center
      [&>svg]:w-[17px] [&>svg]:h-[17px] rounded-sm ${className ?? ''}
    `}
    {...props}
  >
    {icon}
  </span>
);

const MenuSeparator = forwardRef<HTMLLIElement, HTMLAttributes<HTMLLIElement>>(
  ({ className, children, ...props }, ref) => (
    <li
      ref={ref}
      aria-hidden="true"
      className={`[&>svg]:w-4 [&>svg]:h-4 text-text-600 ${className ?? ''}`}
      {...props}
    >
      {children ?? <CaretRight />}
    </li>
  )
);
MenuSeparator.displayName = 'MenuSeparator';

export const internalScroll = (
  container: HTMLUListElement | null,
  direction: 'left' | 'right'
) => {
  if (!container) return;
  container.scrollBy({
    left: direction === 'left' ? -150 : 150,
    behavior: 'smooth',
  });
};

export const internalCheckScroll = (
  container: HTMLUListElement | null,
  setShowLeftArrow: (v: boolean) => void,
  setShowRightArrow: (v: boolean) => void
) => {
  if (!container) return;
  const { scrollLeft, scrollWidth, clientWidth } = container;
  setShowLeftArrow(scrollLeft > 0);
  setShowRightArrow(scrollLeft + clientWidth < scrollWidth);
};

interface MenuOverflowProps extends HTMLAttributes<HTMLUListElement> {
  children: ReactNode;
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

const MenuOverflow = ({
  children,
  className,
  defaultValue,
  value,
  onValueChange,
  ...props
}: MenuOverflowProps) => {
  const containerRef = useRef<HTMLUListElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  useEffect(() => {
    const checkScroll = () =>
      internalCheckScroll(
        containerRef.current,
        setShowLeftArrow,
        setShowRightArrow
      );
    checkScroll();
    const container = containerRef.current;
    container?.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    return () => {
      container?.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  return (
    <div
      data-testid="menu-overflow-wrapper"
      className={`relative w-full overflow-hidden ${className ?? ''}`}
    >
      {showLeftArrow && (
        <button
          onClick={() => internalScroll(containerRef.current, 'left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md"
          data-testid="scroll-left-button"
        >
          <CaretLeft size={16} />
          <span className="sr-only">Scroll left</span>
        </button>
      )}

      <Menu
        ref={containerRef}
        variant="menu2"
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        value={value}
        {...props}
      >
        {children}
      </Menu>

      {showRightArrow && (
        <button
          onClick={() => internalScroll(containerRef.current, 'right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md"
          data-testid="scroll-right-button"
        >
          <CaretRight size={16} />
          <span className="sr-only">Scroll right</span>
        </button>
      )}
    </div>
  );
};

const injectStore = (children: ReactNode, store: MenuStoreApi): ReactNode =>
  Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const typedChild = child as ReactElement<any>;
    const shouldInject = typedChild.type === MenuItem;
    return cloneElement(typedChild, {
      ...(shouldInject ? { store } : {}),
      ...(typedChild.props.children
        ? { children: injectStore(typedChild.props.children, store) }
        : {}),
    });
  });

export default Menu;
export { Menu, MenuItem, MenuSeparator, MenuOverflow, MenuItemIcon };
