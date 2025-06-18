import { HTMLAttributes } from 'react';

/**
 * Divider component props interface
 */
type DividerProps = {
  /** Orientation of the divider */
  orientation?: 'horizontal' | 'vertical';
  /** Additional CSS classes to apply */
  className?: string;
} & HTMLAttributes<HTMLHRElement>;

/**
 * Divider component for Analytica Ensino platforms
 *
 * A simple divider component that creates a visual separation between content sections.
 * Can be used both horizontally and vertically.
 *
 * @param orientation - The orientation of the divider (horizontal or vertical)
 * @param className - Additional CSS classes
 * @param props - All other standard hr HTML attributes
 * @returns A styled divider element
 *
 * @example
 * ```tsx
 * <Divider orientation="horizontal" />
 * <Divider orientation="vertical" className="h-8" />
 * ```
 */
const Divider = ({
  orientation = 'horizontal',
  className = '',
  ...props
}: DividerProps) => {
  const baseClasses = 'bg-border-200 border-0';

  const orientationClasses = {
    horizontal: 'w-full h-px',
    vertical: 'h-full w-px',
  };

  return (
    <hr
      className={`${baseClasses} ${orientationClasses[orientation]} ${className}`}
      aria-orientation={orientation}
      {...props}
    />
  );
};

export default Divider;
