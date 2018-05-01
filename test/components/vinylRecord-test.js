const expect = window.chai.expect;

describe('<vinyl-record/>', () => {
  function createRecord () {
    const record = document.createElement('vinyl-record');
    record.innerHTML = `
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
  `;
    return record;
  }

  describe('.currentTrack', () => {
    let record;
    before(() => document.body.appendChild(record = createRecord()));
    after(() => document.body.removeChild(record));

    it('is the source of the current track', () => {
      expect(record.currentTrack).to.equal('0');
    });
  });

  describe('.nextTrack()', () => {
    let record;
    before(() => document.body.appendChild(record = createRecord()));
    after(() => document.body.removeChild(record));

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
