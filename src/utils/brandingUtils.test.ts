import { normalizeBrandingField } from './brandingUtils';

describe('normalizeBrandingField', () => {
  it('should return the string value when a string is provided', () => {
    expect(normalizeBrandingField('logo.png')).toBe('logo.png');
    expect(normalizeBrandingField('https://example.com/favicon.ico')).toBe(
      'https://example.com/favicon.ico'
    );
    expect(normalizeBrandingField('')).toBe('');
  });

  it('should return null when null is provided', () => {
    expect(normalizeBrandingField(null)).toBeNull();
  });

  it('should return null when undefined is provided', () => {
    expect(normalizeBrandingField(undefined)).toBeNull();
  });

  it('should return null when non-string types are provided', () => {
    expect(normalizeBrandingField(123)).toBeNull();
    expect(normalizeBrandingField({})).toBeNull();
    expect(normalizeBrandingField([])).toBeNull();
    expect(normalizeBrandingField(true)).toBeNull();
    expect(normalizeBrandingField(false)).toBeNull();
  });

  it('should handle edge cases', () => {
    expect(normalizeBrandingField(0)).toBeNull();
    expect(normalizeBrandingField(NaN)).toBeNull();
    expect(normalizeBrandingField(Infinity)).toBeNull();
  });
});
