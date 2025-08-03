import {
  InputHTMLAttributes,
  HTMLAttributes,
  ReactNode,
  forwardRef,
  useId,
  useEffect,
  useRef,
  Children,
  cloneElement,
  isValidElement,
  ReactElement,
} from 'react';
import { create, StoreApi, useStore } from 'zustand';
import CheckBox from './CheckBox';
import { cn } from '../../utils/utils';

/**
 * CheckboxList size variants
 */
type CheckboxListSize = 'small' | 'medium' | 'large';

/**
 * CheckboxList visual state
 */
type CheckboxListState =
  | 'default'
  | 'hovered'
  | 'focused'
  | 'invalid'
  | 'disabled';

/**
 * CheckboxList store interface
 */
interface CheckboxListStore {
  values: string[];
  setValues: (values: string[]) => void;
  toggleValue: (value: string) => void;
  onValuesChange?: (values: string[]) => void;
  disabled: boolean;
  name: string;
}

type CheckboxListStoreApi = StoreApi<CheckboxListStore>;

/**
 * Create a new CheckboxList store
 */
const createCheckboxListStore = (
  name: string,
  defaultValues: string[],
  disabled: boolean,
  onValuesChange?: (values: string[]) => void
): CheckboxListStoreApi =>
  create<CheckboxListStore>((set, get) => ({
    values: defaultValues,
    setValues: (values) => {
      if (!get().disabled) {
        set({ values });
        get().onValuesChange?.(values);
      }
    },
    toggleValue: (value) => {
      if (!get().disabled) {
        const currentValues = get().values;
        const newValues = currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value];
        set({ values: newValues });
        get().onValuesChange?.(newValues);
      }
    },
    onValuesChange,
    disabled,
    name,
  }));

/**
 * Hook to access CheckboxList store
 */
export const useCheckboxListStore = (externalStore?: CheckboxListStoreApi) => {
  if (!externalStore) {
    throw new Error('CheckboxListItem must be used within a CheckboxList');
  }
  return externalStore;
};

/**
 * Inject store into CheckboxListItem children
 */
const injectStore = (
  children: ReactNode,
  store: CheckboxListStoreApi
): ReactNode =>
  Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const typedChild = child as ReactElement<any>;
    const shouldInject = typedChild.type === CheckboxListItem;
    return cloneElement(typedChild, {
      ...(shouldInject ? { store } : {}),
      ...(typedChild.props.children
        ? { children: injectStore(typedChild.props.children, store) }
        : {}),
    });
  });

/**
 * CheckboxList component props interface
 */
export type CheckboxListProps = {
  /** Current selected values */
  values?: string[];
  /** Default selected values for uncontrolled usage */
  defaultValues?: string[];
  /** Callback when selection changes */
  onValuesChange?: (values: string[]) => void;
  /** Group name for all checkboxes */
  name?: string;
  /** Disabled state for the entire group */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Children components */
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValues'>;

/**
 * CheckboxList component for flexible checkbox group composition
 *
 * Uses Zustand for state management with automatic store injection.
 * Allows complete control over layout and styling by composing with CheckboxListItem.
 *
 * @example
 * ```tsx
 * <CheckboxList defaultValues={["option1"]} onValuesChange={setValues}>
 *   <div className="flex items-center gap-3">
 *     <CheckboxListItem value="option1" id="c1" />
 *     <label htmlFor="c1">Option 1</label>
 *   </div>
 *   <div className="flex items-center gap-3">
 *     <CheckboxListItem value="option2" id="c2" />
 *     <label htmlFor="c2">Option 2</label>
 *   </div>
 * </CheckboxList>
 * ```
 */
const CheckboxList = forwardRef<HTMLDivElement, CheckboxListProps>(
  (
    {
      values: propValues,
      defaultValues = [],
      onValuesChange,
      name: propName,
      disabled = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    // Generate unique name if not provided
    const generatedId = useId();
    const name = propName || `checkbox-list-${generatedId}`;

    // Create store reference
    const storeRef = useRef<CheckboxListStoreApi>(null);
    storeRef.current ??= createCheckboxListStore(
      name,
      defaultValues,
      disabled,
      onValuesChange
    );
    const store = storeRef.current;

    // Get store actions
    const { setValues } = useStore(store, (s) => s);

    // Call onValuesChange with initial values
    useEffect(() => {
      const currentValues = store.getState().values;
      if (currentValues.length > 0 && onValuesChange) {
        onValuesChange(currentValues);
      }
    }, [store, onValuesChange]);

    // Handle controlled values changes
    useEffect(() => {
      if (propValues !== undefined) {
        setValues(propValues);
      }
    }, [propValues, setValues]);

    // Update disabled state
    useEffect(() => {
      store.setState({ disabled });
    }, [disabled, store]);

    return (
      <div
        ref={ref}
        className={cn('flex flex-col gap-2 w-full', className)}
        role="group"
        aria-label={name}
        {...props}
      >
        {injectStore(children, store)}
      </div>
    );
  }
);

CheckboxList.displayName = 'CheckboxList';

/**
 * CheckboxListItem component props interface
 */
export type CheckboxListItemProps = {
  /** Value for this checkbox item */
  value: string;
  /** Store reference (automatically injected by CheckboxList) */
  store?: CheckboxListStoreApi;
  /** Disabled state for this specific item */
  disabled?: boolean;
  /** Size variant */
  size?: CheckboxListSize;
  /** Visual state */
  state?: CheckboxListState;
  /** Additional CSS classes */
  className?: string;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'name' | 'value' | 'checked' | 'onChange' | 'size'
>;

/**
 * CheckboxListItem component for use within CheckboxList
 *
 * A checkbox without label that works within CheckboxList context.
 * Provides just the checkbox input for maximum flexibility in composition.
 *
 * @example
 * ```tsx
 * <CheckboxList defaultValues={["option1"]}>
 *   <div className="flex items-center gap-3">
 *     <CheckboxListItem value="option1" id="c1" />
 *     <label htmlFor="c1">Option 1</label>
 *   </div>
 * </CheckboxList>
 * ```
 */
const CheckboxListItem = forwardRef<HTMLInputElement, CheckboxListItemProps>(
  (
    {
      value,
      store: externalStore,
      disabled: itemDisabled,
      size = 'medium',
      state = 'default',
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    // Get store and state
    const store = useCheckboxListStore(externalStore);
    const {
      values: groupValues,
      toggleValue,
      disabled: groupDisabled,
      name,
    } = useStore(store);

    // Generate unique ID if not provided
    const generatedId = useId();
    const inputId = id ?? `checkbox-item-${generatedId}`;

    // Determine states
    const isChecked = groupValues.includes(value);
    const isDisabled = groupDisabled || itemDisabled;
    const currentState = isDisabled ? 'disabled' : state;

    // Use standard CheckBox component for consistency and simplicity
    return (
      <CheckBox
        ref={ref}
        id={inputId}
        name={name}
        value={value}
        checked={isChecked}
        disabled={isDisabled}
        size={size}
        state={currentState}
        className={className}
        onChange={() => {
          if (!isDisabled) {
            toggleValue(value);
          }
        }}
        {...props}
      />
    );
  }
);

CheckboxListItem.displayName = 'CheckboxListItem';

export default CheckboxList;
export { CheckboxListItem };
