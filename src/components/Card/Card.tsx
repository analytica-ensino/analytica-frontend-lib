import {
  forwardRef,
  Fragment,
  HTMLAttributes,
  ReactNode,
  useState,
  useRef,
  MouseEvent,
  ChangeEvent,
  KeyboardEvent,
  Ref,
} from 'react';
import Button from '../Button/Button';
import Badge from '../Badge/Badge';
import ProgressBar from '../ProgressBar/ProgressBar';
import {
  CaretRight,
  ChatCircleText,
  CheckCircle,
  Clock,
  DotsThreeVertical,
  Play,
  SpeakerHigh,
  SpeakerLow,
  SpeakerSimpleX,
  XCircle,
} from 'phosphor-react';
import Text from '../Text/Text';
import { cn } from '../../utils/utils';

// Componente base reutilizável para todos os cards
interface CardBaseProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'compact' | 'minimal';
  layout?: 'horizontal' | 'vertical';
  padding?: 'none' | 'small' | 'medium' | 'large';
  minHeight?: 'none' | 'small' | 'medium' | 'large';
  cursor?: 'default' | 'pointer';
}

const CARD_BASE_CLASSES = {
  default: 'w-full bg-background border border-border-50 rounded-xl',
  compact: 'w-full bg-background border border-border-50 rounded-lg',
  minimal: 'w-full bg-background border border-border-100 rounded-md',
};

const CARD_PADDING_CLASSES = {
  none: '',
  small: 'p-2',
  medium: 'p-4',
  large: 'p-6',
};

const CARD_MIN_HEIGHT_CLASSES = {
  none: '',
  small: 'min-h-16',
  medium: 'min-h-20',
  large: 'min-h-24',
};

const CARD_LAYOUT_CLASSES = {
  horizontal: 'flex flex-row',
  vertical: 'flex flex-col',
};

const CARD_CURSOR_CLASSES = {
  default: '',
  pointer: 'cursor-pointer',
};

const CardBase = forwardRef<HTMLDivElement, CardBaseProps>(
  (
    {
      children,
      variant = 'default',
      layout = 'horizontal',
      padding = 'medium',
      minHeight = 'medium',
      cursor = 'default',
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses = CARD_BASE_CLASSES[variant];
    const paddingClasses = CARD_PADDING_CLASSES[padding];
    const minHeightClasses = CARD_MIN_HEIGHT_CLASSES[minHeight];
    const layoutClasses = CARD_LAYOUT_CLASSES[layout];
    const cursorClasses = CARD_CURSOR_CLASSES[cursor];

    const combinedClasses = [
      baseClasses,
      paddingClasses,
      minHeightClasses,
      layoutClasses,
      cursorClasses,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={combinedClasses} {...props}>
        {children}
      </div>
    );
  }
);

interface CardActivitiesResultsProps extends HTMLAttributes<HTMLDivElement> {
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
  success: 'bg-success-200',
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

const CardActivitiesResults = forwardRef<
  HTMLDivElement,
  CardActivitiesResultsProps
>(
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
        className={cn(
          'w-full flex flex-col border border-border-50  bg-background rounded-xl',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'flex flex-col gap-1 items-center justify-center p-4',
            actionCardClasses,
            extended ? 'rounded-t-xl' : 'rounded-xl'
          )}
        >
          <span
            className={cn(
              'size-7.5 rounded-full flex items-center justify-center',
              actionIconClasses
            )}
          >
            {icon}
          </span>

          <Text
            size="2xs"
            weight="medium"
            className="text-text-800 uppercase truncate"
          >
            {title}
          </Text>

          <p
            className={cn('text-lg font-bold truncate', actionSubTitleClasses)}
          >
            {subTitle}
          </p>
        </div>

        {extended && (
          <div className="flex flex-col items-center gap-2.5 pb-9.5 pt-2.5">
            <p
              className={cn(
                'text-2xs font-medium uppercase truncate',
                actionHeaderClasses
              )}
            >
              {header}
            </p>
            <Badge size="large" action="info">
              {description}
            </Badge>
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
      <CardBase
        ref={ref}
        layout="horizontal"
        padding="medium"
        minHeight="medium"
        className={cn('justify-between gap-4', className)}
        {...props}
      >
        <section className="flex flex-col gap-1 flex-1 min-w-0">
          <p className="font-bold text-xs text-text-950 truncate">{header}</p>

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

        <span className="flex-shrink-0">
          <Button
            size="extra-small"
            onClick={() => onClickButton?.(valueButton)}
            className="min-w-fit"
          >
            {buttonLabel}
          </Button>
        </span>
      </CardBase>
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
  progressVariant?: 'blue' | 'green';
  showDates?: boolean;
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
      progressVariant = 'blue',
      showDates = true,
      className,
      ...props
    },
    ref
  ) => {
    const isHorizontal = direction === 'horizontal';
    const contentComponent = {
      horizontal: (
        <>
          {showDates && (
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
          )}
          <span className="grid grid-cols-[1fr_auto] items-center gap-2">
            <ProgressBar
              size="small"
              value={progress}
              variant={progressVariant}
              data-testid="progress-bar"
            />

            <Text
              size="xs"
              weight="medium"
              className={cn(
                'text-text-950 leading-none tracking-normal text-center flex-none'
              )}
            >
              {Math.round(progress)}%
            </Text>
          </span>
        </>
      ),
      vertical: <p className="text-sm text-text-800">{subhead}</p>,
    };

    return (
      <CardBase
        ref={ref}
        layout={isHorizontal ? 'horizontal' : 'vertical'}
        padding="none"
        minHeight="medium"
        cursor="pointer"
        className={cn(isHorizontal ? 'h-20' : '', className)}
        {...props}
      >
        <div
          className={cn(
            'flex justify-center items-center [&>svg]:size-6 text-text-950',
            isHorizontal
              ? 'min-w-[80px] min-h-[80px] rounded-l-xl'
              : 'min-h-[50px] w-full rounded-t-xl',
            !color.startsWith('#') ? `bg-${color}` : ''
          )}
          style={color.startsWith('#') ? { backgroundColor: color } : undefined}
          data-testid="icon-container"
        >
          {icon}
        </div>

        <div
          className={cn(
            'p-4 flex flex-col justify-between w-full h-full',
            !isHorizontal && 'gap-4'
          )}
        >
          <Text size="sm" weight="bold" className="text-text-950 truncate">
            {header}
          </Text>
          {contentComponent[direction]}
        </div>
      </CardBase>
    );
  }
);

interface CardTopicProps extends HTMLAttributes<HTMLDivElement> {
  header: string;
  subHead?: string[];
  progress: number;
  showPercentage?: boolean;
  progressVariant?: 'blue' | 'green';
}

const CardTopic = forwardRef<HTMLDivElement, CardTopicProps>(
  (
    {
      header,
      subHead,
      progress,
      showPercentage = false,
      progressVariant = 'blue',
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <CardBase
        ref={ref}
        layout="vertical"
        padding="small"
        minHeight="medium"
        cursor="pointer"
        className={cn('justify-center gap-2  py-2 px-4', className)}
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

        <p className="text-sm text-text-950 font-bold truncate">{header}</p>

        <span className="grid grid-cols-[1fr_auto] items-center gap-2">
          <ProgressBar
            size="small"
            value={progress}
            variant={progressVariant}
            data-testid="progress-bar"
          />
          {showPercentage && (
            <Text
              size="xs"
              weight="medium"
              className={cn(
                'text-text-950 leading-none tracking-normal text-center flex-none'
              )}
            >
              {Math.round(progress)}%
            </Text>
          )}
        </span>
      </CardBase>
    );
  }
);

interface CardPerformanceProps extends HTMLAttributes<HTMLDivElement> {
  header: string;
  description?: string;
  progress?: number;
  labelProgress?: string;
  actionVariant?: 'button' | 'caret';
  progressVariant?: 'blue' | 'green';
  onClickButton?: (valueButton?: unknown) => void;
  valueButton?: unknown;
}

const CardPerformance = forwardRef<HTMLDivElement, CardPerformanceProps>(
  (
    {
      header,
      progress,
      description = 'Sem dados ainda! Você ainda não fez um questionário neste assunto.',
      actionVariant = 'button',
      progressVariant = 'blue',
      labelProgress = '',
      className = '',
      onClickButton,
      valueButton,
      ...props
    },
    ref
  ) => {
    const hasProgress = progress !== undefined;

    return (
      <CardBase
        ref={ref}
        layout="horizontal"
        padding="medium"
        minHeight="none"
        className={cn(
          actionVariant == 'caret' ? 'cursor-pointer' : '',
          className
        )}
        onClick={() => actionVariant == 'caret' && onClickButton?.(valueButton)}
        {...props}
      >
        <div className="w-full flex flex-col justify-between gap-2">
          <div className="flex flex-row justify-between items-center gap-2">
            <p className="text-lg font-bold text-text-950 truncate flex-1 min-w-0">
              {header}
            </p>
            {actionVariant === 'button' && (
              <Button
                variant="outline"
                size="extra-small"
                onClick={() => onClickButton?.(valueButton)}
                className="min-w-fit flex-shrink-0"
              >
                Ver Aula
              </Button>
            )}
          </div>

          <div className="w-full">
            {hasProgress ? (
              <ProgressBar
                value={progress}
                label={`${progress}% ${labelProgress}`}
                variant={progressVariant}
              />
            ) : (
              <p className="text-xs text-text-600 truncate">{description}</p>
            )}
          </div>
        </div>

        {actionVariant == 'caret' && (
          <CaretRight
            className="size-4.5 text-text-800 cursor-pointer"
            data-testid="caret-icon"
          />
        )}
      </CardBase>
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
      <CardBase
        ref={ref}
        layout="horizontal"
        padding="none"
        minHeight="medium"
        className={cn('items-center cursor-pointer pr-4', className)}
        {...props}
      >
        <div
          className={cn(
            'flex justify-center items-center [&>svg]:size-8 text-text-950 min-w-20 max-w-20 min-h-20 h-full rounded-l-xl'
          )}
          style={{
            backgroundColor: color,
          }}
        >
          {icon}
        </div>

        <div
          className={cn(
            'p-4 flex justify-between w-full h-full',
            isRow ? 'flex-row items-center gap-2' : 'flex-col'
          )}
        >
          <p className="text-sm font-bold text-text-950 truncate flex-1 min-w-0">
            {header}
          </p>
          <span className="flex flex-row gap-1 items-center">
            <Badge
              action="success"
              variant="solid"
              size="large"
              iconLeft={<CheckCircle />}
            >
              {correct_answers} Corretas
            </Badge>

            <Badge
              action="error"
              variant="solid"
              size="large"
              iconLeft={<XCircle />}
            >
              {incorrect_answers} Incorretas
            </Badge>
          </span>
        </div>

        <CaretRight className="min-w-6 min-h-6 text-text-800" />
      </CardBase>
    );
  }
);

interface CardStatusProps extends HTMLAttributes<HTMLDivElement> {
  header: string;
  status?: 'correct' | 'incorrect' | 'unanswered';
  label?: string;
}

const CardStatus = forwardRef<HTMLDivElement, CardStatusProps>(
  ({ header, className, status, label, ...props }, ref) => {
    const getLabelBadge = (status: CardStatusProps['status']) => {
      switch (status) {
        case 'correct':
          return 'Correta';
        case 'incorrect':
          return 'Incorreta';
        case 'unanswered':
          return 'Em branco';
        default:
          return 'Em branco';
      }
    };
    return (
      <CardBase
        ref={ref}
        layout="horizontal"
        padding="medium"
        minHeight="medium"
        className={cn('items-center cursor-pointer', className)}
        {...props}
      >
        <div className="flex justify-between w-full h-full flex-row items-center gap-2">
          <p className="text-sm font-bold text-text-950 truncate flex-1 min-w-0">
            {header}
          </p>
          <span className="flex flex-row gap-1 items-center flex-shrink-0">
            {status && (
              <Badge
                action={status == 'correct' ? 'success' : 'error'}
                variant="solid"
                size="medium"
                iconLeft={status == 'correct' ? <CheckCircle /> : <XCircle />}
              >
                {getLabelBadge(status)}
              </Badge>
            )}
            {label && <p className="text-sm text-text-800">{label}</p>}
          </span>
          <CaretRight className="min-w-6 min-h-6 text-text-800 cursor-pointer flex-shrink-0 ml-2" />
        </div>
      </CardBase>
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
      <CardBase
        ref={ref}
        layout="horizontal"
        padding="small"
        minHeight="none"
        className={cn(
          'border-none items-center gap-2 text-text-700',
          className
        )}
        {...props}
      >
        <span className="[&>svg]:size-6">{icon}</span>

        <p className="w-full text-sm truncate">{header}</p>

        <CaretRight size={24} className="cursor-pointer" />
      </CardBase>
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
      <CardBase
        ref={ref}
        layout="horizontal"
        padding="medium"
        minHeight="none"
        className={cn(
          'border-none items-center gap-2 text-text-700',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'w-full flex',
            direction == 'col' ? 'flex-col' : 'flex-row items-center'
          )}
        >
          <span className="w-full min-w-0">
            <p className="text-sm text-text-950 font-bold truncate">{header}</p>
          </span>
          <span className="flex flex-row gap-1">{children}</span>
        </div>

        <CaretRight className="text-text-800 cursor-pointer" size={24} />
      </CardBase>
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
      <CardBase
        ref={ref}
        layout="horizontal"
        padding="medium"
        minHeight="none"
        variant="minimal"
        className={cn('w-auto h-auto gap-3', className)}
        {...props}
      >
        <button
          type="button"
          aria-label="Ver perfil"
          onClick={() => onClickProfile?.(valueProfile)}
          className="min-w-8 h-8 rounded-full bg-background-950"
        />

        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <div className="flex flex-row gap-1 items-center flex-wrap">
            <p className="text-xs font-semibold text-primary-700 truncate">
              {title}
            </p>
            <p className="text-xs text-text-600">
              • {date} • {hour}
            </p>
          </div>

          <p className="text-text-950 text-sm line-clamp-2 truncate">
            {content}
          </p>

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
      </CardBase>
    );
  }
);

interface CardAudioProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  title?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onAudioTimeUpdate?: (currentTime: number, duration: number) => void;
  loop?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  tracks?: Array<{
    kind: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata';
    src: string;
    srcLang: string;
    label: string;
    default?: boolean;
  }>;
}

const CardAudio = forwardRef<HTMLDivElement, CardAudioProps>(
  (
    {
      src,
      title,
      onPlay,
      onPause,
      onEnded,
      onAudioTimeUpdate,
      loop = false,
      preload = 'metadata',
      tracks,
      className,
      ...props
    },
    ref
  ) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [showVolumeControl, setShowVolumeControl] = useState(false);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const audioRef = useRef<HTMLAudioElement>(null);

    const formatTime = (time: number) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handlePlayPause = () => {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
        onPause?.();
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
        onPlay?.();
      }
    };

    const handleTimeUpdate = () => {
      const current = audioRef.current?.currentTime ?? 0;
      const total = audioRef.current?.duration ?? 0;

      setCurrentTime(current);
      setDuration(total);
      onAudioTimeUpdate?.(current, total);
    };

    const handleLoadedMetadata = () => {
      setDuration(audioRef.current?.duration ?? 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onEnded?.();
    };

    const handleProgressClick = (e: MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const percentage = clickX / width;
      const newTime = percentage * duration;

      if (audioRef.current) {
        audioRef.current.currentTime = newTime;
      }
      setCurrentTime(newTime);
    };

    const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);
      if (audioRef.current) {
        audioRef.current.volume = newVolume;
      }
    };

    const toggleVolumeControl = () => {
      setShowVolumeControl(!showVolumeControl);
    };

    const toggleSpeedMenu = () => {
      setShowSpeedMenu(!showSpeedMenu);
    };

    const handleSpeedChange = (speed: number) => {
      setPlaybackRate(speed);
      if (audioRef.current) {
        audioRef.current.playbackRate = speed;
      }
      setShowSpeedMenu(false);
    };

    const getVolumeIcon = () => {
      if (volume === 0) {
        return <SpeakerSimpleX />;
      }
      if (volume < 0.5) {
        return <SpeakerLow />;
      }
      return <SpeakerHigh />;
    };

    return (
      <CardBase
        ref={ref}
        layout="horizontal"
        padding="medium"
        minHeight="none"
        className={cn('w-auto h-14 items-center gap-2', className)}
        {...props}
      >
        {/* Audio element */}
        <audio
          ref={audioRef}
          src={src}
          loop={loop}
          preload={preload}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          data-testid="audio-element"
          aria-label={title}
        >
          {tracks ? (
            tracks.map((track) => (
              <track
                key={track.src}
                kind={track.kind}
                src={track.src}
                srcLang={track.srcLang}
                label={track.label}
                default={track.default}
              />
            ))
          ) : (
            <track
              kind="captions"
              src="data:text/vtt;base64,"
              srcLang="pt"
              label="Sem legendas disponíveis"
            />
          )}
        </audio>

        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={handlePlayPause}
          disabled={!src}
          className="cursor-pointer text-text-950 hover:text-primary-600 disabled:text-text-400 disabled:cursor-not-allowed"
          aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
        >
          {isPlaying ? (
            <div className="w-6 h-6 flex items-center justify-center">
              <div className="flex gap-0.5">
                <div className="w-1 h-4 bg-current rounded-sm"></div>
                <div className="w-1 h-4 bg-current rounded-sm"></div>
              </div>
            </div>
          ) : (
            <Play size={24} />
          )}
        </button>

        {/* Current Time */}
        <p className="text-text-800 text-sm font-medium min-w-[2.5rem]">
          {formatTime(currentTime)}
        </p>

        {/* Progress Bar */}
        <div className="flex-1 relative" data-testid="progress-bar">
          <button
            type="button"
            className="w-full h-2 bg-border-100 rounded-full cursor-pointer"
            onClick={handleProgressClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleProgressClick(
                  e as unknown as MouseEvent<HTMLButtonElement>
                );
              }
            }}
            aria-label="Barra de progresso do áudio"
          >
            <div
              className="h-full bg-primary-600 rounded-full transition-all duration-100"
              style={{
                width:
                  duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
              }}
            />
          </button>
        </div>

        {/* Duration */}
        <p className="text-text-800 text-sm font-medium min-w-[2.5rem]">
          {formatTime(duration)}
        </p>

        {/* Volume Control */}
        <div className="relative">
          <button
            type="button"
            onClick={toggleVolumeControl}
            className="cursor-pointer text-text-950 hover:text-primary-600"
            aria-label="Controle de volume"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              {getVolumeIcon()}
            </div>
          </button>

          {showVolumeControl && (
            <button
              type="button"
              className="absolute bottom-full right-0 mb-2 p-2 bg-background border border-border-100 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setShowVolumeControl(false);
                }
              }}
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    const newVolume = Math.min(
                      1,
                      Math.round((volume + 0.1) * 10) / 10
                    );
                    setVolume(newVolume);
                    if (audioRef.current) audioRef.current.volume = newVolume;
                  } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    const newVolume = Math.max(
                      0,
                      Math.round((volume - 0.1) * 10) / 10
                    );
                    setVolume(newVolume);
                    if (audioRef.current) audioRef.current.volume = newVolume;
                  }
                }}
                className="w-20 h-2 bg-border-100 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volume * 100}%, #e5e7eb ${volume * 100}%, #e5e7eb 100%)`,
                }}
                aria-label="Volume"
                aria-valuenow={Math.round(volume * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </button>
          )}
        </div>

        {/* Menu Button */}
        <div className="relative">
          <button
            type="button"
            onClick={toggleSpeedMenu}
            className="cursor-pointer text-text-950 hover:text-primary-600"
            aria-label="Opções de velocidade"
          >
            <DotsThreeVertical size={24} />
          </button>

          {showSpeedMenu && (
            <div className="absolute bottom-full right-0 mb-2 p-2 bg-background border border-border-100 rounded-lg shadow-lg min-w-24 z-10">
              <div className="flex flex-col gap-1">
                {[
                  { speed: 1, label: '1x' },
                  { speed: 1.5, label: '1.5x' },
                  { speed: 2, label: '2x' },
                ].map(({ speed, label }) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => handleSpeedChange(speed)}
                    className={cn(
                      'px-3 py-1 text-sm text-left rounded hover:bg-border-50 transition-colors',
                      playbackRate === speed
                        ? 'bg-primary-950 text-secondary-100 font-medium'
                        : 'text-text-950'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardBase>
    );
  }
);

interface CardSimuladoProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  duration?: string;
  info: string;
  backgroundColor: 'enem' | 'prova' | 'simuladao' | 'vestibular';
}

const SIMULADO_BACKGROUND_CLASSES = {
  enem: 'bg-exam-1',
  prova: 'bg-exam-2',
  simuladao: 'bg-exam-3',
  vestibular: 'bg-exam-4',
};

const CardSimulado = forwardRef<HTMLDivElement, CardSimuladoProps>(
  ({ title, duration, info, backgroundColor, className, ...props }, ref) => {
    const backgroundClass = SIMULADO_BACKGROUND_CLASSES[backgroundColor];

    return (
      <CardBase
        ref={ref}
        layout="horizontal"
        padding="medium"
        minHeight="none"
        cursor="pointer"
        className={cn(
          `${backgroundClass} hover:shadow-soft-shadow-2 transition-shadow duration-200`,
          className
        )}
        {...props}
      >
        <div className="flex justify-between items-center w-full gap-4">
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <Text size="lg" weight="bold" className="text-text-950 truncate">
              {title}
            </Text>

            <div className="flex items-center gap-4 text-text-700">
              {duration && (
                <div className="flex items-center gap-1">
                  <Clock size={16} className="flex-shrink-0" />
                  <Text size="sm">{duration}</Text>
                </div>
              )}

              <Text size="sm" className="truncate">
                {info}
              </Text>
            </div>
          </div>

          <CaretRight
            size={24}
            className="text-text-800 flex-shrink-0"
            data-testid="caret-icon"
          />
        </div>
      </CardBase>
    );
  }
);

interface CardTestProps extends Omit<HTMLAttributes<HTMLElement>, 'onSelect'> {
  title: string;
  duration?: string;
  questionsCount?: number;
  additionalInfo?: string;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
}

const CardTest = forwardRef<HTMLElement, CardTestProps>(
  (
    {
      title,
      duration,
      questionsCount,
      additionalInfo,
      selected = false,
      onSelect,
      className = '',
      ...props
    },
    ref
  ) => {
    const handleClick = () => {
      if (onSelect) {
        onSelect(!selected);
      }
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
      if ((event.key === 'Enter' || event.key === ' ') && onSelect) {
        event.preventDefault();
        onSelect(!selected);
      }
    };

    const isSelectable = !!onSelect;
    const getQuestionsText = (count: number) => {
      const singular = count === 1 ? 'questão' : 'questões';
      return `${count} ${singular}`;
    };

    const displayInfo = questionsCount
      ? getQuestionsText(questionsCount)
      : additionalInfo || '';
    const baseClasses =
      'flex flex-row items-center p-4 gap-2 w-full max-w-full bg-background shadow-soft-shadow-1 rounded-xl isolate border-0 text-left';
    const interactiveClasses = isSelectable
      ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-950 focus:ring-offset-2'
      : '';
    const selectedClasses = selected
      ? 'ring-2 ring-primary-950 ring-offset-2'
      : '';

    if (isSelectable) {
      return (
        <button
          ref={ref as Ref<HTMLButtonElement>}
          type="button"
          className={cn(
            `${baseClasses} ${interactiveClasses} ${selectedClasses} ${className}`.trim()
          )}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          aria-pressed={selected}
          {...(props as HTMLAttributes<HTMLButtonElement>)}
        >
          <div className="flex flex-col justify-between gap-[27px] flex-grow min-h-[67px] w-full min-w-0">
            <Text
              size="md"
              weight="bold"
              className="text-text-950 tracking-[0.2px] leading-[19px] truncate"
            >
              {title}
            </Text>

            <div className="flex flex-row justify-start items-end gap-4 w-full">
              {duration && (
                <div className="flex flex-row items-center gap-1 flex-shrink-0">
                  <Clock size={16} className="text-text-700" />
                  <Text
                    size="sm"
                    className="text-text-700 leading-[21px] whitespace-nowrap"
                  >
                    {duration}
                  </Text>
                </div>
              )}

              <Text
                size="sm"
                className="text-text-700 leading-[21px] flex-grow truncate"
              >
                {displayInfo}
              </Text>
            </div>
          </div>
        </button>
      );
    }

    return (
      <div
        ref={ref as Ref<HTMLDivElement>}
        className={cn(`${baseClasses} ${className}`.trim())}
        {...(props as HTMLAttributes<HTMLDivElement>)}
      >
        <div className="flex flex-col justify-between gap-[27px] flex-grow min-h-[67px] w-full min-w-0">
          <Text
            size="md"
            weight="bold"
            className="text-text-950 tracking-[0.2px] leading-[19px] truncate"
          >
            {title}
          </Text>

          <div className="flex flex-row justify-start items-end gap-4 w-full">
            {duration && (
              <div className="flex flex-row items-center gap-1 flex-shrink-0">
                <Clock size={16} className="text-text-700" />
                <Text
                  size="sm"
                  className="text-text-700 leading-[21px] whitespace-nowrap"
                >
                  {duration}
                </Text>
              </div>
            )}

            <Text
              size="sm"
              className="text-text-700 leading-[21px] flex-grow truncate min-w-0"
            >
              {displayInfo}
            </Text>
          </div>
        </div>
      </div>
    );
  }
);

interface SimulationItem {
  id: string;
  title: string;
  type: 'enem' | 'prova' | 'simulado' | 'vestibular';
  info: string;
}

interface SimulationHistoryData {
  date: string;
  simulations: SimulationItem[];
}

interface CardSimulationHistoryProps extends HTMLAttributes<HTMLDivElement> {
  data: SimulationHistoryData[];
  onSimulationClick?: (simulation: SimulationItem) => void;
}

const SIMULATION_TYPE_STYLES = {
  enem: {
    background: 'bg-exam-1',
    badge: 'exam1' as const,
    text: 'Enem',
  },
  prova: {
    background: 'bg-exam-2',
    badge: 'exam2' as const,
    text: 'Prova',
  },
  simulado: {
    background: 'bg-exam-3',
    badge: 'exam3' as const,
    text: 'Simulado',
  },
  vestibular: {
    background: 'bg-exam-4',
    badge: 'exam4' as const,
    text: 'Vestibular',
  },
};

const CardSimulationHistory = forwardRef<
  HTMLDivElement,
  CardSimulationHistoryProps
>(({ data, onSimulationClick, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('w-full max-w-[992px] h-auto', className)}
      {...props}
    >
      {/* Content */}
      <div className="flex flex-col gap-0">
        {data.map((section, sectionIndex) => (
          <div key={section.date} className="flex flex-col">
            {/* Seção com data */}
            <div
              className={cn(
                'flex flex-row justify-center items-start px-4 py-6 gap-2 w-full bg-white',
                sectionIndex === 0 ? 'rounded-t-3xl' : ''
              )}
            >
              <Text
                size="xs"
                weight="bold"
                className="text-text-800 w-11 flex-shrink-0"
              >
                {section.date}
              </Text>

              <div className="flex flex-col gap-2 flex-1">
                {section.simulations.map((simulation) => {
                  const typeStyles = SIMULATION_TYPE_STYLES[simulation.type];

                  return (
                    <CardBase
                      key={simulation.id}
                      layout="horizontal"
                      padding="medium"
                      minHeight="none"
                      cursor="pointer"
                      className={cn(
                        `${typeStyles.background} rounded-xl hover:shadow-soft-shadow-2 
                          transition-shadow duration-200 h-auto min-h-[61px]`
                      )}
                      onClick={() => onSimulationClick?.(simulation)}
                    >
                      <div className="flex justify-between items-center w-full gap-2">
                        <div className="flex flex-wrap flex-col justify-between sm:flex-row gap-2 flex-1 min-w-0">
                          <Text
                            size="lg"
                            weight="bold"
                            className="text-text-950 truncate"
                          >
                            {simulation.title}
                          </Text>

                          <div className="flex items-center gap-2">
                            <Badge
                              variant="examsOutlined"
                              action={typeStyles.badge}
                              size="medium"
                            >
                              {typeStyles.text}
                            </Badge>

                            <Text size="sm" className="text-text-800 truncate">
                              {simulation.info}
                            </Text>
                          </div>
                        </div>

                        <CaretRight
                          size={24}
                          className="text-text-800 flex-shrink-0"
                          data-testid="caret-icon"
                        />
                      </div>
                    </CardBase>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Footer rounded */}
        {data.length > 0 && (
          <div className="w-full h-6 bg-white rounded-b-3xl" />
        )}
      </div>
    </div>
  );
});

export {
  CardBase,
  CardActivitiesResults,
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
  CardSimulado,
  CardTest,
  CardSimulationHistory,
};
