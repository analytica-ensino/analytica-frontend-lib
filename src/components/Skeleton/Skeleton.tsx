import React, { forwardRef, HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'none';
  lines?: number;
  spacing?: 'none' | 'small' | 'medium' | 'large';
}

const SKELETON_ANIMATION_CLASSES = {
  pulse: 'animate-pulse',
  none: '',
};

const SKELETON_VARIANT_CLASSES = {
  text: 'h-4 bg-background-200 rounded',
  circular: 'bg-background-200 rounded-full',
  rectangular: 'bg-background-200',
  rounded: 'bg-background-200 rounded-lg',
};

const SPACING_CLASSES = {
  none: '',
  small: 'space-y-1',
  medium: 'space-y-2',
  large: 'space-y-3',
};

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = 'text',
      width,
      height,
      animation = 'pulse',
      lines = 1,
      spacing = 'none',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const animationClass = SKELETON_ANIMATION_CLASSES[animation];
    const variantClass = SKELETON_VARIANT_CLASSES[variant];
    const spacingClass = SPACING_CLASSES[spacing];

    const style: React.CSSProperties = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
    };

    // Se for múltiplas linhas de texto
    if (variant === 'text' && lines > 1) {
      return (
        <div
          ref={ref}
          className={`flex flex-col ${spacingClass} ${className}`}
          {...props}
        >
          {Array.from({ length: lines }, (_, index) => (
            <div
              key={index}
              className={`${variantClass} ${animationClass}`}
              style={index === lines - 1 ? { width: '60%' } : undefined}
            />
          ))}
        </div>
      );
    }

    // Se for um único elemento
    return (
      <div
        ref={ref}
        className={`${variantClass} ${animationClass} ${className}`}
        style={style}
        {...props}
      >
        {children}
      </div>
    );
  }
);

// Componentes específicos para casos comuns
const SkeletonText = forwardRef<HTMLDivElement, Omit<SkeletonProps, 'variant'>>(
  (props, ref) => <Skeleton ref={ref} variant="text" {...props} />
);

const SkeletonCircle = forwardRef<
  HTMLDivElement,
  Omit<SkeletonProps, 'variant'>
>((props, ref) => <Skeleton ref={ref} variant="circular" {...props} />);

const SkeletonRectangle = forwardRef<
  HTMLDivElement,
  Omit<SkeletonProps, 'variant'>
>((props, ref) => <Skeleton ref={ref} variant="rectangular" {...props} />);

const SkeletonRounded = forwardRef<
  HTMLDivElement,
  Omit<SkeletonProps, 'variant'>
>((props, ref) => <Skeleton ref={ref} variant="rounded" {...props} />);

// Componente para card skeleton
interface SkeletonCardProps extends HTMLAttributes<HTMLDivElement> {
  showAvatar?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showActions?: boolean;
  lines?: number;
}

const SkeletonCard = forwardRef<HTMLDivElement, SkeletonCardProps>(
  (
    {
      showAvatar = true,
      showTitle = true,
      showDescription = true,
      showActions = true,
      lines = 2,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`w-full p-4 bg-background border border-border-200 rounded-lg ${className}`}
        {...props}
      >
        <div className="flex items-start space-x-3">
          {showAvatar && <SkeletonCircle width={40} height={40} />}

          <div className="flex-1 space-y-2">
            {showTitle && <SkeletonText width="60%" height={20} />}

            {showDescription && <SkeletonText lines={lines} spacing="small" />}
          </div>
        </div>

        {showActions && (
          <div className="flex justify-end space-x-2 mt-4">
            <SkeletonRectangle width={80} height={32} />
            <SkeletonRectangle width={80} height={32} />
          </div>
        )}
      </div>
    );
  }
);

// Componente para lista skeleton
interface SkeletonListProps extends HTMLAttributes<HTMLDivElement> {
  items?: number;
  showAvatar?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  lines?: number;
}

const SkeletonList = forwardRef<HTMLDivElement, SkeletonListProps>(
  (
    {
      items = 3,
      showAvatar = true,
      showTitle = true,
      showDescription = true,
      lines = 1,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} className={`space-y-3 ${className}`} {...props}>
        {Array.from({ length: items }, (_, index) => (
          <div key={index} className="flex items-start space-x-3 p-3">
            {showAvatar && <SkeletonCircle width={32} height={32} />}

            <div className="flex-1 space-y-2">
              {showTitle && <SkeletonText width="40%" height={16} />}

              {showDescription && (
                <SkeletonText lines={lines} spacing="small" />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }
);

// Componente para tabela skeleton
interface SkeletonTableProps extends HTMLAttributes<HTMLDivElement> {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

const SkeletonTable = forwardRef<HTMLDivElement, SkeletonTableProps>(
  (
    { rows = 5, columns = 4, showHeader = true, className = '', ...props },
    ref
  ) => {
    return (
      <div ref={ref} className={`w-full ${className}`} {...props}>
        {showHeader && (
          <div className="flex space-x-2 mb-3">
            {Array.from({ length: columns }, (_, index) => (
              <SkeletonText
                key={index}
                width={`${100 / columns}%`}
                height={20}
              />
            ))}
          </div>
        )}

        <div className="space-y-2">
          {Array.from({ length: rows }, (_, rowIndex) => (
            <div key={rowIndex} className="flex space-x-2">
              {Array.from({ length: columns }, (_, colIndex) => (
                <SkeletonText
                  key={colIndex}
                  width={`${100 / columns}%`}
                  height={16}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

export {
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  SkeletonRectangle,
  SkeletonRounded,
  SkeletonCard,
  SkeletonList,
  SkeletonTable,
};
