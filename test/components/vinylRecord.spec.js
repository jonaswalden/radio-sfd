'use strict';

const {expect} = require('chai');
const resources = require('../helpers/resources');
const {navigateTo} = require('../helpers/browser');

describe('<vinyl-record/>', () => {
  const resourceUrl = resources.add(`
    <link rel="import" href="/components/vinylRecord/vinylRecord.html">

    <vinyl-record>
      <ul slot="side-a">
        <li data-src="0">
        <li data-src="1">
      </ul>
      <ul slot="side-b">
        <li data-src="2">
      </ul>
      <ul slot="side-c">
        <li data-src="3">
        <li data-src="4">
        <li data-src="5">
      </ul>
    </vinyl-string>
    <script>
      console.log("'ello poppet!");
    </script>
  `);

  it('component is set up', async () => {
    const page = await navigateTo(resourceUrl);

    const recordHandle = await page.$('vinyl-record');
    expect(recordHandle).to.be.ok;

    const tagName = await page.evaluate(record => record.tagName, recordHandle);
    expect(tagName).to.equal('VINYL-RECORD');

    const customProp = await page.evaluate(record => record.currentTrackIndex, recordHandle);
    expect(customProp).to.not.be.undefined;

    await recordHandle.dispose();
  });

  describe('.tracks', () => {
    let page, recordHandle;
    before(async () => {
      page = await navigateTo(resourceUrl);
      recordHandle = await page.$('vinyl-record');
    });

    after(async () => {
      await recordHandle.dispose();
    });

    it('is an array of sides containing sources of tracks', async () => {
      const tracks = await page.evaluate(record => record.tracks, recordHandle);
      expect(tracks).to.have.length(3);
      const [sideA, sideB, sideC] = tracks;
      expect(sideA).to.have.ordered.members(['0', '1']);
      expect(sideB).to.have.ordered.members(['2']);
      expect(sideC).to.have.ordered.members(['3', '4', '5']);
    });
  });

  describe('.currentTrack', () => {
    let page, recordHandle;
    before(async () => {
      page = await navigateTo(resourceUrl);
      recordHandle = await page.$('vinyl-record');
    });

    after(async () => {
      await recordHandle.dispose();
    });

    it('is the source of the current track', async () => {
      const currentTrack = await page.evaluate(record => record.currentTrack, recordHandle);
      expect(currentTrack).to.equal('0');
    });
  });

  describe('.nextTrack()', () => {
    let page, recordHandle;
    before(async () => {
      page = await navigateTo(resourceUrl);
      recordHandle = await page.$('vinyl-record');
    });

    it('gets next track and sets it to .currentTrack', async () => {
      let currentTrack = await page.evaluate(record => record.currentTrack, recordHandle);
      expect(currentTrack).to.equal('0');

      let nextTrack = await page.evaluate(record => record.nextTrack(), recordHandle);
      expect(nextTrack).to.equal('1');

      currentTrack = await page.evaluate(record => record.currentTrack, recordHandle);
      expect(currentTrack).to.equal('1');
    });

    it('gets next track from next side', async () => {
      const nextTrack = await page.evaluate(record => record.nextTrack(), recordHandle);
      expect(nextTrack).to.equal('2');
    });

    it('get first track after last track', async () => {
      let nextTrack = await page.evaluate(record => {
        record.nextTrack();
        record.nextTrack();
        return record.nextTrack();
      }, recordHandle);

      expect(nextTrack).to.equal('5');

      nextTrack = await page.evaluate(record => record.nextTrack(), recordHandle);
      expect(nextTrack).to.equal('0');
    });
  });
});
