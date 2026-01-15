import { LESSON_AVAILABILITY } from '../types/lessonAvailability';
import {
  checkLessonAvailability,
  isLessonNotYetAvailable,
  isLessonExpired,
} from './lessonAvailabilityUtils';

describe('lessonAvailabilityUtils', () => {
  beforeEach(() => {
    // Mock current date to 2024-06-15T12:00:00Z
    const mockDate = new Date('2024-06-15T12:00:00Z');
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('checkLessonAvailability', () => {
    it('should return DISPONIVEL when both dates are null', () => {
      const result = checkLessonAvailability(null, null);

      expect(result.status).toBe(LESSON_AVAILABILITY.DISPONIVEL);
      expect(result.startDate).toBeNull();
      expect(result.endDate).toBeNull();
      expect(result.formattedStartDate).toBeNull();
      expect(result.formattedEndDate).toBeNull();
    });

    it('should return DISPONIVEL when current date is between start and end', () => {
      const result = checkLessonAvailability(
        '2024-01-01T00:00:00Z',
        '2024-12-31T23:59:59Z'
      );

      expect(result.status).toBe(LESSON_AVAILABILITY.DISPONIVEL);
      expect(result.formattedStartDate).toBe('01/01/2024');
      expect(result.formattedEndDate).toBe('31/12/2024');
    });

    it('should return NAO_INICIADA when current date is before start date', () => {
      const result = checkLessonAvailability(
        '2024-07-01T00:00:00Z',
        '2024-12-31T23:59:59Z'
      );

      expect(result.status).toBe(LESSON_AVAILABILITY.NAO_INICIADA);
      expect(result.formattedStartDate).toBe('01/07/2024');
    });

    it('should return EXPIRADA when current date is after end date', () => {
      const result = checkLessonAvailability(
        '2024-01-01T00:00:00Z',
        '2024-05-31T23:59:59Z'
      );

      expect(result.status).toBe(LESSON_AVAILABILITY.EXPIRADA);
      expect(result.formattedEndDate).toBe('31/05/2024');
    });

    it('should return DISPONIVEL when only start date is provided and is in past', () => {
      const result = checkLessonAvailability('2024-01-01T00:00:00Z', null);

      expect(result.status).toBe(LESSON_AVAILABILITY.DISPONIVEL);
      expect(result.endDate).toBeNull();
    });

    it('should return NAO_INICIADA when only start date is provided and is in future', () => {
      const result = checkLessonAvailability('2024-12-01T00:00:00Z', null);

      expect(result.status).toBe(LESSON_AVAILABILITY.NAO_INICIADA);
    });

    it('should return DISPONIVEL when only end date is provided and is in future', () => {
      const result = checkLessonAvailability(null, '2024-12-31T23:59:59Z');

      expect(result.status).toBe(LESSON_AVAILABILITY.DISPONIVEL);
      expect(result.startDate).toBeNull();
    });

    it('should return EXPIRADA when only end date is provided and is in past', () => {
      const result = checkLessonAvailability(null, '2024-01-01T00:00:00Z');

      expect(result.status).toBe(LESSON_AVAILABILITY.EXPIRADA);
    });

    it('should parse dates correctly', () => {
      const result = checkLessonAvailability(
        '2024-01-15T10:30:00Z',
        '2024-12-20T18:45:00Z'
      );

      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.endDate).toBeInstanceOf(Date);
      expect(result.startDate?.toISOString()).toBe('2024-01-15T10:30:00.000Z');
      expect(result.endDate?.toISOString()).toBe('2024-12-20T18:45:00.000Z');
    });
  });

  describe('isLessonNotYetAvailable', () => {
    it('should return false when startDate is null', () => {
      expect(isLessonNotYetAvailable(null)).toBe(false);
    });

    it('should return false when startDate is in the past', () => {
      expect(isLessonNotYetAvailable('2024-01-01T00:00:00Z')).toBe(false);
    });

    it('should return true when startDate is in the future', () => {
      expect(isLessonNotYetAvailable('2024-12-01T00:00:00Z')).toBe(true);
    });

    it('should return false when startDate is exactly now', () => {
      // Current time is 2024-06-15T12:00:00Z
      expect(isLessonNotYetAvailable('2024-06-15T12:00:00Z')).toBe(false);
    });

    it('should return true when startDate is one second in the future', () => {
      expect(isLessonNotYetAvailable('2024-06-15T12:00:01Z')).toBe(true);
    });
  });

  describe('isLessonExpired', () => {
    it('should return false when finalDate is null', () => {
      expect(isLessonExpired(null)).toBe(false);
    });

    it('should return false when finalDate is in the future', () => {
      expect(isLessonExpired('2024-12-31T23:59:59Z')).toBe(false);
    });

    it('should return true when finalDate is in the past', () => {
      expect(isLessonExpired('2024-01-01T00:00:00Z')).toBe(true);
    });

    it('should return false when finalDate is exactly now', () => {
      // Current time is 2024-06-15T12:00:00Z
      expect(isLessonExpired('2024-06-15T12:00:00Z')).toBe(false);
    });

    it('should return true when finalDate is one second in the past', () => {
      expect(isLessonExpired('2024-06-15T11:59:59Z')).toBe(true);
    });
  });
});
