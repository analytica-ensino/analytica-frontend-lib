import { expect as baseExpect, test, type Page } from '@playwright/test';

/**
 * The lesson player (`LessonVideoSection`, AE-3291) in the Ladle stories
 * `LessonMediaSections > *`: the pages of the apps hand it the lesson's MP4
 * (`urlVideo`) and HLS master (`urlVideoHls`), and the institution's
 * `MODULES.lessonVideoMp4Only` switch can take it back to the MP4.
 *
 * Same fixture as the VideoPlayer suite (`public/fixtures/video`), so nothing
 * here depends on the network.
 */

/** Polls wait up to 30 s: media start-up is slow on a loaded machine. */
const expect = baseExpect.configure({ timeout: 30_000 });

const HLS_STORY = 'lessonmediasections--video-hls';
const MP4_STORY = 'lessonmediasections--video-mp4';
const MP4_ONLY_STORY = 'lessonmediasections--video-hls-com-volta-ao-mp4';

/** Paths of every request the page makes, in order. */
const trackRequests = (page: Page): string[] => {
  const paths: string[] = [];
  page.on('request', (request) => {
    paths.push(new URL(request.url()).pathname);
  });
  return paths;
};

const openStory = async (page: Page, story: string) => {
  await page.goto(`?story=${story}&mode=preview`);
  const video = page.locator('video');
  await expect(video).toBeAttached();
  await expect
    .poll(() =>
      video.evaluate((element: HTMLVideoElement) => element.readyState)
    )
    .toBeGreaterThan(0);
};

const play = (page: Page) =>
  page.getByRole('button', { name: 'Reproduzir vídeo' }).click();

const videoState = (page: Page) =>
  page.locator('video').evaluate((video: HTMLVideoElement) => ({
    src: video.currentSrc,
    time: video.currentTime,
  }));

test.describe('LessonVideoSection HLS @e2e', () => {
  test.describe.configure({ timeout: 120_000 });

  test('a converted lesson plays its HLS with the quality menu', async ({
    page,
    browserName,
  }) => {
    const requests = trackRequests(page);
    await openStory(page, HLS_STORY);

    const qualityButton = page.getByRole('button', { name: 'Qualidade' });
    await expect(qualityButton).toBeVisible();
    await qualityButton.click();
    await expect(page.getByRole('menuitemradio')).toHaveText([
      'Automático',
      '720p',
      '480p',
      '360p',
    ]);
    await expect(
      page.getByRole('menuitemradio', { name: 'Automático' })
    ).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('Escape');

    await play(page);
    await expect
      .poll(async () => (await videoState(page)).time)
      .toBeGreaterThan(1);
    const { src } = await videoState(page);
    if (browserName === 'chromium') {
      expect(src).toMatch(/^blob:/);
    } else {
      expect(src).toMatch(/\/hls\/master\.m3u8$/);
    }
    expect(requests.some((p) => p.endsWith('/hls/master.m3u8'))).toBe(true);
    expect(requests.some((p) => p.endsWith('/sample.mp4'))).toBe(false);
  });

  test('a lesson not converted plays the MP4, without the quality menu', async ({
    page,
  }) => {
    const requests = trackRequests(page);
    await openStory(page, MP4_STORY);
    await play(page);

    await expect
      .poll(async () => (await videoState(page)).time)
      .toBeGreaterThan(1);
    expect((await videoState(page)).src).toMatch(/\/sample\.mp4$/);
    await expect(page.getByRole('button', { name: 'Qualidade' })).toHaveCount(
      0
    );
    expect(requests.some((p) => p.endsWith('.m3u8'))).toBe(false);
  });

  test('with lessonVideoMp4Only on, a converted lesson plays the MP4', async ({
    page,
  }) => {
    const requests = trackRequests(page);
    await openStory(page, MP4_ONLY_STORY);
    await play(page);

    await expect
      .poll(async () => (await videoState(page)).time)
      .toBeGreaterThan(1);
    expect((await videoState(page)).src).toMatch(/\/sample\.mp4$/);
    await expect(page.getByRole('button', { name: 'Qualidade' })).toHaveCount(
      0
    );
    expect(requests.some((p) => p.endsWith('.m3u8'))).toBe(false);
  });
});
