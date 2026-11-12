import { useEffect, useRef, useState, type ReactNode } from 'react';
import Button from '../Button/Button';
import Text from '../Text/Text';

/** Initial value from AE-3296, still to be validated. */
export const NEXT_LESSON_COUNTDOWN_SECONDS = 5;

export interface NextLessonCountdownProps {
  /** Title of the next lesson in the queue. */
  readonly title: string;
  /** First frame of the next lesson; without it, no image is shown. */
  readonly imageUrl?: string;
  /** Subject icon, shown in the card. */
  readonly icon: ReactNode;
  /** Icon background color (`bg-*` class or hex). */
  readonly color?: string;
  /** Context line above the title, such as "Matéria • Subtema". */
  readonly subtitle?: string;
  /** Called once: when the countdown hits zero or on "Assistir agora". */
  readonly onComplete: () => void;
  /** Stops the advance; the current lesson stays on screen, paused. */
  readonly onCancel: () => void;
}

/**
 * Countdown over the player before advancing to the next lesson in the queue.
 */
export function NextLessonCountdown({
  title,
  imageUrl,
  icon,
  color,
  subtitle,
  onComplete,
  onCancel,
}: NextLessonCountdownProps) {
  const [remaining, setRemaining] = useState(NEXT_LESSON_COUNTDOWN_SECONDS);
  const hasCompletedRef = useRef(false);

  // Read through a ref so a parent re-render does not restart the current second.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const complete = () => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    onCompleteRef.current();
  };

  useEffect(() => {
    if (remaining === 0) {
      complete();
      return;
    }
    const timer = setTimeout(() => setRemaining(remaining - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining]);

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center overflow-y-auto bg-neutral-900 p-4">
      <div className="flex w-full max-w-sm flex-col gap-3">
        <Text size="md" weight="bold" color="text-white" aria-live="polite">
          Próxima aula em {remaining}s
        </Text>

        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            className="aspect-video w-full rounded-lg object-cover"
          />
        )}

        {/* Same block as the dashboard's "Continuar aula" card. */}
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-white ${color?.startsWith('bg-') ? color : ''}`}
            style={
              color && !color.startsWith('bg-')
                ? { backgroundColor: color }
                : undefined
            }
          >
            {icon}
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            {subtitle && (
              <Text size="2xs" color="text-white/70" className="truncate">
                {subtitle}
              </Text>
            )}
            <Text
              size="xs"
              weight="bold"
              color="text-white"
              className="truncate"
            >
              {title}
            </Text>
          </div>
        </div>

        <div className="flex gap-3 border-t border-white/30 pt-3">
          <Button
            variant="outline"
            action="secondary"
            size="small"
            onClick={onCancel}
            className="!border-white !text-white hover:!bg-white/10"
          >
            Cancelar
          </Button>
          <Button
            variant="solid"
            action="primary"
            size="small"
            onClick={complete}
            className="flex-1"
          >
            Assistir agora
          </Button>
        </div>
      </div>
    </div>
  );
}
