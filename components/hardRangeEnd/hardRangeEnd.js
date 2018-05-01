class HardRangeEnd extends HTMLAudioElement {
  static get observedAttributes () {
    return ['src'];
  }

  constructor () {
    super();
    this.addEventListener('pause', this.checkPositionInRange);
  }

  checkPositionInRange () {
    if (!this.rangeEnd) return;
    if (this.currentTime < this.rangeEnd) return;
    this.end();
  }

  end () {
    delete this.rangeEnd;
    this.dispatchEvent(new Event('ended'));
  }

  attributeChangedCallback (name, oldValue, newValue) {
    if (!newValue) return;

    const rangeEnd = HardRangeEnd.getRangeEnd(newValue);
    if (typeof rangeEnd !== 'number') return;

    this.rangeEnd = rangeEnd;
  }

  static getRangeEnd (src) {
    const [, search] = src.split('#');
    if (!search) return;

    const [, rangeEnd] = search.split(',');
    if (!rangeEnd) return;

    return Number(rangeEnd);
  }
}

customElements.define('hard-range-end', HardRangeEnd, { extends: 'audio' });
