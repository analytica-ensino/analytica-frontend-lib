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
        // Figma AE-3308: white circle with a border and a primary-colored icon.
        'rounded-full! border border-primary-950 bg-background text-primary-950 hover:bg-background-100! hover:text-primary-950',
        active && 'border-transparent',
        // Disabled: light-gray border and icon, without the default opacity.
        'disabled:opacity-100! disabled:border-border-200 disabled:text-text-300'
      )}
    />
  </Tooltip>
);

/**
 * Controls for what happens at the end of the video (Figma AE-3308).
 *
 * "Repetir vídeo" and "Voltar ao início da lista" are never active together:
 * with one on, the other is disabled.
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
        onClick={() => setRepeatList(!repeatList)}
      />
      <QueueToggle
        icon={<RepeatOnceIcon size={18} />}
        label="Repetir vídeo"
        active={isRepeatVideo}
        disabled={isBackToStart}
        onClick={() => setEndBehavior(isRepeatVideo ? 'none' : 'repeat-video')}
      />
      <QueueToggle
        icon={<ArrowCounterClockwiseIcon size={18} />}
        label="Voltar ao início da lista"
        active={isBackToStart}
        disabled={isRepeatVideo}
        onClick={() => setEndBehavior(isBackToStart ? 'none' : 'back-to-start')}
      />
    </div>
  );
}
