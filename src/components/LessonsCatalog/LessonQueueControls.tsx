import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react/dist/csr/ArrowCounterClockwise';
import { RepeatIcon } from '@phosphor-icons/react/dist/csr/Repeat';
import { RepeatOnceIcon } from '@phosphor-icons/react/dist/csr/RepeatOnce';
import { ShuffleIcon } from '@phosphor-icons/react/dist/csr/Shuffle';
import type { ReactNode } from 'react';
import IconButton from '../IconButton/IconButton';
import { useMediaPreferencesStore } from '../../store/mediaPreferencesStore';
import { cn } from '../../utils/utils';

interface QueueToggleProps {
  readonly icon: ReactNode;
  readonly label: string;
  readonly active: boolean;
  readonly onClick: () => void;
}

const QueueToggle = ({ icon, label, active, onClick }: QueueToggleProps) => (
  <IconButton
    icon={icon}
    onClick={onClick}
    aria-label={label}
    title={label}
    aria-pressed={active}
    className={cn(active && '!bg-primary-950 !text-secondary-100')}
  />
);

/**
 * Controles do que acontece ao fim do vídeo.
 *
 * Layout provisório: aguarda a definição de UX/UI da AE-3308.
 */
export function LessonQueueControls() {
  const shuffle = useMediaPreferencesStore((s) => s.queueShuffle);
  const repeatList = useMediaPreferencesStore((s) => s.queueRepeatList);
  const endBehavior = useMediaPreferencesStore((s) => s.videoEndBehavior);
  const setShuffle = useMediaPreferencesStore((s) => s.setQueueShuffle);
  const setRepeatList = useMediaPreferencesStore((s) => s.setQueueRepeatList);
  const setEndBehavior = useMediaPreferencesStore((s) => s.setVideoEndBehavior);

  return (
    <div className="flex items-center gap-2">
      <QueueToggle
        icon={<ShuffleIcon size={20} />}
        label="Ordem aleatória"
        active={shuffle}
        onClick={() => setShuffle(!shuffle)}
      />
      <QueueToggle
        icon={<RepeatIcon size={20} />}
        label="Repetir a lista"
        active={repeatList}
        onClick={() => setRepeatList(!repeatList)}
      />
      <QueueToggle
        icon={<RepeatOnceIcon size={20} />}
        label="Repetir um vídeo"
        active={endBehavior === 'repeat-video'}
        onClick={() =>
          setEndBehavior(
            endBehavior === 'repeat-video' ? 'none' : 'repeat-video'
          )
        }
      />
      <QueueToggle
        icon={<ArrowCounterClockwiseIcon size={20} />}
        label="Voltar ao início"
        active={endBehavior === 'back-to-start'}
        onClick={() =>
          setEndBehavior(
            endBehavior === 'back-to-start' ? 'none' : 'back-to-start'
          )
        }
      />
    </div>
  );
}
