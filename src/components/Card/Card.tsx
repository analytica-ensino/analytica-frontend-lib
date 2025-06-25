import { forwardRef, Fragment, HTMLAttributes, ReactNode } from 'react';
import Button from '../Button/Button';
import Badge from '../Badge/Badge';
import ProgressBar from '../ProgressBar/ProgressBar';

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

interface CardQuestionProps extends HTMLAttributes<HTMLDivElement> {
  header: string;
  state?: 'done' | 'undone';
  onClickButton?: (valueButton?: unknown) => void;
  valueButton?: unknown;
}

const CardQuestions = forwardRef<HTMLDivElement, CardQuestionProps>(
  (
    {
      header,
      state = 'undone',
      className,
      onClickButton,
      valueButton,
      ...props
    },
    ref
  ) => {
    const isDone = state === 'done';
    const stateLabel = isDone ? 'Realizado' : 'Não Realizado';
    const buttonLabel = isDone ? 'Ver Questão' : 'Responder';

    return (
      <div
        ref={ref}
        className={`
          w-full flex flex-row justify-between rounded-xl p-4 gap-4 bg-background border border-border-50
          ${className}
        `}
        {...props}
      >
        <section className="flex flex-col gap-1">
          <p className="font-bold text-xs text-text-950">{header}</p>

          <div className="flex flex-row gap-6 items-center">
            <Badge
              size="medium"
              variant="solid"
              action={isDone ? 'success' : 'error'}
            >
              {stateLabel}
            </Badge>

            <span className="flex flex-row items-center gap-1 text-text-700 text-xs">
              {isDone ? 'Nota' : 'Sem nota'}
              {isDone && (
                <Badge size="medium" action="success">
                  00
                </Badge>
              )}
            </span>
          </div>
        </section>

        <Button size="extra-small" onClick={() => onClickButton?.(valueButton)}>
          {buttonLabel}
        </Button>
      </div>
    );
  }
);

interface CardProgressProps extends HTMLAttributes<HTMLDivElement> {
  header: string;
  subhead?: string;
  initialDate?: string;
  endDate?: string;
  progress?: number;
  direction?: 'horizontal' | 'vertical';
  icon: ReactNode;
  color?: string;
}

const CardProgress = forwardRef<HTMLDivElement, CardProgressProps>(
  (
    {
      header,
      subhead,
      initialDate,
      endDate,
      progress = 0,
      direction = 'horizontal',
      icon,
      color = '#B7DFFF',
      className,
      ...props
    },
    ref
  ) => {
    const isHorizontal = direction === 'horizontal';
    const contentComponent = {
      horizontal: (
        <>
          <div className="flex flex-row gap-6 items-center">
            {initialDate && (
              <span className="flex flex-row gap-1 items-center text-2xs">
                <p className="text-text-800 font-semibold">Início</p>
                <p className="text-text-600">{initialDate}</p>
              </span>
            )}
            {endDate && (
              <span className="flex flex-row gap-1 items-center text-2xs">
                <p className="text-text-800 font-semibold">Fim</p>
                <p className="text-text-600">{endDate}</p>
              </span>
            )}
          </div>
          {progress !== undefined && (
            <ProgressBar
              size="medium"
              showPercentage
              value={progress}
              data-testid="progress-bar"
            />
          )}
        </>
      ),
      vertical: <p className="text-sm text-text-800">{subhead}</p>,
    };

    return (
      <div
        ref={ref}
        className={`
          w-full flex border border-border-50 rounded-xl
          ${isHorizontal ? 'flex-row h-20' : 'flex-col'}
          ${className}
        `}
        {...props}
      >
        <div
          className={`
            flex justify-center items-center [&>svg]:size-8 text-text-950
            ${
              isHorizontal
                ? 'w-20 h-full rounded-l-xl'
                : 'min-h-[50px] w-full rounded-t-xl'
            }
          `}
          style={{
            backgroundColor: color,
          }}
        >
          {icon}
        </div>

        <div
          className={`
            p-4 flex flex-col justify-between w-full h-full
            ${!isHorizontal && 'gap-4'}
          `}
        >
          <p className="text-xs font-bold text-text-950">{header}</p>
          {contentComponent[direction]}
        </div>
      </div>
    );
  }
);

interface CardTopicProps extends HTMLAttributes<HTMLDivElement> {
  header: string;
  subHead?: string[];
  progress: number;
  showPercentage?: boolean;
}

const CardTopic = forwardRef<HTMLDivElement, CardTopicProps>(
  (
    {
      header,
      subHead,
      progress,
      showPercentage = false,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`w-full py-2 px-4 flex flex-col justify-center gap-2 border border-border-50 rounded-xl min-h-20 ${className}`}
        {...props}
      >
        {subHead && (
          <span className="text-text-600 text-2xs flex flex-row gap-1">
            {subHead.map((text, index) => (
              <Fragment key={`${text} - ${index}`}>
                <p>{text}</p>
                {index < subHead.length - 1 && <p>•</p>}
              </Fragment>
            ))}
          </span>
        )}

        <p className="text-xs text-text-950 font-bold">{header}</p>

        <ProgressBar showPercentage={showPercentage} value={progress} />
      </div>
    );
  }
);

export { CardActivesResults, CardQuestions, CardProgress, CardTopic };
