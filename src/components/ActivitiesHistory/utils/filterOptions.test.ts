import { getSchoolOptions, getSubjectOptions } from './filterOptions';
import type { ActivityUserFilterData } from '../../../types/activitiesHistory';

describe('filterOptions', () => {
  describe('getSchoolOptions', () => {
    it('should return empty array when data is undefined', () => {
      const result = getSchoolOptions(undefined);
      expect(result).toEqual([]);
    });

    it('should return empty array when schools is undefined', () => {
      const data: ActivityUserFilterData = {};
      const result = getSchoolOptions(data);
      expect(result).toEqual([]);
    });

    it('should return empty array when schools is empty', () => {
      const data: ActivityUserFilterData = { schools: [] };
      const result = getSchoolOptions(data);
      expect(result).toEqual([]);
    });

    it('should map schools to filter options', () => {
      const data: ActivityUserFilterData = {
        schools: [
          { id: 'school-1', name: 'Escola 1' },
          { id: 'school-2', name: 'Escola 2' },
        ],
      };
      const result = getSchoolOptions(data);

      expect(result).toEqual([
        { id: 'school-1', name: 'Escola 1' },
        { id: 'school-2', name: 'Escola 2' },
      ]);
    });

    it('should preserve school properties', () => {
      const data: ActivityUserFilterData = {
        schools: [{ id: 'abc-123', name: 'Test School' }],
      };
      const result = getSchoolOptions(data);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('abc-123');
      expect(result[0].name).toBe('Test School');
    });
  });

  describe('getSubjectOptions', () => {
    it('should return empty array when data is undefined', () => {
      const result = getSubjectOptions(undefined);
      expect(result).toEqual([]);
    });

    it('should return empty array when subjects is undefined', () => {
      const data: ActivityUserFilterData = {};
      const result = getSubjectOptions(data);
      expect(result).toEqual([]);
    });

    it('should return empty array when subjects is empty', () => {
      const data: ActivityUserFilterData = { subjects: [] };
      const result = getSubjectOptions(data);
      expect(result).toEqual([]);
    });

    it('should map subjects to filter options', () => {
      const data: ActivityUserFilterData = {
        subjects: [
          { id: 'subject-1', name: 'Matemática' },
          { id: 'subject-2', name: 'Português' },
          { id: 'subject-3', name: 'Ciências' },
        ],
      };
      const result = getSubjectOptions(data);

      expect(result).toEqual([
        { id: 'subject-1', name: 'Matemática' },
        { id: 'subject-2', name: 'Português' },
        { id: 'subject-3', name: 'Ciências' },
      ]);
    });

    it('should preserve subject properties', () => {
      const data: ActivityUserFilterData = {
        subjects: [{ id: 'xyz-789', name: 'História' }],
      };
      const result = getSubjectOptions(data);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('xyz-789');
      expect(result[0].name).toBe('História');
    });
  });

  describe('combined data', () => {
    it('should handle data with both schools and subjects', () => {
      const data: ActivityUserFilterData = {
        schools: [{ id: 's1', name: 'School 1' }],
        subjects: [{ id: 'sub1', name: 'Subject 1' }],
      };

      const schoolOptions = getSchoolOptions(data);
      const subjectOptions = getSubjectOptions(data);

      expect(schoolOptions).toHaveLength(1);
      expect(subjectOptions).toHaveLength(1);
    });
  });
});
