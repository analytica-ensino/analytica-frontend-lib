import { forwardRef, Fragment, HTMLAttributes, ReactNode } from 'react';
import Button from '../Button/Button';
import Badge from '../Badge/Badge';
import ProgressBar from '../ProgressBar/ProgressBar';
import {
  CaretRight,
  ChatCircleText,
  CheckCircle,
  DotsThreeVertical,
  Play,
  XCircle,
} from 'phosphor-react';

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
        className={`w-full flex flex-col border border-border-50  bg-background rounded-xl ${className}`}
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

        <span>
          <Button
            size="extra-small"
            onClick={() => onClickButton?.(valueButton)}
          >
            {buttonLabel}
          </Button>
        </span>
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
          <ProgressBar
            size="medium"
            showPercentage
            value={progress}
            data-testid="progress-bar"
          />
        </>
      ),
      vertical: <p className="text-sm text-text-800">{subhead}</p>,
    };

    return (
      <div
        ref={ref}
        className={`
          w-full flex border border-border-50 bg-background rounded-xl cursor-pointer
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
        className={`cursor-pointer w-full py-2 px-4 flex flex-col justify-center gap-2 bg-background border border-border-50 rounded-xl min-h-20 ${className}`}
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

interface CardPerformanceProps extends HTMLAttributes<HTMLDivElement> {
  header: string;
  description?: string;
  progress?: number;
  onClickButton?: (valueButton?: unknown) => void;
  valueButton?: unknown;
}

const CardPerformance = forwardRef<HTMLDivElement, CardPerformanceProps>(
  (
    {
      header,
      progress,
      description = 'Sem dados ainda! Você ainda não fez um questionário neste assunto.',
      className = '',
      onClickButton,
      valueButton,
      ...props
    },
    ref
  ) => {
    const hasProgress = progress !== undefined;

    return (
      <div
        ref={ref}
        className={`w-full min-h-20.5 flex flex-row justify-between p-4 gap-2 bg-background border border-border-50 ${className}`}
        {...props}
      >
        <div className="w-full flex flex-col justify-between gap-2">
          <div className="flex flex-row justify-between items-center">
            <p className="text-md font-bold text-text-950">{header}</p>
            {hasProgress && (
              <Button
                variant="outline"
                size="extra-small"
                onClick={() => onClickButton?.(valueButton)}
              >
                Ver Aula
              </Button>
            )}
          </div>

          <div className="w-full">
            {hasProgress ? (
              <ProgressBar value={progress} label={`${progress}% corretas`} />
            ) : (
              <p className="text-xs text-text-600">{description}</p>
            )}
          </div>
        </div>

        {!hasProgress && (
          <CaretRight
            className="size-4.5 text-text-800 cursor-pointer"
            data-testid="caret-icon"
            onClick={() => onClickButton?.(valueButton)}
          />
        )}
      </div>
    );
  }
);

interface CardResultsProps extends HTMLAttributes<HTMLDivElement> {
  header: string;
  icon: ReactNode;
  correct_answers: number;
  incorrect_answers: number;
  direction?: 'row' | 'col';
  color?: string;
}

const CardResults = forwardRef<HTMLDivElement, CardResultsProps>(
  (
    {
      header,
      correct_answers,
      incorrect_answers,
      icon,
      direction = 'col',
      color = '#B7DFFF',
      className,
      ...props
    },
    ref
  ) => {
    const isRow = direction == 'row';

    return (
      <div
        ref={ref}
        className={`
          w-full flex border border-border-50 bg-background rounded-xl min-h-20 flex-row items-center pr-4
          ${className}
        `}
        {...props}
      >
        <div
          className={`
              flex justify-center items-center [&>svg]:size-8 text-text-950 min-w-20 max-w-20 h-full rounded-l-xl
            `}
          style={{
            backgroundColor: color,
          }}
        >
          {icon}
        </div>

        <div
          className={`
            p-4 flex justify-between w-full h-full
            ${isRow ? 'flex-row items-center' : 'flex-col'}
          `}
        >
          <p className="text-xs font-bold text-text-950">{header}</p>
          <span className="flex flex-row gap-1 items-center">
            <Badge
              action="success"
              variant="solid"
              size="medium"
              iconLeft={<CheckCircle />}
            >
              {correct_answers} Corretas
            </Badge>

            <Badge
              action="error"
              variant="solid"
              size="medium"
              iconLeft={<XCircle />}
            >
              {incorrect_answers} Incorretas
            </Badge>
          </span>
        </div>

        <CaretRight className="min-w-6 min-h-6 text-text-800 cursor-pointer" />
      </div>
    );
  }
);

interface CardStatusProps extends HTMLAttributes<HTMLDivElement> {
  header: string;
  status?: 'correct' | 'incorrect';
}

const CardStatus = forwardRef<HTMLDivElement, CardStatusProps>(
  ({ header, className, status, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          w-full flex border border-border-50 bg-background rounded-xl min-h-20 flex-row items-center pr-4
          ${className}
        `}
        {...props}
      >
        <div
          className={`
            p-4 flex justify-between w-full h-full flex-row items-center
          `}
        >
          <p className="text-xs font-bold text-text-950">{header}</p>
          {status && (
            <span className="flex flex-row gap-1 items-center">
              <Badge
                action={status == 'correct' ? 'success' : 'error'}
                variant="solid"
                size="medium"
                iconLeft={<CheckCircle />}
              >
                {status == 'correct' ? 'Correta' : 'Incorreta'}
              </Badge>

              <p className="text-sm text-text-800">Respondida</p>
            </span>
          )}
        </div>

        <CaretRight className="min-w-6 min-h-6 text-text-800 cursor-pointer" />
      </div>
    );
  }
);

interface CardSettingsProps extends HTMLAttributes<HTMLDivElement> {
  icon: ReactNode;
  header: string;
}

const CardSettings = forwardRef<HTMLDivElement, CardSettingsProps>(
  ({ header, className, icon, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`w-full p-2 flex flex-row items-center gap-2 text-text-700 bg-background rounded-xl ${className}`}
        {...props}
      >
        <span className="[&>svg]:size-6">{icon}</span>

        <p className="w-full text-md">{header}</p>

        <CaretRight size={24} className="cursor-pointer" />
      </div>
    );
  }
);

interface CardSupportProps extends HTMLAttributes<HTMLDivElement> {
  header: string;
  direction?: 'row' | 'col';
  children: ReactNode;
}

const CardSupport = forwardRef<HTMLDivElement, CardSupportProps>(
  ({ header, className, direction = 'col', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`w-full p-4 flex flex-row items-center gap-2 text-text-700  bg-background rounded-xl ${className}`}
        {...props}
      >
        <div
          className={`
              w-full flex ${direction == 'col' ? 'flex-col' : 'flex-row items-center'}  gap-2
          `}
        >
          <span className="w-full">
            <p className="text-xs text-text-950 font-bold">{header}</p>
          </span>
          <span className="flex flex-row gap-1">{children}</span>
        </div>

        <CaretRight className="text-text-800 cursor-pointer" size={24} />
      </div>
    );
  }
);

interface CardForumProps<T = unknown> extends HTMLAttributes<HTMLDivElement> {
  title: string;
  content: string;
  comments: number;
  date: string;
  hour: string;
  onClickComments?: (value?: T) => void;
  valueComments?: T;
  onClickProfile?: (profile?: T) => void;
  valueProfile?: T;
}

const CardForum = forwardRef<HTMLDivElement, CardForumProps>(
  (
    {
      title,
      content,
      comments,
      onClickComments,
      valueComments,
      onClickProfile,
      valueProfile,
      className = '',
      date,
      hour,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`w-auto h-auto p-4 rounded-lg flex flex-row gap-3 border border-border-100 bg-background ${className}`}
        {...props}
      >
        <button
          type="button"
          aria-label="Ver perfil"
          onClick={() => onClickProfile?.(valueProfile)}
          className="min-w-8 h-8 rounded-full bg-background-950"
        />

        <div className="flex flex-col gap-2 flex-1">
          <div className="flex flex-row gap-1 items-center flex-wrap">
            <p className="text-xs font-semibold text-primary-700 truncate">
              {title}
            </p>
            <p className="text-xs text-text-600">
              • {date} • {hour}
            </p>
          </div>

          <p className="text-text-950 text-sm line-clamp-2">{content}</p>

          <button
            type="button"
            aria-label="Ver comentários"
            onClick={() => onClickComments?.(valueComments)}
            className="text-text-600 flex flex-row gap-2 items-center"
          >
            <ChatCircleText aria-hidden="true" size={16} />
            <p className="text-xs">{comments} respostas</p>
          </button>
        </div>
      </div>
    );
  }
);

const CardAudio = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`w-auto h-14 p-4 flex flex-row bg-background items-center gap-1 ${className}`}
        {...props}
      >
        <Play size={24} className="cursor-pointer text-text-950" />
        <p className="text-text-800 text-sm font-medium">0:00</p>
        <ProgressBar value={20} size="small" className="w-[228px]" />
        <p className="text-text-800 text-sm font-medium">0:00</p>
        <DotsThreeVertical size={24} className="text-text-950 cursor-pointer" />
      </div>
    );
  }
);

export {
  CardActivesResults,
  CardQuestions,
  CardProgress,
  CardTopic,
  CardPerformance,
  CardResults,
  CardStatus,
  CardSettings,
  CardSupport,
  CardForum,
  CardAudio,
};
