import { SubjectEnum } from '../enums/SubjectEnum';

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
