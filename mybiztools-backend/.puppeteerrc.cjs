const { join } = require('node:path');

/**
 * Keep the downloaded Chromium inside the project directory so the binary
 * fetched at build time is still found at runtime on hosts where $HOME differs
 * between the build and run steps (e.g. Render native runtime).
 *
 * In Docker we instead use the system Chromium via PUPPETEER_EXECUTABLE_PATH,
 * and PUPPETEER_SKIP_DOWNLOAD=true makes this cache unused there.
 *
 * @type {import('puppeteer').Configuration}
 */
module.exports = {
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
