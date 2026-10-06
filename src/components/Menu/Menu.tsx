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
  useId,
  useMemo,
  createContext,
  useContext,
  type Ref,
} from 'react';
import { CaretLeftIcon } from '@phosphor-icons/react/dist/csr/CaretLeft';
import { CaretRightIcon } from '@phosphor-icons/react/dist/csr/CaretRight';
import { cn } from '../../utils/utils';
import Text from '../Text/Text';
import Button from '../Button/Button';

type MenuVariant =
  | 'menu'
  | 'menu2'
  | 'menu-overflow'
  | 'menu-overflow-col'
  | 'breadcrumb';

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
 * Papel ARIA do conjunto. Um menu de navegação, uma faixa de abas e um seletor
 * de opção única parecem iguais na tela, mas o leitor de tela precisa saber
 * qual é qual para anunciar "aba, selecionada" ou "botão de opção, marcado" e
 * o teclado precisa seguir o padrão de cada um (setas só em abas/rádios).
 */
export type MenuSemantics = 'menu' | 'tabs' | 'radio';

const CONTAINER_ROLE: Record<MenuSemantics, string> = {
  menu: 'menu',
  tabs: 'tablist',
  radio: 'radiogroup',
};

const ITEM_ROLE: Record<MenuSemantics, string> = {
  menu: 'menuitem',
  tabs: 'tab',
  radio: 'radio',
};

interface MenuContextValue {
  store: MenuStoreApi;
  semantics: MenuSemantics;
  /** Id of the hidden "selecionado" text referenced by the selected item. */
  selectedStateId: string;
  /** Id of the hidden "não selecionado" text referenced by the other items. */
  unselectedStateId: string;
}

const MenuContext = createContext<MenuContextValue | null>(null);

interface MenuContentContextValue {
  /** True when the content renders as a breadcrumb trail (`nav > ol`). */
  isBreadcrumb: boolean;
  /** Value of the single item reachable by Tab in tabs/radio semantics. */
  tabStopValue?: string;
}

const MenuContentContext = createContext<MenuContentContextValue>({
  isBreadcrumb: false,
});

const BREADCRUMB_CONTENT_CONTEXT: MenuContentContextValue = {
  isBreadcrumb: true,
};

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
  /**
   * ARIA pattern announced by the menu. `menu` (default) keeps the
   * `menu`/`menuitem` roles; `tabs` renders `tablist`/`tab` with
   * `aria-selected`; `radio` renders `radiogroup`/`radio` with `aria-checked`.
   * `tabs` and `radio` use a roving tabindex and arrow-key navigation.
   */
  semantics?: MenuSemantics;
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
      semantics = 'menu',
      ...props
    },
    ref
  ) => {
    const stateIdBase = useId();
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
    const { syncValue } = useStore(store, (s) => s);

    // Sync the controlled/default value into the store WITHOUT firing
    // onValueChange — a prop change is not a user click.
    useEffect(() => {
      syncValue(propValue ?? defaultValue);
    }, [defaultValue, propValue, syncValue]);

    const baseClasses = BASE_CLASSES_BY_VARIANT[variant];
    const variantClasses = VARIANT_CLASSES[variant];

    const contextValue = useMemo<MenuContextValue>(
      () => ({
        store,
        semantics,
        selectedStateId: `menu-state-selected-${stateIdBase}`,
        unselectedStateId: `menu-state-unselected-${stateIdBase}`,
      }),
      [store, semantics, stateIdBase]
    );

    return (
      <MenuContext.Provider value={contextValue}>
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
          {/*
           * `aria-selected` não vale em `menuitem` e trocar o papel para
           * `menuitemradio` mudaria o que o leitor anuncia. O estado sai por
           * descrição, apontando para estes textos ocultos fora do item: assim
           * o "selecionado" não vaza para o nome de quem deriva o nome do
           * conteúdo, e vale também para item sem `aria-label`.
           */}
          {semantics === 'menu' && (
            <>
              <Text as="span" id={contextValue.selectedStateId} hidden>
                selecionado
              </Text>
              <Text as="span" id={contextValue.unselectedStateId} hidden>
                não selecionado
              </Text>
            </>
          )}
        </div>
      </MenuContext.Provider>
    );
  }
);
Menu.displayName = 'Menu';

interface MenuContentProps extends HTMLAttributes<HTMLUListElement> {
  children: ReactNode;
  variant?: MenuVariant;
}

/** Fallback store so `useStore` can run when MenuContent sits outside a Menu. */
const DETACHED_STORE = createMenuStore(() => undefined);

const MenuContent = forwardRef<HTMLUListElement, MenuContentProps>(
  ({ className, children, variant = 'menu', ...props }, ref) => {
    const menuContext = useContext(MenuContext);
    const semantics = menuContext?.semantics ?? 'menu';
    const selectedValue = useStore(
      menuContext?.store ?? DETACHED_STORE,
      (s) => s.value
    );

    const baseClasses = 'w-full flex flex-row items-center gap-2';

    const isOverflowVariant =
      variant === 'menu2' ||
      variant === 'menu-overflow' ||
      variant === 'menu-overflow-col';
    const variantClasses = isOverflowVariant
      ? 'overflow-x-auto scroll-smooth'
      : '';

    const items = Children.toArray(children).filter(
      (child): child is ReactElement<Partial<MenuItemProps>> =>
        isValidElement<Partial<MenuItemProps>>(child) &&
        typeof child.props.value === 'string'
    );

    // Trilha de navegação não é menu: é uma lista ordenada de links dentro de
    // `nav`. Detecta pelos itens porque vários consumidores marcam só os
    // `MenuItem` com `variant="breadcrumb"` e deixam o `MenuContent` sem
    // variante.
    const isBreadcrumb =
      semantics === 'menu' &&
      (variant === 'breadcrumb' ||
        items.some((item) => item.props.variant === 'breadcrumb'));

    // Roving tabindex: só um item entra na ordem do Tab — o selecionado ou,
    // sem seleção válida, o primeiro habilitado — e as setas cuidam do resto.
    let tabStopValue: string | undefined;
    if (semantics !== 'menu') {
      const enabled = items.filter((item) => !item.props.disabled);
      tabStopValue =
        enabled.find((item) => item.props.value === selectedValue)?.props
          .value ?? enabled[0]?.props.value;
    }

    const listContext = useMemo<MenuContentContextValue>(
      () => ({ isBreadcrumb: false, tabStopValue }),
      [tabStopValue]
    );

    const listClasses = `
          ${baseClasses}
          ${variantClasses}
          ${variant == 'breadcrumb' ? 'flex-wrap' : ''}
          ${className ?? ''}
        `;

    if (isBreadcrumb) {
      const { 'aria-label': ariaLabel, ...listProps } = props;
      return (
        <MenuContentContext.Provider value={BREADCRUMB_CONTENT_CONTEXT}>
          <nav
            aria-label={ariaLabel ?? 'Trilha de navegação'}
            className="w-full"
          >
            <ol
              ref={ref as unknown as Ref<HTMLOListElement>}
              className={listClasses}
              {...listProps}
            >
              {children}
            </ol>
          </nav>
        </MenuContentContext.Provider>
      );
    }

    return (
      <MenuContentContext.Provider value={listContext}>
        <ul
          ref={ref}
          // Sem isto cada item fica órfão — `menuitem` precisa de um `menu`,
          // `tab` de um `tablist` e `radio` de um `radiogroup`. Com o papel
          // correto no pai, o leitor de tela também deriva a posição ("1 de 2")
          // sozinho. Vem antes de `...props` para o consumidor poder sobrepor.
          role={CONTAINER_ROLE[semantics]}
          className={listClasses}
          style={
            isOverflowVariant
              ? { scrollbarWidth: 'none', msOverflowStyle: 'none' }
              : undefined
          }
          {...props}
        >
          {children}
        </ul>
      </MenuContentContext.Provider>
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

/** Arrow keys shared by tabs and radios, mapped to the target index. */
const ROVING_KEYS = new Map<string, (index: number, total: number) => number>([
  ['ArrowRight', (index, total) => (index + 1) % total],
  ['ArrowLeft', (index, total) => (index - 1 + total) % total],
  ['Home', () => 0],
  ['End', (index, total) => total - 1],
]);

/** Vertical arrows only move within a radio group (tabs here are horizontal). */
const RADIO_ONLY_KEYS = new Map<
  string,
  (index: number, total: number) => number
>([
  ['ArrowDown', (index, total) => (index + 1) % total],
  ['ArrowUp', (index, total) => (index - 1 + total) % total],
]);

/**
 * Moves focus and selection to a sibling item, following the WAI-ARIA tabs and
 * radio group keyboard patterns (automatic activation).
 *
 * @param current - The item that received the key press
 * @param key - The pressed key
 * @param semantics - The menu semantics (`tabs` or `radio`)
 * @returns `true` when the key was handled
 */
const moveToSibling = (
  current: HTMLElement,
  key: string,
  semantics: MenuSemantics
): boolean => {
  const getTarget =
    ROVING_KEYS.get(key) ??
    (semantics === 'radio' ? RADIO_ONLY_KEYS.get(key) : undefined);
  if (!getTarget || !current.parentElement) return false;

  const siblings = Array.from(
    current.parentElement.querySelectorAll<HTMLElement>(
      `:scope > [role="${ITEM_ROLE[semantics]}"]:not([aria-disabled="true"])`
    )
  );
  if (siblings.length === 0) return false;

  const target =
    siblings[getTarget(siblings.indexOf(current), siblings.length)];
  target.focus();
  target.click();
  return true;
};

/**
 * Resolves the item's tabindex: disabled items leave the tab order, menu items
 * are all tabbable, and tabs/radios use a roving tabindex.
 *
 * @param disabled - Whether the item is disabled
 * @param isRoving - Whether the menu uses a roving tabindex
 * @param isTabStop - Whether this item is the group's tab stop
 * @returns The tabindex value
 */
const getItemTabIndex = (
  disabled: boolean,
  isRoving: boolean,
  isTabStop: boolean
): number => {
  if (disabled) return -1;
  if (!isRoving || isTabStop) return 0;
  return -1;
};

/**
 * Cada semântica anuncia a seleção do jeito que o leitor de tela espera:
 * aba com `aria-selected`, rádio com `aria-checked`. Em `menuitem` nenhum
 * dos dois é válido, então o estado sai por descrição apontando para os
 * textos ocultos do Menu — fecha "próximas, item de menu, 1 de 2,
 * selecionado". Uma descrição do consumidor tem precedência.
 *
 * @param semantics - Semantics of the parent menu
 * @param isSelected - Whether the item is the selected one
 * @param menuContext - Parent menu context (holds the hidden state text ids)
 * @param consumerDescribedBy - `aria-describedby` passed by the consumer
 * @returns Role and state attributes for the item
 */
const getItemRoleProps = (
  semantics: MenuSemantics,
  isSelected: boolean,
  menuContext: MenuContextValue | null,
  consumerDescribedBy: string | undefined
): HTMLAttributes<HTMLLIElement> => {
  if (semantics === 'tabs') {
    return { role: 'tab', 'aria-selected': isSelected };
  }
  if (semantics === 'radio') {
    return { role: 'radio', 'aria-checked': isSelected };
  }
  if (!menuContext || consumerDescribedBy !== undefined) {
    return { role: 'menuitem' };
  }
  return {
    role: 'menuitem',
    'aria-describedby': isSelected
      ? menuContext.selectedStateId
      : menuContext.unselectedStateId,
  };
};

interface BreadcrumbItemProps extends HTMLAttributes<HTMLLIElement> {
  isSelected: boolean;
  disabled: boolean;
  separator: boolean;
  onItemSelect: (e: MouseEvent<HTMLElement>) => void;
}

/**
 * Trilha de navegação: o item atual é texto com `aria-current="page"` (não
 * é uma ação) e os anteriores são botões de verdade. O separador é só
 * decoração e sai da árvore de acessibilidade.
 */
const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  (
    {
      isSelected,
      disabled,
      separator,
      onItemSelect,
      onClick: consumerOnClick,
      className,
      children,
      ...itemProps
    },
    ref
  ) => (
    <li
      ref={ref}
      data-variant="breadcrumb"
      className={`
        flex flex-row gap-2 items-center w-fit p-2 rounded-lg font-bold text-xs
        ${isSelected ? 'text-text-950' : 'text-text-600'}
        ${className ?? ''}
      `}
      {...itemProps}
    >
      {isSelected ? (
        <Text
          as="span"
          aria-current="page"
          className="text-inherit text-xs font-bold"
        >
          {children}
        </Text>
      ) : (
        <Button
          variant="raw"
          disabled={disabled}
          // Mesmo contrato de antes: com `onClick` do consumidor só ele
          // roda (navegação); sem ele, o clique seleciona o item.
          onClick={(e) =>
            consumerOnClick
              ? consumerOnClick(e as unknown as MouseEvent<HTMLLIElement>)
              : onItemSelect(e)
          }
          className="border-b border-b-text-600 hover:border-primary-600 hover:text-primary-600 text-inherit text-xs font-bold cursor-pointer rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indicator-info"
        >
          {children}
        </Button>
      )}

      {separator && (
        <CaretRightIcon
          size={16}
          className="text-text-600"
          data-testid="separator"
          aria-hidden="true"
        />
      )}
    </li>
  )
);
BreadcrumbItem.displayName = 'BreadcrumbItem';

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
    const menuContext = useContext(MenuContext);
    const { isBreadcrumb, tabStopValue } = useContext(MenuContentContext);
    const semantics = menuContext?.semantics ?? 'menu';
    const store = useMenuStore(externalStore ?? menuContext?.store);
    const { value: selectedValue, setValue } = useStore(store, (s) => s);

    const handleClick = (
      e: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>
    ) => {
      if (!disabled) {
        setValue(value);
      }
      props.onClick?.(e as MouseEvent<HTMLLIElement>);
    };

    const isSelected = selectedValue === value;

    if (isBreadcrumb && variant === 'breadcrumb') {
      return (
        <BreadcrumbItem
          ref={ref}
          isSelected={isSelected}
          disabled={disabled}
          separator={separator}
          onItemSelect={handleClick}
          className={className}
          {...props}
        >
          {children}
        </BreadcrumbItem>
      );
    }

    const roleProps = getItemRoleProps(
      semantics,
      isSelected,
      menuContext,
      props['aria-describedby']
    );

    const isRoving = semantics !== 'menu';
    const isTabStop =
      tabStopValue === undefined ? isSelected : tabStopValue === value;

    const commonProps = {
      ...roleProps,
      'aria-disabled': disabled,
      ref,
      onClick: handleClick,
      onKeyDown: (e: KeyboardEvent<HTMLLIElement>) => {
        if (['Enter', ' '].includes(e.key)) {
          handleClick(e);
          return;
        }
        if (isRoving && moveToSibling(e.currentTarget, e.key, semantics)) {
          e.preventDefault();
        }
      },
      tabIndex: getItemTabIndex(disabled, isRoving, isTabStop),
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
            ${isSelected ? 'bg-primary-50 text-primary-950' : 'text-text-950'}
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
            ${isSelected ? '' : 'pb-4'}
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
          {isSelected && (
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
            ${isSelected ? '' : 'pb-4'}
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
          {isSelected && (
            <div className="h-1 w-full bg-primary-950 rounded-lg" />
          )}
        </li>
      ),
      'menu-overflow-col': (
        <li
          data-variant="menu-overflow-col"
          className={cn(
            'flex-1 min-w-fit flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-sm font-medium text-xs whitespace-nowrap [&>svg]:size-6 cursor-pointer hover:bg-primary-600 hover:text-text focus:outline-none focus:border-indicator-info focus:border-2',
            isSelected ? 'bg-primary-50 text-primary-950' : 'text-text-950',
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
            ${isSelected ? 'text-text-950' : 'text-text-600'}
            ${className ?? ''}
          `}
          {...commonProps}
        >
          <span
            className={cn(
              'border-b border-text-600 hover:border-primary-600 text-inherit text-xs',
              isSelected ? 'border-b-0 font-bold' : 'border-b-text-600'
            )}
          >
            {children}
          </span>

          {separator && (
            <CaretRightIcon
              size={16}
              className="text-text-600"
              data-testid="separator"
              aria-hidden="true"
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
  /** ARIA pattern of the strip — see {@link MenuProps.semantics}. */
  semantics?: MenuSemantics;
}

const MenuOverflow = ({
  children,
  className,
  defaultValue,
  value,
  onValueChange,
  semantics,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
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
          type="button"
          onClick={() => internalScroll(containerRef.current, 'left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md cursor-pointer"
          data-testid="scroll-left-button"
        >
          <CaretLeftIcon size={16} aria-hidden="true" />
          <Text as="span" className="sr-only">
            Rolar para a esquerda
          </Text>
        </button>
      )}

      <Menu
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        value={value}
        variant="menu2"
        semantics={semantics}
        {...props}
      >
        {/* O nome vai para o elemento com papel (lista), não para o wrapper. */}
        <MenuContent
          ref={containerRef}
          variant="menu2"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
        >
          {children}
        </MenuContent>
      </Menu>

      {showRightArrow && (
        <button
          type="button"
          onClick={() => internalScroll(containerRef.current, 'right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md cursor-pointer"
          data-testid="scroll-right-button"
        >
          <CaretRightIcon size={16} aria-hidden="true" />
          <Text as="span" className="sr-only">
            Rolar para a direita
          </Text>
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
