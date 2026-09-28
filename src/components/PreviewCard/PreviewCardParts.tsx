import {
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { CaretDownIcon } from '@phosphor-icons/react/dist/csr/CaretDown';
import { DotsSixVerticalIcon } from '@phosphor-icons/react/dist/csr/DotsSixVertical';
import { TrashIcon } from '@phosphor-icons/react/dist/csr/Trash';
import Text from '../Text/Text';
import IconButton from '../IconButton/IconButton';
import { cn } from '../../utils/utils';

/**
 * Chip used for every metadata tag of a preview card header.
 */
export const PreviewCardTag = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <span
    className={cn(
      'min-w-0 max-w-full py-1 px-2 rounded-md bg-background-50 flex flex-row items-center gap-1',
      className
    )}
  >
    {children}
  </span>
);

/**
 * Top row of a preview card: item order on the left, actions on the right.
 * The drag ghost reuses it without actions, so it renders no buttons twice.
 */
export const PreviewCardOrderRow = ({
  position,
  actions,
}: {
  position?: number;
  actions?: ReactNode;
}) => {
  if (typeof position !== 'number' && !actions) return null;

  return (
    <div className="flex flex-row items-center gap-2 min-h-8 px-3 pt-2">
      {typeof position === 'number' && (
        <span className="shrink-0 py-0.5 px-2 rounded-md bg-primary-50">
          <Text size="sm" weight="medium" className="text-primary-950">
            {position}º
          </Text>
        </span>
      )}

      {actions && (
        <div className="ml-auto flex flex-row items-center gap-1 text-text-700">
          {actions}
        </div>
      )}
    </div>
  );
};

/**
 * Visual drag cue. The draggable element is the list wrapper, not this icon.
 */
export const PreviewCardDragHandle = () => (
  <span
    data-drag-handle="true"
    aria-hidden="true"
    className="size-6 flex items-center justify-center shrink-0 text-text-600 cursor-grab active:cursor-grabbing"
  >
    <DotsSixVerticalIcon size={16} />
  </span>
);

/**
 * Remove action. Marked `data-no-drag` so pressing it never starts a drag.
 */
export const PreviewCardRemoveButton = ({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) => (
  <IconButton
    size="sm"
    data-no-drag="true"
    icon={<TrashIcon size={16} />}
    aria-label={label}
    onClick={(event) => {
      event.stopPropagation();
      onRemove();
    }}
  />
);

/**
 * Caret that expands / collapses the card content.
 */
export const PreviewCardExpandButton = ({
  isExpanded,
  contentId,
  expandLabel,
  collapseLabel,
  caretTestId,
  onToggle,
}: {
  isExpanded: boolean;
  contentId: string;
  expandLabel: string;
  collapseLabel: string;
  caretTestId: string;
  onToggle: () => void;
}) => (
  <IconButton
    size="sm"
    aria-label={isExpanded ? collapseLabel : expandLabel}
    aria-expanded={isExpanded}
    aria-controls={contentId}
    icon={
      <CaretDownIcon
        size={16}
        className={cn(
          'transition-transform duration-200',
          isExpanded ? 'rotate-180' : 'rotate-0'
        )}
        data-testid={caretTestId}
      />
    }
    onClick={(event) => {
      event.stopPropagation();
      onToggle();
    }}
  />
);

/**
 * Expand state of a preview card. The whole card toggles on click or
 * Enter/Space, except its own buttons, which already handle their events.
 *
 * @param defaultExpanded - Initial expand state
 */
export const usePreviewCardToggle = (defaultExpanded: boolean) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => setIsExpanded((previous) => !previous);

  const handleCardClick = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement | null)?.closest('button')) return;
    toggleExpanded();
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if ((event.target as HTMLElement | null)?.closest('button')) return;
    event.preventDefault();
    toggleExpanded();
  };

  /** Lets a drag start inside a draggable list; otherwise avoids the focus ring. */
  const handleCardMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    const draggableAncestor = (event.target as HTMLElement).closest(
      '[data-draggable="true"]'
    );
    if (!draggableAncestor) {
      event.preventDefault();
    }
  };

  return {
    isExpanded,
    toggleExpanded,
    handleCardClick,
    handleCardKeyDown,
    handleCardMouseDown,
  };
};
