import { QUESTION_TYPE } from '../components/Quiz/useQuizStore';
import { questionTypeLabels } from './questionTypes';

describe('questionTypes', () => {
  describe('questionTypeLabels', () => {
    it('should have a label for every QUESTION_TYPE', () => {
      const allQuestionTypes = Object.values(QUESTION_TYPE);

      allQuestionTypes.forEach((type) => {
        expect(questionTypeLabels[type]).toBeDefined();
        expect(typeof questionTypeLabels[type]).toBe('string');
        expect(questionTypeLabels[type].length).toBeGreaterThan(0);
      });
    });

    it('should have correct label for ALTERNATIVA', () => {
      expect(questionTypeLabels[QUESTION_TYPE.ALTERNATIVA]).toBe('Alternativa');
    });

    it('should have correct label for VERDADEIRO_FALSO', () => {
      expect(questionTypeLabels[QUESTION_TYPE.VERDADEIRO_FALSO]).toBe(
        'Verdadeiro ou Falso'
      );
    });

    it('should have correct label for DISSERTATIVA', () => {
      expect(questionTypeLabels[QUESTION_TYPE.DISSERTATIVA]).toBe('Discursiva');
    });

    it('should have correct label for IMAGEM', () => {
      expect(questionTypeLabels[QUESTION_TYPE.IMAGEM]).toBe('Imagem');
    });

    it('should have correct label for MULTIPLA_ESCOLHA', () => {
      expect(questionTypeLabels[QUESTION_TYPE.MULTIPLA_ESCOLHA]).toBe(
        'Múltipla Escolha'
      );
    });

    it('should have correct label for RELACIONAR', () => {
      expect(questionTypeLabels[QUESTION_TYPE.RELACIONAR]).toBe('Relacionar');
    });

    it('should have correct label for PREENCHER_LACUNAS', () => {
      expect(questionTypeLabels[QUESTION_TYPE.PREENCHER_LACUNAS]).toBe(
        'Preencher Lacunas'
      );
    });

    it('should have the same number of labels as QUESTION_TYPE values', () => {
      const questionTypeCount = Object.keys(QUESTION_TYPE).length;
      const labelCount = Object.keys(questionTypeLabels).length;
      expect(labelCount).toBe(questionTypeCount);
    });
  });
});
