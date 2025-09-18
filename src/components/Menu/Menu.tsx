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
import { cn } from '../../utils/utils';

type MenuVariant = 'menu' | 'menu2' | 'menu-overflow' | 'breadcrumb';

interface MenuStore {
  value: string;
  setValue: (value: string) => void;
  onValueChange?: (value: string) => void;
}

type MenuStoreApi = StoreApi<MenuStore>;

const createMenuStore = (
  onValueChange?: (value: string) => void
): MenuStoreApi =>
  create<MenuStore>((set) => ({
    value: '',
    setValue: (value) => {
      set({ value });
      onValueChange?.(value);
    },
    onValueChange,
  }));

export const useMenuStore = (externalStore?: MenuStoreApi) => {
  if (!externalStore) throw new Error('MenuItem must be inside Menu');
  return externalStore;
};

interface MenuProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  defaultValue: string;
  value?: string;
  variant?: MenuVariant;
  onValueChange?: (value: string) => void;
}

const VARIANT_CLASSES = {
  menu: 'bg-background shadow-soft-shadow-1 px-6',
  menu2: '',
  'menu-overflow': '',
  breadcrumb: 'bg-transparent shadow-none !px-0',
};

const Menu = forwardRef<HTMLDivElement, MenuProps>(
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
    storeRef.current ??= createMenuStore(onValueChange);
    const store = storeRef.current;
    const { setValue } = useStore(store, (s) => s);

    useEffect(() => {
      setValue(propValue ?? defaultValue);
    }, [defaultValue, propValue, setValue]);

    const baseClasses =
      variant === 'menu-overflow'
        ? 'w-fit py-2 flex flex-row items-center justify-center'
        : 'w-full py-2 flex flex-row items-center justify-center';
    const variantClasses = VARIANT_CLASSES[variant];

    return (
      <div
        ref={ref}
        className={`
          ${baseClasses}
          ${variantClasses}
          ${className ?? ''}
        `}
        {...props}
      >
        {injectStore(children, store)}
      </div>
    );
  }
);
Menu.displayName = 'Menu';

interface MenuContentProps extends HTMLAttributes<HTMLUListElement> {
  children: ReactNode;
  variant?: MenuVariant;
}

const MenuContent = forwardRef<HTMLUListElement, MenuContentProps>(
  ({ className, children, variant = 'menu', ...props }, ref) => {
    const baseClasses = 'w-full flex flex-row items-center gap-2';

    const variantClasses =
      variant === 'menu2' || variant === 'menu-overflow'
        ? 'overflow-x-auto scroll-smooth'
        : '';

    return (
      <ul
        ref={ref}
        className={`
          ${baseClasses}
          ${variantClasses}
          ${variant == 'breadcrumb' ? 'flex-wrap' : ''}
          ${className ?? ''}
        `}
        style={
          variant === 'menu2' || variant === 'menu-overflow'
            ? { scrollbarWidth: 'none', msOverflowStyle: 'none' }
            : undefined
        }
        {...props}
      >
        {children}
      </ul>
    );
  }
);
MenuContent.displayName = 'MenuContent';

interface MenuItemProps extends HTMLAttributes<HTMLLIElement> {
  value: string;
  disabled?: boolean;
  store?: MenuStoreApi;
  variant?: MenuVariant;
  separator?: boolean;
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
      separator = false,
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
        if (['Enter', ' '].includes(e.key)) handleClick(e);
      },
      tabIndex: disabled ? -1 : 0,
      onMouseDown: (e: MouseEvent<HTMLLIElement>) => {
        e.preventDefault();
      },
      ...props,
    };

    const variants: Record<string, ReactNode> = {
      menu: (
        <li
          data-variant="menu"
          className={`
            w-full flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-sm font-medium text-xs
            [&>svg]:size-6 cursor-pointer hover:bg-primary-600 hover:text-text
            focus:outline-none focus:border-indicator-info focus:border-2
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
            w-full flex flex-col items-center px-2 pt-4 gap-3 cursor-pointer focus:rounded-sm justify-center hover:bg-background-100 rounded-lg
            focus:outline-none focus:border-indicator-info focus:border-2
            ${selectedValue === value ? '' : 'pb-4'}
          `}
          {...commonProps}
        >
          <span
            className={cn(
              'flex flex-row items-center gap-2 px-4 text-text-950 text-xs font-bold',
              className
            )}
          >
            {children}
          </span>
          {selectedValue === value && (
            <div className="h-1 w-full bg-primary-950 rounded-lg" />
          )}
        </li>
      ),
      'menu-overflow': (
        <li
          data-variant="menu-overflow"
          className={`
            w-fit flex flex-col items-center px-2 pt-4 gap-3 cursor-pointer focus:rounded-sm justify-center hover:bg-background-100 rounded-lg
            focus:outline-none focus:border-indicator-info focus:border-2
            ${selectedValue === value ? '' : 'pb-4'}
          `}
          {...commonProps}
        >
          <span
            className={cn(
              'flex flex-row items-center gap-2 px-4 text-text-950 text-xs font-bold',
              className
            )}
          >
            {children}
          </span>
          {selectedValue === value && (
            <div className="h-1 w-full bg-primary-950 rounded-lg" />
          )}
        </li>
      ),
      breadcrumb: (
        <li
          data-variant="breadcrumb"
          className={`
            flex flex-row gap-2 items-center w-fit p-2 rounded-lg hover:text-primary-600 cursor-pointer font-bold text-xs
            focus:outline-none focus:border-indicator-info focus:border-2
            ${selectedValue === value ? 'text-text-950' : 'text-text-600'}
            ${className ?? ''}
          `}
          {...commonProps}
        >
          <span
            className={cn(
              'border-b border-text-600 hover:border-primary-600 text-inherit text-xs',
              selectedValue === value
                ? 'border-b-0 font-bold'
                : 'border-b-text-600'
            )}
          >
            {children}
          </span>

          {separator && (
            <CaretRight
              size={16}
              className="text-text-600"
              data-testid="separator"
            />
          )}
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
    className={cn(
      'bg-background-500 w-[21px] h-[21px] flex items-center justify-center [&>svg]:w-[17px] [&>svg]:h-[17px] rounded-sm',
      className
    )}
    {...props}
  >
    {icon}
  </span>
);

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

interface MenuOverflowProps extends HTMLAttributes<HTMLDivElement> {
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
      className={cn('relative w-full overflow-hidden', className)}
    >
      {showLeftArrow && (
        <button
          onClick={() => internalScroll(containerRef.current, 'left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md cursor-pointer"
          data-testid="scroll-left-button"
        >
          <CaretLeft size={16} />
          <span className="sr-only">Scroll left</span>
        </button>
      )}

      <Menu
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        value={value}
        variant="menu2"
        {...props}
      >
        <MenuContent ref={containerRef} variant="menu2">
          {children}
        </MenuContent>
      </Menu>

      {showRightArrow && (
        <button
          onClick={() => internalScroll(containerRef.current, 'right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md cursor-pointer"
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
export { Menu, MenuContent, MenuItem, MenuOverflow, MenuItemIcon };
