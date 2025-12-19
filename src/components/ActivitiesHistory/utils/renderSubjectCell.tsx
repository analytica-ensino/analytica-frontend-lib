import type { ReactNode } from 'react';
import { SubjectEnum } from '../../../enums/SubjectEnum';
import { getSubjectInfo } from '../../SubjectInfo/SubjectInfo';
import Text from '../../Text/Text';
import { cn } from '../../../utils/utils';

/**
 * Render a subject cell with optional icon based on subject enum mapping
 * @param subjectName - The subject name to display
 * @param mapSubjectNameToEnum - Optional function to map subject name to SubjectEnum
 * @param showEmptyDash - Whether to show "-" for empty subject names (default: false)
 * @returns React node for the subject cell
 */
export const renderSubjectCell = (
  subjectName: string,
  mapSubjectNameToEnum?: (name: string) => SubjectEnum | null,
  showEmptyDash = false
): ReactNode => {
  if (!subjectName) {
    return showEmptyDash ? (
      <Text size="sm" color="text-text-400">
        -
      </Text>
    ) : null;
  }

  const subjectEnum = mapSubjectNameToEnum?.(subjectName);

  if (!subjectEnum) {
    return (
      <Text size="sm" className="truncate" title={subjectName}>
        {subjectName}
      </Text>
    );
  }

  const subjectInfo = getSubjectInfo(subjectEnum);

  return (
    <div className="flex items-center gap-2" title={subjectName}>
      <span
        className={cn(
          'w-[21px] h-[21px] flex items-center justify-center rounded-sm text-text-950 shrink-0',
          subjectInfo.colorClass
        )}
      >
        {subjectInfo.icon}
      </span>
      <Text size="sm" className="truncate">
        {subjectName}
      </Text>
    </div>
  );
};
