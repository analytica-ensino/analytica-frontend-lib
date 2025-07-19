import { forwardRef, HTMLAttributes, ReactNode, useState } from "react";
import { CardBase } from "../Card/Card";
import Text from "../Text/Text";
import { CaretRight } from "phosphor-react";

interface CardAccordationProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  onToggleExpanded?: (isExpanded: boolean) => void;
}

const CardAccordation = forwardRef<HTMLDivElement, CardAccordationProps>(
  ({ title, children, className, defaultExpanded = false, onToggleExpanded, ...props }, ref) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const handleToggle = () => {
      const newExpanded = !isExpanded;
      setIsExpanded(newExpanded);
      onToggleExpanded?.(newExpanded);
    };

    return (
      <CardBase
        ref={ref}
        layout="vertical"
        padding="none"
        minHeight="none"
        className={`overflow-hidden ${className}`}
        {...props}
      >
        {/* Header clicável */}
        <div
          onClick={handleToggle}
          className="w-full cursor-pointer p-4 flex items-center justify-between gap-3 text-left transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
          aria-expanded={isExpanded}
          aria-controls="accordion-content"
        >
          <Text size="sm" weight="bold" className="text-text-950 truncate flex-1">
            {title}
          </Text>
          
          <CaretRight
            size={20}
            className={`text-text-700 transition-transform duration-200 flex-shrink-0 ${
              isExpanded ? 'rotate-90' : 'rotate-0'
            }`}
            data-testid="accordion-caret"
          />
        </div>

        {/* Conteúdo expansível */}
        <div
          id="accordion-content"
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}
          data-testid="accordion-content"
        >
          <div className="p-4 pt-0 border-border-50">
            {children}
          </div>
        </div>
      </CardBase>
    );
  }
);

export {
  CardAccordation
};