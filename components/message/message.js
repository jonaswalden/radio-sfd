customElements.define('rsfd-message', class Message extends HTMLElement {
  constructor () {
    super();
    const template = window.appTemplates.message;

    const shadowRoot = this.attachShadow();
    shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback () {
    this.audio = this.querySelector('audio');
  }

  get src () {
    return this.getAttribute('src');
  }

  set src (value) {
    this.setAttribute('src', this.audio.src = value);
  }

  async play () {
    const self = this;
    this.audio.play();

    return new Promise(resolve => {
      self.audio.addEventListener('ended', resolve, {once: true});
    });
  }
});
