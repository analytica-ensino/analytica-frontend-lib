import { SubjectEnum } from '../enums/SubjectEnum';
import type { SubjectData as DraftSubject } from '../types/activitiesHistory';

/**
 * Mapping from Portuguese subject names to SubjectEnum values
 * Used to convert backend subject names to frontend enum values
 */
const SUBJECT_NAME_MAPPING: Record<string, SubjectEnum> = {
  matemática: SubjectEnum.MATEMATICA,
  português: SubjectEnum.PORTUGUES,
  ciências: SubjectEnum.BIOLOGIA,
  história: SubjectEnum.HISTORIA,
  geografia: SubjectEnum.GEOGRAFIA,
  inglês: SubjectEnum.INGLES,
  'educação física': SubjectEnum.EDUCACAO_FISICA,
  artes: SubjectEnum.ARTES,
  tecnologia: SubjectEnum.TRILHAS,
  física: SubjectEnum.FISICA,
  literatura: SubjectEnum.LITERATURA,
  biologia: SubjectEnum.BIOLOGIA,
  química: SubjectEnum.QUIMICA,
  filosofia: SubjectEnum.FILOSOFIA,
  espanhol: SubjectEnum.ESPANHOL,
  redação: SubjectEnum.REDACAO,
  sociologia: SubjectEnum.SOCIOLOGIA,
  trilhas: SubjectEnum.TRILHAS,
};

/**
 * Maps backend subject names to SubjectEnum values
 * @param subjectName - The subject name from the backend
 * @returns The corresponding SubjectEnum value or null if no mapping exists
 *
 * @example
 * ```typescript
 * const subjectEnum = mapSubjectNameToEnum('Matemática');
 * // Returns: SubjectEnum.MATEMATICA
 *
 * const unknown = mapSubjectNameToEnum('Unknown Subject');
 * // Returns: null
 * ```
 */
export const mapSubjectNameToEnum = (
  subjectName: string
): SubjectEnum | null => {
  const normalized = subjectName.trim().toLowerCase();
  return SUBJECT_NAME_MAPPING[normalized] || null;
};

/**
 * Maps SubjectEnum values back to display names
 * @param subjectEnum - The SubjectEnum value
 * @returns The display name for the subject
 *
 * @example
 * ```typescript
 * const name = mapSubjectEnumToName(SubjectEnum.MATEMATICA);
 * // Returns: 'Matemática'
 * ```
 */
export const mapSubjectEnumToName = (subjectEnum: SubjectEnum): string => {
  const reverseMapping: Record<SubjectEnum, string> = {
    [SubjectEnum.MATEMATICA]: 'Matemática',
    [SubjectEnum.PORTUGUES]: 'Português',
    [SubjectEnum.BIOLOGIA]: 'Biologia',
    [SubjectEnum.HISTORIA]: 'História',
    [SubjectEnum.GEOGRAFIA]: 'Geografia',
    [SubjectEnum.INGLES]: 'Inglês',
    [SubjectEnum.EDUCACAO_FISICA]: 'Educação Física',
    [SubjectEnum.ARTES]: 'Artes',
    [SubjectEnum.FISICA]: 'Física',
    [SubjectEnum.LITERATURA]: 'Literatura',
    [SubjectEnum.QUIMICA]: 'Química',
    [SubjectEnum.FILOSOFIA]: 'Filosofia',
    [SubjectEnum.ESPANHOL]: 'Espanhol',
    [SubjectEnum.REDACAO]: 'Redação',
    [SubjectEnum.SOCIOLOGIA]: 'Sociologia',
    [SubjectEnum.TRILHAS]: 'Trilhas',
  };

  return reverseMapping[subjectEnum] || subjectEnum;
};

/**
 * A subject as the deprecated singular fields still carry it: some endpoints
 * only ever sent `{ id, name }`, without the colour and icon the chip needs.
 */
type PartialSubject = Pick<DraftSubject, 'id' | 'name'> &
  Partial<Pick<DraftSubject, 'color' | 'icon'>>;

/** Neutral chip for a subject whose colour/icon the payload did not carry. */
const withSubjectDefaults = (subject: PartialSubject): DraftSubject => ({
  id: subject.id,
  name: subject.name,
  icon: subject.icon || 'BookOpen',
  color: subject.color || '#6B7280',
});

/**
 * Resolve the subjects to show for an activity draft or model.
 *
 * A draft's subjects come from the questions it selected, so the backend sends
 * them as a list — but only on the two GET endpoints; the create and update
 * responses reuse the same payload without paying for the lookup. The
 * `subjectsMap` fallback covers a response that carries only `subjectId`,
 * synthesizing a neutral chip from the name the caller already knows.
 *
 * @param draft - Draft/model payload from the API
 * @param subjectsMap - Optional id -> name map, used when the payload has no subject object
 * @returns Subjects to render, possibly empty
 *
 * @example
 * ```ts
 * resolveDraftSubjects({ subjects: [bio, fis], subjectId: null });  // [bio, fis]
 * resolveDraftSubjects({ subjectId: 'x' }, new Map([['x', 'Biologia']]));
 * // [{ id: 'x', name: 'Biologia', icon: 'BookOpen', color: '#6B7280' }]
 * ```
 */
export const resolveDraftSubjects = (
  draft: {
    subjects?: PartialSubject[];
    subject?: PartialSubject | null;
    subjectId?: string | null;
  },
  subjectsMap?: Map<string, string>
): DraftSubject[] => {
  if (draft.subjects?.length) {
    return draft.subjects.map(withSubjectDefaults);
  }

  if (draft.subject) {
    return [withSubjectDefaults(draft.subject)];
  }

  const fallbackName = draft.subjectId
    ? subjectsMap?.get(draft.subjectId)
    : undefined;

  if (draft.subjectId && fallbackName) {
    return [withSubjectDefaults({ id: draft.subjectId, name: fallbackName })];
  }

  return [];
};
