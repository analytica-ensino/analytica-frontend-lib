import { defineConfig, devices } from '@playwright/test';

/**
 * Browser tests (`yarn test:e2e`). They run the Ladle stories in Google
 * Chrome (hls.js) and WebKit (native HLS, as in Safari) against the video
 * fixture in `public/fixtures/video`, so they never depend on the network.
 *
 * The videos are H.264/AAC: the Chrome project uses the installed Google
 * Chrome (`channel: 'chrome'`), which has those codecs, rather than the
 * Chromium build Playwright downloads. WebKit comes from
 * `yarn playwright install webkit`. Not part of CI yet; a CI job would need
 * Chrome on the runner (GitHub's ubuntu-latest has it) and the WebKit
 * dependencies (`yarn playwright install --with-deps webkit`).
 */
const PORT = 61010;
const BASE_URL = `http://127.0.0.1:${PORT}/analytica-frontend-lib/`;

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: `yarn ladle serve --host 127.0.0.1 --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    // Ladle opens a browser tab on start unless told not to.
    env: { BROWSER: 'none' },
  },
});
