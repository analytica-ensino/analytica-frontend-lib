import {
  Children,
  cloneElement,
  forwardRef,
  HTMLAttributes,
  isValidElement,
  ReactElement,
  useState,
} from 'react';
import { CardAccordationProps } from './Accordation';

interface AccordionGroupProps extends HTMLAttributes<HTMLDivElement> {
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean;
  children:
    | ReactElement<CardAccordationProps>
    | ReactElement<CardAccordationProps>[];
}

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
    const value = isControlled ? controlledValue : internalValue;

    const handleValueChange = (itemValue: string, isExpanded: boolean) => {
      let newValue: string | string[];

      if (type === 'single') {
        // Single mode: only one item can be open at a time
        if (isExpanded) {
          newValue = itemValue;
        } else {
          // If collapsible, allow closing the current item
          newValue = collapsible ? '' : (value as string);
        }
      } else {
        // Multiple mode: multiple items can be open
        const currentArray = Array.isArray(value) ? value : [];

        if (isExpanded) {
          newValue = [...currentArray, itemValue];
        } else {
          newValue = currentArray.filter((v) => v !== itemValue);
        }
      }

      if (!isControlled) {
        setInternalValue(newValue);
      }

      onValueChange?.(newValue);
    };

    const isItemExpanded = (itemValue: string): boolean => {
      if (type === 'single') {
        return value === itemValue;
      } else {
        return Array.isArray(value) && value.includes(itemValue);
      }
    };

    // Clone children and inject controlled props
    const enhancedChildren = Children.map(children, (child, index) => {
      if (!isValidElement(child)) {
        return child;
      }

      const itemValue = child.props.value || `accordion-item-${index}`;
      const expanded = isItemExpanded(itemValue);

      return cloneElement(child, {
        ...child.props,
        value: itemValue,
        expanded,
        onToggleExpanded: (isExpanded: boolean) => {
          handleValueChange(itemValue, isExpanded);
          child.props.onToggleExpanded?.(isExpanded);
        },
      });
    });

    return (
      <div ref={ref} className={className} {...props}>
        {enhancedChildren}
      </div>
    );
  }
);

AccordionGroup.displayName = 'AccordionGroup';

export { AccordionGroup };
export type { AccordionGroupProps };
