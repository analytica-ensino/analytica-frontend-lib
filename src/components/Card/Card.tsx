import { forwardRef, HTMLAttributes, ReactNode } from 'react';

interface CardActivesResultsProps extends HTMLAttributes<HTMLDivElement> {
  icon: ReactNode;
  title: string;
  subTitle: string;
  header: string;
  description?: string;
  extended?: boolean;
  action?: 'warning' | 'success' | 'error' | 'info';
}

const ACTION_CARD_CLASSES = {
  warning: 'bg-warning-background',
  success: 'bg-success-300',
  error: 'bg-error-100',
  info: 'bg-info-background',
};

const ACTION_ICON_CLASSES = {
  warning: 'bg-warning-300 text-text',
  success: 'bg-yellow-300 text-text-950',
  error: 'bg-error-500 text-text',
  info: 'bg-info-500 text-text',
};

const ACTION_SUBTITLE_CLASSES = {
  warning: 'text-warning-600',
  success: 'text-success-700',
  error: 'text-error-700',
  info: 'text-info-700',
};

const ACTION_HEADER_CLASSES = {
  warning: 'text-warning-300',
  success: 'text-success-300',
  error: 'text-error-300',
  info: 'text-info-300',
};

const CardActivesResults = forwardRef<HTMLDivElement, CardActivesResultsProps>(
  (
    {
      icon,
      title,
      subTitle,
      header,
      extended = false,
      action = 'success',
      description,
      className,
      ...props
    },
    ref
  ) => {
    const actionCardClasses = ACTION_CARD_CLASSES[action];
    const actionIconClasses = ACTION_ICON_CLASSES[action];
    const actionSubTitleClasses = ACTION_SUBTITLE_CLASSES[action];
    const actionHeaderClasses = ACTION_HEADER_CLASSES[action];

    return (
      <div
        ref={ref}
        className={`w-full flex flex-col border border-border-50 bg-background rounded-xl ${className}`}
        {...props}
      >
        <div
          className={`
          flex flex-col gap-1 items-center justify-center p-4 
          ${actionCardClasses}
          ${extended ? 'rounded-t-xl' : 'rounded-xl'}`}
        >
          <span
            className={`size-7.5 rounded-full flex items-center justify-center ${actionIconClasses}`}
          >
            {icon}
          </span>

          <p className="text-text-800 font-medium uppercase text-2xs">
            {title}
          </p>

          <p className={`text-lg font-bold ${actionSubTitleClasses}`}>
            {subTitle}
          </p>
        </div>

        {extended && (
          <div className="flex flex-col items-center gap-2.5 pb-9.5 pt-2.5">
            <p
              className={`text-2xs font-medium uppercase ${actionHeaderClasses}`}
            >
              {header}
            </p>
            <p className="text-sm text-info-800 text-center">{description}</p>
          </div>
        )}
      </div>
    );
  }
);

export { CardActivesResults };
