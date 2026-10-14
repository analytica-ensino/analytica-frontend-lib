import { useId } from 'react';
import Text from '../Text/Text';
import { CardResults } from '../Card/Card';
import { useTheme } from '../../hooks/useTheme';
import { getSubjectColorWithOpacity } from '../../utils/utils';
import type { EnemClassroomResultSubject } from '../../types/enemClassroom';
import { useSubjectStyleMap } from './EnemClassroomResultSummary';
import {
  FALLBACK_SUBJECT_COLOR,
  FALLBACK_SUBJECT_ICON,
  type EnemClassroomSubjectStyle,
} from './utils';

/**
 * "Componente curricular" of a Simulado Momento Enem result: one row per
 * component of the student's block, with its hits and misses.
 *
 * Read-only — the result carries no questions, so a row opens nothing and
 * `CardResults` draws it without the caret. A component the app could not
 * style gets a neutral icon and colour.
 */
export const EnemClassroomResultSubjects = ({
  subjects,
  subjectStyles,
}: Readonly<{
  subjects: EnemClassroomResultSubject[];
  /** Icons and colours of the components, from the app's subjects endpoint. */
  subjectStyles: ReadonlyArray<EnemClassroomSubjectStyle>;
}>) => {
  const titleId = useId();
  const { isDark } = useTheme();
  const styles = useSubjectStyleMap(subjectStyles);

  if (subjects.length === 0) return null;

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-3">
      <Text
        as="h2"
        id={titleId}
        size="lg"
        weight="bold"
        className="text-text-950"
      >
        Componente curricular
      </Text>
      <ul className="flex flex-col gap-2">
        {subjects.map((subject) => {
          const style = styles.get(subject.subjectId);
          return (
            <li key={subject.subjectId}>
              <CardResults
                direction="row"
                header={subject.subjectName}
                icon={style?.icon ?? FALLBACK_SUBJECT_ICON}
                color={getSubjectColorWithOpacity(
                  style?.color ?? FALLBACK_SUBJECT_COLOR,
                  isDark
                )}
                correct_answers={subject.correct}
                incorrect_answers={subject.incorrect}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
};
