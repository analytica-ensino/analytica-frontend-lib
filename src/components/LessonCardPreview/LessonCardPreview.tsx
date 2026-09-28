import { useId } from 'react';
import { IconRender, Text, getSubjectColorWithOpacity } from '../../index';
import Button from '../Button/Button';
import IconButton from '../IconButton/IconButton';
import Video from '../../assets/icons/subjects/Video';
import { cn } from '../../utils/utils';
import {
  PreviewCardDragHandle,
  PreviewCardExpandButton,
  PreviewCardOrderRow,
  PreviewCardRemoveButton,
  PreviewCardTag,
  usePreviewCardToggle,
} from '../PreviewCard/PreviewCardParts';

/** Subject shown in the card badge. */
export interface LessonCardPreviewSubject {
  name: string;
  color?: string;
  icon?: string;
}

export interface LessonCardPreviewProps {
  /** Lesson title (truncated while collapsed, full when expanded). */
  title?: string;
  /** 1-based order of the lesson in the list. */
  position?: number;
  /** Lesson subject; the badge is hidden when missing. */
  subject?: LessonCardPreviewSubject;
  /** Hierarchy levels (area › subject › topic › subtopic › content). */
  trail?: string[];
  /** Id used to link the caret with the expandable content. */
  value?: string;
  isDark?: boolean;
  defaultExpanded?: boolean;
  /** Shows the drag cue (the list wrapper is the draggable element). */
  showDragHandle?: boolean;
  /** Opens the lesson player; the video action is hidden when missing. */
  onWatch?: () => void;
  /** Removes the lesson; the trash action is hidden when missing. */
  onRemove?: () => void;
  className?: string;
}

/** Subject chip of the card header. */
const LessonSubjectTag = ({
  subject,
  isDark,
}: {
  subject: LessonCardPreviewSubject;
  isDark: boolean;
}) => {
  const color = subject.color ?? '#000000';
  const badgeColor = getSubjectColorWithOpacity(color, isDark) ?? color;

  return (
    <PreviewCardTag className="self-start">
      <Text
        as="span"
        className="size-4 rounded-sm flex items-center justify-center shrink-0"
        style={{ backgroundColor: badgeColor }}
      >
        <IconRender
          iconName={subject.icon ?? 'Book'}
          size={14}
          color="currentColor"
        />
      </Text>
      <Text as="span" size="sm" color="text-text-650" className="truncate">
        {subject.name}
      </Text>
    </PreviewCardTag>
  );
};

/**
 * Lesson card of the recommended lesson preview: order badge, subject badge,
 * truncated title and drag / watch / remove / expand actions. Expanding shows
 * the full title and the lesson trail.
 */
export const LessonCardPreview = ({
  title = 'Aula sem título',
  position,
  subject,
  trail = [],
  value,
  isDark = false,
  defaultExpanded = false,
  showDragHandle = false,
  onWatch,
  onRemove,
  className,
}: LessonCardPreviewProps) => {
  const { isExpanded, toggleExpanded, handleCardMouseDown } =
    usePreviewCardToggle(defaultExpanded);
  const generatedId = useId();
  const contentId = value ? `lesson-preview-content-${value}` : generatedId;

  /** Subject badge + title. Truncated title while collapsed, full when expanded. */
  const renderSummary = (expanded: boolean) => (
    <>
      {subject?.name && <LessonSubjectTag subject={subject} isDark={isDark} />}

      <Text
        as="span"
        size="md"
        weight="bold"
        className={cn('block', expanded ? 'break-words' : 'truncate')}
      >
        {title}
      </Text>
    </>
  );

  const actions = (
    <>
      {showDragHandle && <PreviewCardDragHandle />}

      {onWatch && (
        <IconButton
          size="sm"
          data-no-drag="true"
          icon={<Video size={16} color="currentColor" />}
          aria-label="Assistir aula"
          onClick={(event) => {
            event.stopPropagation();
            onWatch();
          }}
        />
      )}

      {onRemove && (
        <PreviewCardRemoveButton
          label={
            typeof position === 'number'
              ? `Remover aula ${position}`
              : 'Remover aula'
          }
          onRemove={onRemove}
        />
      )}

      <PreviewCardExpandButton
        isExpanded={isExpanded}
        contentId={contentId}
        expandLabel="Expandir aula"
        collapseLabel="Recolher aula"
        caretTestId="lesson-caret"
        onToggle={toggleExpanded}
      />
    </>
  );

  return (
    <div className="w-full" data-position={position}>
      {/* Hidden drag preview with header + truncated title (closed state) */}
      <div
        data-drag-preview="true"
        aria-hidden="true"
        className="fixed -left-[9999px] -top-[9999px] pointer-events-none z-[9999] w-[440px]"
      >
        <div className="w-full rounded-lg border border-border-200 bg-background flex flex-col gap-2 pb-2">
          <PreviewCardOrderRow position={position} />
          <div className="px-3 flex flex-col gap-2 min-w-0">
            {renderSummary(false)}
          </div>
        </div>
      </div>

      <div
        className={cn(
          'w-full rounded-lg border border-border-200 bg-background overflow-hidden',
          className
        )}
      >
        <PreviewCardOrderRow position={position} actions={actions} />

        {/* Native button: the actions above stay outside it (no nested buttons) */}
        <Button
          variant="raw"
          aria-expanded={isExpanded}
          aria-controls={contentId}
          onClick={toggleExpanded}
          onMouseDown={handleCardMouseDown}
          className="w-full min-w-0 flex flex-col gap-2 px-3 pt-2 pb-2 text-left cursor-pointer"
        >
          {renderSummary(isExpanded)}
        </Button>

        <section
          id={contentId}
          aria-hidden={!isExpanded}
          // Collapsed content stays in the DOM, so it must not be focusable
          inert={!isExpanded}
          data-testid="lesson-preview-content"
          className={cn(
            'transition-all duration-300 ease-in-out overflow-hidden',
            isExpanded ? 'opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          {trail.length > 0 && (
            <div className="px-3 pb-4">
              <Text
                size="sm"
                className="text-text-700 break-words"
                data-testid="lesson-trail"
              >
                {trail.join(' › ')}
              </Text>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default LessonCardPreview;
