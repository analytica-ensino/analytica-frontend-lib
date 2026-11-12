import { expect as baseExpect, test, type Page } from '@playwright/test';

/**
 * Lesson queue (AE-3307) and list controls (AE-3308), in the Ladle story
 * `LessonViewPage > Queue`: three lessons of one subtopic, each playing the
 * local 10 s fixture, against an in-memory API that logs every write to
 * `window.__lessonApiWrites`.
 *
 * Reaching the end of a video is done by seeking close to it while it plays,
 * so each test runs the real `ended` event without waiting 10 s.
 */

/** Polls wait up to 30 s: media start-up is slow on a loaded machine. */
const expect = baseExpect.configure({ timeout: 30_000 });

const STORY = 'lesson-view-page--queue';
const COUNTDOWN = /Próxima aula em \ds/;

interface ApiWrite {
  method: string;
  url: string;
  body: Record<string, unknown> | null;
  answeredAt: number;
}

const openStory = async (page: Page, query = '') => {
  await page.goto(`?story=${STORY}&mode=preview${query}`);
  await page.locator('video').waitFor({ state: 'attached' });
};

/** Title of the lesson on the player, from the band above it. */
const activeLesson = (page: Page) =>
  page.locator('span.rounded-t-xl').first().innerText();

const video = (page: Page) => page.locator('video');

const isPaused = (page: Page) =>
  video(page).evaluate((element: HTMLVideoElement) => element.paused);

const videoTime = (page: Page) =>
  video(page).evaluate((element: HTMLVideoElement) => element.currentTime);

/** Starts playback with a real click, so autoplay rules don't block it. */
const play = async (page: Page) => {
  await page.getByRole('button', { name: 'Reproduzir vídeo' }).click();
  await expect.poll(() => isPaused(page)).toBe(false);
};

/** Jumps close to the end of the playing video. */
const seekToEnd = async (page: Page) => {
  if (await isPaused(page)) await play(page);
  await video(page).evaluate((element: HTMLVideoElement) => {
    element.currentTime = element.duration - 0.5;
  });
};

/** Jumps close to the end of the playing video and waits for it to end. */
const playToEnd = async (page: Page) => {
  await seekToEnd(page);
  await expect.poll(() => isPaused(page)).toBe(true);
};

const countdown = (page: Page) => page.getByText(COUNTDOWN);

const toggle = (page: Page, name: string) =>
  page.getByRole('button', { name, exact: true });

const writes = (page: Page) =>
  page.evaluate(
    () =>
      (globalThis as unknown as { __lessonApiWrites: ApiWrite[] })
        .__lessonApiWrites
  );

const openLessonFromList = (page: Page, title: string) =>
  page
    .getByRole('button', { name: new RegExp(title) })
    .first()
    .click();

test.describe('Lesson queue: automatic next lesson', () => {
  test('counts down and opens the next lesson playing', async ({
    page,
    browserName,
  }) => {
    await openStory(page);
    await expect.poll(() => activeLesson(page)).toContain('Aula 1');

    await playToEnd(page);
    await expect(countdown(page)).toBeVisible();

    await expect.poll(() => activeLesson(page)).toContain('Aula 2');
    await expect(countdown(page)).toHaveCount(0);
    // WebKit, like Safari, blocks unmuted playback without a fresh click: the
    // player then offers the play button instead of starting.
    if (browserName === 'webkit') {
      await expect
        .poll(
          async () =>
            !(await isPaused(page)) ||
            (await page
              .getByRole('button', { name: 'Reproduzir vídeo' })
              .isVisible())
        )
        .toBe(true);
    } else {
      await expect.poll(() => isPaused(page)).toBe(false);
    }
  });

  test('"Assistir agora" skips the rest of the countdown', async ({ page }) => {
    await openStory(page);
    await playToEnd(page);

    await page.getByRole('button', { name: 'Assistir agora' }).click();

    await expect
      .poll(() => activeLesson(page), { timeout: 3_000 })
      .toContain('Aula 2');
  });

  test('"Cancelar" keeps the lesson on screen, paused', async ({ page }) => {
    await openStory(page);
    await playToEnd(page);

    await page.getByRole('button', { name: 'Cancelar' }).click();
    await expect(countdown(page)).toHaveCount(0);

    // Longer than the countdown: nothing advances on its own afterwards.
    await page.waitForTimeout(6_000);
    expect(await activeLesson(page)).toContain('Aula 1');
    expect(await isPaused(page)).toBe(true);
  });

  test('records the video progress before opening the next lesson', async ({
    page,
  }) => {
    // Longer than the countdown: the switch has to wait for the write.
    await openStory(page, '&patchDelay=8000');
    await playToEnd(page);
    await expect(countdown(page)).toBeVisible();

    await expect(countdown(page)).toHaveCount(0, { timeout: 10_000 });
    expect(await activeLesson(page)).toContain('Aula 1');

    await expect.poll(() => activeLesson(page)).toContain('Aula 2');
    const switchedAt = await page.evaluate(() => performance.now());
    const videoWrite = (await writes(page)).find(
      (write) =>
        write.url === '/lesson/lesson-1/progress' && write.body?.video === true
    );
    expect(videoWrite).toBeDefined();
    expect(videoWrite!.answeredAt).toBeLessThanOrEqual(switchedAt);
  });

  test('the last lesson stops without a countdown', async ({ page }) => {
    await openStory(page);
    await openLessonFromList(page, 'Aula 3');
    await expect.poll(() => activeLesson(page)).toContain('Aula 3');

    await playToEnd(page);

    await expect.poll(() => videoTime(page)).toBe(0);
    await expect(countdown(page)).toHaveCount(0);
    expect(await activeLesson(page)).toContain('Aula 3');
  });

  test('keeps the same player, so fullscreen survives the switch', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Fullscreen API checked in Chrome');
    await openStory(page);
    await play(page);
    await video(page).evaluate((element) => {
      (element as unknown as { __marker: boolean }).__marker = true;
    });
    await page.getByRole('button', { name: 'Ativar tela cheia' }).click();
    await expect
      .poll(() => page.evaluate(() => document.fullscreenElement !== null))
      .toBe(true);

    await playToEnd(page);
    await page.getByRole('button', { name: 'Assistir agora' }).click();
    await expect.poll(() => activeLesson(page)).toContain('Aula 2');

    expect(
      await video(page).evaluate(
        (element) => (element as unknown as { __marker?: boolean }).__marker
      )
    ).toBe(true);
    expect(await page.evaluate(() => document.fullscreenElement !== null)).toBe(
      true
    );
  });

  test('with the tab hidden, the next lesson waits for the student', async ({
    page,
  }) => {
    await openStory(page);
    await playToEnd(page);
    await expect(countdown(page)).toBeVisible();

    // The story enables picture-in-picture, so hiding the tab does not pause.
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => true,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    await expect.poll(() => activeLesson(page)).toContain('Aula 2');
    await page.waitForTimeout(1_500);
    expect(await isPaused(page)).toBe(true);

    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => false,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect.poll(() => isPaused(page)).toBe(false);
  });
});

test.describe('Lesson queue: list controls', () => {
  test('"Repetir vídeo" replays the same lesson', async ({ page }) => {
    await openStory(page);
    await toggle(page, 'Repetir vídeo').click();
    await expect(toggle(page, 'Voltar ao início da lista')).toBeDisabled();

    await seekToEnd(page);
    await page.waitForTimeout(1_500);

    await expect.poll(() => isPaused(page)).toBe(false);
    await expect.poll(() => videoTime(page)).toBeLessThan(3);
    await expect(countdown(page)).toHaveCount(0);
    expect(await activeLesson(page)).toContain('Aula 1');
  });

  test('"Voltar ao início da lista" rewinds and waits for play', async ({
    page,
  }) => {
    await openStory(page);
    await toggle(page, 'Voltar ao início da lista').click();
    await expect(toggle(page, 'Repetir vídeo')).toBeDisabled();

    await playToEnd(page);

    await expect.poll(() => videoTime(page)).toBe(0);
    await page.waitForTimeout(1_000);
    expect(await isPaused(page)).toBe(true);
    await expect(countdown(page)).toHaveCount(0);
    expect(await activeLesson(page)).toContain('Aula 1');
  });

  test('"Repetir lista" goes from the last lesson back to the first', async ({
    page,
  }) => {
    await openStory(page);
    await toggle(page, 'Repetir lista').click();
    await openLessonFromList(page, 'Aula 3');
    await expect.poll(() => activeLesson(page)).toContain('Aula 3');

    await playToEnd(page);
    await expect(countdown(page)).toBeVisible();

    await expect.poll(() => activeLesson(page)).toContain('Aula 1');
  });

  test('"Repetir vídeo" wins over "Repetir lista"', async ({ page }) => {
    await openStory(page);
    await toggle(page, 'Repetir lista').click();
    await toggle(page, 'Repetir vídeo').click();
    await openLessonFromList(page, 'Aula 3');
    await expect.poll(() => activeLesson(page)).toContain('Aula 3');

    await seekToEnd(page);
    await page.waitForTimeout(1_500);

    await expect.poll(() => videoTime(page)).toBeLessThan(3);
    await expect.poll(() => isPaused(page)).toBe(false);
    await expect(countdown(page)).toHaveCount(0);
    expect(await activeLesson(page)).toContain('Aula 3');
  });

  test('"Aleatório" opens another lesson of the list', async ({ page }) => {
    await openStory(page);
    await toggle(page, 'Aleatório').click();

    await playToEnd(page);
    await page.getByRole('button', { name: 'Assistir agora' }).click();

    await expect.poll(() => activeLesson(page)).not.toContain('Aula 1');
    expect(await activeLesson(page)).toMatch(/Aula [23]/);
  });

  test('the choices are kept after reloading the page', async ({ page }) => {
    await openStory(page);
    await toggle(page, 'Aleatório').click();
    await toggle(page, 'Repetir vídeo').click();

    await page.reload();
    await page.locator('video').waitFor({ state: 'attached' });

    await expect(toggle(page, 'Aleatório')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await expect(toggle(page, 'Repetir vídeo')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await expect(toggle(page, 'Repetir lista')).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });
});
