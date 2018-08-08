import setAudioSource from "./setAudioSource.js";

export default async function mc (schedule, messages, musicPlayer) {
  const audio = document.getElementById("alert-player__audio");
  const [text] = document.getElementsByClassName("alert-player__text");
  const [repeatButton] = document.getElementsByClassName("alert-player__repeat-button");
  const date = new Date();
  const thisMonth = [date.getFullYear(), date.getMonth()];
  const today = [...thisMonth, date.getDate()];
  const tomorrow = [...thisMonth, today[2] + 1];
  const vignetteAudio = "audio/messages/vignette.ogg";

  repeatButton.addEventListener("click", repeatLast);
  window.addEventListener("keyup", keyboardRepeatLast);

  queueNext();

  function queueNext () {
    const upcoming = getUpcoming();
    const moment = upcoming.queue.split(":");
    const now = Date.now();
    let timeout = new Date(...today, ...moment).getTime() - now;

    if (timeout < 0) {
      timeout = new Date(...tomorrow, ...moment).getTime() - now;
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

  function keyboardRepeatLast (event) {
    if (event.key === "backspace") repeatLast();
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
      text.textContent = "...";

      return new Promise(resolve => {
        audio.addEventListener("ended", resolve, {once: true});
      });
    }

    function playMessage () {
      setAudioSource(audio, message.audio);
      audio.play();
      text.innerHTML = message.text;

      return new Promise(resolve => {
        audio.addEventListener("ended", resolve, {once: true});
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
    document.documentElement.classList.toggle("state-alert", on);
  }
}
