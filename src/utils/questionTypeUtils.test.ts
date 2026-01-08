import { QUESTION_TYPE } from '../components/Quiz/useQuizStore';
import {
  mapQuestionTypeToEnum,
  mapQuestionTypeToEnumRequired,
} from './questionTypeUtils';

describe('questionTypeUtils', () => {
  describe('mapQuestionTypeToEnum', () => {
    describe('valid mappings (uppercase)', () => {
      it('should map ALTERNATIVA correctly', () => {
        expect(mapQuestionTypeToEnum('ALTERNATIVA')).toBe(
          QUESTION_TYPE.ALTERNATIVA
        );
      });

      it('should map DISSERTATIVA correctly', () => {
        expect(mapQuestionTypeToEnum('DISSERTATIVA')).toBe(
          QUESTION_TYPE.DISSERTATIVA
        );
      });

      it('should map MULTIPLA_ESCOLHA correctly', () => {
        expect(mapQuestionTypeToEnum('MULTIPLA_ESCOLHA')).toBe(
          QUESTION_TYPE.MULTIPLA_ESCOLHA
        );
      });

      it('should map VERDADEIRO_FALSO correctly', () => {
        expect(mapQuestionTypeToEnum('VERDADEIRO_FALSO')).toBe(
          QUESTION_TYPE.VERDADEIRO_FALSO
        );
      });

      it('should map IMAGEM correctly', () => {
        expect(mapQuestionTypeToEnum('IMAGEM')).toBe(QUESTION_TYPE.IMAGEM);
      });

      it('should map LIGAR_PONTOS correctly', () => {
        expect(mapQuestionTypeToEnum('LIGAR_PONTOS')).toBe(
          QUESTION_TYPE.LIGAR_PONTOS
        );
      });

      it('should map PREENCHER correctly', () => {
        expect(mapQuestionTypeToEnum('PREENCHER')).toBe(
          QUESTION_TYPE.PREENCHER
        );
      });
    });

    describe('case insensitivity', () => {
      it('should map lowercase alternativa', () => {
        expect(mapQuestionTypeToEnum('alternativa')).toBe(
          QUESTION_TYPE.ALTERNATIVA
        );
      });

      it('should map lowercase dissertativa', () => {
        expect(mapQuestionTypeToEnum('dissertativa')).toBe(
          QUESTION_TYPE.DISSERTATIVA
        );
      });

      it('should map lowercase multipla_escolha', () => {
        expect(mapQuestionTypeToEnum('multipla_escolha')).toBe(
          QUESTION_TYPE.MULTIPLA_ESCOLHA
        );
      });

      it('should map lowercase verdadeiro_falso', () => {
        expect(mapQuestionTypeToEnum('verdadeiro_falso')).toBe(
          QUESTION_TYPE.VERDADEIRO_FALSO
        );
      });

      it('should map lowercase imagem', () => {
        expect(mapQuestionTypeToEnum('imagem')).toBe(QUESTION_TYPE.IMAGEM);
      });

      it('should map lowercase ligar_pontos', () => {
        expect(mapQuestionTypeToEnum('ligar_pontos')).toBe(
          QUESTION_TYPE.LIGAR_PONTOS
        );
      });

      it('should map lowercase preencher', () => {
        expect(mapQuestionTypeToEnum('preencher')).toBe(
          QUESTION_TYPE.PREENCHER
        );
      });

      it('should map mixed case Alternativa', () => {
        expect(mapQuestionTypeToEnum('Alternativa')).toBe(
          QUESTION_TYPE.ALTERNATIVA
        );
      });

      it('should map mixed case DiSsErTaTiVa', () => {
        expect(mapQuestionTypeToEnum('DiSsErTaTiVa')).toBe(
          QUESTION_TYPE.DISSERTATIVA
        );
      });
    });

    describe('invalid types without fallback', () => {
      it('should return null for unknown type', () => {
        expect(mapQuestionTypeToEnum('UNKNOWN_TYPE')).toBeNull();
      });

      it('should return null for empty string', () => {
        expect(mapQuestionTypeToEnum('')).toBeNull();
      });

      it('should return null for typo in type', () => {
        expect(mapQuestionTypeToEnum('ALTERNATIV')).toBeNull();
      });

      it('should return null for partial match', () => {
        expect(mapQuestionTypeToEnum('ALTER')).toBeNull();
      });

      it('should return null for type with extra characters', () => {
        expect(mapQuestionTypeToEnum('ALTERNATIVA_EXTRA')).toBeNull();
      });
    });

    describe('invalid types with fallback', () => {
      it('should return fallback for unknown type', () => {
        expect(
          mapQuestionTypeToEnum('UNKNOWN', QUESTION_TYPE.ALTERNATIVA)
        ).toBe(QUESTION_TYPE.ALTERNATIVA);
      });

      it('should return fallback for empty string', () => {
        expect(mapQuestionTypeToEnum('', QUESTION_TYPE.DISSERTATIVA)).toBe(
          QUESTION_TYPE.DISSERTATIVA
        );
      });

      it('should return MULTIPLA_ESCOLHA fallback', () => {
        expect(
          mapQuestionTypeToEnum('invalid', QUESTION_TYPE.MULTIPLA_ESCOLHA)
        ).toBe(QUESTION_TYPE.MULTIPLA_ESCOLHA);
      });

      it('should return VERDADEIRO_FALSO fallback', () => {
        expect(
          mapQuestionTypeToEnum('invalid', QUESTION_TYPE.VERDADEIRO_FALSO)
        ).toBe(QUESTION_TYPE.VERDADEIRO_FALSO);
      });

      it('should return IMAGEM fallback', () => {
        expect(mapQuestionTypeToEnum('invalid', QUESTION_TYPE.IMAGEM)).toBe(
          QUESTION_TYPE.IMAGEM
        );
      });

      it('should return LIGAR_PONTOS fallback', () => {
        expect(
          mapQuestionTypeToEnum('invalid', QUESTION_TYPE.LIGAR_PONTOS)
        ).toBe(QUESTION_TYPE.LIGAR_PONTOS);
      });

      it('should return PREENCHER fallback', () => {
        expect(mapQuestionTypeToEnum('invalid', QUESTION_TYPE.PREENCHER)).toBe(
          QUESTION_TYPE.PREENCHER
        );
      });
    });

    describe('valid type with fallback (fallback should be ignored)', () => {
      it('should return mapped type even when fallback is provided', () => {
        expect(
          mapQuestionTypeToEnum('DISSERTATIVA', QUESTION_TYPE.ALTERNATIVA)
        ).toBe(QUESTION_TYPE.DISSERTATIVA);
      });

      it('should not use fallback when type is valid', () => {
        expect(mapQuestionTypeToEnum('imagem', QUESTION_TYPE.PREENCHER)).toBe(
          QUESTION_TYPE.IMAGEM
        );
      });
    });
  });

  describe('mapQuestionTypeToEnumRequired', () => {
    describe('valid mappings', () => {
      it('should map ALTERNATIVA correctly', () => {
        expect(mapQuestionTypeToEnumRequired('ALTERNATIVA')).toBe(
          QUESTION_TYPE.ALTERNATIVA
        );
      });

      it('should map DISSERTATIVA correctly', () => {
        expect(mapQuestionTypeToEnumRequired('DISSERTATIVA')).toBe(
          QUESTION_TYPE.DISSERTATIVA
        );
      });

      it('should map all types correctly (lowercase)', () => {
        expect(mapQuestionTypeToEnumRequired('multipla_escolha')).toBe(
          QUESTION_TYPE.MULTIPLA_ESCOLHA
        );
        expect(mapQuestionTypeToEnumRequired('verdadeiro_falso')).toBe(
          QUESTION_TYPE.VERDADEIRO_FALSO
        );
        expect(mapQuestionTypeToEnumRequired('imagem')).toBe(
          QUESTION_TYPE.IMAGEM
        );
        expect(mapQuestionTypeToEnumRequired('ligar_pontos')).toBe(
          QUESTION_TYPE.LIGAR_PONTOS
        );
        expect(mapQuestionTypeToEnumRequired('preencher')).toBe(
          QUESTION_TYPE.PREENCHER
        );
      });
    });

    describe('default fallback (ALTERNATIVA)', () => {
      it('should return ALTERNATIVA for unknown type without explicit fallback', () => {
        expect(mapQuestionTypeToEnumRequired('UNKNOWN')).toBe(
          QUESTION_TYPE.ALTERNATIVA
        );
      });

      it('should return ALTERNATIVA for empty string without explicit fallback', () => {
        expect(mapQuestionTypeToEnumRequired('')).toBe(
          QUESTION_TYPE.ALTERNATIVA
        );
      });

      it('should return ALTERNATIVA for invalid type without explicit fallback', () => {
        expect(mapQuestionTypeToEnumRequired('invalid_type')).toBe(
          QUESTION_TYPE.ALTERNATIVA
        );
      });
    });

    describe('custom fallback', () => {
      it('should return custom fallback for unknown type', () => {
        expect(
          mapQuestionTypeToEnumRequired('UNKNOWN', QUESTION_TYPE.DISSERTATIVA)
        ).toBe(QUESTION_TYPE.DISSERTATIVA);
      });

      it('should return custom fallback for empty string', () => {
        expect(
          mapQuestionTypeToEnumRequired('', QUESTION_TYPE.MULTIPLA_ESCOLHA)
        ).toBe(QUESTION_TYPE.MULTIPLA_ESCOLHA);
      });

      it('should return VERDADEIRO_FALSO as custom fallback', () => {
        expect(
          mapQuestionTypeToEnumRequired('xyz', QUESTION_TYPE.VERDADEIRO_FALSO)
        ).toBe(QUESTION_TYPE.VERDADEIRO_FALSO);
      });

      it('should return IMAGEM as custom fallback', () => {
        expect(
          mapQuestionTypeToEnumRequired('invalid', QUESTION_TYPE.IMAGEM)
        ).toBe(QUESTION_TYPE.IMAGEM);
      });

      it('should return LIGAR_PONTOS as custom fallback', () => {
        expect(
          mapQuestionTypeToEnumRequired('test', QUESTION_TYPE.LIGAR_PONTOS)
        ).toBe(QUESTION_TYPE.LIGAR_PONTOS);
      });

      it('should return PREENCHER as custom fallback', () => {
        expect(
          mapQuestionTypeToEnumRequired('abc', QUESTION_TYPE.PREENCHER)
        ).toBe(QUESTION_TYPE.PREENCHER);
      });
    });

    describe('valid type with custom fallback (fallback should be ignored)', () => {
      it('should return mapped type even when custom fallback is provided', () => {
        expect(
          mapQuestionTypeToEnumRequired('DISSERTATIVA', QUESTION_TYPE.IMAGEM)
        ).toBe(QUESTION_TYPE.DISSERTATIVA);
      });

      it('should not use custom fallback when type is valid', () => {
        expect(
          mapQuestionTypeToEnumRequired('preencher', QUESTION_TYPE.ALTERNATIVA)
        ).toBe(QUESTION_TYPE.PREENCHER);
      });
    });

    describe('never returns null', () => {
      it('should always return a QUESTION_TYPE value', () => {
        const result = mapQuestionTypeToEnumRequired('completely_invalid_type');
        expect(result).not.toBeNull();
        expect(Object.values(QUESTION_TYPE)).toContain(result);
      });

      it('should return fallback type that is a valid QUESTION_TYPE', () => {
        const invalidTypes = ['', 'xyz', '123', 'null', 'undefined'];
        invalidTypes.forEach((type) => {
          const result = mapQuestionTypeToEnumRequired(type);
          expect(Object.values(QUESTION_TYPE)).toContain(result);
        });
      });
    });
  });

  describe('real-world scenarios', () => {
    it('should handle API response with uppercase type', () => {
      const apiResponse = { questionType: 'ALTERNATIVA' };
      const result = mapQuestionTypeToEnum(apiResponse.questionType);
      expect(result).toBe(QUESTION_TYPE.ALTERNATIVA);
    });

    it('should handle API response with lowercase type', () => {
      const apiResponse = { questionType: 'dissertativa' };
      const result = mapQuestionTypeToEnum(apiResponse.questionType);
      expect(result).toBe(QUESTION_TYPE.DISSERTATIVA);
    });

    it('should handle legacy API response with unknown type using fallback', () => {
      const apiResponse = { questionType: 'OLD_TYPE' };
      const result = mapQuestionTypeToEnumRequired(
        apiResponse.questionType,
        QUESTION_TYPE.ALTERNATIVA
      );
      expect(result).toBe(QUESTION_TYPE.ALTERNATIVA);
    });

    it('should handle form data validation', () => {
      const formData = { type: 'MULTIPLA_ESCOLHA' };
      const questionType = mapQuestionTypeToEnumRequired(formData.type);
      expect(questionType).toBe(QUESTION_TYPE.MULTIPLA_ESCOLHA);
    });

    it('should handle quiz creation with default type', () => {
      const newQuestion = { type: '' };
      const questionType = mapQuestionTypeToEnumRequired(newQuestion.type);
      expect(questionType).toBe(QUESTION_TYPE.ALTERNATIVA);
    });
  });
});
