import { arraysEqual } from './arraysEqual';

describe('arraysEqual', () => {
  describe('without comparator (default behavior)', () => {
    it('should return true for empty arrays', () => {
      expect(arraysEqual([], [])).toBe(true);
    });

    it('should return true for identical arrays', () => {
      expect(arraysEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    });

    it('should return true for arrays with same elements in different order', () => {
      expect(arraysEqual([1, 2, 3], [3, 1, 2])).toBe(true);
    });

    it('should return false for arrays with different lengths', () => {
      expect(arraysEqual([1, 2], [1, 2, 3])).toBe(false);
    });

    it('should return false for arrays with different elements', () => {
      expect(arraysEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    });

    it('should work with string arrays', () => {
      expect(arraysEqual(['a', 'b', 'c'], ['c', 'a', 'b'])).toBe(true);
      expect(arraysEqual(['a', 'b'], ['a', 'c'])).toBe(false);
    });
  });

  describe('with custom comparator', () => {
    it('should compare primitive arrays using custom comparator', () => {
      const a = [3, 1, 2];
      const b = [2, 3, 1];
      const comparator = (x: number, y: number) => x - y;

      expect(arraysEqual(a, b, comparator)).toBe(true);
    });

    it('should return false when primitive arrays differ using custom comparator', () => {
      const a = [1, 2, 3];
      const b = [1, 2, 4];
      const comparator = (x: number, y: number) => x - y;

      expect(arraysEqual(a, b, comparator)).toBe(false);
    });

    it('should work with same object references', () => {
      const obj1 = { id: 1 };
      const obj2 = { id: 2 };
      const a = [obj1, obj2];
      const b = [obj2, obj1];
      const comparator = (x: { id: number }, y: { id: number }) => x.id - y.id;

      // Same object references, just different order
      expect(arraysEqual(a, b, comparator)).toBe(true);
    });

    it('should handle empty arrays with custom comparator', () => {
      const comparator = (x: number, y: number) => x - y;
      expect(arraysEqual([], [], comparator)).toBe(true);
    });

    it('should compare string arrays using custom comparator', () => {
      const a = ['banana', 'apple', 'cherry'];
      const b = ['cherry', 'apple', 'banana'];
      const comparator = (x: string, y: string) => x.localeCompare(y);

      expect(arraysEqual(a, b, comparator)).toBe(true);
    });
  });
});
