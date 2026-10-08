import { useEffect, type RefObject } from 'react';

/**
 * Vertical position of the caption box, as a percentage of the video display
 * area, for each screen range. `visible` applies while the controls bar is on
 * screen; `hidden` while it is faded out.
 *
 * The values differ per range because `line` is relative to the video height
 * while the controls bar height is nearly fixed in pixels — the same bar eats
 * ~18% of a 450px tall video and ~30% of a 170px one.
 */
export const CAPTION_LINE = {
  default: { visible: 78, hidden: 90 },
  ultraSmall: { visible: 68, hidden: 88 },
  tiny: { visible: 62, hidden: 86 },
} as const;

type CaptionLineInput = {
  controlsVisible: boolean;
  isUltraSmallMobile: boolean;
  isTinyMobile: boolean;
};

/**
 * Picks the caption line for the current screen range and controls state.
 */
export const getCaptionLine = ({
  controlsVisible,
  isUltraSmallMobile,
  isTinyMobile,
}: CaptionLineInput): number => {
  const range = (() => {
    if (isTinyMobile) return CAPTION_LINE.tiny;
    if (isUltraSmallMobile) return CAPTION_LINE.ultraSmall;
    return CAPTION_LINE.default;
  })();

  return controlsVisible ? range.visible : range.hidden;
};

/**
 * Moves every cue of the track to `line`, expressed as a percentage of the
 * video display area.
 *
 * `snapToLines = false` is what switches `line` from "text line count" to that
 * percentage. The cue's own `line` from the VTT file is overwritten on purpose:
 * honouring it would reinstate the bug precisely for the cues that ask to sit
 * at the bottom, which is the case being fixed.
 *
 * A missing or empty cue list is a no-op — `track.cues` is null until the VTT
 * file loads.
 */
export const applyCaptionLine = (
  cues: TextTrackCueList | null | undefined,
  line: number
): void => {
  if (!cues) return;

  for (const cue of cues) {
    const vttCue = cue as VTTCue;
    vttCue.snapToLines = false;
    vttCue.line = line;
  }
};

type UseCaptionPositionInput = {
  trackRef: RefObject<HTMLTrackElement | null>;
  controlsVisible: boolean;
  enabled: boolean;
  isUltraSmallMobile: boolean;
  isTinyMobile: boolean;
};

/**
 * Keeps the native caption clear of the controls bar, lifting it while the bar
 * is on screen and dropping it back when the bar fades out.
 *
 * Positioning the native cue — instead of rendering the caption ourselves —
 * is what keeps captions working inside Safari iOS native fullscreen, where
 * `webkitEnterFullscreen` hands the video over to the system player and no
 * custom overlay is drawn.
 *
 * Repositioning runs on the track's `load` event, because `track.cues` is null
 * until the VTT file arrives, and again whenever the controls state or the
 * screen range changes.
 */
export const useCaptionPosition = ({
  trackRef,
  controlsVisible,
  enabled,
  isUltraSmallMobile,
  isTinyMobile,
}: UseCaptionPositionInput): void => {
  useEffect(() => {
    const trackElement = trackRef.current;
    if (!trackElement || !enabled) return;

    const line = getCaptionLine({
      controlsVisible,
      isUltraSmallMobile,
      isTinyMobile,
    });
    const reposition = () => applyCaptionLine(trackElement.track?.cues, line);

    reposition();
    trackElement.addEventListener('load', reposition);

    return () => trackElement.removeEventListener('load', reposition);
  }, [trackRef, controlsVisible, enabled, isUltraSmallMobile, isTinyMobile]);
};
