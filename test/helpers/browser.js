'use strict';

const {baseUrl} = require('../../app');
const puppeteer = require('puppeteer');

const {npm_config_chromium_executable_path: executablePath} = process.env;
let Browser;

module.exports = {
  navigateTo,
  open () {
    Browser = puppeteer.launch({executablePath, headless: true});
  },
};

async function navigateTo (relativeUrl) {
  if (!Browser) return console.log('browser not started'); // eslint-disable-line no-console

  const browser = await Browser;
  const page = await browser.newPage();
  attachConsole(page, true);
  await page.goto(baseUrl + relativeUrl);
  return page
}

function attachConsole (page, disabled) {
  if (disabled) return;

  /* eslint-disable no-console */
  page.on('console', msg => console.log('[browser]', '>', msg.text()));
  page.on('pageerror', error => console.log('[browser]', error.message, '\n', error.stack));
  page.on('request', request => console.log('[browser]', 'go', request.url()));
  page.on('response', response => console.log('[browser]', response.status(), response.url()));
  page.on('requestfailed', request => console.log('[browser]', request.url(), request.failure().errorText));
}
