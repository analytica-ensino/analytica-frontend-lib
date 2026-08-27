import type { ReactNode } from 'react';
import { SubjectEnum } from '../../enums/SubjectEnum';
import { getSubjectInfo } from '../SubjectInfo/SubjectInfo';
import Text from '../Text/Text';
import { Tooltip } from '../Tooltip/Tooltip';
import { TruncatedText } from '../TruncatedText/TruncatedText';
import { cn } from '../../utils/utils';

/**
 * SubjectBadgeList component props
 */
export interface SubjectBadgeListProps {
  /** Subject names to display, already in the order they should appear */
  subjects: string[];
  /** Maps a backend subject name to the enum that carries its icon and colour */
  mapSubjectNameToEnum?: (name: string) => SubjectEnum | null;
  /** How many chips to render before collapsing the rest into "+N" */
  maxVisible?: number;
  /** Render "-" instead of nothing when there is no subject */
  showEmptyDash?: boolean;
  /** Additional className for the wrapper */
  className?: string;
}

/**
 * Coloured square + name chip for a single subject
 */
const SubjectChip = ({
  name,
  mapSubjectNameToEnum,
}: {
  name: string;
  mapSubjectNameToEnum?: (name: string) => SubjectEnum | null;
}): ReactNode => {
  const subjectEnum = mapSubjectNameToEnum?.(name);

  if (!subjectEnum) {
    return <TruncatedText size="sm">{name}</TruncatedText>;
  }

  const subjectInfo = getSubjectInfo(subjectEnum);

  return (
    <div className="flex items-center gap-2 min-w-0">
      <span
        className={cn(
          'w-[21px] h-[21px] flex items-center justify-center rounded-sm text-text-950 shrink-0',
          subjectInfo.colorClass
        )}
      >
        {subjectInfo.icon}
      </span>
      <TruncatedText size="sm">{name}</TruncatedText>
    </div>
  );
};

/**
 * Display the subjects an activity covers as chips, collapsing the overflow
 * into a "+N" badge whose tooltip names the hidden ones
 *
 * @example
 * ```tsx
 * <SubjectBadgeList
 *   subjects={['Biologia', 'Física', 'História']}
 *   mapSubjectNameToEnum={mapSubjectNameToEnum}
 * />
 * // ▪ Biologia  ▪ Física  +1   (tooltip on +1: "História")
 * ```
 */
export const SubjectBadgeList = ({
  subjects,
  mapSubjectNameToEnum,
  maxVisible = 2,
  showEmptyDash = false,
  className,
}: SubjectBadgeListProps): ReactNode => {
  if (subjects.length === 0) {
    return showEmptyDash ? (
      <Text size="sm" color="text-text-400">
        -
      </Text>
    ) : null;
  }

  const unique = [...new Set(subjects)];
  const visible = unique.slice(0, maxVisible);
  const hidden = unique.slice(visible.length);

  return (
    <div className={cn('flex flex-wrap items-center gap-1 min-w-0', className)}>
      {visible.map((name) => (
        <SubjectChip
          key={name}
          name={name}
          mapSubjectNameToEnum={mapSubjectNameToEnum}
        />
      ))}
      {hidden.length > 0 && (
        <Tooltip content={hidden.join(', ')} usePortal>
          <Text
            as="span"
            size="xs"
            weight="medium"
            tabIndex={0}
            aria-label={`Mais ${hidden.length}: ${hidden.join(', ')}`}
            className="inline-flex items-center rounded-full border border-border-200 bg-background-50 px-2 py-0.5 text-text-700 shrink-0 cursor-default"
          >
            +{hidden.length}
          </Text>
        </Tooltip>
      )}
    </div>
  );
};

export default SubjectBadgeList;
