import { QUESTION_TYPE } from '../components/Quiz/useQuizStore';

/**
 * Map question types to display labels
 */
export const questionTypeLabels: Record<QUESTION_TYPE, string> = {
  [QUESTION_TYPE.ALTERNATIVA]: 'Alternativa',
  [QUESTION_TYPE.VERDADEIRO_FALSO]: 'Verdadeiro ou Falso',
  [QUESTION_TYPE.DISSERTATIVA]: 'Discursiva',
  [QUESTION_TYPE.IMAGEM]: 'Imagem',
  [QUESTION_TYPE.MULTIPLA_ESCOLHA]: 'Múltipla Escolha',
  [QUESTION_TYPE.LIGAR_PONTOS]: 'Ligar Pontos',
  [QUESTION_TYPE.PREENCHER]: 'Preencher Lacunas',
};
