import { useModulesStore } from '../store/modulesStore';
import { isLessonVideoMp4Only } from '../types/modulesConfig';

/**
 * Decide the `hlsSrc` a lesson player receives.
 *
 * The MP4 (`urlVideo`) is always the player's `src`: the HLS master only rides
 * along as `hlsSrc`, and only when there is one and HLS is not switched off.
 * Returning `undefined` makes the player behave exactly as it did before HLS.
 *
 * @param hlsSrc - The lesson's `urlVideoHls`: a master playlist, or null/empty
 * while the lesson has not been converted
 * @param mp4Only - The institution's `lessonVideoMp4Only` switch
 * @returns The master to hand the player, or undefined to play the MP4
 */
export const resolveLessonHlsSrc = (
  hlsSrc: string | null | undefined,
  mp4Only: boolean
): string | undefined => {
  if (mp4Only) return undefined;

  const master = hlsSrc?.trim();
  return master || undefined;
};

/**
 * The `hlsSrc` for a lesson player, honouring the institution's way back to
 * the MP4 (`MODULES.lessonVideoMp4Only`).
 *
 * Every lesson player of the lib goes through here, so switching the flag on
 * takes all of them back to the MP4 — including the ones that load the lesson
 * themselves (catalogue page, recommended-lesson modal), where the app never
 * sees the lesson to strip the HLS from it. The flag is read from the same
 * modules store the apps fill at login (`useModules`).
 *
 * @param hlsSrc - The lesson's `urlVideoHls`
 * @returns The master to hand the player, or undefined to play the MP4
 */
export const useLessonVideoHlsSrc = (
  hlsSrc: string | null | undefined
): string | undefined => {
  const mp4Only = useModulesStore((state) =>
    isLessonVideoMp4Only(state.modules)
  );

  return resolveLessonHlsSrc(hlsSrc, mp4Only);
};
