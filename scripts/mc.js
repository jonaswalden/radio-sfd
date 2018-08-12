import setAudioSource from './setAudioSource.js';
import {today, tomorrow, moment} from './time.js'

export default function MC (schedule, messages, musicPlayer) {
  const audio = document.getElementById('alert-player');
  const [text] = document.getElementsByClassName('alert-player__text');
  const vignetteAudio = 'audio/messages/vignette.ogg';

  return {
    start: queueNext,
    repeatLast,
  }

  function queueNext () {
    const upcoming = getUpcoming();
    const now = Date.now();
    let timeout = moment(today, upcoming.queue) - now;

    if (timeout < 0) {
      timeout = moment(tomorrow, upcoming.queue) - now;
    }

    window.setTimeout(playNext, timeout);

    function playNext () {
      play(upcoming.message);
      schedule.passed.push(schedule.upcoming.shift());
    }
  }

  function repeatLast () {
    const last = schedule.passed[schedule.passed.length - 1];
    if (!last) return;

    play(last.message);
  }

  async function play (messageKey) {
    const message = messages[messageKey];
    toggleAlertState(true);
    musicPlayer.pause();

    await playVignette();
    await playMessage();
    await new Promise(resolve => window.setTimeout(resolve, 500));

    toggleAlertState(false);
    musicPlayer.resume();
    queueNext();

    function playVignette () {
      setAudioSource(audio, vignetteAudio);
      audio.play();
      text.textContent = '...';

      return new Promise(resolve => {
        audio.addEventListener('ended', resolve, {once: true});
      });
    }

    function playMessage () {
      setAudioSource(audio, message.audio);
      audio.play();
      text.innerHTML = message.text;

      return new Promise(resolve => {
        audio.addEventListener('ended', resolve, {once: true});
      });
    }
  }

  function getUpcoming () {
    if (!schedule.upcoming.length) {
      schedule.upcoming = schedule.passed;
      schedule.passed = [];
    }

    return schedule.upcoming[0];
  }

  function toggleAlertState (on) {
    document.documentElement.classList.toggle('state-alert', on);
  }
}
