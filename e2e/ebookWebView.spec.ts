import { readFileSync } from 'fs';
import path from 'path';
import { expect as baseExpect, test, type Page } from '@playwright/test';

/**
 * The ebook reader for the app's WebView (AE-3323), as the app gets it: the
 * page built by `scripts/ebook-webview/htmlPlugin.mjs`, driven through its
 * bridge the way the app drives it. EB40 comes from the lib fixture
 * (`public/fixtures/ebook/eb40/student`), served from a fake CDN.
 *
 * The app's WebView plays media without a tap (`mediaPlaybackRequiresUserAction`
 * off); the browser is launched the same way.
 */

const expect = baseExpect.configure({ timeout: 15_000 });

const READER_URL = 'https://reader.e2e.test/';
const CDN = 'https://cdn.e2e.test/eb40/';
const FIXTURE = path.join(
  __dirname,
  '..',
  'public/fixtures/ebook/eb40/student'
);

const VIEWPORTS = [
  { name: 'phone', size: { width: 375, height: 640 } },
  { name: 'tablet', size: { width: 768, height: 960 } },
] as const;

const fixture = (file: string) => readFileSync(path.join(FIXTURE, file));

const CONTENT = {
  html: fixture('content.html').toString('utf-8'),
  css: fixture('styles.css').toString('utf-8'),
  narration: JSON.parse(fixture('narration.json').toString('utf-8')),
  assetBaseUrl: CDN,
};

interface WebViewEvent {
  type: string;
  state?: {
    layout: string;
    pageIndex: number;
    pageLabel: string;
    toc: { label: string; target: string }[];
    activeTocTarget?: string;
    isPlaying: boolean;
    withAudioDescription: boolean;
  };
  page?: { section: string | null; sections: string[] };
}

declare global {
  interface Window {
    __events: WebViewEvent[];
  }
}

let readerHtml = '';

test.beforeAll(async () => {
  const esbuild = await import('esbuild');
  const { buildEbookWebViewHtml } =
    await import('../scripts/ebook-webview/htmlPlugin.mjs');
  readerHtml = (await buildEbookWebViewHtml(esbuild)).html;
});

/** Opens the reader page inside a stand-in for the React Native WebView. */
const openReader = async (page: Page) => {
  await page.addInitScript(() => {
    globalThis.window.__events = [];
    globalThis.window.ReactNativeWebView = {
      postMessage: (message: string) => {
        globalThis.window.__events.push(JSON.parse(message));
      },
    };
  });
  await page.route(READER_URL, (route) =>
    route.fulfill({ contentType: 'text/html', body: readerHtml })
  );
  await page.route(`${CDN}**`, (route) => {
    const file = new URL(route.request().url()).pathname.replace('/eb40/', '');
    return route.fulfill({ body: fixture(file) });
  });
  await page.goto(READER_URL);
  await expect.poll(() => events(page)).toContainEqual({ type: 'ready' });
};

const events = (page: Page) => page.evaluate(() => globalThis.window.__events);

const send = (page: Page, command: object) =>
  page.evaluate((sent) => {
    globalThis.window.ebookReaderBridge?.receive(sent);
  }, command);

const lastState = async (page: Page) =>
  (await events(page)).filter((event) => event.type === 'state').at(-1)?.state;

const sectionsReported = async (page: Page) =>
  (await events(page))
    .filter((event) => event.type === 'pageChange')
    .map((event) => event.page?.section);

test.use({
  launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] },
});

for (const { name, size } of VIEWPORTS) {
  test.describe(`Ebook WebView reader @e2e on a ${name}`, () => {
    test.use({ viewport: size });

    test('opens the book at the cover, with its images', async ({ page }) => {
      await openReader(page);

      await send(page, { type: 'open', content: CONTENT });

      await expect(page.locator('#book.stf__parent')).toBeVisible();
      await expect
        .poll(async () => (await lastState(page))?.pageLabel)
        .toBe('Capa');
      const cover = page.locator('.ebook-content img').first();
      await expect
        .poll(() => cover.evaluate((img: HTMLImageElement) => img.naturalWidth))
        .toBeGreaterThan(0);
    });

    test('turns the pages the app asks for and reports each one', async ({
      page,
    }) => {
      await openReader(page);
      await send(page, { type: 'open', content: CONTENT });
      await expect.poll(async () => (await lastState(page))?.pageIndex).toBe(0);

      await send(page, { type: 'next' });

      await expect.poll(async () => (await lastState(page))?.pageIndex).toBe(1);
      await expect.poll(() => sectionsReported(page)).toContain('rosto');

      await send(page, { type: 'previous' });
      await expect.poll(async () => (await lastState(page))?.pageIndex).toBe(0);
    });

    test('opens where the student left off', async ({ page }) => {
      await openReader(page);

      await send(page, {
        type: 'open',
        content: CONTENT,
        initialSection: 'p04',
      });

      await expect.poll(() => sectionsReported(page)).toContain('p04');
      expect((await lastState(page))?.pageLabel).not.toBe('Capa');
    });

    test('goes to an entry of the contents', async ({ page }) => {
      await openReader(page);
      await send(page, { type: 'open', content: CONTENT });
      await expect
        .poll(async () => (await lastState(page))?.toc.length)
        .toBeGreaterThan(1);
      const entry = (await lastState(page))?.toc[1];

      await send(page, { type: 'goTo', target: entry?.target });

      await expect
        .poll(async () => (await lastState(page))?.activeTocTarget)
        .toBe(entry?.target);
    });

    test('switches to scroll and back', async ({ page }) => {
      await openReader(page);
      await send(page, { type: 'open', content: CONTENT });
      await expect(page.locator('#book.stf__parent')).toBeVisible();

      await send(page, { type: 'toggleLayout' });
      await expect(page.locator('#book.rolagem')).toBeVisible();
      await expect
        .poll(async () => (await lastState(page))?.layout)
        .toBe('scroll');

      await send(page, { type: 'toggleLayout' });
      await expect
        .poll(async () => (await lastState(page))?.layout)
        .toBe('book');
    });

    test('plays the narration, highlighting what is read', async ({ page }) => {
      await openReader(page);
      await send(page, {
        type: 'open',
        content: CONTENT,
        initialSection: 'caso',
      });
      await expect.poll(() => sectionsReported(page)).toContain('caso');

      await send(page, { type: 'toggleNarration' });

      await expect
        .poll(async () => (await lastState(page))?.isPlaying)
        .toBe(true);
      await expect(page.locator('[data-segment="p3-1"]')).toHaveClass(/lendo/);

      await send(page, { type: 'toggleNarration' });
      await expect
        .poll(async () => (await lastState(page))?.isPlaying)
        .toBe(false);
    });
  });
}
