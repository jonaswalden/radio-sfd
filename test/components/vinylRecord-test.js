import '../../node_modules/mocha/mocha.js';
import '../../node_modules/chai/chai.js';

import {navigateToDomString} from './browser.js';
const {expect} = chai;

describe('<vinyl-record/>', () => {
  let browser;

  async function navigate () {
    browser = await navigateToDomString(`
      <!doctype html>
      <head>
        <script src="/scripts/mc.js"></script>
        <link rel="import" href="/components/vinylRecord/vinylRecord.html">
      </head>
      <body>
        <vinyl-record>
          <ul slot="side-a">
            <li data-src="0"></li>
            <li data-src="1"></li>
          </ul>
          <ul slot="side-b">
            <li data-src="2"></li>
          </ul>
          <ul slot="side-c">
            <li data-src="3"></li>
            <li data-src="4"></li>
            <li data-src="5"></li>
          </ul>
        </vinyl-string>
        <script>
          console.log("whaaat?");
        </script>
      </body>
    `);
  }

  describe('.currentTrack', () => {
    before(navigate);

    let record;
    before(() => {
      record = browser.document.querySelector('vinyl-record');
    });

    it('is the source of the current track', () => {
      expect(record.currentTrack).to.equal('0');
    });
  });

  describe('.nextTrack()', () => {
    before(navigate);

    let record;
    before(() => {
      record = browser.document.querySelector('vinyl-record');
    });

    it('gets next track and sets it to .currentTrack', () => {
      expect(record.currentTrack).to.equal('0');
      expect(record.nextTrack()).to.equal('1');
      expect(record.currentTrack).to.equal('1');
    });

    it('gets next track from next side', () => {
      expect(record.nextTrack()).to.equal('2');
    });

    it('get first track after last track', () => {
      record.nextTrack();
      record.nextTrack();
      expect(record.nextTrack()).to.equal('5');
      expect(record.nextTrack()).to.equal('0');
    });
  });
});
