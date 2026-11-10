import { expect as baseExpect, test, type Page } from '@playwright/test';

/**
 * Pause on leaving the tab and picture-in-picture (AE-3311), in the Ladle
 * stories `VideoPlayer > PauseOnBackground`, `BackgroundPlayback` and
 * `PictureInPicture`. All three play the local 10 s fixture.
 *
 * Leaving the tab is simulated the way the browser reports it to the page:
 * `document.hidden` turns true, then `visibilitychange` and the window `blur`
 * fire.
 */

/** Polls wait up to 30 s: media start-up is slow on a loaded machine. */
const expect = baseExpect.configure({ timeout: 30_000 });

const PAUSE_STORY = 'videoplayer--pause-on-background';
const BACKGROUND_STORY = 'videoplayer--background-playback';
const PIP_STORY = 'videoplayer--picture-in-picture';

const openStory = async (page: Page, story: string) => {
  await page.goto(`?story=${story}&mode=preview`);
  await page.locator('video').waitFor({ state: 'attached' });
};

const isPaused = (page: Page) =>
  page.locator('video').evaluate((video: HTMLVideoElement) => video.paused);

const videoTime = (page: Page) =>
  page
    .locator('video')
    .evaluate((video: HTMLVideoElement) => video.currentTime);

/**
 * Starts playback with a real click, so autoplay rules don't block it, and
 * waits until the player itself shows it as playing ("Pausar"). Leaving the
 * tab before that would race the player's state, and the old pause handler
 * would ignore the event, passing the "keeps playing" tests for no reason.
 */
const play = async (page: Page) => {
  await page.getByRole('button', { name: 'Reproduzir vídeo' }).click();
  await expect.poll(() => isPaused(page)).toBe(false);
  await expect(
    page.getByRole('button', { name: 'Pausar', exact: true })
  ).toHaveCount(1);
};

/** Hides the tab and blurs the window, as switching tabs does. */
const leaveTab = (page: Page) =>
  page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true,
    });
    document.dispatchEvent(new Event('visibilitychange'));
    globalThis.dispatchEvent(new Event('blur'));
  });

const pipButton = (page: Page) =>
  page.getByRole('button', { name: /janela flutuante/ });

test.describe('VideoPlayer: pause on leaving the tab', () => {
  test('pauses on leaving the tab, with no PiP button (default)', async ({
    page,
  }) => {
    await openStory(page, PAUSE_STORY);
    await expect(pipButton(page)).toHaveCount(0);

    await play(page);
    await leaveTab(page);

    await expect.poll(() => isPaused(page)).toBe(true);
  });

  test('keeps playing on leaving the tab with background playback', async ({
    page,
  }) => {
    await openStory(page, BACKGROUND_STORY);
    await expect(pipButton(page)).toHaveCount(0);

    await play(page);
    await leaveTab(page);
    const leftAt = await videoTime(page);

    await expect.poll(() => videoTime(page)).toBeGreaterThan(leftAt + 1);
    expect(await isPaused(page)).toBe(false);
  });
});

test.describe('VideoPlayer: picture-in-picture', () => {
  test('keeps playing on leaving the tab', async ({ page }) => {
    await openStory(page, PIP_STORY);

    await play(page);
    await leaveTab(page);
    const leftAt = await videoTime(page);

    await expect.poll(() => videoTime(page)).toBeGreaterThan(leftAt + 1);
  });

  test('opens and closes the floating window from the button', async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== 'chromium',
      'Only Chrome exposes the PiP window to automation.'
    );
    await openStory(page, PIP_STORY);
    await play(page);

    const open = page.getByRole('button', {
      name: 'Abrir em janela flutuante',
    });
    await open.click();

    const inPip = () =>
      page.evaluate(
        () =>
          document.pictureInPictureElement === document.querySelector('video')
      );
    await expect.poll(inPip).toBe(true);
    await expect(
      page.getByRole('button', { name: 'Sair da janela flutuante' })
    ).toHaveAttribute('aria-pressed', 'true');

    // Pausing from the window reaches the player's own controls.
    await page.locator('video').evaluate((video: HTMLVideoElement) => {
      video.pause();
    });
    await expect(
      page.getByRole('button', { name: 'Reproduzir', exact: true })
    ).toHaveCount(1);

    // Closing the window from outside the button (its own X) resets the button.
    await page.evaluate(() => document.exitPictureInPicture());
    await expect.poll(inPip).toBe(false);
    await expect(open).toHaveAttribute('aria-pressed', 'false');
  });
});
