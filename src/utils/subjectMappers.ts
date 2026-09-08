import { SubjectEnum } from '../enums/SubjectEnum';
import { normalizeText } from './stringUtils';

/**
 * Mapping from normalized (lowercase, accent-stripped) subject names to SubjectEnum values.
 * Keys must be written WITHOUT diacritics because lookups go through `normalizeText`.
 * Includes the canonical backend names (e.g. "Língua Portuguesa") alongside the short forms.
 */
const SUBJECT_NAME_MAPPING: Record<string, SubjectEnum> = {
  matematica: SubjectEnum.MATEMATICA,
  'matematica avancada': SubjectEnum.MATEMATICA,
  portugues: SubjectEnum.PORTUGUES,
  'lingua portuguesa': SubjectEnum.PORTUGUES,
  ciencias: SubjectEnum.BIOLOGIA,
  historia: SubjectEnum.HISTORIA,
  geografia: SubjectEnum.GEOGRAFIA,
  ingles: SubjectEnum.INGLES,
  'lingua inglesa': SubjectEnum.INGLES,
  'educacao fisica': SubjectEnum.EDUCACAO_FISICA,
  artes: SubjectEnum.ARTES,
  tecnologia: SubjectEnum.TRILHAS,
  fisica: SubjectEnum.FISICA,
  literatura: SubjectEnum.LITERATURA,
  biologia: SubjectEnum.BIOLOGIA,
  quimica: SubjectEnum.QUIMICA,
  filosofia: SubjectEnum.FILOSOFIA,
  espanhol: SubjectEnum.ESPANHOL,
  'lingua espanhola': SubjectEnum.ESPANHOL,
  redacao: SubjectEnum.REDACAO,
  sociologia: SubjectEnum.SOCIOLOGIA,
  trilhas: SubjectEnum.TRILHAS,
};

/**
 * Maps backend subject names to SubjectEnum values.
 * Matching is case- and accent-insensitive and accepts both the short names
 * ("Português") and the canonical backend names ("Língua Portuguesa").
 * @param subjectName - The subject name from the backend
 * @returns The corresponding SubjectEnum value or null if no mapping exists
 *
 * @example
 * ```typescript
 * const subjectEnum = mapSubjectNameToEnum('Matemática');
 * // Returns: SubjectEnum.MATEMATICA
 *
 * const portuguese = mapSubjectNameToEnum('Língua Portuguesa');
 * // Returns: SubjectEnum.PORTUGUES
 *
 * const unknown = mapSubjectNameToEnum('Unknown Subject');
 * // Returns: null
 * ```
 */
export const mapSubjectNameToEnum = (
  subjectName: string
): SubjectEnum | null => {
  const normalized = normalizeText(subjectName.trim());
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
