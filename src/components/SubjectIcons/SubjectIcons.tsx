import type { JSX } from 'react';
import { IconRender } from '../IconRender/IconRender';
import Text from '../Text/Text';
import { Tooltip } from '../Tooltip/Tooltip';
import { TruncatedText } from '../TruncatedText/TruncatedText';
import { useTheme } from '../../hooks/useTheme';
import { getSubjectColorWithOpacity } from '../../utils/utils';

/**
 * Minimal subject shape this component needs.
 *
 * Structural rather than an import of `ActivitySubject` so the same component
 * serves activities, exams, drafts and recommended classes — they all carry at
 * least these four fields, and the extra ones (`areaKnowledgeId`) are irrelevant
 * here.
 */
export interface SubjectIconsItem {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface SubjectIconsProps {
  /** Subjects to render, in the order the backend returned them. */
  subjects: SubjectIconsItem[];
  /**
   * How many icons to draw before collapsing the rest into a "+N" counter.
   * Defaults to 3, which is what fits the "Componente curricular" column.
   */
  maxVisible?: number;
  /** Render a dash when there is no subject at all. Defaults to true. */
  showEmptyDash?: boolean;
  /** Extra classes for the wrapper. */
  className?: string;
}

/** Fallback for a subject whose `icon` the backend left empty. */
const FALLBACK_ICON = 'BookOpen';

/**
 * Colored square carrying a subject's icon.
 *
 * @param subject - Subject to draw
 * @param isDark - Whether the dark theme is active, which shifts the chip color
 * @returns The chip element
 */
const SubjectChip = ({
  subject,
  isDark,
}: {
  subject: SubjectIconsItem;
  isDark: boolean;
}): JSX.Element => (
  <span
    aria-label={subject.name}
    className="w-[21px] h-[21px] flex items-center justify-center rounded-sm text-text-950 shrink-0"
    style={{
      backgroundColor: getSubjectColorWithOpacity(subject.color, isDark),
    }}
  >
    <IconRender
      iconName={subject.icon || FALLBACK_ICON}
      size={14}
      color="currentColor"
    />
  </span>
);

/**
 * Row of subject icons for a table cell.
 *
 * An activity covers several subjects now, and several names do not fit a table
 * cell — so from two subjects on they are drawn as their colored icons, which is
 * what identifies them at that size, and the full list of names lives in the
 * tooltip. A single subject does fit, and its name identifies it far better than
 * the icon alone, so it is spelled out next to the chip.
 *
 * @example
 * ```tsx
 * <SubjectIcons subjects={activity.subjects} />
 * // 1 subject  -> chip + "Biologia"
 * // 5 subjects -> 3 icons + "+2", tooltip lists all 5 names
 * ```
 */
export const SubjectIcons = ({
  subjects,
  maxVisible = 3,
  showEmptyDash = true,
  className,
}: SubjectIconsProps): JSX.Element | null => {
  const { isDark } = useTheme();

  if (subjects.length === 0) {
    if (!showEmptyDash) {
      return null;
    }
    return (
      <Text size="sm" color="text-text-400">
        -
      </Text>
    );
  }

  if (subjects.length === 1) {
    const [subject] = subjects;
    return (
      <div
        className={className ?? 'flex items-center gap-2 min-w-0'}
        data-testid="subject-icons"
      >
        <SubjectChip subject={subject} isDark={isDark} />
        <TruncatedText size="sm">{subject.name}</TruncatedText>
      </div>
    );
  }

  const visible = subjects.slice(0, maxVisible);
  const hiddenCount = subjects.length - visible.length;

  return (
    <Tooltip
      content={subjects.map((subject) => subject.name).join(', ')}
      usePortal
    >
      <div
        className={className ?? 'flex items-center gap-1 min-w-0'}
        data-testid="subject-icons"
      >
        {visible.map((subject) => (
          <SubjectChip key={subject.id} subject={subject} isDark={isDark} />
        ))}
        {hiddenCount > 0 && (
          <Text size="sm" color="text-text-600" className="shrink-0">
            +{hiddenCount}
          </Text>
        )}
      </div>
    </Tooltip>
  );
};

export default SubjectIcons;
