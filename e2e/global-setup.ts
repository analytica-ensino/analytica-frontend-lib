import { chromium, type FullConfig } from '@playwright/test';

/** How long the first visit may take on a cold dev server. */
const WARM_UP_TIMEOUT = 300_000;

/**
 * Opens the HLS story once before the tests. The first visit makes the Ladle
 * dev server compile the stories and pre-bundle their dependencies, which on
 * a busy machine takes longer than a test's timeout.
 *
 * @param config - Playwright config, for the base URL
 */
const globalSetup = async (config: FullConfig) => {
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    const page = await browser.newPage();
    await page.goto(`${baseURL}?story=videoplayer--hls&mode=preview`, {
      timeout: WARM_UP_TIMEOUT,
    });
    await page
      .locator('video')
      .waitFor({ state: 'attached', timeout: WARM_UP_TIMEOUT });
  } finally {
    await browser.close();
  }
};

export default globalSetup;
