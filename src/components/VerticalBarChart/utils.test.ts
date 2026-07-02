import { niceStep, calculateTicks } from './utils';

describe('VerticalBarChart utils', () => {
  describe('niceStep', () => {
    it('should return 1 for small values (maxValue <= 4)', () => {
      expect(niceStep(4)).toBe(1);
      expect(niceStep(3)).toBe(1);
      expect(niceStep(2)).toBe(1);
    });

    it('should return 2 for values between 5 and 8', () => {
      expect(niceStep(5)).toBe(2);
      expect(niceStep(8)).toBe(2);
    });

    it('should return 5 for values between 9 and 20', () => {
      expect(niceStep(10)).toBe(5);
      expect(niceStep(20)).toBe(5);
    });

    it('should return 10 for values between 21 and 40', () => {
      expect(niceStep(30)).toBe(10);
      expect(niceStep(40)).toBe(10);
    });

    it('should return 50 for values around 200', () => {
      expect(niceStep(200)).toBe(50);
    });

    it('should return 100 for values around 400', () => {
      expect(niceStep(400)).toBe(100);
    });

    it('should return 500 for values around 1000', () => {
      // 1000/4 = 250 → magnitude=100, normalized=2.5 → niceNormalized=5 → 500
      expect(niceStep(1000)).toBe(500);
    });

    it('should always return at least 1', () => {
      expect(niceStep(0.5)).toBeGreaterThanOrEqual(1);
      expect(niceStep(0.1)).toBeGreaterThanOrEqual(1);
    });
  });

  describe('calculateTicks', () => {
    it('should return [0] for maxValue <= 0', () => {
      expect(calculateTicks(0)).toEqual([0]);
      expect(calculateTicks(-5)).toEqual([0]);
    });

    it('should return ticks in descending order', () => {
      const ticks = calculateTicks(100);
      for (let i = 1; i < ticks.length; i++) {
        expect(ticks[i - 1]).toBeGreaterThan(ticks[i]);
      }
    });

    it('should always start with 0 (last element)', () => {
      expect(calculateTicks(10).at(-1)).toBe(0);
      expect(calculateTicks(100).at(-1)).toBe(0);
      expect(calculateTicks(1000).at(-1)).toBe(0);
    });

    it('should have first element >= maxValue', () => {
      expect(calculateTicks(10)[0]).toBeGreaterThanOrEqual(10);
      expect(calculateTicks(87)[0]).toBeGreaterThanOrEqual(87);
      expect(calculateTicks(200)[0]).toBeGreaterThanOrEqual(200);
    });

    it('should calculate nice ticks for small datasets', () => {
      // maxValue = 4 → step = 1 → [4, 3, 2, 1, 0]
      expect(calculateTicks(4)).toEqual([4, 3, 2, 1, 0]);
    });

    it('should calculate nice ticks for medium datasets', () => {
      // maxValue = 200 → step = 50 → [200, 150, 100, 50, 0]
      expect(calculateTicks(200)).toEqual([200, 150, 100, 50, 0]);
    });

    it('should round up to next nice number when maxValue is not exact', () => {
      // maxValue = 87 → step = 25 → [100, 75, 50, 25, 0]
      const ticks = calculateTicks(87);
      expect(ticks[0]).toBe(100);
      expect(ticks.at(-1)).toBe(0);
    });

    it('should handle large numbers', () => {
      // 10000 → step=5000 → [10000, 5000, 0]
      const ticks = calculateTicks(10000);
      expect(ticks[0]).toBeGreaterThanOrEqual(10000);
      expect(ticks.at(-1)).toBe(0);
      expect(ticks).toEqual([10000, 5000, 0]);
    });
  });
});
