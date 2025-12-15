import { STUDENT_ACTIVITY_STATUS } from '../types/activityDetails';
import {
  getStatusBadgeConfig,
  formatTimeSpent,
  formatQuestionNumbers,
  formatDateToBrazilian,
} from './activityDetailsUtils';

describe('activityDetailsUtils', () => {
  describe('getStatusBadgeConfig', () => {
    it('should return correct config for CONCLUIDO status', () => {
      const config = getStatusBadgeConfig(STUDENT_ACTIVITY_STATUS.CONCLUIDO);

      expect(config).toEqual({
        label: 'Concluído',
        bgColor: 'bg-green-50',
        textColor: 'text-green-800',
      });
    });

    it('should return correct config for AGUARDANDO_CORRECAO status', () => {
      const config = getStatusBadgeConfig(
        STUDENT_ACTIVITY_STATUS.AGUARDANDO_CORRECAO
      );

      expect(config).toEqual({
        label: 'Aguardando Correção',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-800',
      });
    });

    it('should return correct config for AGUARDANDO_RESPOSTA status', () => {
      const config = getStatusBadgeConfig(
        STUDENT_ACTIVITY_STATUS.AGUARDANDO_RESPOSTA
      );

      expect(config).toEqual({
        label: 'Aguardando Resposta',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-800',
      });
    });

    it('should return correct config for NAO_ENTREGUE status', () => {
      const config = getStatusBadgeConfig(STUDENT_ACTIVITY_STATUS.NAO_ENTREGUE);

      expect(config).toEqual({
        label: 'Não Entregue',
        bgColor: 'bg-red-50',
        textColor: 'text-red-800',
      });
    });

    it('should return default config for unknown status', () => {
      const config = getStatusBadgeConfig(
        'UNKNOWN_STATUS' as typeof STUDENT_ACTIVITY_STATUS.CONCLUIDO
      );

      expect(config).toEqual({
        label: 'Desconhecido',
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-800',
      });
    });
  });

  describe('formatTimeSpent', () => {
    it('should format 0 seconds correctly', () => {
      expect(formatTimeSpent(0)).toBe('00:00:00');
    });

    it('should format seconds only', () => {
      expect(formatTimeSpent(45)).toBe('00:00:45');
    });

    it('should format minutes and seconds', () => {
      expect(formatTimeSpent(90)).toBe('00:01:30');
    });

    it('should format hours only', () => {
      expect(formatTimeSpent(3600)).toBe('01:00:00');
    });

    it('should format hours, minutes, and seconds', () => {
      expect(formatTimeSpent(3665)).toBe('01:01:05');
    });

    it('should format large values correctly', () => {
      expect(formatTimeSpent(36000)).toBe('10:00:00');
    });

    it('should pad single digit values with zero', () => {
      expect(formatTimeSpent(3661)).toBe('01:01:01');
    });
  });

  describe('formatQuestionNumbers', () => {
    it('should return "-" for empty array', () => {
      expect(formatQuestionNumbers([])).toBe('-');
    });

    it('should format single element (0-indexed to 1-indexed)', () => {
      expect(formatQuestionNumbers([0])).toBe('01');
    });

    it('should format multiple elements with comma separator', () => {
      expect(formatQuestionNumbers([0, 1, 2])).toBe('01, 02, 03');
    });

    it('should format non-sequential numbers correctly', () => {
      expect(formatQuestionNumbers([0, 5, 10])).toBe('01, 06, 11');
    });

    it('should format double-digit numbers correctly', () => {
      expect(formatQuestionNumbers([9, 10, 11])).toBe('10, 11, 12');
    });

    it('should handle single large number', () => {
      expect(formatQuestionNumbers([99])).toBe('100');
    });
  });

  describe('formatDateToBrazilian', () => {
    it('should format ISO date string to DD/MM/YYYY', () => {
      expect(formatDateToBrazilian('2024-01-15')).toBe('15/01/2024');
    });

    it('should format ISO date with time to DD/MM/YYYY', () => {
      expect(formatDateToBrazilian('2024-01-15T10:30:00Z')).toBe('15/01/2024');
    });

    it('should format different month correctly', () => {
      expect(formatDateToBrazilian('2025-12-31')).toBe('31/12/2025');
    });

    it('should format February date correctly', () => {
      expect(formatDateToBrazilian('2025-02-15')).toBe('15/02/2025');
    });

    it('should format first day of year correctly', () => {
      expect(formatDateToBrazilian('2025-01-01')).toBe('01/01/2025');
    });

    it('should format date with timezone offset correctly', () => {
      expect(formatDateToBrazilian('2024-06-20T23:59:59Z')).toBe('20/06/2024');
    });
  });
});
