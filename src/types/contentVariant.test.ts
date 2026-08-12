import {
  CONTENT_VARIANTS,
  ContentVariant,
  toContentVariant,
} from './contentVariant';

describe('contentVariant', () => {
  it('lists every variant this build knows about', () => {
    expect(CONTENT_VARIANTS).toEqual([
      ContentVariant.DEFAULT,
      ContentVariant.READING_FLUENCY,
      ContentVariant.B2C,
    ]);
  });

  it.each(Object.values(ContentVariant))('keeps %s as-is', (variant) => {
    expect(toContentVariant(variant)).toBe(variant);
  });

  it.each([
    ['an unknown variant', 'PAPOLE'],
    ['an empty string', ''],
    ['null', null],
    ['undefined', undefined],
    ['a number', 3],
  ])('falls back to DEFAULT for %s', (_label, value) => {
    expect(toContentVariant(value)).toBe(ContentVariant.DEFAULT);
  });
});
