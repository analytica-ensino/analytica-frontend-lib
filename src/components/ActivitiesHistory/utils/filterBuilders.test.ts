import {
  isValidApiStatus,
  buildHistoryFiltersFromParams,
  buildModelsFiltersFromParams,
} from './filterBuilders';
import { GenericApiStatus } from '../../../types/common';
import type { TableParams } from '../../TableProvider/TableProvider';

describe('filterBuilders', () => {
  describe('isValidApiStatus', () => {
    it('should return true for valid GenericApiStatus values', () => {
      expect(isValidApiStatus(GenericApiStatus.A_VENCER)).toBe(true);
      expect(isValidApiStatus(GenericApiStatus.VENCIDA)).toBe(true);
      expect(isValidApiStatus(GenericApiStatus.CONCLUIDA)).toBe(true);
    });

    it('should return false for invalid status values', () => {
      expect(isValidApiStatus('INVALID_STATUS')).toBe(false);
      expect(isValidApiStatus('pending')).toBe(false);
      expect(isValidApiStatus('')).toBe(false);
      expect(isValidApiStatus('a_vencer')).toBe(false);
    });
  });

  describe('buildHistoryFiltersFromParams', () => {
    it('should build filters with page and limit', () => {
      const params: TableParams = { page: 1, limit: 10 };
      const result = buildHistoryFiltersFromParams(params);

      expect(result).toEqual({ page: 1, limit: 10 });
    });

    it('should include search when provided', () => {
      const params: TableParams = { page: 1, limit: 10, search: 'test query' };
      const result = buildHistoryFiltersFromParams(params);

      expect(result).toEqual({
        page: 1,
        limit: 10,
        search: 'test query',
      });
    });

    it('should include status filter when provided', () => {
      const params: TableParams = {
        page: 1,
        limit: 10,
        status: [GenericApiStatus.A_VENCER],
      };
      const result = buildHistoryFiltersFromParams(params);

      expect(result).toEqual({
        page: 1,
        limit: 10,
        status: [GenericApiStatus.A_VENCER],
      });
    });

    it('should include school filter when provided', () => {
      const params: TableParams = {
        page: 1,
        limit: 10,
        school: ['school-123'],
      };
      const result = buildHistoryFiltersFromParams(params);

      expect(result).toEqual({
        page: 1,
        limit: 10,
        school: ['school-123'],
      });
    });

    it('should include subject filter when provided', () => {
      const params: TableParams = {
        page: 1,
        limit: 10,
        subject: ['subject-456'],
      };
      const result = buildHistoryFiltersFromParams(params);

      expect(result).toEqual({
        page: 1,
        limit: 10,
        subject: ['subject-456'],
      });
    });

    it('should build filters with all parameters', () => {
      const params: TableParams = {
        page: 2,
        limit: 20,
        search: 'atividade',
        status: [GenericApiStatus.VENCIDA],
        school: ['school-abc'],
        subject: ['subject-xyz'],
      };
      const result = buildHistoryFiltersFromParams(params);

      expect(result).toEqual({
        page: 2,
        limit: 20,
        search: 'atividade',
        status: [GenericApiStatus.VENCIDA],
        school: ['school-abc'],
        subject: ['subject-xyz'],
      });
    });

    it('should ignore empty arrays', () => {
      const params: TableParams = {
        page: 1,
        limit: 10,
        status: [],
        school: [],
        subject: [],
      };
      const result = buildHistoryFiltersFromParams(params);

      expect(result).toEqual({ page: 1, limit: 10 });
    });

    it('should drop invalid status values', () => {
      const params: TableParams = {
        page: 1,
        limit: 10,
        status: ['INVALID_STATUS'],
      };
      const result = buildHistoryFiltersFromParams(params);

      expect(result.status).toEqual([]);
    });

    it('should keep the valid status values and drop the invalid ones', () => {
      const params: TableParams = {
        page: 1,
        limit: 10,
        status: ['INVALID_STATUS', GenericApiStatus.VENCIDA],
      };
      const result = buildHistoryFiltersFromParams(params);

      expect(result.status).toEqual([GenericApiStatus.VENCIDA]);
    });

    it('should keep every value when multiple values are provided', () => {
      const params: TableParams = {
        page: 1,
        limit: 10,
        status: [GenericApiStatus.A_VENCER, GenericApiStatus.VENCIDA],
        school: ['school-1', 'school-2'],
        subject: ['subject-1', 'subject-2'],
      };
      const result = buildHistoryFiltersFromParams(params);

      expect(result.status).toEqual([
        GenericApiStatus.A_VENCER,
        GenericApiStatus.VENCIDA,
      ]);
      expect(result.school).toEqual(['school-1', 'school-2']);
      expect(result.subject).toEqual(['subject-1', 'subject-2']);
    });
  });

  describe('buildModelsFiltersFromParams', () => {
    it('should build filters with page and limit', () => {
      const params: TableParams = { page: 1, limit: 10 };
      const result = buildModelsFiltersFromParams(params);

      expect(result).toEqual({ page: 1, limit: 10 });
    });

    it('should include search when provided', () => {
      const params: TableParams = { page: 1, limit: 10, search: 'modelo' };
      const result = buildModelsFiltersFromParams(params);

      expect(result).toEqual({
        page: 1,
        limit: 10,
        search: 'modelo',
      });
    });

    it('should include subject filter when provided', () => {
      const params: TableParams = {
        page: 1,
        limit: 10,
        subject: ['subject-789'],
      };
      const result = buildModelsFiltersFromParams(params);

      expect(result).toEqual({
        page: 1,
        limit: 10,
        subjectIds: 'subject-789',
      });
    });

    it('should build filters with all model parameters', () => {
      const params: TableParams = {
        page: 3,
        limit: 50,
        search: 'prova',
        subject: ['math-subject'],
      };
      const result = buildModelsFiltersFromParams(params);

      expect(result).toEqual({
        page: 3,
        limit: 50,
        search: 'prova',
        subjectIds: 'math-subject',
      });
    });

    it('should ignore empty arrays', () => {
      const params: TableParams = {
        page: 1,
        limit: 10,
        subject: [],
      };
      const result = buildModelsFiltersFromParams(params);

      expect(result).toEqual({ page: 1, limit: 10 });
    });

    it('should keep every subject when multiple values are provided', () => {
      const params: TableParams = {
        page: 1,
        limit: 10,
        subject: ['subject-1', 'subject-2', 'subject-3'],
      };
      const result = buildModelsFiltersFromParams(params);

      expect(result.subjectIds).toBe('subject-1,subject-2,subject-3');
    });
  });
});
