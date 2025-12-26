import {
  getSchoolOptionsFromUserData,
  getSubjectOptionsFromUserData,
  getSchoolYearOptionsFromUserData,
  getClassOptionsFromUserData,
  buildUserFilterData,
  type UserFilterSourceData,
} from './filterHelpers';

describe('filterHelpers', () => {
  describe('getSchoolOptionsFromUserData', () => {
    it('should return empty array when userData is null', () => {
      expect(getSchoolOptionsFromUserData(null)).toEqual([]);
    });

    it('should return empty array when userData is undefined', () => {
      expect(getSchoolOptionsFromUserData(undefined)).toEqual([]);
    });

    it('should return empty array when userInstitutions is undefined', () => {
      const userData: UserFilterSourceData = {};
      expect(getSchoolOptionsFromUserData(userData)).toEqual([]);
    });

    it('should return empty array when userInstitutions is empty', () => {
      const userData: UserFilterSourceData = { userInstitutions: [] };
      expect(getSchoolOptionsFromUserData(userData)).toEqual([]);
    });

    it('should extract unique schools from user data', () => {
      const userData: UserFilterSourceData = {
        userInstitutions: [
          { school: { id: 'school-1', name: 'Escola A' } },
          { school: { id: 'school-2', name: 'Escola B' } },
          { school: { id: 'school-1', name: 'Escola A' } }, // Duplicate
        ],
      };

      const result = getSchoolOptionsFromUserData(userData);
      expect(result).toHaveLength(2);
      expect(result).toEqual([
        { id: 'school-1', name: 'Escola A' },
        { id: 'school-2', name: 'Escola B' },
      ]);
    });

    it('should sort schools alphabetically by name', () => {
      const userData: UserFilterSourceData = {
        userInstitutions: [
          { school: { id: 'school-1', name: 'Zebra School' } },
          { school: { id: 'school-2', name: 'Apple School' } },
          { school: { id: 'school-3', name: 'Mango School' } },
        ],
      };

      const result = getSchoolOptionsFromUserData(userData);
      expect(result[0].name).toBe('Apple School');
      expect(result[1].name).toBe('Mango School');
      expect(result[2].name).toBe('Zebra School');
    });

    it('should filter out schools with missing id', () => {
      const userData: UserFilterSourceData = {
        userInstitutions: [
          { school: { id: 'school-1', name: 'Valid School' } },
          { school: { id: '', name: 'No ID School' } },
        ],
      };

      const result = getSchoolOptionsFromUserData(userData);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Valid School');
    });

    it('should filter out schools with missing name', () => {
      const userData: UserFilterSourceData = {
        userInstitutions: [
          { school: { id: 'school-1', name: 'Valid School' } },
          { school: { id: 'school-2', name: '' } },
        ],
      };

      const result = getSchoolOptionsFromUserData(userData);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Valid School');
    });

    it('should filter out institutions without school', () => {
      const userData: UserFilterSourceData = {
        userInstitutions: [
          { school: { id: 'school-1', name: 'Valid School' } },
          {},
        ],
      };

      const result = getSchoolOptionsFromUserData(userData);
      expect(result).toHaveLength(1);
    });

    it('should handle Portuguese locale sorting', () => {
      const userData: UserFilterSourceData = {
        userInstitutions: [
          { school: { id: 'school-1', name: 'Água School' } },
          { school: { id: 'school-2', name: 'Árabe School' } },
          { school: { id: 'school-3', name: 'Ana School' } },
        ],
      };

      const result = getSchoolOptionsFromUserData(userData);
      expect(result[0].name).toBe('Água School');
      expect(result[1].name).toBe('Ana School');
      expect(result[2].name).toBe('Árabe School');
    });
  });

  describe('getSubjectOptionsFromUserData', () => {
    it('should return empty array when userData is null', () => {
      expect(getSubjectOptionsFromUserData(null)).toEqual([]);
    });

    it('should return empty array when userData is undefined', () => {
      expect(getSubjectOptionsFromUserData(undefined)).toEqual([]);
    });

    it('should return empty array when subTeacherTopicClasses is undefined', () => {
      const userData: UserFilterSourceData = {};
      expect(getSubjectOptionsFromUserData(userData)).toEqual([]);
    });

    it('should return empty array when subTeacherTopicClasses is empty', () => {
      const userData: UserFilterSourceData = { subTeacherTopicClasses: [] };
      expect(getSubjectOptionsFromUserData(userData)).toEqual([]);
    });

    it('should extract unique subjects from user data', () => {
      const userData: UserFilterSourceData = {
        subTeacherTopicClasses: [
          { subject: { id: 'subject-1', name: 'Matemática' } },
          { subject: { id: 'subject-2', name: 'Português' } },
          { subject: { id: 'subject-1', name: 'Matemática' } }, // Duplicate
        ],
      };

      const result = getSubjectOptionsFromUserData(userData);
      expect(result).toHaveLength(2);
    });

    it('should sort subjects alphabetically by name', () => {
      const userData: UserFilterSourceData = {
        subTeacherTopicClasses: [
          { subject: { id: 'subject-1', name: 'Química' } },
          { subject: { id: 'subject-2', name: 'Biologia' } },
          { subject: { id: 'subject-3', name: 'Física' } },
        ],
      };

      const result = getSubjectOptionsFromUserData(userData);
      expect(result[0].name).toBe('Biologia');
      expect(result[1].name).toBe('Física');
      expect(result[2].name).toBe('Química');
    });

    it('should filter out subjects with missing id', () => {
      const userData: UserFilterSourceData = {
        subTeacherTopicClasses: [
          { subject: { id: 'subject-1', name: 'Valid Subject' } },
          { subject: { id: '', name: 'No ID Subject' } },
        ],
      };

      const result = getSubjectOptionsFromUserData(userData);
      expect(result).toHaveLength(1);
    });

    it('should filter out subjects with missing name', () => {
      const userData: UserFilterSourceData = {
        subTeacherTopicClasses: [
          { subject: { id: 'subject-1', name: 'Valid Subject' } },
          { subject: { id: 'subject-2', name: '' } },
        ],
      };

      const result = getSubjectOptionsFromUserData(userData);
      expect(result).toHaveLength(1);
    });

    it('should filter out entries without subject', () => {
      const userData: UserFilterSourceData = {
        subTeacherTopicClasses: [
          { subject: { id: 'subject-1', name: 'Valid Subject' } },
          {},
        ],
      };

      const result = getSubjectOptionsFromUserData(userData);
      expect(result).toHaveLength(1);
    });
  });

  describe('getSchoolYearOptionsFromUserData', () => {
    it('should return empty array when userData is null', () => {
      expect(getSchoolYearOptionsFromUserData(null)).toEqual([]);
    });

    it('should return empty array when userData is undefined', () => {
      expect(getSchoolYearOptionsFromUserData(undefined)).toEqual([]);
    });

    it('should return empty array when userInstitutions is undefined', () => {
      const userData: UserFilterSourceData = {};
      expect(getSchoolYearOptionsFromUserData(userData)).toEqual([]);
    });

    it('should return empty array when userInstitutions is empty', () => {
      const userData: UserFilterSourceData = { userInstitutions: [] };
      expect(getSchoolYearOptionsFromUserData(userData)).toEqual([]);
    });

    it('should extract unique school years from user data', () => {
      const userData: UserFilterSourceData = {
        userInstitutions: [
          { schoolYear: { id: 'year-1', name: '1º Ano' } },
          { schoolYear: { id: 'year-2', name: '2º Ano' } },
          { schoolYear: { id: 'year-1', name: '1º Ano' } }, // Duplicate
        ],
      };

      const result = getSchoolYearOptionsFromUserData(userData);
      expect(result).toHaveLength(2);
    });

    it('should sort school years alphabetically by name', () => {
      const userData: UserFilterSourceData = {
        userInstitutions: [
          { schoolYear: { id: 'year-1', name: '3º Ano' } },
          { schoolYear: { id: 'year-2', name: '1º Ano' } },
          { schoolYear: { id: 'year-3', name: '2º Ano' } },
        ],
      };

      const result = getSchoolYearOptionsFromUserData(userData);
      expect(result[0].name).toBe('1º Ano');
      expect(result[1].name).toBe('2º Ano');
      expect(result[2].name).toBe('3º Ano');
    });

    it('should filter out school years with missing id', () => {
      const userData: UserFilterSourceData = {
        userInstitutions: [
          { schoolYear: { id: 'year-1', name: 'Valid Year' } },
          { schoolYear: { id: '', name: 'No ID Year' } },
        ],
      };

      const result = getSchoolYearOptionsFromUserData(userData);
      expect(result).toHaveLength(1);
    });

    it('should filter out school years with missing name', () => {
      const userData: UserFilterSourceData = {
        userInstitutions: [
          { schoolYear: { id: 'year-1', name: 'Valid Year' } },
          { schoolYear: { id: 'year-2', name: '' } },
        ],
      };

      const result = getSchoolYearOptionsFromUserData(userData);
      expect(result).toHaveLength(1);
    });

    it('should filter out entries without schoolYear', () => {
      const userData: UserFilterSourceData = {
        userInstitutions: [
          { schoolYear: { id: 'year-1', name: 'Valid Year' } },
          {},
        ],
      };

      const result = getSchoolYearOptionsFromUserData(userData);
      expect(result).toHaveLength(1);
    });
  });

  describe('getClassOptionsFromUserData', () => {
    it('should return empty array when userData is null', () => {
      expect(getClassOptionsFromUserData(null)).toEqual([]);
    });

    it('should return empty array when userData is undefined', () => {
      expect(getClassOptionsFromUserData(undefined)).toEqual([]);
    });

    it('should return empty array when userInstitutions is undefined', () => {
      const userData: UserFilterSourceData = {};
      expect(getClassOptionsFromUserData(userData)).toEqual([]);
    });

    it('should return empty array when userInstitutions is empty', () => {
      const userData: UserFilterSourceData = { userInstitutions: [] };
      expect(getClassOptionsFromUserData(userData)).toEqual([]);
    });

    it('should extract unique classes from userInstitutions', () => {
      const userData: UserFilterSourceData = {
        userInstitutions: [
          { class: { id: 'class-1', name: 'Turma A' } },
          { class: { id: 'class-2', name: 'Turma B' } },
          { class: { id: 'class-1', name: 'Turma A' } }, // Duplicate
        ],
      };

      const result = getClassOptionsFromUserData(userData);
      expect(result).toHaveLength(2);
    });

    it('should also extract classes from subTeacherTopicClasses', () => {
      const userData: UserFilterSourceData = {
        userInstitutions: [{ class: { id: 'class-1', name: 'Turma A' } }],
        subTeacherTopicClasses: [
          { class: { id: 'class-2', name: 'Turma B' } },
          { class: { id: 'class-3', name: 'Turma C' } },
        ],
      };

      const result = getClassOptionsFromUserData(userData);
      expect(result).toHaveLength(3);
    });

    it('should deduplicate classes from both sources', () => {
      const userData: UserFilterSourceData = {
        userInstitutions: [{ class: { id: 'class-1', name: 'Turma A' } }],
        subTeacherTopicClasses: [
          { class: { id: 'class-1', name: 'Turma A' } }, // Same class
          { class: { id: 'class-2', name: 'Turma B' } },
        ],
      };

      const result = getClassOptionsFromUserData(userData);
      expect(result).toHaveLength(2);
    });

    it('should sort classes alphabetically by name', () => {
      const userData: UserFilterSourceData = {
        userInstitutions: [
          { class: { id: 'class-1', name: 'Turma C' } },
          { class: { id: 'class-2', name: 'Turma A' } },
          { class: { id: 'class-3', name: 'Turma B' } },
        ],
      };

      const result = getClassOptionsFromUserData(userData);
      expect(result[0].name).toBe('Turma A');
      expect(result[1].name).toBe('Turma B');
      expect(result[2].name).toBe('Turma C');
    });

    it('should filter out classes with missing id from userInstitutions', () => {
      const userData: UserFilterSourceData = {
        userInstitutions: [
          { class: { id: 'class-1', name: 'Valid Class' } },
          { class: { id: '', name: 'No ID Class' } },
        ],
      };

      const result = getClassOptionsFromUserData(userData);
      expect(result).toHaveLength(1);
    });

    it('should filter out classes with missing name from userInstitutions', () => {
      const userData: UserFilterSourceData = {
        userInstitutions: [
          { class: { id: 'class-1', name: 'Valid Class' } },
          { class: { id: 'class-2', name: '' } },
        ],
      };

      const result = getClassOptionsFromUserData(userData);
      expect(result).toHaveLength(1);
    });

    it('should filter out classes with missing id from subTeacherTopicClasses', () => {
      const userData: UserFilterSourceData = {
        userInstitutions: [],
        subTeacherTopicClasses: [
          { class: { id: 'class-1', name: 'Valid Class' } },
          { class: { id: '', name: 'No ID Class' } },
        ],
      };

      const result = getClassOptionsFromUserData(userData);
      expect(result).toHaveLength(1);
    });

    it('should filter out classes with missing name from subTeacherTopicClasses', () => {
      const userData: UserFilterSourceData = {
        userInstitutions: [],
        subTeacherTopicClasses: [
          { class: { id: 'class-1', name: 'Valid Class' } },
          { class: { id: 'class-2', name: '' } },
        ],
      };

      const result = getClassOptionsFromUserData(userData);
      expect(result).toHaveLength(1);
    });

    it('should filter out entries without class in userInstitutions', () => {
      const userData: UserFilterSourceData = {
        userInstitutions: [
          { class: { id: 'class-1', name: 'Valid Class' } },
          {},
        ],
      };

      const result = getClassOptionsFromUserData(userData);
      expect(result).toHaveLength(1);
    });

    it('should filter out entries without class in subTeacherTopicClasses', () => {
      const userData: UserFilterSourceData = {
        userInstitutions: [],
        subTeacherTopicClasses: [
          { class: { id: 'class-1', name: 'Valid Class' } },
          {},
        ],
      };

      const result = getClassOptionsFromUserData(userData);
      expect(result).toHaveLength(1);
    });

    it('should work when subTeacherTopicClasses is undefined', () => {
      const userData: UserFilterSourceData = {
        userInstitutions: [{ class: { id: 'class-1', name: 'Turma A' } }],
      };

      const result = getClassOptionsFromUserData(userData);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Turma A');
    });
  });

  describe('buildUserFilterData', () => {
    it('should return empty arrays when userData is null', () => {
      const result = buildUserFilterData(null);
      expect(result).toEqual({ schools: [], subjects: [] });
    });

    it('should return empty arrays when userData is undefined', () => {
      const result = buildUserFilterData(undefined);
      expect(result).toEqual({ schools: [], subjects: [] });
    });

    it('should combine schools and subjects from user data', () => {
      const userData: UserFilterSourceData = {
        userInstitutions: [{ school: { id: 'school-1', name: 'Escola A' } }],
        subTeacherTopicClasses: [
          { subject: { id: 'subject-1', name: 'Matemática' } },
        ],
      };

      const result = buildUserFilterData(userData);
      expect(result.schools).toHaveLength(1);
      expect(result.subjects).toHaveLength(1);
      expect(result.schools[0].name).toBe('Escola A');
      expect(result.subjects[0].name).toBe('Matemática');
    });
  });
});
