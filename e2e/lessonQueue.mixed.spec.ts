import { expect as baseExpect, test, type Page } from '@playwright/test';

/**
 * Lesson queue with different media on each lesson, in the Ladle story
 * `LessonViewPage > QueueMixed`: Aula 1 (MP4), Aula 2 (HLS, saved at 4 s),
 * Aula 3 and Aula 5 (other MP4 files) and Aula 4 (no video, outside the
 * queue). One player stays mounted across lessons, so these cover what a
 * single shared file hides: the next media must not inherit the previous
 * one's position, play state or speed.
 */

/** Polls wait up to 30 s: media start-up is slow on a loaded machine. */
const expect = baseExpect.configure({ timeout: 30_000 });

const STORY = 'lesson-view-page--queue-mixed';
/** Every lesson in HLS: native in WebKit, as in Safari. */
const HLS_STORY = 'lesson-view-page--queue-hls';
const COUNTDOWN = /Próxima aula em \ds/;

interface ApiWrite {
  url: string;
  body: Record<string, unknown> | null;
}

const openStory = async (page: Page, story = STORY) => {
  await page.goto(`?story=${story}&mode=preview`);
  await page.locator('video').waitFor({ state: 'attached' });
};

const activeLesson = (page: Page) =>
  page.locator('span.rounded-t-xl').first().innerText();

const video = (page: Page) => page.locator('video');

const isPaused = (page: Page) =>
  video(page).evaluate((element: HTMLVideoElement) => element.paused);

const videoTime = (page: Page) =>
  video(page).evaluate((element: HTMLVideoElement) => element.currentTime);

const currentSrc = (page: Page) =>
  video(page).evaluate((element: HTMLVideoElement) => element.currentSrc);

/**
 * Waits for the element to load another media than `previous`. Right after a
 * switch it still holds the previous lesson's video for a moment: reading its
 * position before that measures the wrong video.
 */
const waitForNewMedia = async (page: Page, previous: string) => {
  await expect.poll(() => currentSrc(page)).not.toBe(previous);
  await expect
    .poll(() =>
      video(page).evaluate((element: HTMLVideoElement) => element.readyState)
    )
    .toBeGreaterThanOrEqual(1);
};

const play = async (page: Page) => {
  await page.getByRole('button', { name: 'Reproduzir vídeo' }).click();
  await expect.poll(() => isPaused(page)).toBe(false);
};

/** Seeks `fromEnd` seconds before the end, once the media has a duration. */
const seekTo = async (page: Page, fromEnd: number) => {
  await expect
    .poll(() =>
      video(page).evaluate((element: HTMLVideoElement) =>
        Number.isFinite(element.duration)
      )
    )
    .toBe(true);
  await video(page).evaluate((element: HTMLVideoElement, offset: number) => {
    element.currentTime = element.duration - offset;
  }, fromEnd);
};

/**
 * Makes sure the video plays. Right after the queue opens a lesson it starts
 * on its own (where the browser allows it): clicking play at that moment
 * would land on top of the autoplay and pause it again.
 */
const ensurePlaying = async (page: Page) => {
  const autoplayed = await expect
    .poll(() => isPaused(page), { timeout: 3_000 })
    .toBe(false)
    .then(() => true)
    .catch(() => false);
  if (!autoplayed) await play(page);
};

/** Jumps close to the end of the playing video and waits for it to end. */
const playToEnd = async (page: Page) => {
  await ensurePlaying(page);
  await seekTo(page, 0.5);
  await expect.poll(() => isPaused(page)).toBe(true);
};

const countdown = (page: Page) => page.getByText(COUNTDOWN);

const watchNow = (page: Page) =>
  page.getByRole('button', { name: 'Assistir agora' }).click();

const toggle = (page: Page, name: string) =>
  page.getByRole('button', { name, exact: true });

const openLessonFromList = (page: Page, title: string) =>
  page
    .getByRole('button', { name: new RegExp(title) })
    .first()
    .click();

const writes = (page: Page) =>
  page.evaluate(
    () =>
      (globalThis as unknown as { __lessonApiWrites: ApiWrite[] })
        .__lessonApiWrites
  );

test.describe('Lesson queue with different media', () => {
  test('a lesson opened mid-video starts from its own beginning', async ({
    page,
  }) => {
    await openStory(page);
    await play(page);
    await seekTo(page, 3);

    await openLessonFromList(page, 'Aula 3');
    await expect.poll(() => activeLesson(page)).toContain('Aula 3');

    await expect
      .poll(() =>
        video(page).evaluate((element: HTMLVideoElement) => element.currentSrc)
      )
      .toContain('?v=3');
    expect(await videoTime(page)).toBeLessThan(1);
    expect(await isPaused(page)).toBe(true);
  });

  test('advancing into an HLS lesson resumes at its saved position', async ({
    page,
  }) => {
    await openStory(page);
    await playToEnd(page);
    const previous = await currentSrc(page);
    await watchNow(page);

    await expect.poll(() => activeLesson(page)).toContain('Aula 2');
    await waitForNewMedia(page, previous);
    await expect.poll(() => videoTime(page)).toBeGreaterThanOrEqual(3.5);
    // Not the previous video's position, close to its end.
    expect(await videoTime(page)).toBeLessThan(7);
  });

  for (const { from, story } of [
    { from: 'an MP4', story: STORY },
    { from: 'an HLS', story: HLS_STORY },
  ]) {
    test(`an HLS lesson opened from the list mid-video (from ${from} lesson) resumes at its saved position`, async ({
      page,
    }) => {
      await openStory(page, story);
      await play(page);
      await seekTo(page, 3);
      const previous = await currentSrc(page);

      await openLessonFromList(page, 'Aula 2');
      await expect.poll(() => activeLesson(page)).toContain('Aula 2');
      await waitForNewMedia(page, previous);

      await expect.poll(() => videoTime(page)).toBeGreaterThanOrEqual(3.5);
      // Opened by hand: it waits for play, at its own position.
      expect(await isPaused(page)).toBe(true);
      expect(await videoTime(page)).toBeLessThan(5);
    });
  }

  test('the chosen speed carries over to the next lesson', async ({ page }) => {
    // MP4 to MP4: loading a new file sets the element back to 1x. (Into an HLS
    // lesson the source switch already restored the speed.)
    await openStory(page);
    await openLessonFromList(page, 'Aula 3');
    await expect.poll(() => activeLesson(page)).toContain('Aula 3');
    await play(page);
    await page
      .getByRole('button', { name: 'Velocidade de reprodução' })
      .click();
    await page.getByRole('menuitemradio', { name: '1.5x' }).click();

    await playToEnd(page);
    await watchNow(page);
    await expect.poll(() => activeLesson(page)).toContain('Aula 5');

    await expect
      .poll(() =>
        video(page).evaluate(
          (element: HTMLVideoElement) => element.playbackRate
        )
      )
      .toBe(1.5);
  });

  test('a lesson without video is left out of the queue', async ({ page }) => {
    await openStory(page);
    await openLessonFromList(page, 'Aula 3');
    await expect.poll(() => activeLesson(page)).toContain('Aula 3');

    await playToEnd(page);
    await expect(countdown(page)).toBeVisible();
    await watchNow(page);

    await expect.poll(() => activeLesson(page)).toContain('Aula 5');
  });

  test('shuffle plays every lesson once before repeating', async ({ page }) => {
    await openStory(page);
    await toggle(page, 'Aleatório').click();

    const visited = [await activeLesson(page)];
    for (let step = 0; step < 3; step++) {
      await playToEnd(page);
      await watchNow(page);
      await expect.poll(() => activeLesson(page)).not.toBe(visited.at(-1));
      visited.push(await activeLesson(page));
    }

    const titles = visited.map((text) => /Aula \d/.exec(text)?.[0]);
    expect(new Set(titles).size).toBe(4);
    expect(titles).not.toContain('Aula 4');
  });

  test('"Repetir vídeo" does not record a new completion', async ({ page }) => {
    await openStory(page);
    await toggle(page, 'Repetir vídeo').click();
    await play(page);

    for (let round = 0; round < 2; round++) {
      // Playing past the start before jumping to the end: the video ends while
      // it plays, as it does for the student.
      await expect.poll(() => videoTime(page)).toBeGreaterThan(1);
      await seekTo(page, 0.5);
      await expect.poll(() => videoTime(page)).toBeLessThan(3);
      await expect.poll(() => isPaused(page)).toBe(false);
    }

    const completions = (await writes(page)).filter(
      (write) =>
        write.url === '/lesson/lesson-1/progress' && write.body?.video === true
    );
    expect(completions).toHaveLength(1);
    expect(await activeLesson(page)).toContain('Aula 1');
  });
});
