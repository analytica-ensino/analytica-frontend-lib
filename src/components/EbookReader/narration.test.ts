import {
  activeSegments,
  audioDescriptionSkipTarget,
  hasAudioDescription,
  isAudioDescriptionOnly,
} from './narration';
import type { EbookNarrationPage } from './types';

/** Page "caso" of EB40: an audio description, then three lines. */
const CASO: EbookNarrationPage = {
  section: 'caso',
  file: 'audio/narration.mp3',
  start: 85.58,
  end: 108.1,
  segments: [
    { segment: 'p3-1', start: 0, end: 13.56, ad: true },
    { segment: 'p3-2', start: 14.05, end: 18.26 },
    { segment: 'p3-3', start: 18.76, end: 20.56 },
    { segment: 'p3-4', start: 21.05, end: 22.36 },
  ],
};

const COVER: EbookNarrationPage = {
  section: 'capa',
  file: 'audio/narration.mp3',
  start: 0,
  end: 9.57,
  segments: [{ segment: 'p0-1', start: 0, end: 9.4 }],
};

describe('isAudioDescriptionOnly', () => {
  it('is true when every segment describes an image', () => {
    expect(
      isAudioDescriptionOnly({ ...CASO, segments: [CASO.segments[0]] })
    ).toBe(true);
  });

  it('is false for a page with spoken lines', () => {
    expect(isAudioDescriptionOnly(CASO)).toBe(false);
  });

  it('is false for a page without segments', () => {
    expect(isAudioDescriptionOnly({ ...CASO, segments: [] })).toBe(false);
  });
});

describe('hasAudioDescription', () => {
  it('finds an audio description in any page', () => {
    expect(hasAudioDescription([COVER, CASO])).toBe(true);
  });

  it('is false when no segment describes an image', () => {
    expect(hasAudioDescription([COVER])).toBe(false);
  });
});

describe('audioDescriptionSkipTarget', () => {
  it('never skips while audio description is on', () => {
    expect(audioDescriptionSkipTarget(CASO, 0, true)).toBe(-1);
  });

  it('jumps to the end of the description being heard', () => {
    expect(audioDescriptionSkipTarget(CASO, 5, false)).toBe(13.56);
  });

  it('jumps just before a description starts sounding', () => {
    const page = {
      ...CASO,
      segments: [
        { segment: 'a', start: 0, end: 2 },
        { segment: 'b', start: 2.1, end: 4, ad: true },
      ],
    };

    expect(audioDescriptionSkipTarget(page, 1.95, false)).toBe(4);
  });

  it('chains descriptions that follow each other', () => {
    const page = {
      ...CASO,
      segments: [
        { segment: 'a', start: 0, end: 3, ad: true },
        { segment: 'b', start: 3.1, end: 6, ad: true },
        { segment: 'c', start: 6.5, end: 8 },
      ],
    };

    expect(audioDescriptionSkipTarget(page, 0, false)).toBe(6);
  });

  it('keeps playing a spoken line', () => {
    expect(audioDescriptionSkipTarget(CASO, 15, false)).toBe(-1);
  });
});

describe('activeSegments', () => {
  it('is empty before the first segment starts', () => {
    expect(
      activeSegments({ ...CASO, segments: CASO.segments.slice(1) }, 1)
    ).toEqual([]);
  });

  it('returns the segment being read, a little ahead of the voice', () => {
    expect(activeSegments(CASO, 14.01).map(({ segment }) => segment)).toEqual([
      'p3-2',
    ]);
  });

  it('keeps the last segment until the page ends', () => {
    expect(activeSegments(CASO, 30).map(({ segment }) => segment)).toEqual([
      'p3-4',
    ]);
  });

  it('highlights segments that start together', () => {
    const page = {
      ...CASO,
      segments: [
        { segment: 'a', start: 0, end: 2 },
        { segment: 'b', start: 0, end: 2 },
        { segment: 'c', start: 2.5, end: 3 },
      ],
    };

    expect(activeSegments(page, 1).map(({ segment }) => segment)).toEqual([
      'a',
      'b',
    ]);
  });
});
