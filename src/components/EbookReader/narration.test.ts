import {
  activeClips,
  audioDescriptionSkipTarget,
  hasAudioDescription,
  isAudioDescriptionOnly,
} from './narration';
import type { EbookNarrationPage } from './types';

/** Page "caso" of EB40: an audio description, then three lines. */
const CASO: EbookNarrationPage = {
  section: 'caso',
  file: 'audio/narracao.mp3',
  start: 85.58,
  end: 108.1,
  clips: [
    { id: 'p3-1', start: 0, end: 13.56, audioDescription: true },
    { id: 'p3-2', start: 14.05, end: 18.26 },
    { id: 'p3-3', start: 18.76, end: 20.56 },
    { id: 'p3-4', start: 21.05, end: 22.36 },
  ],
};

const COVER: EbookNarrationPage = {
  section: 'capa',
  file: 'audio/narracao.mp3',
  start: 0,
  end: 9.57,
  clips: [{ id: 'p0-1', start: 0, end: 9.4 }],
};

describe('isAudioDescriptionOnly', () => {
  it('is true when every clip describes an image', () => {
    expect(isAudioDescriptionOnly({ ...CASO, clips: [CASO.clips[0]] })).toBe(
      true
    );
  });

  it('is false for a page with spoken lines', () => {
    expect(isAudioDescriptionOnly(CASO)).toBe(false);
  });

  it('is false for a page without clips', () => {
    expect(isAudioDescriptionOnly({ ...CASO, clips: [] })).toBe(false);
  });
});

describe('hasAudioDescription', () => {
  it('finds an audio description in any page', () => {
    expect(hasAudioDescription([COVER, CASO])).toBe(true);
  });

  it('is false when no clip describes an image', () => {
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
      clips: [
        { id: 'a', start: 0, end: 2 },
        { id: 'b', start: 2.1, end: 4, audioDescription: true },
      ],
    };

    expect(audioDescriptionSkipTarget(page, 1.95, false)).toBe(4);
  });

  it('chains descriptions that follow each other', () => {
    const page = {
      ...CASO,
      clips: [
        { id: 'a', start: 0, end: 3, audioDescription: true },
        { id: 'b', start: 3.1, end: 6, audioDescription: true },
        { id: 'c', start: 6.5, end: 8 },
      ],
    };

    expect(audioDescriptionSkipTarget(page, 0, false)).toBe(6);
  });

  it('keeps playing a spoken line', () => {
    expect(audioDescriptionSkipTarget(CASO, 15, false)).toBe(-1);
  });
});

describe('activeClips', () => {
  it('is empty before the first clip starts', () => {
    expect(activeClips({ ...CASO, clips: CASO.clips.slice(1) }, 1)).toEqual([]);
  });

  it('returns the clip being read, a little ahead of the voice', () => {
    expect(activeClips(CASO, 14.01).map((clip) => clip.id)).toEqual(['p3-2']);
  });

  it('keeps the last clip until the page ends', () => {
    expect(activeClips(CASO, 30).map((clip) => clip.id)).toEqual(['p3-4']);
  });

  it('highlights clips that start together', () => {
    const page = {
      ...CASO,
      clips: [
        { id: 'a', start: 0, end: 2 },
        { id: 'b', start: 0, end: 2 },
        { id: 'c', start: 2.5, end: 3 },
      ],
    };

    expect(activeClips(page, 1).map((clip) => clip.id)).toEqual(['a', 'b']);
  });
});
