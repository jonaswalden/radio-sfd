import getSchedule from "./getSchedule";

const date = new Date();
const thisMonth = [date.getFullYear(), date.getMonth()];
const today = [...thisMonth, date.getDate()];
const tomorrow = [...thisMonth, today[2] + 1];

customElements.define('rsfd-alerts', class Alerts extends HTMLElement {
  constructor () {
    super();
    const template = window.appTemplates.alerts;

    const shadowRoot = this.attachShadow({mode: 'open'});
    shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback () {
    this.audio = this.querySelector('audio');
    this.queueNext();
  }

  queueNext () {
    const self = this;
    const upcoming = this.getUpcoming();
    const moment = upcoming.queue.split(':');
    const now = Date.now();
    let timeout = new Date(...today, ...moment).getTime() - now;

    if (timeout < 0) {
      timeout = new Date(...tomorrow, ...moment).getTime() - now;
    }

    window.setTimeout(playNext, timeout);

    function playNext () {
      self.play(upcoming.message);
      self.schedule.passed.push(self.schedule.upcoming.shift());
    }
  }

  repeatLast () {
    const last = this.schedule.passed[this.schedule.passed.length - 1];
    if (!last) return;

    this.play(last.message);
  }

  async play (message) {
    toggleAlertState(true);
    musicPlayer.pause();

    await this.vignette.play();
    await message.play();
    await new Promise(resolve => setTimeout(resolve, 500));

    toggleAlertState(false);
    musicPlayer.resume();
    this.queueNext();
  }

  getUpcoming () {
    const {schedule} = this;
    if (!schedule.upcoming.length) {
      schedule.upcoming = schedule.passed;
      schedule.passed = [];
    }

    return schedule.upcoming[0];
  }

  toggleAlertState (on) {
    document.documentElement.classList.toggle('state-alert', on);
  }
});
