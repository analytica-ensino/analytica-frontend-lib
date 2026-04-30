import {
  cn,
  getSubjectColorWithOpacity,
  syncDropdownState,
  formatPercentageRounded,
  formatScore,
  hexToRgba,
  bgClassToCssVar,
  polarToCartesian,
  describeArc,
  ScoreType,
} from './utils';

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

  describe('formatPercentageRounded', () => {
    it('should format integer percentage', () => {
      expect(formatPercentageRounded(72)).toBe('72%');
    });

    it('should round decimal percentage down', () => {
      expect(formatPercentageRounded(72.4)).toBe('72%');
    });

    it('should round decimal percentage up', () => {
      expect(formatPercentageRounded(72.5)).toBe('73%');
      expect(formatPercentageRounded(72.9)).toBe('73%');
    });

    it('should handle zero', () => {
      expect(formatPercentageRounded(0)).toBe('0%');
    });

    it('should handle 100', () => {
      expect(formatPercentageRounded(100)).toBe('100%');
    });

    it('should handle negative numbers', () => {
      expect(formatPercentageRounded(-5)).toBe('-5%');
    });

    it('should handle very small decimals', () => {
      expect(formatPercentageRounded(0.1)).toBe('0%');
      expect(formatPercentageRounded(0.5)).toBe('1%');
    });
  });

  describe('formatScore', () => {
    describe('percentage mode', () => {
      it('should format with 1 decimal place and comma separator', () => {
        expect(formatScore(72.5, ScoreType.PERCENTAGE)).toBe('72,5%');
      });

      it('should format integer as decimal', () => {
        expect(formatScore(72, ScoreType.PERCENTAGE)).toBe('72,0%');
      });

      it('should handle zero', () => {
        expect(formatScore(0, ScoreType.PERCENTAGE)).toBe('0,0%');
      });

      it('should handle 100', () => {
        expect(formatScore(100, ScoreType.PERCENTAGE)).toBe('100,0%');
      });

      it('should round to 1 decimal place', () => {
        expect(formatScore(72.456, ScoreType.PERCENTAGE)).toBe('72,5%');
        expect(formatScore(72.444, ScoreType.PERCENTAGE)).toBe('72,4%');
      });
    });

    describe('tri mode', () => {
      it('should format as rounded integer without symbol', () => {
        expect(formatScore(685, ScoreType.TRI)).toBe('685');
      });

      it('should round decimal values', () => {
        expect(formatScore(685.4, ScoreType.TRI)).toBe('685');
        expect(formatScore(685.5, ScoreType.TRI)).toBe('686');
      });

      it('should handle zero', () => {
        expect(formatScore(0, ScoreType.TRI)).toBe('0');
      });

      it('should handle large values', () => {
        expect(formatScore(1000, ScoreType.TRI)).toBe('1000');
      });
    });
  });

  describe('hexToRgba', () => {
    it('should convert hex color to rgba', () => {
      expect(hexToRgba('#FF0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
    });

    it('should handle hex without hash', () => {
      expect(hexToRgba('00FF00', 0.3)).toBe('rgba(0, 255, 0, 0.3)');
    });

    it('should handle lowercase hex', () => {
      expect(hexToRgba('#0000ff', 1)).toBe('rgba(0, 0, 255, 1)');
    });

    it('should handle mixed case hex', () => {
      expect(hexToRgba('#AbCdEf', 0.1)).toBe('rgba(171, 205, 239, 0.1)');
    });

    it('should return fallback gray for invalid hex', () => {
      expect(hexToRgba('invalid', 0.5)).toBe('rgba(107, 114, 128, 0.5)');
    });

    it('should return fallback gray for empty string', () => {
      expect(hexToRgba('', 0.5)).toBe('rgba(107, 114, 128, 0.5)');
    });

    it('should return fallback gray for short hex (3 digits)', () => {
      expect(hexToRgba('#FFF', 0.5)).toBe('rgba(107, 114, 128, 0.5)');
    });

    it('should handle zero opacity', () => {
      expect(hexToRgba('#000000', 0)).toBe('rgba(0, 0, 0, 0)');
    });

    it('should handle full opacity', () => {
      expect(hexToRgba('#FFFFFF', 1)).toBe('rgba(255, 255, 255, 1)');
    });
  });

  describe('bgClassToCssVar', () => {
    it('should convert bg class to CSS variable', () => {
      expect(bgClassToCssVar('bg-error-600')).toBe('var(--color-error-600)');
    });

    it('should handle different color classes', () => {
      expect(bgClassToCssVar('bg-success-400')).toBe(
        'var(--color-success-400)'
      );
      expect(bgClassToCssVar('bg-warning-500')).toBe(
        'var(--color-warning-500)'
      );
    });

    it('should handle nested color names', () => {
      expect(bgClassToCssVar('bg-text-950')).toBe('var(--color-text-950)');
    });
  });

  describe('polarToCartesian', () => {
    it('should convert 0 degrees to top position', () => {
      const result = polarToCartesian(100, 100, 50, 0);
      expect(result.x).toBe(100);
      expect(result.y).toBeCloseTo(50, 5);
    });

    it('should convert 90 degrees to right position', () => {
      const result = polarToCartesian(100, 100, 50, 90);
      expect(result.x).toBeCloseTo(150, 5);
      expect(result.y).toBeCloseTo(100, 5);
    });

    it('should convert 180 degrees to bottom position', () => {
      const result = polarToCartesian(100, 100, 50, 180);
      expect(result.x).toBeCloseTo(100, 5);
      expect(result.y).toBeCloseTo(150, 5);
    });

    it('should convert 270 degrees to left position', () => {
      const result = polarToCartesian(100, 100, 50, 270);
      expect(result.x).toBeCloseTo(50, 5);
      expect(result.y).toBeCloseTo(100, 5);
    });

    it('should handle different center coordinates', () => {
      const result = polarToCartesian(50, 50, 25, 0);
      expect(result.x).toBe(50);
      expect(result.y).toBeCloseTo(25, 5);
    });
  });

  describe('describeArc', () => {
    it('should generate SVG path string', () => {
      const path = describeArc(100, 100, 50, 0, 90);
      expect(path).toContain('M 100 100');
      expect(path).toContain('A 50 50');
      expect(path).toContain('Z');
    });

    it('should use large arc flag for angles > 180', () => {
      const smallArc = describeArc(100, 100, 50, 0, 90);
      const largeArc = describeArc(100, 100, 50, 0, 270);

      // Small arc should have 0 for large-arc-flag
      expect(smallArc).toContain('A 50 50 0 0 0');
      // Large arc should have 1 for large-arc-flag
      expect(largeArc).toContain('A 50 50 0 1 0');
    });

    it('should handle full circle', () => {
      const path = describeArc(100, 100, 50, 0, 360);
      expect(path).toBeDefined();
      expect(path.length).toBeGreaterThan(0);
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
