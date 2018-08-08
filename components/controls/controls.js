customElements.define('rsfd-controls', class Controls extends HTMLElement {
  constructor () {
    super();
    const template = window.appTemplates.controls;

    const shadowRoot = this.attachShadow({mode: 'open'});
    shadowRoot.appendChild(template.content.cloneNode(true));
  }
});
