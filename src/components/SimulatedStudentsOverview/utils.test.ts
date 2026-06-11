import {
  getErrorMessage,
  isStudentsData,
  isClassesData,
  isMunicipalitiesData,
} from './utils';
import type {
  StudentsOnlyOverviewData,
  ClassesOverviewData,
  MunicipalitiesOverviewData,
} from './types';

const mockStudentsData: StudentsOnlyOverviewData = {
  classAverage: 75,
  totalStudents: 10,
  counters: {
    highlight: 2,
    aboveAverage: 3,
    belowAverage: 3,
    attentionPoint: 2,
  },
  topHighlights: [],
  topDifficulties: [],
};

const mockClassesData: ClassesOverviewData = {
  classAverage: 70,
  totalClasses: 5,
  totalStudents: 100,
  counters: {
    highlight: 1,
    aboveAverage: 2,
    belowAverage: 1,
    attentionPoint: 1,
  },
  topHighlights: [],
  topDifficulties: [],
};

const mockMunicipalitiesData: MunicipalitiesOverviewData = {
  classAverage: 72,
  totalMunicipalities: 3,
  totalSchools: 15,
  totalStudents: 500,
  counters: {
    highlight: 1,
    aboveAverage: 1,
    belowAverage: 1,
    attentionPoint: 0,
  },
  topHighlights: [],
  topDifficulties: [],
};

describe('utils', () => {
  describe('getErrorMessage', () => {
    it('returns error message when err is an Error instance', () => {
      const error = new Error('Something went wrong');
      expect(getErrorMessage(error, 'Fallback message')).toBe(
        'Something went wrong'
      );
    });

    it('returns fallback message when err is a string', () => {
      expect(getErrorMessage('fail', 'Fallback message')).toBe(
        'Fallback message'
      );
    });

    it('returns fallback message when err is null', () => {
      expect(getErrorMessage(null, 'Fallback message')).toBe(
        'Fallback message'
      );
    });

    it('returns fallback message when err is undefined', () => {
      expect(getErrorMessage(undefined, 'Fallback message')).toBe(
        'Fallback message'
      );
    });

    it('returns fallback message when err is an object', () => {
      expect(getErrorMessage({ error: 'test' }, 'Fallback message')).toBe(
        'Fallback message'
      );
    });

    it('returns fallback message when err is a number', () => {
      expect(getErrorMessage(500, 'Fallback message')).toBe('Fallback message');
    });
  });

  describe('isStudentsData', () => {
    it('returns true when type is students and data has students shape', () => {
      expect(isStudentsData(mockStudentsData, 'students')).toBe(true);
    });

    it('returns false when type is not students', () => {
      expect(isStudentsData(mockStudentsData, 'classes')).toBe(false);
      expect(isStudentsData(mockStudentsData, 'municipalities')).toBe(false);
    });

    it('returns false when data is null', () => {
      expect(isStudentsData(null, 'students')).toBe(false);
    });

    it('returns false when type is students but data has classes shape', () => {
      expect(isStudentsData(mockClassesData, 'students')).toBe(false);
    });

    it('returns false when type is students but data has municipalities shape', () => {
      expect(isStudentsData(mockMunicipalitiesData, 'students')).toBe(false);
    });
  });

  describe('isClassesData', () => {
    it('returns true when type is classes and data has classes shape', () => {
      expect(isClassesData(mockClassesData, 'classes')).toBe(true);
    });

    it('returns false when type is not classes', () => {
      expect(isClassesData(mockClassesData, 'students')).toBe(false);
      expect(isClassesData(mockClassesData, 'municipalities')).toBe(false);
    });

    it('returns false when data is null', () => {
      expect(isClassesData(null, 'classes')).toBe(false);
    });

    it('returns false when type is classes but data has students shape', () => {
      expect(isClassesData(mockStudentsData, 'classes')).toBe(false);
    });

    it('returns false when type is classes but data has municipalities shape', () => {
      expect(isClassesData(mockMunicipalitiesData, 'classes')).toBe(false);
    });
  });

  describe('isMunicipalitiesData', () => {
    it('returns true when type is municipalities and data has municipalities shape', () => {
      expect(
        isMunicipalitiesData(mockMunicipalitiesData, 'municipalities')
      ).toBe(true);
    });

    it('returns false when type is not municipalities', () => {
      expect(isMunicipalitiesData(mockMunicipalitiesData, 'students')).toBe(
        false
      );
      expect(isMunicipalitiesData(mockMunicipalitiesData, 'classes')).toBe(
        false
      );
    });

    it('returns false when data is null', () => {
      expect(isMunicipalitiesData(null, 'municipalities')).toBe(false);
    });

    it('returns false when type is municipalities but data has students shape', () => {
      expect(isMunicipalitiesData(mockStudentsData, 'municipalities')).toBe(
        false
      );
    });

    it('returns false when type is municipalities but data has classes shape', () => {
      expect(isMunicipalitiesData(mockClassesData, 'municipalities')).toBe(
        false
      );
    });
  });
});
