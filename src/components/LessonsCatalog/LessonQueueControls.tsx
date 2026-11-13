import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react/dist/csr/ArrowCounterClockwise';
import { RepeatIcon } from '@phosphor-icons/react/dist/csr/Repeat';
import { RepeatOnceIcon } from '@phosphor-icons/react/dist/csr/RepeatOnce';
import { ShuffleIcon } from '@phosphor-icons/react/dist/csr/Shuffle';
import type { ReactNode } from 'react';
import IconButton from '../IconButton/IconButton';
import { Tooltip } from '../Tooltip/Tooltip';
import { useMediaPreferencesStore } from '../../store/mediaPreferencesStore';
import { cn } from '../../utils/utils';

interface QueueToggleProps {
  readonly icon: ReactNode;
  readonly label: string;
  readonly active: boolean;
  readonly disabled?: boolean;
  readonly onClick: () => void;
}

const QueueToggle = ({
  icon,
  label,
  active,
  disabled = false,
  onClick,
}: QueueToggleProps) => (
  <Tooltip content={label} disabled={disabled}>
    <IconButton
      icon={icon}
      onClick={onClick}
      aria-label={label}
      active={active}
      disabled={disabled}
      className={cn(
        // Colors from the design (AE-3308), per state. The background never
        // changes on hover: only the icon and the border do.
        'rounded-full! border',
        active
          ? // Selected: light fill, no border, primary-700 icon.
            'border-transparent bg-primary-50! hover:bg-primary-50! text-primary-700! hover:text-primary-400!'
          : // Not selected: primary-950 icon and border.
            'border-primary-950 bg-background hover:bg-background! text-primary-950 hover:border-primary-400 hover:text-primary-400!',
        // Disabled: text-500 icon and border, without the default opacity.
        'disabled:opacity-100! disabled:border-text-500 disabled:text-text-500!'
      )}
    />
  </Tooltip>
);

/**
 * Controls for what happens at the end of the video (Figma AE-3308).
 *
 * Locking rules from the design:
 * - turning "Repetir vídeo" on turns "Repetir lista" off and disables it: the
 *   video repeats, so the list never reaches its end;
 * - turning "Voltar ao início da lista" on disables "Repetir vídeo".
 *
 * "Repetir vídeo" and "Voltar ao início da lista" share one stored field, so
 * they are never on together: turning one on replaces the other.
 */
export function LessonQueueControls() {
  const shuffle = useMediaPreferencesStore((s) => s.queueShuffle);
  const repeatList = useMediaPreferencesStore((s) => s.queueRepeatList);
  const endBehavior = useMediaPreferencesStore((s) => s.videoEndBehavior);
  const setShuffle = useMediaPreferencesStore((s) => s.setQueueShuffle);
  const setRepeatList = useMediaPreferencesStore((s) => s.setQueueRepeatList);
  const setEndBehavior = useMediaPreferencesStore((s) => s.setVideoEndBehavior);

  const isRepeatVideo = endBehavior === 'repeat-video';
  const isBackToStart = endBehavior === 'back-to-start';

  return (
    <div className="flex items-center gap-2">
      <QueueToggle
        icon={<ShuffleIcon size={18} />}
        label="Aleatório"
        active={shuffle}
        onClick={() => setShuffle(!shuffle)}
      />
      <QueueToggle
        icon={<RepeatIcon size={18} />}
        label="Repetir lista"
        active={repeatList}
        disabled={isRepeatVideo}
        onClick={() => setRepeatList(!repeatList)}
      />
      <QueueToggle
        icon={<RepeatOnceIcon size={18} />}
        label="Repetir vídeo"
        active={isRepeatVideo}
        disabled={isBackToStart}
        onClick={() => {
          if (isRepeatVideo) {
            setEndBehavior('none');
            return;
          }
          setEndBehavior('repeat-video');
          setRepeatList(false);
        }}
      />
      <QueueToggle
        icon={<ArrowCounterClockwiseIcon size={18} />}
        label="Voltar ao início da lista"
        active={isBackToStart}
        onClick={() => setEndBehavior(isBackToStart ? 'none' : 'back-to-start')}
      />
    </div>
  );
}
