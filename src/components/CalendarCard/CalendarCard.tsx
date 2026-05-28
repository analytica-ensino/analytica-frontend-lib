import { CalendarBlank } from 'phosphor-react';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import DropdownMenu, {
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../DropdownMenu/DropdownMenu';
import IconButton from '../IconButton/IconButton';
import Modal from '../Modal/Modal';
import { useMobile } from '../../hooks/useMobile';

export interface CalendarCardProps {
  /** Content rendered inside the calendar (calendar grid + activities list). */
  content: ReactNode;
  /**
   * Whether the calendar surface is currently open.
   * When provided, the component is **controlled**: the consumer is the source of truth.
   * When omitted, the component manages internal state.
   */
  isOpen?: boolean;
  /**
   * Fired whenever the open state changes (user click, outside click,
   * programmatic close, ESC, etc.).
   */
  onOpenChange?: (open: boolean) => void;
  /** Title displayed in the mobile Modal. Default: "Calendário". */
  title?: string;
  /** Optional className applied to the trigger button. */
  className?: string;
}

/**
 * Calendar widget for the app header. Renders a calendar icon trigger that
 * opens a `DropdownMenu` on tablet/desktop and a `Modal` on mobile (<500px).
 *
 * Pairs naturally with `AppHeader`'s `calendarContent` prop. Use the
 * controlled `isOpen` + `onOpenChange` pair when the consumer needs to close
 * the surface programmatically (e.g. on route change).
 */
export const CalendarCard = ({
  content,
  isOpen,
  onOpenChange,
  title = 'Calendário',
  className,
}: CalendarCardProps) => {
  const { isMobile } = useMobile();
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = isOpen !== undefined;
  const effectiveOpen = isControlled ? isOpen : internalOpen;

  // `useCallback` keeps the reference stable across renders, so the
  // `DropdownMenu`'s `useEffect [open, onOpenChange]` doesn't re-fire on
  // every parent re-render (which is what triggers the infinite update loop
  // observed before).
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!isControlled) {
        setInternalOpen(open);
      }
      onOpenChange?.(open);
    },
    [isControlled, onOpenChange]
  );

  const iconColor = effectiveOpen ? 'text-primary-950' : 'text-primary';
  const triggerIcon = <CalendarBlank size={24} className={iconColor} />;

  if (isMobile) {
    return (
      <>
        <IconButton
          active={effectiveOpen}
          onClick={() => handleOpenChange(!effectiveOpen)}
          icon={triggerIcon}
          className={className}
        />
        <Modal
          isOpen={effectiveOpen}
          onClose={() => handleOpenChange(false)}
          title={title}
        >
          <div className="flex justify-center">{content}</div>
        </Modal>
      </>
    );
  }

  return (
    <DropdownMenu open={effectiveOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        className={`text-primary cursor-pointer ${className ?? ''}`}
      >
        <IconButton active={effectiveOpen} icon={triggerIcon} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[320px] max-w-[calc(100vw-16px)] max-h-[80vh] overflow-y-auto"
        align="end"
        side="bottom"
      >
        {content}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CalendarCard;
