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
import { CaretLeftIcon } from '@phosphor-icons/react/dist/csr/CaretLeft';
import { CaretRightIcon } from '@phosphor-icons/react/dist/csr/CaretRight';
import { cn } from '../../utils/utils';

type MenuVariant =
  | 'menu'
  | 'menu2'
  | 'menu-overflow'
  | 'menu-overflow-col'
  | 'breadcrumb';

/**
 * Todo variant menos `breadcrumb` é uma aba: a seleção troca o painel abaixo
 * (`menu`/`menu2`/`menu-overflow*`). Por isso o papel é `tab`/`tablist`, que é
 * o único par em que `aria-selected` é válido e lido — era o que faltava para o
 * leitor de tela anunciar qual aba está ativa.
 *
 * `breadcrumb` não é aba nem seleção: o item "ativo" é a página atual, então
 * fica em `menuitem` + `aria-current="page"`.
 */
const isTabVariant = (variant: MenuVariant) => variant !== 'breadcrumb';

interface MenuStore {
  value: string;
  /** User-initiated selection (e.g. a MenuItem click): fires `onValueChange`. */
  setValue: (value: string) => void;
  /**
   * Syncs the controlled `value`/`defaultValue` prop into the store WITHOUT
   * firing `onValueChange`. A prop change is not a user selection, so it must
   * not dispatch a click — otherwise a route-driven `value` change would
   * trigger navigation (e.g. bouncing `/atividades/detalhes/:id` back to
   * `/atividades`).
   */
  syncValue: (value: string) => void;
}

type MenuStoreApi = StoreApi<MenuStore>;

/**
 * The store is created once per Menu and never recreated, so it takes a *getter*
 * rather than the callback itself. Closing over `onValueChange` directly would
 * pin the consumer's handler to its first render: a handler that resolves the
 * clicked value against state — which item does this id belong to? — would keep
 * searching the state as it was at mount, and any value that appeared later
 * would never resolve. The click then highlights the item while the consumer
 * never learns about it.
 */
const createMenuStore = (
  getOnValueChange: () => ((value: string) => void) | undefined
): MenuStoreApi =>
  create<MenuStore>((set) => ({
    value: '',
    setValue: (value) => {
      set({ value });
      getOnValueChange()?.(value);
    },
    syncValue: (value) =>
      set((state) => (state.value === value ? state : { value })),
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
  'menu-overflow-col': 'bg-background shadow-soft-shadow-1',
  breadcrumb: 'bg-transparent shadow-none !px-0',
};

const BASE_CLASSES_BY_VARIANT: Record<MenuVariant, string> = {
  menu: 'w-full py-2 flex flex-row items-center justify-center',
  menu2: 'w-full py-2 flex flex-row items-center justify-center',
  'menu-overflow': 'w-fit py-2 flex flex-row items-center justify-center',
  'menu-overflow-col': 'w-full py-2 flex flex-row items-center justify-start',
  breadcrumb: 'w-full py-2 flex flex-row items-center justify-center',
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
    // Kept in a ref so the store, which outlives every render, always reaches the
    // current handler. Written in an effect rather than during render: a render
    // React throws away must not leave its callback behind, and a click can only
    // follow a commit, so the ref is current by the time `setValue` reads it.
    const onValueChangeRef = useRef(onValueChange);
    useEffect(() => {
      onValueChangeRef.current = onValueChange;
    }, [onValueChange]);

    const storeRef = useRef<MenuStoreApi>(null);
    storeRef.current ??= createMenuStore(() => onValueChangeRef.current);
    const store = storeRef.current;
    const { syncValue, value: selectedValue } = useStore(store, (s) => s);

    /**
     * Quem fica na ordem do Tab (roving tab stop do padrão de abas): a aba
     * selecionada, para quem chega de Tab cair direto nela. Decidido aqui, não
     * em cada item, porque só o Menu vê a lista toda — e se o `value` não casar
     * com nenhum item (ex.: seleção que chega depois dos dados), o primeiro item
     * assume o tab stop, senão a lista inteira ficaria fora do teclado.
     */
    const itemValues = collectItemValues(children);
    const tabStopValue = itemValues.includes(selectedValue)
      ? selectedValue
      : itemValues[0];

    // Sync the controlled/default value into the store WITHOUT firing
    // onValueChange — a prop change is not a user click.
    useEffect(() => {
      syncValue(propValue ?? defaultValue);
    }, [defaultValue, propValue, syncValue]);

    const baseClasses = BASE_CLASSES_BY_VARIANT[variant];
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
        {injectStore(children, store, tabStopValue)}
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

    const isOverflowVariant =
      variant === 'menu2' ||
      variant === 'menu-overflow' ||
      variant === 'menu-overflow-col';
    const variantClasses = isOverflowVariant
      ? 'overflow-x-auto scroll-smooth'
      : '';

    return (
      <ul
        ref={ref}
        // Sem isto cada item fica órfão — `tab` precisa de um `tablist` que o
        // possua, `menuitem` de um `menu`. Com o papel correto no pai, o leitor
        // de tela também deriva a posição ("1 de 2") sozinho, sem
        // `aria-posinset`/`aria-setsize` na mão. Vem antes de `...props` para o
        // consumidor poder sobrepor quando for o caso.
        role={isTabVariant(variant) ? 'tablist' : 'menu'}
        className={`
          ${baseClasses}
          ${variantClasses}
          ${variant == 'breadcrumb' ? 'flex-wrap' : ''}
          ${className ?? ''}
        `}
        style={
          isOverflowVariant
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
  /**
   * Valor do item que fica na ordem do Tab. Injetado pelo Menu, que é quem vê a
   * lista inteira — não passe à mão.
   */
  tabStopValue?: string;
  variant?: MenuVariant;
  separator?: boolean;
}

/** Setas que andam entre abas: direita avança, esquerda volta, com a volta ao começo/fim. */
const ARROW_STEP: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };

const MenuItem = forwardRef<HTMLLIElement, MenuItemProps>(
  (
    {
      className,
      children,
      value,
      disabled = false,
      store: externalStore,
      tabStopValue,
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

    const isSelected = selectedValue === value;

    /**
     * A seleção só existia como classe de fundo e barrinha — invisível para
     * leitor de tela. Como aba (todo variant menos `breadcrumb`), o estado sai
     * em `aria-selected`, o slot nativo do papel `tab`: o leitor fecha a frase
     * em "próximas atividades, aba, selecionada, 1 de 2". O painel que a aba
     * controla é do consumidor, que o liga pelo `aria-controls` repassado em
     * `...props`.
     *
     * No `breadcrumb` não há aba nem seleção — o item ativo é a página atual,
     * anunciada por `aria-current="page"`.
     */
    const isTab = isTabVariant(variant);

    /**
     * Roving tab stop: numa lista de abas só uma entra na ordem do Tab — a
     * selecionada (quem chega de Tab cai na aba ativa, não na primeira), e o
     * passeio entre as abas é por seta. Sem isso o Tab percorria uma aba por
     * vez, o que o padrão de abas reserva para sair da lista.
     *
     * O `breadcrumb` fica de fora: são links de navegação, cada um na ordem do
     * Tab como antes. `tabStopValue` indefinido (Menu sem item casando) também
     * mantém todos focáveis, para nunca sobrar lista inalcançável.
     */
    const isTabStop =
      !isTab || tabStopValue === undefined || tabStopValue === value;

    /** Move o foco para a aba vizinha sem trocar a seleção — ativar é Enter/Espaço. */
    const moveFocus = (e: KeyboardEvent<HTMLLIElement>, step: number): void => {
      const tabs = Array.from(
        e.currentTarget
          .closest('[role="tablist"]')
          ?.querySelectorAll<HTMLElement>(
            '[role="tab"]:not([aria-disabled="true"])'
          ) ?? []
      );
      const current = tabs.indexOf(e.currentTarget);
      const next = tabs[(current + step + tabs.length) % tabs.length];
      if (current === -1 || !next || next === e.currentTarget) return;
      e.preventDefault();
      next.focus();
    };

    const commonProps = {
      ...(isTab
        ? { role: 'tab', 'aria-selected': isSelected }
        : {
            role: 'menuitem',
            ...(isSelected && { 'aria-current': 'page' as const }),
          }),
      'aria-disabled': disabled,
      ref,
      onClick: handleClick,
      onKeyDown: (e: KeyboardEvent<HTMLLIElement>) => {
        if (['Enter', ' '].includes(e.key)) {
          handleClick(e);
          return;
        }
        const step = isTab ? ARROW_STEP[e.key] : undefined;
        if (step !== undefined) moveFocus(e, step);
      },
      tabIndex: disabled || !isTabStop ? -1 : 0,
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
      'menu-overflow-col': (
        <li
          data-variant="menu-overflow-col"
          className={cn(
            'flex-1 min-w-fit flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-sm font-medium text-xs whitespace-nowrap [&>svg]:size-6 cursor-pointer hover:bg-primary-600 hover:text-text focus:outline-none focus:border-indicator-info focus:border-2',
            selectedValue === value
              ? 'bg-primary-50 text-primary-950'
              : 'text-text-950',
            className
          )}
          {...commonProps}
        >
          {children}
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
            <CaretRightIcon
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

    // Use MutationObserver to detect when children are added/removed
    let mutationObserver: MutationObserver | null = null;
    if (container) {
      mutationObserver = new MutationObserver(checkScroll);
      mutationObserver.observe(container, { childList: true, subtree: true });
    }

    return () => {
      container?.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
      mutationObserver?.disconnect();
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
          <CaretLeftIcon size={16} />
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
          <CaretRightIcon size={16} />
          <span className="sr-only">Scroll right</span>
        </button>
      )}
    </div>
  );
};

/**
 * Valores dos itens habilitados, na ordem em que aparecem. Serve só para o Menu
 * escolher qual aba fica na ordem do Tab; item desabilitado fica fora porque não
 * pode receber foco. Percorre a mesma árvore de `injectStore`, então vale para
 * os itens dentro do MenuContent.
 */
const collectItemValues = (
  children: ReactNode,
  out: string[] = []
): string[] => {
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const typedChild = child as ReactElement<any>;
    if (typedChild.type === MenuItem && !typedChild.props.disabled) {
      out.push(typedChild.props.value);
    }
    if (typedChild.props.children) {
      collectItemValues(typedChild.props.children, out);
    }
  });
  return out;
};

const injectStore = (
  children: ReactNode,
  store: MenuStoreApi,
  tabStopValue?: string
): ReactNode =>
  Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const typedChild = child as ReactElement<any>;
    const shouldInject = typedChild.type === MenuItem;
    return cloneElement(typedChild, {
      ...(shouldInject ? { store, tabStopValue } : {}),
      ...(typedChild.props.children
        ? {
            children: injectStore(
              typedChild.props.children,
              store,
              tabStopValue
            ),
          }
        : {}),
    });
  });

export default Menu;
export { Menu, MenuContent, MenuItem, MenuOverflow, MenuItemIcon };
