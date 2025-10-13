import {
  forwardRef,
  HTMLAttributes,
  KeyboardEvent,
  ReactNode,
  useId,
  useState,
  useEffect,
} from 'react';
import { CardBase } from '../Card/Card';
import { CaretRight } from 'phosphor-react';
import { cn } from '../../utils/utils';

interface CardAccordationProps extends HTMLAttributes<HTMLDivElement> {
  trigger: ReactNode;
  children: ReactNode;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onToggleExpanded?: (isExpanded: boolean) => void;
  value?: string;
}

const CardAccordation = forwardRef<HTMLDivElement, CardAccordationProps>(
  (
    {
      trigger,
      children,
      className,
      defaultExpanded = false,
      expanded: controlledExpanded,
      onToggleExpanded,
      value,
      ...props
    },
    ref
  ) => {
    const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
    const generatedId = useId();

    // Use value as ID base for better semantics, fallback to generated ID
    const contentId = value ? `accordion-content-${value}` : generatedId;
    const headerId = value
      ? `accordion-header-${value}`
      : `${generatedId}-header`;

    // Determine if component is controlled
    const isControlled = controlledExpanded !== undefined;
    const isExpanded = isControlled ? controlledExpanded : internalExpanded;

    // Sync internal state when controlled value changes
    useEffect(() => {
      if (isControlled) {
        setInternalExpanded(controlledExpanded);
      }
    }, [isControlled, controlledExpanded]);

    const handleToggle = () => {
      const newExpanded = !isExpanded;

      if (!isControlled) {
        setInternalExpanded(newExpanded);
      }

      onToggleExpanded?.(newExpanded);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleToggle();
      }
    };

    return (
      <CardBase
        ref={ref}
        layout="vertical"
        padding="none"
        minHeight="none"
        className={cn('overflow-hidden', className)}
        {...props}
      >
        {/* Clickable header */}
        <button
          id={headerId}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          className="w-full cursor-pointer text-text-950 not-aria-expanded:rounded-xl aria-expanded:rounded-t-xl p-4 flex items-center justify-between gap-3 text-left transition-colors duration-200 focus:outline-none focus:border-2 focus:border-primary-950 focus:ring-inset"
          aria-expanded={isExpanded}
          aria-controls={contentId}
          data-value={value}
        >
          {trigger}

          <CaretRight
            size={20}
            className={cn(
              'text-text-700 transition-transform duration-200 flex-shrink-0',
              isExpanded ? 'rotate-90' : 'rotate-0'
            )}
            data-testid="accordion-caret"
          />
        </button>

        {/* Expandable content */}
        <div
          id={contentId}
          role="region"
          aria-labelledby={headerId}
          className={cn(
            'transition-all duration-300 ease-in-out overflow-hidden',
            isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          )}
          data-testid="accordion-content"
          data-value={value}
        >
          <div className="p-4 pt-0 border-border-50">{children}</div>
        </div>
      </CardBase>
    );
  }
);

CardAccordation.displayName = 'CardAccordation';

export { CardAccordation };
export type { CardAccordationProps };
