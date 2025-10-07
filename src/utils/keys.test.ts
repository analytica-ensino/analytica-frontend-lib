import { FEATURE_FLAGS_KEYS, KEYS } from '../../src/utils/keys';

describe('keys', () => {
  describe('FEATURE_FLAGS_KEYS', () => {
    it('should have LOGIN key', () => {
      expect(FEATURE_FLAGS_KEYS.LOGIN).toBe('LOGIN');
    });

    it('should have correct number of keys', () => {
      const keys = Object.keys(FEATURE_FLAGS_KEYS);
      expect(keys).toHaveLength(1);
    });

    it('should have string values', () => {
      Object.values(FEATURE_FLAGS_KEYS).forEach((value) => {
        expect(typeof value).toBe('string');
      });
    });
  });

  describe('KEYS', () => {
    it('should have AUTH_STORAGE key', () => {
      expect(KEYS.AUTH_STORAGE).toBe('@auth-storage:analytica:v2');
    });

    it('should have APP_STORAGE key', () => {
      expect(KEYS.APP_STORAGE).toBe('@app-storage:analytica:v2');
    });

    it('should have LESSONS_STORAGE key', () => {
      expect(KEYS.LESSONS_STORAGE).toBe('@lessons-storage:analytica:v2');
    });

    it('should have correct number of keys', () => {
      const keys = Object.keys(KEYS);
      expect(keys).toHaveLength(3);
    });

    it('should have string values', () => {
      Object.values(KEYS).forEach((value) => {
        expect(typeof value).toBe('string');
      });
    });

    it('should have unique values', () => {
      const values = Object.values(KEYS);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });

    it('should follow naming convention', () => {
      Object.values(KEYS).forEach((value) => {
        expect(value).toMatch(/^@[a-z-]+:analytica:v\d+$/);
      });
    });
  });
});
