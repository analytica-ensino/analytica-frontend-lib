import {
  measureBook,
  pageLabel,
  readingProgress,
  visiblePages,
} from './bookLayout';

/** EB40: cover, 24 inner pages, back cover. */
const COUNT = 26;

describe('measureBook', () => {
  it('shows a spread when two pages fit the width', () => {
    expect(measureBook(1440, 800)).toEqual({
      pageWidth: 533,
      pageHeight: 799,
      spread: true,
    });
  });

  it('shows one page on a phone, as wide as the screen allows', () => {
    expect(measureBook(375, 700)).toEqual({
      pageWidth: 343,
      pageHeight: 514,
      spread: false,
    });
  });

  it('caps the page height on very tall screens', () => {
    expect(measureBook(4000, 2000).pageHeight).toBe(900);
  });

  it('never makes the book taller than the space', () => {
    expect(measureBook(1440, 715).pageHeight).toBeLessThanOrEqual(715);
  });

  it('keeps a minimum page height on very short screens', () => {
    expect(measureBook(4000, 100)).toEqual({
      pageWidth: 213,
      pageHeight: 319,
      spread: true,
    });
  });
});

describe('visiblePages', () => {
  it.each([
    [0, true, [0]],
    [1, true, [1, 2]],
    [23, true, [23, 24]],
    [25, true, [25]],
    [5, false, [5]],
  ])('page %i with spread=%s shows %j', (index, spread, expected) => {
    expect(visiblePages(index, COUNT, spread)).toEqual(expected);
  });
});

describe('pageLabel', () => {
  it.each([
    [0, true, 'Capa'],
    [25, true, 'Contracapa'],
    [1, true, '1–2 de 24'],
    [23, true, '23–24 de 24'],
    [5, false, '5 de 24'],
  ])('page %i with spread=%s reads "%s"', (index, spread, expected) => {
    expect(pageLabel(index, COUNT, spread)).toBe(expected);
  });
});

describe('readingProgress', () => {
  it.each([
    [0, 0],
    [13, 52],
    [25, 100],
  ])('page %i is %i%% of the book', (index, expected) => {
    expect(readingProgress(index, COUNT)).toBe(expected);
  });

  it('is zero for a single page', () => {
    expect(readingProgress(0, 1)).toBe(0);
  });
});
