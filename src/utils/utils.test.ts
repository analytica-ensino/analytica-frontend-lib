import { cn, getSubjectColorWithOpacity, syncDropdownState } from './utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge classes correctly', () => {
      expect(cn('px-2 py-1', 'px-3')).toBe('py-1 px-3');
    });

    it('should handle conditional classes', () => {
      expect(cn('px-2', 'text-red-500')).toBe('px-2 text-red-500');
    });

    it('should handle empty inputs', () => {
      expect(cn()).toBe('');
    });
  });

  describe('getSubjectColorWithOpacity', () => {
    describe('when hexColor is undefined or empty', () => {
      it('should return undefined for undefined input', () => {
        expect(getSubjectColorWithOpacity(undefined, false)).toBeUndefined();
        expect(getSubjectColorWithOpacity(undefined, true)).toBeUndefined();
      });

      it('should return undefined for empty string', () => {
        expect(getSubjectColorWithOpacity('', false)).toBeUndefined();
        expect(getSubjectColorWithOpacity('', true)).toBeUndefined();
      });
    });

    describe('when isDark is false (light mode)', () => {
      it('should add opacity to 6-digit hex color without #', () => {
        expect(getSubjectColorWithOpacity('0066b8', false)).toBe('#0066b84d');
        expect(getSubjectColorWithOpacity('ff0000', false)).toBe('#ff00004d');
        expect(getSubjectColorWithOpacity('abcdef', false)).toBe('#abcdef4d');
      });

      it('should add opacity to 6-digit hex color with #', () => {
        expect(getSubjectColorWithOpacity('#0066b8', false)).toBe('#0066b84d');
        expect(getSubjectColorWithOpacity('#FF0000', false)).toBe('#ff00004d');
        expect(getSubjectColorWithOpacity('#AbCdEf', false)).toBe('#abcdef4d');
      });

      it('should return 8-digit hex color as is', () => {
        expect(getSubjectColorWithOpacity('#0066b8ff', false)).toBe(
          '#0066b8ff'
        );
        expect(getSubjectColorWithOpacity('0066b8aa', false)).toBe('#0066b8aa');
        expect(getSubjectColorWithOpacity('#FF00004d', false)).toBe(
          '#ff00004d'
        );
      });

      it('should handle colors with existing opacity', () => {
        expect(getSubjectColorWithOpacity('#0066b8cc', false)).toBe(
          '#0066b8cc'
        );
        expect(getSubjectColorWithOpacity('ff000080', false)).toBe('#ff000080');
      });
    });

    describe('when isDark is true (dark mode)', () => {
      it('should return 6-digit hex color without opacity', () => {
        expect(getSubjectColorWithOpacity('0066b8', true)).toBe('#0066b8');
        expect(getSubjectColorWithOpacity('#ff0000', true)).toBe('#ff0000');
        expect(getSubjectColorWithOpacity('#AbCdEf', true)).toBe('#abcdef');
      });

      it('should remove opacity from 8-digit hex color', () => {
        expect(getSubjectColorWithOpacity('#0066b84d', true)).toBe('#0066b8');
        expect(getSubjectColorWithOpacity('ff0000cc', true)).toBe('#ff0000');
        expect(getSubjectColorWithOpacity('#AbCdEfAa', true)).toBe('#abcdef');
      });

      it('should remove opacity even from colors that already have 8 digits', () => {
        expect(getSubjectColorWithOpacity('#0066b8ff', true)).toBe('#0066b8');
        expect(getSubjectColorWithOpacity('ff0000aa', true)).toBe('#ff0000');
      });
    });

    describe('edge cases', () => {
      it('should handle uppercase hex colors', () => {
        expect(getSubjectColorWithOpacity('#FF0000', false)).toBe('#ff00004d');
        expect(getSubjectColorWithOpacity('ABCDEF', true)).toBe('#abcdef');
      });

      it('should handle mixed case hex colors', () => {
        expect(getSubjectColorWithOpacity('#AbCdEf', false)).toBe('#abcdef4d');
        expect(getSubjectColorWithOpacity('FfAaBb', true)).toBe('#ffaabb');
      });

      it('should handle colors with different lengths', () => {
        // 3-digit colors (should be handled as is since they are not 6 or 8 digits)
        expect(getSubjectColorWithOpacity('#fff', false)).toBe('#fff');
        expect(getSubjectColorWithOpacity('000', true)).toBe('#000');

        // 4-digit colors (should be handled as is)
        expect(getSubjectColorWithOpacity('#ffff', false)).toBe('#ffff');
        expect(getSubjectColorWithOpacity('0000', true)).toBe('#0000');

        // 5-digit colors (should be handled as is)
        expect(getSubjectColorWithOpacity('#fffff', false)).toBe('#fffff');
        expect(getSubjectColorWithOpacity('00000', true)).toBe('#00000');
      });

      it('should handle colors with whitespace (preserves whitespace)', () => {
        // A função não faz trim, então whitespace é preservado como parte da cor
        // Isso pode não ser o comportamento desejado, mas é o comportamento atual
        expect(getSubjectColorWithOpacity(' #0066b8 ', false)).toBe(
          '# #0066b8 '
        );
        expect(getSubjectColorWithOpacity(' ff0000 ', true)).toBe('# ff000');
      });
    });

    describe('real-world scenarios', () => {
      it('should work with common subject colors in light mode', () => {
        // Matemática - azul
        expect(getSubjectColorWithOpacity('#0066b8', false)).toBe('#0066b84d');
        // Português - verde
        expect(getSubjectColorWithOpacity('#00a651', false)).toBe('#00a6514d');
        // História - marrom
        expect(getSubjectColorWithOpacity('#8b4513', false)).toBe('#8b45134d');
      });

      it('should work with common subject colors in dark mode', () => {
        // Matemática - azul
        expect(getSubjectColorWithOpacity('#0066b8', true)).toBe('#0066b8');
        // Português - verde
        expect(getSubjectColorWithOpacity('#00a651', true)).toBe('#00a651');
        // História - marrom
        expect(getSubjectColorWithOpacity('#8b4513', true)).toBe('#8b4513');
      });

      it('should handle colors that come with opacity from API', () => {
        // Cor que já vem com opacidade da API em light mode
        expect(getSubjectColorWithOpacity('#0066b84d', false)).toBe(
          '#0066b84d'
        );
        // Cor que já vem com opacidade da API em dark mode (deve remover)
        expect(getSubjectColorWithOpacity('#0066b84d', true)).toBe('#0066b8');
      });
    });
  });

  describe('syncDropdownState', () => {
    it('should update state when open is false and dropdown is active', () => {
      const mockSetActiveStates = jest.fn();

      syncDropdownState(false, true, mockSetActiveStates, 'notifications');

      expect(mockSetActiveStates).toHaveBeenCalledWith(expect.any(Function));

      // Test the callback function
      const callback = mockSetActiveStates.mock.calls[0][0];
      const prevState = { notifications: true, profile: false };
      const result = callback(prevState);

      expect(result).toEqual({
        notifications: false,
        profile: false,
      });
    });

    it('should not update state when open is true', () => {
      const mockSetActiveStates = jest.fn();

      syncDropdownState(true, true, mockSetActiveStates, 'notifications');

      expect(mockSetActiveStates).not.toHaveBeenCalled();
    });

    it('should not update state when dropdown is not active', () => {
      const mockSetActiveStates = jest.fn();

      syncDropdownState(false, false, mockSetActiveStates, 'notifications');

      expect(mockSetActiveStates).not.toHaveBeenCalled();
    });

    it('should not update state when open is true and dropdown is not active', () => {
      const mockSetActiveStates = jest.fn();

      syncDropdownState(true, false, mockSetActiveStates, 'notifications');

      expect(mockSetActiveStates).not.toHaveBeenCalled();
    });

    it('should update state with custom key', () => {
      const mockSetActiveStates = jest.fn();

      syncDropdownState(false, true, mockSetActiveStates, 'profile');

      expect(mockSetActiveStates).toHaveBeenCalledWith(expect.any(Function));

      // Test the callback function
      const callback = mockSetActiveStates.mock.calls[0][0];
      const prevState = { notifications: false, profile: true };
      const result = callback(prevState);

      expect(result).toEqual({
        notifications: false,
        profile: false,
      });
    });
  });
});
