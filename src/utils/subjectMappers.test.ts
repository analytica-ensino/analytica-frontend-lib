import { SubjectEnum } from '../enums/SubjectEnum';
import { mapSubjectNameToEnum, mapSubjectEnumToName } from './subjectMappers';

describe('subjectMappers', () => {
  describe('mapSubjectNameToEnum', () => {
    describe('exact matches', () => {
      it('should map "Matemática" to SubjectEnum.MATEMATICA', () => {
        expect(mapSubjectNameToEnum('Matemática')).toBe(SubjectEnum.MATEMATICA);
      });

      it('should map "Português" to SubjectEnum.PORTUGUES', () => {
        expect(mapSubjectNameToEnum('Português')).toBe(SubjectEnum.PORTUGUES);
      });

      it('should map "Ciências" to SubjectEnum.BIOLOGIA', () => {
        expect(mapSubjectNameToEnum('Ciências')).toBe(SubjectEnum.BIOLOGIA);
      });

      it('should map "História" to SubjectEnum.HISTORIA', () => {
        expect(mapSubjectNameToEnum('História')).toBe(SubjectEnum.HISTORIA);
      });

      it('should map "Geografia" to SubjectEnum.GEOGRAFIA', () => {
        expect(mapSubjectNameToEnum('Geografia')).toBe(SubjectEnum.GEOGRAFIA);
      });

      it('should map "Inglês" to SubjectEnum.INGLES', () => {
        expect(mapSubjectNameToEnum('Inglês')).toBe(SubjectEnum.INGLES);
      });

      it('should map "Educação Física" to SubjectEnum.EDUCACAO_FISICA', () => {
        expect(mapSubjectNameToEnum('Educação Física')).toBe(
          SubjectEnum.EDUCACAO_FISICA
        );
      });

      it('should map "Artes" to SubjectEnum.ARTES', () => {
        expect(mapSubjectNameToEnum('Artes')).toBe(SubjectEnum.ARTES);
      });

      it('should map "Tecnologia" to SubjectEnum.TRILHAS', () => {
        expect(mapSubjectNameToEnum('Tecnologia')).toBe(SubjectEnum.TRILHAS);
      });

      it('should map "Física" to SubjectEnum.FISICA', () => {
        expect(mapSubjectNameToEnum('Física')).toBe(SubjectEnum.FISICA);
      });

      it('should map "Literatura" to SubjectEnum.LITERATURA', () => {
        expect(mapSubjectNameToEnum('Literatura')).toBe(SubjectEnum.LITERATURA);
      });

      it('should map "Biologia" to SubjectEnum.BIOLOGIA', () => {
        expect(mapSubjectNameToEnum('Biologia')).toBe(SubjectEnum.BIOLOGIA);
      });

      it('should map "Química" to SubjectEnum.QUIMICA', () => {
        expect(mapSubjectNameToEnum('Química')).toBe(SubjectEnum.QUIMICA);
      });

      it('should map "Filosofia" to SubjectEnum.FILOSOFIA', () => {
        expect(mapSubjectNameToEnum('Filosofia')).toBe(SubjectEnum.FILOSOFIA);
      });

      it('should map "Espanhol" to SubjectEnum.ESPANHOL', () => {
        expect(mapSubjectNameToEnum('Espanhol')).toBe(SubjectEnum.ESPANHOL);
      });

      it('should map "Redação" to SubjectEnum.REDACAO', () => {
        expect(mapSubjectNameToEnum('Redação')).toBe(SubjectEnum.REDACAO);
      });

      it('should map "Sociologia" to SubjectEnum.SOCIOLOGIA', () => {
        expect(mapSubjectNameToEnum('Sociologia')).toBe(SubjectEnum.SOCIOLOGIA);
      });

      it('should map "Trilhas" to SubjectEnum.TRILHAS', () => {
        expect(mapSubjectNameToEnum('Trilhas')).toBe(SubjectEnum.TRILHAS);
      });
    });

    describe('case-insensitive matching', () => {
      it('should handle uppercase input', () => {
        expect(mapSubjectNameToEnum('MATEMÁTICA')).toBe(SubjectEnum.MATEMATICA);
        expect(mapSubjectNameToEnum('PORTUGUÊS')).toBe(SubjectEnum.PORTUGUES);
        expect(mapSubjectNameToEnum('HISTÓRIA')).toBe(SubjectEnum.HISTORIA);
      });

      it('should handle lowercase input', () => {
        expect(mapSubjectNameToEnum('matemática')).toBe(SubjectEnum.MATEMATICA);
        expect(mapSubjectNameToEnum('português')).toBe(SubjectEnum.PORTUGUES);
        expect(mapSubjectNameToEnum('história')).toBe(SubjectEnum.HISTORIA);
      });

      it('should handle mixed case input', () => {
        expect(mapSubjectNameToEnum('MaTeMáTiCa')).toBe(SubjectEnum.MATEMATICA);
        expect(mapSubjectNameToEnum('pOrTuGuÊs')).toBe(SubjectEnum.PORTUGUES);
        expect(mapSubjectNameToEnum('HiStÓrIa')).toBe(SubjectEnum.HISTORIA);
      });

      it('should handle uppercase multi-word subjects', () => {
        expect(mapSubjectNameToEnum('EDUCAÇÃO FÍSICA')).toBe(
          SubjectEnum.EDUCACAO_FISICA
        );
      });

      it('should handle lowercase multi-word subjects', () => {
        expect(mapSubjectNameToEnum('educação física')).toBe(
          SubjectEnum.EDUCACAO_FISICA
        );
      });
    });

    describe('whitespace handling', () => {
      it('should trim leading whitespace', () => {
        expect(mapSubjectNameToEnum('  Matemática')).toBe(
          SubjectEnum.MATEMATICA
        );
        expect(mapSubjectNameToEnum('   Português')).toBe(
          SubjectEnum.PORTUGUES
        );
      });

      it('should trim trailing whitespace', () => {
        expect(mapSubjectNameToEnum('Matemática  ')).toBe(
          SubjectEnum.MATEMATICA
        );
        expect(mapSubjectNameToEnum('Português   ')).toBe(
          SubjectEnum.PORTUGUES
        );
      });

      it('should trim both leading and trailing whitespace', () => {
        expect(mapSubjectNameToEnum('  Matemática  ')).toBe(
          SubjectEnum.MATEMATICA
        );
        expect(mapSubjectNameToEnum('   Português   ')).toBe(
          SubjectEnum.PORTUGUES
        );
      });
    });

    describe('unmapped subjects', () => {
      it('should return null for unknown subject', () => {
        expect(mapSubjectNameToEnum('Música')).toBeNull();
      });

      it('should return null for empty string', () => {
        expect(mapSubjectNameToEnum('')).toBeNull();
      });

      it('should return null for whitespace-only string', () => {
        expect(mapSubjectNameToEnum('   ')).toBeNull();
      });

      it('should return null for random text', () => {
        expect(mapSubjectNameToEnum('Random Subject')).toBeNull();
        expect(mapSubjectNameToEnum('xyz')).toBeNull();
        expect(mapSubjectNameToEnum('123')).toBeNull();
      });
    });
  });

  describe('mapSubjectEnumToName', () => {
    it('should map SubjectEnum.MATEMATICA to "Matemática"', () => {
      expect(mapSubjectEnumToName(SubjectEnum.MATEMATICA)).toBe('Matemática');
    });

    it('should map SubjectEnum.PORTUGUES to "Português"', () => {
      expect(mapSubjectEnumToName(SubjectEnum.PORTUGUES)).toBe('Português');
    });

    it('should map SubjectEnum.BIOLOGIA to "Biologia"', () => {
      expect(mapSubjectEnumToName(SubjectEnum.BIOLOGIA)).toBe('Biologia');
    });

    it('should map SubjectEnum.HISTORIA to "História"', () => {
      expect(mapSubjectEnumToName(SubjectEnum.HISTORIA)).toBe('História');
    });

    it('should map SubjectEnum.GEOGRAFIA to "Geografia"', () => {
      expect(mapSubjectEnumToName(SubjectEnum.GEOGRAFIA)).toBe('Geografia');
    });

    it('should map SubjectEnum.INGLES to "Inglês"', () => {
      expect(mapSubjectEnumToName(SubjectEnum.INGLES)).toBe('Inglês');
    });

    it('should map SubjectEnum.EDUCACAO_FISICA to "Educação Física"', () => {
      expect(mapSubjectEnumToName(SubjectEnum.EDUCACAO_FISICA)).toBe(
        'Educação Física'
      );
    });

    it('should map SubjectEnum.ARTES to "Artes"', () => {
      expect(mapSubjectEnumToName(SubjectEnum.ARTES)).toBe('Artes');
    });

    it('should map SubjectEnum.FISICA to "Física"', () => {
      expect(mapSubjectEnumToName(SubjectEnum.FISICA)).toBe('Física');
    });

    it('should map SubjectEnum.LITERATURA to "Literatura"', () => {
      expect(mapSubjectEnumToName(SubjectEnum.LITERATURA)).toBe('Literatura');
    });

    it('should map SubjectEnum.QUIMICA to "Química"', () => {
      expect(mapSubjectEnumToName(SubjectEnum.QUIMICA)).toBe('Química');
    });

    it('should map SubjectEnum.FILOSOFIA to "Filosofia"', () => {
      expect(mapSubjectEnumToName(SubjectEnum.FILOSOFIA)).toBe('Filosofia');
    });

    it('should map SubjectEnum.ESPANHOL to "Espanhol"', () => {
      expect(mapSubjectEnumToName(SubjectEnum.ESPANHOL)).toBe('Espanhol');
    });

    it('should map SubjectEnum.REDACAO to "Redação"', () => {
      expect(mapSubjectEnumToName(SubjectEnum.REDACAO)).toBe('Redação');
    });

    it('should map SubjectEnum.SOCIOLOGIA to "Sociologia"', () => {
      expect(mapSubjectEnumToName(SubjectEnum.SOCIOLOGIA)).toBe('Sociologia');
    });

    it('should map SubjectEnum.TRILHAS to "Trilhas"', () => {
      expect(mapSubjectEnumToName(SubjectEnum.TRILHAS)).toBe('Trilhas');
    });

    it('should return the enum value if not found in mapping', () => {
      // Test with an unknown enum value (type casting to test edge case)
      const unknownValue = 'UNKNOWN_SUBJECT' as SubjectEnum;
      expect(mapSubjectEnumToName(unknownValue)).toBe('UNKNOWN_SUBJECT');
    });
  });
});
