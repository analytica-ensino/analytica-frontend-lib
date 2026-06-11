import { getErrorMessage } from './utils';

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
});
