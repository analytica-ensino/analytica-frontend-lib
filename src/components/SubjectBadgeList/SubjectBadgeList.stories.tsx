import type { Story } from '@ladle/react';
import { SubjectBadgeList } from './SubjectBadgeList';
import { mapSubjectNameToEnum } from '../../utils/subjectMappers';

export default {
  title: 'Components/SubjectBadgeList',
};

/**
 * An activity built from a single subject — the common case.
 */
export const SingleSubject: Story = () => (
  <SubjectBadgeList
    subjects={['Biologia']}
    mapSubjectNameToEnum={mapSubjectNameToEnum}
  />
);

/**
 * Two subjects still fit, so nothing collapses.
 */
export const TwoSubjects: Story = () => (
  <SubjectBadgeList
    subjects={['Biologia', 'Física']}
    mapSubjectNameToEnum={mapSubjectNameToEnum}
  />
);

/**
 * The reported case: three questions from three different subjects. The third
 * collapses into "+1", whose tooltip names it.
 */
export const WithOverflow: Story = () => (
  <SubjectBadgeList
    subjects={['Biologia', 'Física', 'História']}
    mapSubjectNameToEnum={mapSubjectNameToEnum}
  />
);

/**
 * A large multi-subject activity, as it appears inside the history table cell.
 */
export const ManySubjectsInACell: Story = () => (
  <div className="max-w-[220px] border border-border-200 p-2">
    <SubjectBadgeList
      subjects={[
        'Biologia',
        'Física',
        'História',
        'Geografia',
        'Matemática',
        'Redação',
      ]}
      mapSubjectNameToEnum={mapSubjectNameToEnum}
    />
  </div>
);

/**
 * A subject the enum does not know about falls back to plain text.
 */
export const UnmappedSubject: Story = () => (
  <SubjectBadgeList
    subjects={['Biologia', 'Matéria Nova']}
    mapSubjectNameToEnum={mapSubjectNameToEnum}
  />
);

/**
 * No subject at all, with the dash the tables ask for.
 */
export const EmptyWithDash: Story = () => (
  <SubjectBadgeList subjects={[]} showEmptyDash />
);
