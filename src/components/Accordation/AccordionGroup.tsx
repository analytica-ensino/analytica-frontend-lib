import {
  Children,
  cloneElement,
  forwardRef,
  HTMLAttributes,
  isValidElement,
  ReactElement,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { create, StoreApi } from 'zustand';
import { CardAccordationProps } from './Accordation';

interface AccordionGroupStore {
  type: 'single' | 'multiple';
  value: string | string[];
  collapsible: boolean;
  setValue: (value: string | string[]) => void;
  isItemExpanded: (itemValue: string) => boolean;
}

type AccordionGroupStoreApi = StoreApi<AccordionGroupStore>;

function createAccordionGroupStore(
  type: 'single' | 'multiple',
  initialValue: string | string[],
  collapsible: boolean
): AccordionGroupStoreApi {
  return create<AccordionGroupStore>((set, get) => ({
    type,
    value: initialValue,
    collapsible,
    setValue: (value) => set({ value }),
    isItemExpanded: (itemValue: string): boolean => {
      const state = get();
      if (state.type === 'single') {
        return state.value === itemValue;
      } else {
        return Array.isArray(state.value) && state.value.includes(itemValue);
      }
    },
  }));
}

interface AccordionGroupProps extends HTMLAttributes<HTMLDivElement> {
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean;
  children: ReactNode;
}

// Helper function to inject store only to CardAccordation components
const injectStore = (
  children: ReactNode,
  store: AccordionGroupStoreApi,
  indexRef: { current: number },
  onItemToggle: (itemValue: string, isExpanded: boolean) => void
): ReactNode => {
  return Children.map(children, (child) => {
    if (!isValidElement(child)) {
      return child;
    }

    const typedChild = child as ReactElement<
      CardAccordationProps & {
        children?: ReactNode;
      }
    >;

    // Check if it's a CardAccordation component
    const displayName = (typedChild.type as unknown as { displayName?: string })
      ?.displayName;

    let newProps: Partial<{
      children: ReactNode;
      value: string;
      expanded: boolean;
      onToggleExpanded: (isExpanded: boolean) => void;
    }> = {};

    if (displayName === 'CardAccordation') {
      // Generate value if not provided
      const itemValue =
        typedChild.props.value || `accordion-item-${indexRef.current++}`;

      // Get expanded state from store
      const storeState = store.getState();
      const expanded = storeState.isItemExpanded(itemValue);

      newProps.value = itemValue;
      newProps.expanded = expanded;
      newProps.onToggleExpanded = (isExpanded: boolean) => {
        onItemToggle(itemValue, isExpanded);
        typedChild.props.onToggleExpanded?.(isExpanded);
      };
    }

    // Recursively process children
    if (typedChild.props.children) {
      const processedChildren = injectStore(
        typedChild.props.children,
        store,
        indexRef,
        onItemToggle
      );

      // If it's a CardAccordation, add children to newProps
      if (displayName === 'CardAccordation') {
        newProps.children = processedChildren;
      } else if (processedChildren !== typedChild.props.children) {
        // For other elements, only clone if children changed
        return cloneElement(typedChild, { children: processedChildren });
      }
    }

    // Only clone if we have props to inject (only for CardAccordation)
    if (Object.keys(newProps).length > 0) {
      return cloneElement(typedChild, newProps);
    }

    return child;
  });
};

const AccordionGroup = forwardRef<HTMLDivElement, AccordionGroupProps>(
  (
    {
      type = 'single',
      defaultValue,
      value: controlledValue,
      onValueChange,
      collapsible = true,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState<string | string[]>(
      defaultValue || (type === 'single' ? '' : [])
    );

    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : internalValue;

    // Create store only once using useRef
    const storeRef = useRef<AccordionGroupStoreApi | null>(null);
    if (storeRef.current) {
      // Update store configuration when props change
      storeRef.current.setState((prev) => {
        const nextState: Partial<AccordionGroupStore> = {};
        if (prev.type !== type) {
          nextState.type = type;
        }
        if (prev.collapsible !== collapsible) {
          nextState.collapsible = collapsible;
        }
        return nextState;
      });
    } else {
      // Create store on first render
      storeRef.current = createAccordionGroupStore(
        type,
        currentValue,
        collapsible
      );
    }
    const store = storeRef.current;

    // Sync store value when currentValue changes
    useEffect(() => {
      store.setState({ value: currentValue });
    }, [currentValue, store]);

    // Normalize internal value when type changes (uncontrolled mode)
    useEffect(() => {
      if (!isControlled) {
        setInternalValue((prev) => {
          if (type === 'single') {
            if (Array.isArray(prev)) {
              return prev[0] ?? '';
            }
            return typeof prev === 'string' ? prev : '';
          }
          if (Array.isArray(prev)) {
            return prev;
          }
          return prev ? [prev] : [];
        });
      }
    }, [isControlled, type]);

    const handleItemToggle = (itemValue: string, isExpanded: boolean) => {
      const storeState = store.getState();
      let newValue: string | string[];

      if (type === 'single') {
        // Single mode: only one item can be open at a time
        if (isExpanded) {
          newValue = itemValue;
        } else {
          // If collapsible, allow closing the current item
          newValue = collapsible ? '' : (storeState.value as string);
        }
      } else {
        // Multiple mode: multiple items can be open
        const currentArray = Array.isArray(storeState.value)
          ? storeState.value
          : [];

        if (isExpanded) {
          newValue = [...currentArray, itemValue];
        } else {
          newValue = currentArray.filter((v) => v !== itemValue);
        }
      }

      if (!isControlled) {
        setInternalValue(newValue);
      }
      store.setState({ value: newValue });
      onValueChange?.(newValue);
    };

    // Use ref to track index across recursive calls
    const indexRef = { current: 0 };
    const enhancedChildren = injectStore(
      children,
      store,
      indexRef,
      handleItemToggle
    );

    return (
      <div ref={ref} className={className} {...props}>
        {enhancedChildren}
      </div>
    );
  }
);

AccordionGroup.displayName = 'AccordionGroup';

export { AccordionGroup };
