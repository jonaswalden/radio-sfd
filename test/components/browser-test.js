import '/node_modules/mocha/mocha.js';
import '/node_modules/chai/chai.js';

import * as Browser from './browser.js';

describe('Browser', () => {
  describe.skip('.navigateToUrl(url)', () => {
    const {navigateToUrl} = Browser;

    it('loads document from url', async () => {
      const browser = await navigateToUrl('/app.html');
      const result = browser.document.body.querySelector('*');
      chai.expect(result).to.be.ok;
    });
  });

  describe('.navigateToDomString(domString)', () => {
    const {navigateToDomString} = Browser;

    it('loads domstring as document', async () => {
      const browser = await navigateToDomString('<div id="result"></div>');
      const result = browser.document.getElementById('result');
      chai.expect(result).to.be.ok;
    });

    it('loads linked resources', async () => {
      await navigateToDomString('<script src="/this/asset/doesnt/exist.js"></script>');
    });
  });
});
