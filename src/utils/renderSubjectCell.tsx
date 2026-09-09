import type { ReactNode } from 'react';
import { SubjectEnum } from '../enums/SubjectEnum';
import { getSubjectInfo } from '../components/SubjectInfo/SubjectInfo';
import {
  SubjectIcons,
  type SubjectIconsItem,
} from '../components/SubjectIcons/SubjectIcons';
import Text from '../components/Text/Text';
import { TruncatedText } from '../components/TruncatedText/TruncatedText';
import { cn } from './utils';

/**
 * Render the "Componente curricular" cell of a table row.
 *
 * An activity covers several subjects, and several names do not fit the column
 * — so the cell is a row of subject icons, which the backend now describes with
 * a `color` and an `icon` on every subject.
 *
 * Tolerates a non-array value because `ColumnConfig.render` is typed `unknown`:
 * a row that predates the field renders as empty rather than throwing.
 *
 * @param value - The row's `subjects` field, as handed over by TableProvider
 * @returns React node for the subjects cell
 */
export const renderSubjectsCell = (value: unknown): ReactNode => (
  <SubjectIcons
    subjects={Array.isArray(value) ? (value as SubjectIconsItem[]) : []}
  />
);

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
    return <TruncatedText size="sm">{subjectName}</TruncatedText>;
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
      <TruncatedText size="sm">{subjectName}</TruncatedText>
    </div>
  );
};
