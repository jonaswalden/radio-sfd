'use strict';

const server = require('../../app');
const puppeteer = require('puppeteer');
const router = require('koa-route');

const {npm_config_chromium_executable_path: executablePath} = process.env;
const Browser = puppeteer.launch({executablePath, headless: true});

const resources = [];

server.app.use(router.get('/resource/:id', (ctx, id) => {
  const resource = resources[Number(id)];
  if (!resource) return ctx.throw('no such thing', 404)
  ctx.body = resource;
}));

server.start();

module.exports = {
  navigateTo,
  addResource (resource) {
    const id = resources.push(resource) - 1;
    return `http://localhost:4000/resource/${id}`;
  },
  async close () {
    const browser = await Browser;
    await browser.close();
    return new Promise(resolve => server.stop(resolve));
  },
};

async function navigateTo (url) {
  const browser = await Browser;
  const page = await browser.newPage();
  page.on('console', msg => console.log('[browser]', '>', msg.text()));
  page.on('pageerror', error => console.log('[browser]', error.message, '\n', error.stack));
  page.on('request', request => console.log('[browser]', 'go', request.url()));
  page.on('response', response => console.log('[browser]', response.status(), response.url()));
  page.on('requestfailed', request => console.log('[browser]', request.url(), request.failure().errorText));
  await page.goto(url);
  return page
}
