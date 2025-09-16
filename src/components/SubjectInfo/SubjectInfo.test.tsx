import { render } from '@testing-library/react';
import { SubjectEnum } from '@/enums/SubjectEnum';
import {
  SubjectInfo,
  getSubjectData,
  getSubjectIcon,
  getSubjectColorClass,
  getSubjectName,
  SubjectData,
  IconProps,
} from './SubjectInfo';

describe('SubjectInfo', () => {
  describe('SubjectInfo object structure', () => {
    it('should contain all subject enum values', () => {
      const subjectKeys = Object.keys(SubjectInfo);
      const enumKeys = Object.keys(SubjectEnum);

      expect(subjectKeys).toHaveLength(enumKeys.length);

      enumKeys.forEach((enumKey) => {
        const enumValue = SubjectEnum[enumKey as keyof typeof SubjectEnum];
        expect(SubjectInfo[enumValue].name).toBe(enumValue);
      });
    });

    it('should have correct data structure for each subject', () => {
      Object.values(SubjectEnum).forEach((subject) => {
        const subjectData = SubjectInfo[subject];

        expect(subjectData).toHaveProperty('icon');
        expect(subjectData).toHaveProperty('colorClass');
        expect(subjectData).toHaveProperty('name');

        expect(typeof subjectData.colorClass).toBe('string');
        expect(typeof subjectData.name).toBe('string');
        expect(subjectData.colorClass).toMatch(/^bg-subject-\d+$/);
      });
    });

    it('should have unique color classes for each subject', () => {
      const colorClasses = Object.values(SubjectInfo).map(
        (data) => data.colorClass
      );
      const uniqueColorClasses = new Set(colorClasses);

      expect(uniqueColorClasses.size).toBe(colorClasses.length);
    });

    it('should have unique names for each subject', () => {
      const names = Object.values(SubjectInfo).map((data) => data.name);
      const uniqueNames = new Set(names);

      expect(uniqueNames.size).toBe(names.length);
    });
  });

  describe('Subject data validation', () => {
    it('should have correct subject names', () => {
      expect(SubjectInfo[SubjectEnum.FISICA].name).toBe('Física');
      expect(SubjectInfo[SubjectEnum.HISTORIA].name).toBe('História');
      expect(SubjectInfo[SubjectEnum.LITERATURA].name).toBe('Literatura');
      expect(SubjectInfo[SubjectEnum.GEOGRAFIA].name).toBe('Geografia');
      expect(SubjectInfo[SubjectEnum.BIOLOGIA].name).toBe('Biologia');
      expect(SubjectInfo[SubjectEnum.PORTUGUES].name).toBe('Português');
      expect(SubjectInfo[SubjectEnum.QUIMICA].name).toBe('Química');
      expect(SubjectInfo[SubjectEnum.ARTES].name).toBe('Artes');
      expect(SubjectInfo[SubjectEnum.MATEMATICA].name).toBe('Matemática');
      expect(SubjectInfo[SubjectEnum.FILOSOFIA].name).toBe('Filosofia');
      expect(SubjectInfo[SubjectEnum.ESPANHOL].name).toBe('Espanhol');
      expect(SubjectInfo[SubjectEnum.REDACAO].name).toBe('Redação');
      expect(SubjectInfo[SubjectEnum.SOCIOLOGIA].name).toBe('Sociologia');
      expect(SubjectInfo[SubjectEnum.INGLES].name).toBe('Inglês');
      expect(SubjectInfo[SubjectEnum.EDUCACAO_FISICA].name).toBe('Ed. Física');
      expect(SubjectInfo[SubjectEnum.TRILHAS].name).toBe('Trilhas');
    });

    it('should have correct color class pattern', () => {
      Object.values(SubjectEnum).forEach((subject, index) => {
        const expectedColorClass = `bg-subject-${index + 1}`;
        expect(SubjectInfo[subject].colorClass).toBe(expectedColorClass);
      });
    });
  });

  describe('Icon properties', () => {
    it('should render icons without errors', () => {
      Object.values(SubjectEnum).forEach((subject) => {
        const { container } = render(SubjectInfo[subject].icon);
        expect(container.firstChild).toBeInTheDocument();
      });
    });

    it('should have icons with correct size property', () => {
      Object.values(SubjectEnum).forEach((subject) => {
        const icon = SubjectInfo[subject].icon;
        expect(icon.props.size).toBe(17);
      });
    });

    it('should have icons with color property when specified', () => {
      const subjectsWithColor = [
        SubjectEnum.LITERATURA,
        SubjectEnum.BIOLOGIA,
        SubjectEnum.PORTUGUES,
        SubjectEnum.FILOSOFIA,
        SubjectEnum.ESPANHOL,
        SubjectEnum.INGLES,
      ];

      subjectsWithColor.forEach((subject) => {
        const icon = SubjectInfo[subject].icon;
        expect(icon.props.color).toBe('#000000');
      });
    });

    it('should have icons without color property when not specified', () => {
      const subjectsWithoutColor = [
        SubjectEnum.FISICA,
        SubjectEnum.HISTORIA,
        SubjectEnum.GEOGRAFIA,
        SubjectEnum.QUIMICA,
        SubjectEnum.ARTES,
        SubjectEnum.MATEMATICA,
        SubjectEnum.REDACAO,
        SubjectEnum.SOCIOLOGIA,
        SubjectEnum.EDUCACAO_FISICA,
        SubjectEnum.TRILHAS,
      ];

      subjectsWithoutColor.forEach((subject) => {
        const icon = SubjectInfo[subject].icon;
        expect(icon.props.color).toBeUndefined();
      });
    });
  });

  describe('Helper functions', () => {
    describe('getSubjectData', () => {
      it('should return correct data for each subject', () => {
        Object.values(SubjectEnum).forEach((subject) => {
          const data = getSubjectData(subject);
          expect(data).toEqual(SubjectInfo[subject]);
        });
      });

      it('should return data with correct structure', () => {
        const data = getSubjectData(SubjectEnum.FISICA);
        expect(data).toHaveProperty('icon');
        expect(data).toHaveProperty('colorClass');
        expect(data).toHaveProperty('name');
      });
    });

    describe('getSubjectIcon', () => {
      it('should return correct icon for each subject', () => {
        Object.values(SubjectEnum).forEach((subject) => {
          const icon = getSubjectIcon(subject);
          expect(icon).toBe(SubjectInfo[subject].icon);
        });
      });

      it('should return ReactElement', () => {
        const icon = getSubjectIcon(SubjectEnum.FISICA);
        expect(icon).toBeDefined();
        expect(icon.type).toBeDefined();
        expect(icon.props).toBeDefined();
      });
    });

    describe('getSubjectColorClass', () => {
      it('should return correct color class for each subject', () => {
        Object.values(SubjectEnum).forEach((subject) => {
          const colorClass = getSubjectColorClass(subject);
          expect(colorClass).toBe(SubjectInfo[subject].colorClass);
        });
      });

      it('should return string values', () => {
        Object.values(SubjectEnum).forEach((subject) => {
          const colorClass = getSubjectColorClass(subject);
          expect(typeof colorClass).toBe('string');
        });
      });
    });

    describe('getSubjectName', () => {
      it('should return correct name for each subject', () => {
        Object.values(SubjectEnum).forEach((subject) => {
          const name = getSubjectName(subject);
          expect(name).toBe(SubjectInfo[subject].name);
        });
      });

      it('should return string values', () => {
        Object.values(SubjectEnum).forEach((subject) => {
          const name = getSubjectName(subject);
          expect(typeof name).toBe('string');
        });
      });
    });
  });

  describe('Type safety', () => {
    it('should have correct TypeScript types', () => {
      // Test that SubjectData interface is properly implemented
      const testData: SubjectData = {
        icon: SubjectInfo[SubjectEnum.FISICA].icon,
        colorClass: 'bg-subject-1',
        name: 'Test Subject',
      };

      expect(testData.icon).toBeDefined();
      expect(testData.colorClass).toBe('bg-subject-1');
      expect(testData.name).toBe('Test Subject');
    });

    it('should have correct IconProps interface', () => {
      // Test that IconProps interface is properly implemented
      const testProps: IconProps = {
        size: 17,
        color: '#000000',
      };

      expect(testProps.size).toBe(17);
      expect(testProps.color).toBe('#000000');
    });
  });

  describe('Edge cases', () => {
    it('should handle all enum values without errors', () => {
      const allSubjects = Object.values(SubjectEnum);

      allSubjects.forEach((subject) => {
        expect(() => getSubjectData(subject)).not.toThrow();
        expect(() => getSubjectIcon(subject)).not.toThrow();
        expect(() => getSubjectColorClass(subject)).not.toThrow();
        expect(() => getSubjectName(subject)).not.toThrow();
      });
    });

    it('should maintain consistency between direct access and helper functions', () => {
      Object.values(SubjectEnum).forEach((subject) => {
        const directData = SubjectInfo[subject];
        const helperData = getSubjectData(subject);

        expect(directData).toEqual(helperData);
        expect(directData.icon).toBe(getSubjectIcon(subject));
        expect(directData.colorClass).toBe(getSubjectColorClass(subject));
        expect(directData.name).toBe(getSubjectName(subject));
      });
    });
  });
});
