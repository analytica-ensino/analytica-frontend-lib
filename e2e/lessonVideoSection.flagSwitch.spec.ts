import { expect as baseExpect, test, type Page } from '@playwright/test';

/**
 * `MODULES.lessonVideoMp4Only` changing while the lesson is open (AE-3291), in
 * the Ladle story `LessonMediaSections > Video Hls Com Troca Da Chave`.
 *
 * The apps serve the cached modules first and revalidate `/me/modules` in the
 * background, so the switch can flip after the player already started on the
 * HLS. Turning it on must take the player to the MP4 and stop every HLS
 * request; turning it off must bring the HLS and the quality menu back.
 *
 * Same fixture as the VideoPlayer suite (`public/fixtures/video`): no network.
 */

/** Polls wait up to 30 s: media start-up is slow on a loaded machine. */
const expect = baseExpect.configure({ timeout: 30_000 });

const STORY = 'lessonmediasections--video-hls-com-troca-da-chave';
/** Time given to a destroyed hls.js to prove it fetches nothing else. */
const QUIET_PERIOD_MS = 4_000;

/** Paths of every request the page makes, in order. */
const trackRequests = (page: Page): string[] => {
  const paths: string[] = [];
  page.on('request', (request) => {
    paths.push(new URL(request.url()).pathname);
  });
  return paths;
};

const isHlsRequest = (path: string) => path.includes('/fixtures/video/hls/');

const videoState = (page: Page) =>
  page.locator('video').evaluate((video: HTMLVideoElement) => ({
    src: video.currentSrc,
    time: video.currentTime,
    paused: video.paused,
  }));

const qualityButton = (page: Page) =>
  page.getByRole('button', { name: 'Qualidade' });

const openStory = async (page: Page) => {
  await page.goto(`?story=${STORY}&mode=preview`);
  await expect(page.locator('video')).toBeAttached();
};

/** Starts playback with the player's button and waits for `seconds`. */
const playPast = async (page: Page, seconds: number) => {
  await page.getByRole('button', { name: 'Reproduzir vídeo' }).click();
  await expect
    .poll(async () => (await videoState(page)).time)
    .toBeGreaterThan(seconds);
};

/**
 * Resumes the element itself after a source swap, then waits for `seconds`.
 * The play button may still read "Pausar" right after the swap (see the
 * `test.fail` below), so these tests do not go through it.
 */
const resumePast = async (page: Page, seconds: number) => {
  await page.locator('video').evaluate((video: HTMLVideoElement) => {
    if (video.paused) return video.play();
    return undefined;
  });
  await expect
    .poll(async () => (await videoState(page)).time)
    .toBeGreaterThan(seconds);
};

/** hls.js attaches a blob: (Chrome); Safari plays the master itself. */
const expectPlaysHls = async (page: Page, browserName: string) => {
  const hlsSource =
    browserName === 'chromium' ? /^blob:/ : /\/hls\/master\.m3u8$/;
  await expect
    .poll(async () => (await videoState(page)).src)
    .toMatch(hlsSource);
};

test.describe('LessonVideoSection lessonVideoMp4Only at runtime @e2e', () => {
  test.describe.configure({ timeout: 120_000 });

  test('switching it on mid-playback moves to the MP4 and stops HLS', async ({
    page,
    browserName,
  }) => {
    const requests = trackRequests(page);
    await openStory(page);
    await expect(qualityButton(page)).toBeVisible();
    await playPast(page, 1);
    await expectPlaysHls(page, browserName);
    const before = await videoState(page);

    await page.getByRole('button', { name: 'Ligar volta ao MP4' }).click();

    await expect
      .poll(async () => (await videoState(page)).src)
      .toMatch(/\/sample\.mp4$/);
    await expect(qualityButton(page)).toHaveCount(0);
    const after = await videoState(page);
    test.info().annotations.push({
      type: 'position',
      description: `HLS at ${before.time.toFixed(2)} s; right after the switch the MP4 is at ${after.time.toFixed(2)} s, paused=${after.paused}`,
    });

    // From here on, only the MP4: the destroyed hls.js loads nothing more.
    const hlsRequestsAtSwitch = requests.filter(isHlsRequest).length;
    await resumePast(page, Math.min(after.time, 7) + 1);
    await page.waitForTimeout(QUIET_PERIOD_MS);
    expect((await videoState(page)).src).toMatch(/\/sample\.mp4$/);
    expect(requests.filter(isHlsRequest)).toHaveLength(hlsRequestsAtSwitch);
  });

  test('switching it off again brings the HLS and the quality menu back', async ({
    page,
    browserName,
  }) => {
    await openStory(page);
    await expect(qualityButton(page)).toBeVisible();

    await page.getByRole('button', { name: 'Ligar volta ao MP4' }).click();
    await expect(qualityButton(page)).toHaveCount(0);
    await playPast(page, 1);
    expect((await videoState(page)).src).toMatch(/\/sample\.mp4$/);

    await page.getByRole('button', { name: 'Desligar volta ao MP4' }).click();

    await expect(qualityButton(page)).toBeVisible();
    await resumePast(page, 0.5);
    await expectPlaysHls(page, browserName);
  });

  test('after the swap the play button matches the video', async ({ page }) => {
    // Known issue (AE-3291 review): the swap leaves the element paused at 0
    // while the button still reads "Pausar". Remove `test.fail` once fixed.
    test.fail();
    await openStory(page);
    await expect(qualityButton(page)).toBeVisible();
    await playPast(page, 1);

    await page.getByRole('button', { name: 'Ligar volta ao MP4' }).click();
    await expect
      .poll(async () => (await videoState(page)).src)
      .toMatch(/\/sample\.mp4$/);

    // Either the video keeps playing or the player offers to play it again.
    await expect
      .poll(
        async () =>
          !(await videoState(page)).paused ||
          (await page
            .getByRole('button', { name: 'Reproduzir vídeo' })
            .isVisible()),
        { timeout: 5_000 }
      )
      .toBe(true);
  });
});
