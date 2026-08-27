import type { ReactNode } from 'react';
import { SubjectEnum } from '../enums/SubjectEnum';
import { SubjectBadgeList } from '../components/SubjectBadgeList/SubjectBadgeList';

/**
 * Render a subject cell with optional icon based on subject enum mapping
 *
 * @param subjectName - The subject name, or the names to display
 * @param mapSubjectNameToEnum - Optional function to map subject name to SubjectEnum
 * @param showEmptyDash - Whether to show "-" for empty subject names (default: false)
 * @returns React node for the subject cell
 */
export const renderSubjectCell = (
  subjectName: string | string[],
  mapSubjectNameToEnum?: (name: string) => SubjectEnum | null,
  showEmptyDash = false
): ReactNode => {
  const subjects = (
    Array.isArray(subjectName) ? subjectName : [subjectName]
  ).filter(Boolean);

  if (subjects.length === 0 && !showEmptyDash) {
    return null;
  }

  return (
    <SubjectBadgeList
      subjects={subjects}
      mapSubjectNameToEnum={mapSubjectNameToEnum}
      showEmptyDash={showEmptyDash}
    />
  );
};
