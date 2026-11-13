import { expect as baseExpect, test, type Page } from '@playwright/test';

/**
 * Lesson queue with different media on each lesson, in the Ladle story
 * `LessonViewPage > QueueMixed`: Aula 1 (MP4), Aula 2 (HLS, saved at 4 s),
 * Aula 3 and Aula 5 (other MP4 files), Aula 4 (no video, outside the queue)
 * Aula 6 (another HLS stream, saved at 5 s) and Aula 7 (HLS, nothing saved). One player stays mounted across lessons, so these cover what a
 * single shared file hides: the next media must not inherit the previous
 * one's position, play state or speed.
 */

/** Polls wait up to 30 s: media start-up is slow on a loaded machine. */
const expect = baseExpect.configure({ timeout: 30_000 });

const STORY = 'lesson-view-page--queue-mixed';
const COUNTDOWN = /Próxima aula em \ds/;

interface ApiWrite {
  url: string;
  body: Record<string, unknown> | null;
}

/** `query` adds the story's own parameters, such as `&playbackDelay=500`. */
const openStory = async (page: Page, query = '') => {
  await page.goto(`?story=${STORY}&mode=preview${query}`);
  await page.locator('video').waitFor({ state: 'attached' });
};

const activeLesson = (page: Page) =>
  page.locator('span.rounded-t-xl').first().innerText();

const video = (page: Page) => page.locator('video');

const isPaused = (page: Page) =>
  video(page).evaluate((element: HTMLVideoElement) => element.paused);

const videoTime = (page: Page) =>
  video(page).evaluate((element: HTMLVideoElement) => element.currentTime);

/**
 * Whether the video sits within `[min, max)`. Checked in a single poll: right
 * after the swap the element still holds the previous media, whose position
 * would pass a lower bound on its own.
 */
const resumedAt = async (page: Page, min: number, max: number) => {
  const time = await videoTime(page);
  return time >= min && time < max;
};

const playButton = (page: Page) =>
  page.getByRole('button', { name: 'Reproduzir vídeo' });

/**
 * A single click, as the student does: one pressed while a freshly opened
 * lesson is still loading must play it once it loads.
 */
const play = async (page: Page) => {
  await playButton(page).click();
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

const currentSrc = (page: Page) =>
  video(page).evaluate((element: HTMLVideoElement) => element.currentSrc);

const writes = (page: Page) =>
  page.evaluate(
    () =>
      (globalThis as unknown as { __lessonApiWrites: ApiWrite[] })
        .__lessonApiWrites
  );

test.describe('Lesson queue with different media', () => {
  // Until the new lesson's media loads, the player still holds the previous
  // one: while the page reads the saved position (here held back 500 ms, as
  // the network does), then while an HLS stream attaches. A play pressed in
  // between is for the new lesson.
  for (const { label, query, target, from, to } of [
    {
      label: 'its saved position is read',
      query: '&playbackDelay=500',
      target: 'Aula 6',
      from: 4.5,
      to: 9,
    },
    {
      label: 'its HLS stream attaches',
      query: '',
      target: 'Aula 7',
      from: 0,
      to: 3,
    },
  ]) {
    test(`play pressed while ${label} plays the new lesson`, async ({
      page,
    }) => {
      await openStory(page, query);
      await openLessonFromList(page, 'Aula 3');
      await expect.poll(() => currentSrc(page)).toContain('?v=3');

      await openLessonFromList(page, target);
      await playButton(page).click();

      await expect.poll(() => currentSrc(page)).not.toContain('?v=3');
      await expect.poll(() => isPaused(page)).toBe(false);
      // From its own saved position, not from where the old video was.
      await expect.poll(() => resumedAt(page, from, to)).toBe(true);
      expect(await activeLesson(page)).toContain(target);
    });
  }

  test('pressing play again before the new lesson loads cancels it', async ({
    page,
  }) => {
    await openStory(page, '&playbackDelay=1000');
    await openLessonFromList(page, 'Aula 3');
    await expect.poll(() => currentSrc(page)).toContain('?v=3');

    await openLessonFromList(page, 'Aula 6');
    await playButton(page).click();
    await page.getByRole('button', { name: 'Pausar' }).click();

    await expect.poll(() => resumedAt(page, 4.5, 5.5)).toBe(true);
    await page.waitForTimeout(1_000);
    expect(await isPaused(page)).toBe(true);
    expect(await videoTime(page)).toBeLessThan(5.5);
  });

  test('an HLS lesson opened mid-video starts from its own beginning', async ({
    page,
  }) => {
    await openStory(page);
    await openLessonFromList(page, 'Aula 3');
    await expect.poll(() => activeLesson(page)).toContain('Aula 3');
    await play(page);
    await seekTo(page, 3);

    await openLessonFromList(page, 'Aula 7');
    await expect.poll(() => activeLesson(page)).toContain('Aula 7');

    // Starts at 0 and stays paused: in a single poll, since right after the
    // swap the element still holds the previous media's position.
    await expect
      .poll(async () => (await videoTime(page)) < 1 && (await isPaused(page)))
      .toBe(true);
    // Not a transient 0 before the old position leaks in.
    await page.waitForTimeout(1_000);
    expect(await videoTime(page)).toBeLessThan(1);
  });

  for (const from of ['Aula 1', 'Aula 2']) {
    test(`an HLS lesson opened from the list after ${from} resumes at its saved position`, async ({
      page,
    }) => {
      await openStory(page);
      if (from !== 'Aula 1') {
        await openLessonFromList(page, from);
        await expect.poll(() => activeLesson(page)).toContain(from);
      }
      await play(page);
      await seekTo(page, 3);

      await openLessonFromList(page, 'Aula 6');
      await expect.poll(() => activeLesson(page)).toContain('Aula 6');

      await expect.poll(() => resumedAt(page, 4.5, 7)).toBe(true);
    });
  }

  test('advancing into an HLS lesson resumes at its saved position', async ({
    page,
  }) => {
    await openStory(page);
    await playToEnd(page);
    await watchNow(page);

    await expect.poll(() => activeLesson(page)).toContain('Aula 2');
    // Not the previous video's position, close to its end.
    await expect.poll(() => resumedAt(page, 3.5, 7)).toBe(true);
  });

  test('the chosen speed carries over to the next lesson', async ({ page }) => {
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
      // Seek only while playing: jumping to the end of a paused video just
      // leaves it there instead of ending it.
      await expect.poll(() => videoTime(page)).toBeGreaterThan(1);
      await seekTo(page, 0.5);
      await expect.poll(() => videoTime(page)).toBeLessThan(3);
    }

    const completions = (await writes(page)).filter(
      (write) =>
        write.url === '/lesson/lesson-1/progress' && write.body?.video === true
    );
    expect(completions).toHaveLength(1);
    expect(await activeLesson(page)).toContain('Aula 1');
  });
});
