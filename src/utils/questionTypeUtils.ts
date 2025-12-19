import { QUESTION_TYPE } from '../components/Quiz/useQuizStore';

/**
 * Maps API question type string to QUESTION_TYPE enum
 * Converts input to uppercase for case-insensitive matching
 *
 * @param type - Question type string from API
 * @param fallback - Optional fallback QUESTION_TYPE if mapping fails. If not provided, returns null
 * @returns QUESTION_TYPE enum value or null/fallback if not found
 */
export function mapQuestionTypeToEnum(
  type: string,
  fallback?: QUESTION_TYPE
): QUESTION_TYPE | null {
  const upperType = type.toUpperCase();

  const typeMap: Record<string, QUESTION_TYPE> = {
    ALTERNATIVA: QUESTION_TYPE.ALTERNATIVA,
    DISSERTATIVA: QUESTION_TYPE.DISSERTATIVA,
    MULTIPLA_ESCOLHA: QUESTION_TYPE.MULTIPLA_ESCOLHA,
    VERDADEIRO_FALSO: QUESTION_TYPE.VERDADEIRO_FALSO,
    IMAGEM: QUESTION_TYPE.IMAGEM,
    LIGAR_PONTOS: QUESTION_TYPE.LIGAR_PONTOS,
    PREENCHER: QUESTION_TYPE.PREENCHER,
  };

  return typeMap[upperType] ?? fallback ?? null;
}

/**
 * Maps API question type string to QUESTION_TYPE enum with required fallback
 * Always returns a QUESTION_TYPE (never null)
 *
 * @param type - Question type string from API
 * @param fallback - Fallback QUESTION_TYPE if mapping fails (defaults to ALTERNATIVA)
 * @returns QUESTION_TYPE enum value
 */
export function mapQuestionTypeToEnumRequired(
  type: string,
  fallback: QUESTION_TYPE = QUESTION_TYPE.ALTERNATIVA
): QUESTION_TYPE {
  return mapQuestionTypeToEnum(type, fallback) ?? fallback;
}
