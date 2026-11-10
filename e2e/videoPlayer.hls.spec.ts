import path from 'node:path';
import { expect as baseExpect, test, type Page } from '@playwright/test';

/**
 * VideoPlayer with HLS (AE-3290), in the Ladle story `VideoPlayer > Hls`.
 *
 * Chromium plays through hls.js (Media Source Extensions) and WebKit plays
 * natively, as Safari does. The fixture in `public/fixtures/video` is 10 s
 * long, with 360p/480p/720p renditions in 2 s segments and the same video as
 * MP4 (`sample.mp4`), which is the fallback.
 */

/** Polls wait up to 30 s: media start-up is slow on a loaded machine. */
const expect = baseExpect.configure({ timeout: 30_000 });

const HLS_STORY = 'videoplayer--hls';
const MP4_STORY = 'videoplayer--with-subtitles';
const MP4_STORY_URL = 'https://www.w3schools.com/html/mov_bbb.mp4';
const FIXTURE_MP4 = path.join(
  __dirname,
  '..',
  'public',
  'fixtures',
  'video',
  'sample.mp4'
);
/** localStorage key of the saved position (`<storageKey>-<src>`). */
const SAVED_POSITION_KEY = 'video-progress-fixtures/video/sample.mp4';

interface VideoState {
  src: string;
  time: number;
  paused: boolean;
  height: number;
  rate: number;
  captions: string;
  cues: number;
}

const readVideo = (page: Page): Promise<VideoState> =>
  page.locator('video').evaluate((video: HTMLVideoElement) => {
    const track = video.querySelector('track')?.track;
    return {
      src: video.currentSrc,
      time: video.currentTime,
      paused: video.paused,
      height: video.videoHeight,
      rate: video.playbackRate,
      captions: track?.mode ?? 'none',
      cues: track?.cues?.length ?? 0,
    };
  });

const videoTime = async (page: Page) => (await readVideo(page)).time;
const videoSrc = async (page: Page) => (await readVideo(page)).src;

/** Paths of every request the page makes, in order. */
const trackRequests = (page: Page): string[] => {
  const paths: string[] = [];
  page.on('request', (request) => {
    paths.push(new URL(request.url()).pathname);
  });
  return paths;
};

/**
 * Records each second the story reports through `onTimeUpdate` (its status
 * line), to prove the reported time never drops back to 0 on a source change.
 */
const recordReportedSeconds = (page: Page) =>
  page.evaluate(() => {
    const scope = globalThis as typeof globalThis & { __seconds: number[] };
    scope.__seconds = [];
    const status = document.querySelector('[role="status"]');
    if (!status) throw new Error('status line not found');
    new MutationObserver(() => {
      const match = /Tempo: (\d+) s/.exec(status.textContent ?? '');
      if (match) scope.__seconds.push(Number(match[1]));
    }).observe(status, { childList: true, subtree: true, characterData: true });
  });

const reportedSeconds = (page: Page) =>
  page.evaluate(
    () => (globalThis as typeof globalThis & { __seconds: number[] }).__seconds
  );

const openStory = async (page: Page, story = HLS_STORY) => {
  await page.goto(`?story=${story}&mode=preview`);
  await expect(page.locator('video')).toBeAttached();
};

const play = (page: Page) =>
  page.getByRole('button', { name: 'Reproduzir vídeo' }).click();

const chooseQuality = async (page: Page, label: string) => {
  await page.getByRole('button', { name: 'Qualidade' }).click();
  await page.getByRole('menuitemradio', { name: label, exact: true }).click();
};

/** Picks a speed and waits until the video runs at it. */
const setSpeed = async (page: Page, label: string, rate: number) => {
  await page.getByRole('button', { name: 'Velocidade de reprodução' }).click();
  await page.getByRole('menuitemradio', { name: label, exact: true }).click();
  await expect.poll(async () => (await readVideo(page)).rate).toBe(rate);
};

const showCaptions = async (page: Page) => {
  await page.getByRole('button', { name: 'Exibir legendas' }).click();
  await expect
    .poll(async () => (await readVideo(page)).captions)
    .toBe('showing');
};

/** Source the engine plays: hls.js attaches a blob:, Safari the playlist. */
const expectHlsEngine = (src: string, browserName: string) => {
  if (browserName === 'chromium') {
    expect(src).toMatch(/^blob:/);
  } else {
    expect(src).toMatch(/\/hls\/master\.m3u8$/);
  }
};

test.describe('VideoPlayer HLS @e2e', () => {
  // Media start-up gets slow on a loaded machine; waiting longer does not let
  // a wrong state pass, every check still has to be met.
  test.describe.configure({ timeout: 120_000 });

  test('plays the HLS stream instead of the MP4', async ({
    page,
    browserName,
  }) => {
    const requests = trackRequests(page);
    await openStory(page);
    await play(page);

    await expect.poll(() => videoTime(page)).toBeGreaterThan(1);
    const video = await readVideo(page);
    expect(video.paused).toBe(false);
    expectHlsEngine(video.src, browserName);
    // hls.js is fetched on demand, and only where it plays.
    expect(requests.some((p) => p.includes('hls__js'))).toBe(
      browserName === 'chromium'
    );
    expect(requests.some((p) => p.endsWith('/hls/master.m3u8'))).toBe(true);
    expect(requests.some((p) => p.endsWith('.m4s'))).toBe(true);
    expect(requests.some((p) => p.endsWith('/sample.mp4'))).toBe(false);
  });

  test('hls.js starts on the 480p rendition', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Safari picks its own start');
    const requests = trackRequests(page);
    await openStory(page);
    await play(page);

    await expect
      .poll(() => requests.find((p) => p.endsWith('.m4s')))
      .toMatch(/\/480p\/seg_00000\.m4s$/);
  });

  test('quality menu offers Automático, checked, then the renditions', async ({
    page,
  }) => {
    await openStory(page);
    await page.getByRole('button', { name: 'Qualidade' }).click();

    await expect(page.getByRole('menuitemradio')).toHaveText([
      'Automático',
      '720p',
      '480p',
      '360p',
    ]);
    await expect(
      page.getByRole('menuitemradio', { name: 'Automático' })
    ).toHaveAttribute('aria-checked', 'true');
  });

  test('switching quality keeps position, play state, speed and captions', async ({
    page,
    browserName,
  }) => {
    await openStory(page);
    await play(page);
    await showCaptions(page);
    await setSpeed(page, '1.25x', 1.25);
    await expect.poll(() => videoTime(page)).toBeGreaterThan(1.5);
    await recordReportedSeconds(page);
    const before = await readVideo(page);

    await chooseQuality(page, '360p');

    // The state is put back once the new source has metadata.
    await expect
      .poll(() => readVideo(page))
      .toMatchObject({
        height: 360,
        paused: false,
        rate: 1.25,
        captions: 'showing',
      });
    const after = await readVideo(page);
    expect(after.time).toBeGreaterThanOrEqual(before.time - 0.5);
    expect(after.cues).toBeGreaterThan(0);
    if (browserName === 'webkit') {
      // Safari plays the variant playlist listed in the master.
      expect(after.src).toMatch(/\/hls\/360p\/index\.m3u8$/);
    }
    // onTimeUpdate never reported a restart from 0 during the change.
    expect(await reportedSeconds(page)).not.toContain(0);

    // Back near the start so the video does not end on a slow run.
    await page.locator('video').evaluate((video: HTMLVideoElement) => {
      video.currentTime = 1;
    });
    await chooseQuality(page, 'Automático');
    if (browserName === 'webkit') {
      await expect.poll(() => videoSrc(page)).toMatch(/\/hls\/master\.m3u8$/);
    }
    await expect
      .poll(() => readVideo(page))
      .toMatchObject({ paused: false, rate: 1.25, captions: 'showing' });
    await page.getByRole('button', { name: 'Qualidade' }).click();
    await expect(
      page.getByRole('menuitemradio', { name: 'Automático' })
    ).toHaveAttribute('aria-checked', 'true');
  });

  test('a rendition picked in the menu wins over the player-size cap', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'the cap is an hls.js setting');
    // A 480 px wide player: the automatic choice is capped to 360p.
    await page.setViewportSize({ width: 480, height: 640 });
    await openStory(page);
    await play(page);
    await expect.poll(async () => (await readVideo(page)).height).toBe(360);

    await chooseQuality(page, '720p');

    await expect.poll(async () => (await readVideo(page)).height).toBe(720);
  });

  test('falls back to the MP4 when the master playlist fails', async ({
    page,
  }) => {
    let masterRequests = 0;
    await page.route('**/hls/master.m3u8', (route) => {
      masterRequests += 1;
      return route.fulfill({ status: 404, body: 'not found' });
    });
    await openStory(page);
    await play(page);

    await expect.poll(() => videoSrc(page)).toMatch(/\/sample\.mp4$/);
    await expect.poll(() => videoTime(page)).toBeGreaterThan(0.5);
    expect((await readVideo(page)).paused).toBe(false);
    expect(masterRequests).toBeGreaterThan(0);
    await expect(page.getByRole('button', { name: 'Qualidade' })).toHaveCount(
      0
    );
  });

  test('falls back to the MP4 mid-playback keeping position, play state, speed and captions', async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== 'chromium',
      'Safari stalls on a missing segment without raising an error'
    );
    // hls.js retries and switches renditions for about 30 s before the
    // error becomes fatal.
    test.setTimeout(180_000);

    let releaseSegment = () => {};
    const segmentReleased = new Promise<void>((resolve) => {
      releaseSegment = resolve;
    });
    // The third segment of every rendition goes missing once playback runs.
    await page.route('**/hls/*/seg_00002.m4s', async (route) => {
      await segmentReleased;
      await route.fulfill({ status: 404, body: 'not found' });
    });

    let before: VideoState;
    try {
      await openStory(page);
      await play(page);
      await showCaptions(page);
      await setSpeed(page, '1.5x', 1.5);
      await expect.poll(() => videoTime(page)).toBeGreaterThan(1);
      await recordReportedSeconds(page);
      before = await readVideo(page);
      expectHlsEngine(before.src, browserName);
    } finally {
      // A request still held would keep the page from closing on a failure.
      releaseSegment();
    }

    await expect
      .poll(() => videoSrc(page), { timeout: 90_000 })
      .toMatch(/\/sample\.mp4$/);
    await expect.poll(() => videoTime(page)).toBeGreaterThan(before.time + 0.5);
    const after = await readVideo(page);
    expect(after.paused).toBe(false);
    expect(after.rate).toBe(1.5);
    expect(after.captions).toBe('showing');
    expect(after.cues).toBeGreaterThan(0);
    expect(await reportedSeconds(page)).not.toContain(0);
    await expect(page.getByRole('button', { name: 'Qualidade' })).toHaveCount(
      0
    );
  });

  test('resumes the HLS stream from the saved position', async ({
    page,
    browserName,
  }) => {
    await page.addInitScript((key) => {
      localStorage.setItem(key, '6');
    }, SAVED_POSITION_KEY);
    await openStory(page);
    await play(page);

    await expect.poll(() => videoTime(page)).toBeGreaterThan(6.2);
    expectHlsEngine(await videoSrc(page), browserName);
  });

  test('reports completion above 95% on the HLS stream', async ({
    page,
    browserName,
  }) => {
    await openStory(page);
    await play(page);
    await expect.poll(() => videoTime(page)).toBeGreaterThan(0.5);
    expectHlsEngine(await videoSrc(page), browserName);
    await expect(page.getByRole('status')).toContainText('Concluído: não');

    await page.locator('video').evaluate((video: HTMLVideoElement) => {
      video.currentTime = 9.3;
    });

    await expect(page.getByRole('status')).toContainText('Concluído: sim');
  });

  test('an MP4-only player loads no hls.js and shows no quality menu', async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== 'chromium',
      'serving the routed MP4 needs range requests in WebKit'
    );
    const requests = trackRequests(page);
    await page.route(MP4_STORY_URL, (route) =>
      route.fulfill({ path: FIXTURE_MP4, contentType: 'video/mp4' })
    );
    await page.route('https://via.placeholder.com/**', (route) =>
      route.abort()
    );
    await openStory(page, MP4_STORY);
    await play(page);

    await expect.poll(() => videoTime(page)).toBeGreaterThan(0.5);
    expect(await videoSrc(page)).toBe(MP4_STORY_URL);
    // The dev server serves the library as `.vite/deps/hls__js.js`.
    expect(requests.some((p) => /hls__js|\/hls(\.min)?\.m?js$/.test(p))).toBe(
      false
    );
    await expect(page.getByRole('button', { name: 'Qualidade' })).toHaveCount(
      0
    );
  });
});
