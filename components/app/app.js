customElements.define('rsfd-app', class RecordPlayer extends HTMLElement {
  constructor () {
    super();
    const template = window.appTemplates.app;

    const shadowRoot = this.attachShadow({mode: 'open'});
    shadowRoot.appendChild(template.content.cloneNode(true));
  }
});
