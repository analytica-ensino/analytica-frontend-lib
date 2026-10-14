import {
  applyCaptionLine,
  getCaptionLine,
  CAPTION_LINE,
} from './useCaptionPosition';

/**
 * Builds an array-like stand-in for TextTrackCueList. jsdom does not implement
 * VTTCue, so the cues only need `line` and `snapToLines` to be observable.
 */
const buildCueList = (count: number) => {
  const cues = Array.from({ length: count }, () => ({
    line: 'auto' as number | 'auto',
    snapToLines: true,
  }));
  return {
    list: cues as unknown as TextTrackCueList,
    cues,
  };
};

describe('applyCaptionLine', () => {
  it('should set snapToLines to false and the given line on every cue', () => {
    const { list, cues } = buildCueList(3);

    applyCaptionLine(list, 78);

    cues.forEach((cue) => {
      expect(cue.snapToLines).toBe(false);
      expect(cue.line).toBe(78);
    });
  });

  it('should not throw for an empty cue list', () => {
    const { list } = buildCueList(0);

    expect(() => applyCaptionLine(list, 90)).not.toThrow();
  });

  it('should not throw when the cue list is null', () => {
    expect(() => applyCaptionLine(null, 90)).not.toThrow();
  });

  it('should not throw when the cue list is undefined', () => {
    expect(() => applyCaptionLine(undefined, 90)).not.toThrow();
  });
});

describe('getCaptionLine', () => {
  it('should lift the caption above the controls bar when controls are visible', () => {
    expect(
      getCaptionLine({
        controlsVisible: true,
        isUltraSmallMobile: false,
        isTinyMobile: false,
      })
    ).toBe(CAPTION_LINE.default.visible);
  });

  it('should drop the caption near the bottom when controls are hidden', () => {
    expect(
      getCaptionLine({
        controlsVisible: false,
        isUltraSmallMobile: false,
        isTinyMobile: false,
      })
    ).toBe(CAPTION_LINE.default.hidden);
  });

  it('should use the ultra small mobile values below 375px', () => {
    expect(
      getCaptionLine({
        controlsVisible: true,
        isUltraSmallMobile: true,
        isTinyMobile: false,
      })
    ).toBe(CAPTION_LINE.ultraSmall.visible);
    expect(
      getCaptionLine({
        controlsVisible: false,
        isUltraSmallMobile: true,
        isTinyMobile: false,
      })
    ).toBe(CAPTION_LINE.ultraSmall.hidden);
  });

  it('should use the tiny mobile values below 320px', () => {
    expect(
      getCaptionLine({
        controlsVisible: true,
        isUltraSmallMobile: true,
        isTinyMobile: true,
      })
    ).toBe(CAPTION_LINE.tiny.visible);
    expect(
      getCaptionLine({
        controlsVisible: false,
        isUltraSmallMobile: true,
        isTinyMobile: true,
      })
    ).toBe(CAPTION_LINE.tiny.hidden);
  });

  it('should lift the caption higher as the screen gets narrower', () => {
    const narrower = [
      CAPTION_LINE.default.visible,
      CAPTION_LINE.ultraSmall.visible,
      CAPTION_LINE.tiny.visible,
    ];

    expect(narrower).toStrictEqual([...narrower].sort((a, b) => b - a));
  });
});
