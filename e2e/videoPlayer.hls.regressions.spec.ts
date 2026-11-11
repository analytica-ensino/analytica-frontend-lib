import { expect as baseExpect, test, type Page } from '@playwright/test';

/**
 * Extra checks on the VideoPlayer HLS story (AE-3290), written by the tester:
 * where the MP4 fallback starts, progress after a source change, the Safari
 * stall watchdog leaving a paused video alone, and the quality menu driven by
 * the keyboard.
 */

/** Polls wait up to 30 s: media start-up is slow on a loaded machine. */
const expect = baseExpect.configure({ timeout: 30_000 });

const HLS_STORY = 'videoplayer--hls';
/** A bit longer than the native stall watchdog (15 s). */
const LONGER_THAN_WATCHDOG_MS = 17_000;

type Scope = typeof globalThis & {
  __mp4Start?: number;
  __maxHlsTime?: number;
};

const openStory = async (page: Page) => {
  await page.goto(`?story=${HLS_STORY}&mode=preview`);
  await expect(page.locator('video')).toBeAttached();
};

const play = (page: Page) =>
  page.getByRole('button', { name: 'Reproduzir vídeo' }).click();

const readVideo = (page: Page) =>
  page.locator('video').evaluate((video: HTMLVideoElement) => ({
    src: video.currentSrc,
    time: video.currentTime,
    paused: video.paused,
    height: video.videoHeight,
    readyState: video.readyState,
  }));

const videoSrc = async (page: Page) => (await readVideo(page)).src;
const videoTime = async (page: Page) => (await readVideo(page)).time;

/** Seconds the story last received through `onTimeUpdate` (status line). */
const reportedSeconds = async (page: Page) => {
  const text = (await page.getByRole('status').textContent()) ?? '';
  const match = /Tempo: (\d+) s/.exec(text);
  return match ? Number(match[1]) : -1;
};

const chooseQuality = async (page: Page, label: string) => {
  await page.getByRole('button', { name: 'Qualidade' }).click();
  await page.getByRole('menuitemradio', { name: label, exact: true }).click();
};

/**
 * Records the furthest time reached on the HLS stream and the time at which
 * the MP4 first starts playing. A fallback that does not restore the position
 * starts the MP4 at 0 and only later gets past the old time, which a plain
 * "time keeps growing" poll would not notice.
 */
const recordFallbackTimes = (page: Page) =>
  page.locator('video').evaluate((video: HTMLVideoElement) => {
    const scope = globalThis as Scope;
    scope.__maxHlsTime = 0;
    scope.__mp4Start = undefined;
    const onMp4 = () => video.currentSrc.endsWith('/sample.mp4');
    video.addEventListener('timeupdate', () => {
      if (!onMp4()) {
        scope.__maxHlsTime = Math.max(
          scope.__maxHlsTime ?? 0,
          video.currentTime
        );
      }
    });
    video.addEventListener('playing', () => {
      if (scope.__mp4Start === undefined && onMp4()) {
        scope.__mp4Start = video.currentTime;
      }
    });
  });

const fallbackTimes = (page: Page) =>
  page.evaluate(() => {
    const scope = globalThis as Scope;
    return {
      maxHlsTime: scope.__maxHlsTime ?? 0,
      mp4Start: scope.__mp4Start ?? null,
    };
  });

test.describe('VideoPlayer HLS, tester checks @e2e', () => {
  test.describe.configure({ timeout: 120_000 });

  test('falls back mid-playback to where the stream stopped, not to 0', async ({
    page,
    browserName,
  }) => {
    // hls.js gives up after about 30 s of retries; Safari's watchdog after 15 s.
    test.setTimeout(180_000);

    let releaseSegment = () => {};
    const segmentReleased = new Promise<void>((resolve) => {
      releaseSegment = resolve;
    });
    // Safari only starts with three segments buffered, so its gap comes later.
    const missing = browserName === 'webkit' ? 'seg_00003' : 'seg_00002';
    await page.route(`**/hls/*/${missing}.m4s`, async (route) => {
      await segmentReleased;
      await route.fulfill({ status: 404, body: 'not found' });
    });

    try {
      await openStory(page);
      await recordFallbackTimes(page);
      await play(page);
      await expect.poll(() => videoTime(page)).toBeGreaterThan(1);
    } finally {
      releaseSegment();
    }

    await expect
      .poll(() => videoSrc(page), { timeout: 90_000 })
      .toMatch(/\/sample\.mp4$/);
    await expect
      .poll(async () => (await fallbackTimes(page)).mp4Start, {
        timeout: 30_000,
      })
      .not.toBeNull();

    const { maxHlsTime, mp4Start } = await fallbackTimes(page);
    // The stream played up to the gap (4 s in Chrome, 6 s in WebKit)...
    expect(maxHlsTime).toBeGreaterThan(3);
    // ...and the MP4 picks up there instead of starting over.
    expect(mp4Start).toBeGreaterThanOrEqual(maxHlsTime - 0.5);
    expect((await readVideo(page)).paused).toBe(false);
    // Progress is reported again on the MP4 (the switch guard was released).
    await expect
      .poll(() => reportedSeconds(page))
      .toBeGreaterThanOrEqual(Math.floor(maxHlsTime) + 1);
  });

  test('progress and completion keep being reported after a quality switch', async ({
    page,
  }) => {
    await openStory(page);
    await play(page);
    await expect.poll(() => videoTime(page)).toBeGreaterThan(1);

    await chooseQuality(page, '360p');
    await expect.poll(async () => (await readVideo(page)).height).toBe(360);

    // The reported time keeps moving after the switch...
    await expect.poll(() => reportedSeconds(page)).toBeGreaterThanOrEqual(3);
    await expect(page.getByRole('status')).toContainText('Concluído: não');

    // ...and reaching the end still completes the lesson.
    await page.locator('video').evaluate((video: HTMLVideoElement) => {
      video.currentTime = 9.3;
    });
    await expect(page.getByRole('status')).toContainText('Concluído: sim');
  });

  test('the Safari stall watchdog leaves a paused video on HLS', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'webkit', 'the watchdog runs on native HLS only');
    // As on the iPhone, nothing loads before play (preload="none"): the video
    // sits paused without data, which a watchdog that ignored the pause would
    // take for a stall. Desktop WebKit otherwise buffers ahead and the pause
    // check would never matter here.
    await page.addInitScript(() => {
      new MutationObserver(() => {
        document.querySelectorAll('video').forEach((video) => {
          video.preload = 'none';
        });
      }).observe(document, { childList: true, subtree: true });
    });
    await openStory(page);
    await expect.poll(() => videoSrc(page)).toMatch(/\/hls\/master\.m3u8$/);

    // Not played yet: the student is still reading the page.
    await page.waitForTimeout(LONGER_THAN_WATCHDOG_MS);
    const beforePlay = await readVideo(page);
    expect(beforePlay.readyState).toBeLessThan(3);
    expect(beforePlay.src).toMatch(/\/hls\/master\.m3u8$/);

    // Played, then paused for longer than the watchdog.
    await play(page);
    await expect.poll(() => videoTime(page)).toBeGreaterThan(1);
    await page.getByRole('button', { name: 'Pausar' }).click();
    await expect.poll(async () => (await readVideo(page)).paused).toBe(true);
    await page.waitForTimeout(LONGER_THAN_WATCHDOG_MS);

    expect(await videoSrc(page)).toMatch(/\/hls\/master\.m3u8$/);
    await expect(
      page.getByRole('button', { name: 'Qualidade' })
    ).toBeAttached();
  });

  test('the quality menu works from the keyboard', async ({ page }) => {
    await openStory(page);
    await play(page);
    await expect.poll(() => videoTime(page)).toBeGreaterThan(0.5);

    const button = page.getByRole('button', { name: 'Qualidade' });
    await button.focus();
    await page.keyboard.press('Enter');

    // Focus lands on the current choice, "Automático".
    const auto = page.getByRole('menuitemradio', { name: 'Automático' });
    await expect(auto).toBeFocused();
    await expect(auto).toHaveAttribute('aria-checked', 'true');
    await expect(button).toHaveAttribute('aria-expanded', 'true');

    // ArrowUp wraps to the last option, the shortest rendition.
    await page.keyboard.press('ArrowUp');
    await expect(
      page.getByRole('menuitemradio', { name: '360p', exact: true })
    ).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(page.getByRole('menu', { name: 'Qualidade' })).toHaveCount(0);
    await expect(button).toBeFocused();
    await expect.poll(async () => (await readVideo(page)).height).toBe(360);

    // Escape closes without changing the choice.
    await page.keyboard.press('Enter');
    await expect(
      page.getByRole('menuitemradio', { name: '360p', exact: true })
    ).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu', { name: 'Qualidade' })).toHaveCount(0);
    await expect(button).toBeFocused();
  });
});
