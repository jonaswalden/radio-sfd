import setAudioSource from './setAudioSource.js';

export default function MC (schedule, messages, musicPlayer) {
  const audio = document.getElementById('alert-player');
  const [text] = document.getElementsByClassName('alert-player__text');
  const vignetteAudio = 'audio/messages/vignette.ogg';

  return {
    start: queueNext,
    repeatLast,
  }

  function queueNext () {
    document.documentElement.classList.toggle('state-alert-repeatable', !!schedule.passed.length);
    const [upcoming] = schedule.upcoming;
    if (!upcoming) return;

    const timeout = upcoming.queue - Date.now();
    if (timeout < 0) ;

    window.setTimeout(playNext, timeout);

    function playNext () {
      play(upcoming.message);
      schedule.passed.push(schedule.upcoming.shift());
    }
  }

  function repeatLast () {
    const last = schedule.passed[schedule.passed.length - 1];
    if (!last) return;

    play(last.message, true);
  }

  async function play (messageId, skipQueueNext) {
    const message = messages[messageId];
    if (!message) return;

    toggleAlertState(true);
    musicPlayer.pause();

    await playVignette();
    await playMessage();
    await new Promise(resolve => window.setTimeout(resolve, 500));

    toggleAlertState(false);
    musicPlayer.resume();
    if (skipQueueNext) return; 

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

  function toggleAlertState (on) {
    document.documentElement.classList.toggle('state-alert', on);
  }
}
