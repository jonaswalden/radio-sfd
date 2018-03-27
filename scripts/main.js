"use strict";

try {
  init(window.tracks, window.alertMessages);
}
catch (err) {
}

if (typeof module !== "undefined") {
  module.exports = {
    Playlist,
    MusicPlayer,
    schedule,
    setAudioSource
  };
}

function init (tracks, alertMessages) {
  if (!tracks || !alertMessages) return;

  const playlist = Playlist(tracks);
  const musicPlayer = MusicPlayer(playlist);
  schedule(alertMessages, musicPlayer);
  musicPlayer.start();
}

function Playlist (tracks) {
  const amountTracks = tracks.length;
  let t = amountTracks;

  return {
    next
  };

  function  next () {
    const track = tracks[t++ % amountTracks];
    return track;
  }
}

function MusicPlayer (playlist) {
  const audio = document.getElementById("music-player");
  const playButton = document.getElementsByClassName("music-player__play-button")[0];
  let playing = false;
  let disabled = false;
  let wasPlayingWhenPaused = false;

  window.addEventListener("keyup", keyboardPlayPause);
  playButton.addEventListener("click", playPause);
  audio.addEventListener("play", toggleMusicState);
  audio.addEventListener("pause", toggleMusicState);

  return {
    start () {
      playNext();
      audio.addEventListener("ended", playNext);
    },
    pause () {
      disabled = true;
      wasPlayingWhenPaused = playing;
      audio.pause();
    },
    resume () {
      disabled = false;
      if (!wasPlayingWhenPaused) return;
      audio.play();
    }
  };

  function playNext () {
    setAudioSource(audio, playlist.next());
    audio.play();
  }

  function keyboardPlayPause (event) {
    if (!["Enter", " "].includes(event.key)) return;
    playPause();
  }

  function playPause () {
    if (disabled) return;

    if (playing) audio.pause();
    else audio.play();
  }

  function toggleMusicState (event) {
    playing = event.type === "play";
    document.documentElement.classList.toggle("state-music", playing);

    // if (!playing && (this.duration - this.currentTime) < 1) {
    //   console.log("ended?");
    //   this.dispatchEvent(new Event("ended"));
    // }
  }
}

function schedule (alertMessages, musicPlayer) {
  const audio = document.getElementById("alert-player__audio");
  const [text] = document.getElementsByClassName("alert-player__text");
  if (!audio || !text) return;

  const date = new Date();
  const thisMonth = [date.getFullYear(), date.getMonth()];
  const today = [...thisMonth, date.getDate()];
  const tomorrow = [...thisMonth, today[2] + 1];

  queueNext();

  function queueNext () {
    const upcoming = getUpcoming();
    if (!upcoming) return;

    window.setTimeout(() => play(upcoming.message), upcoming.timeout);
  }

  async function play (message) {
    text.textContent = "...";
    toggleAlertState(true);
    musicPlayer.pause();

    await playVignette();
    await playMessage();
    await new Promise(resolve => setTimeout(resolve, 500));

    toggleAlertState(false);
    musicPlayer.resume();
    queueNext();

    function playVignette () {
      setAudioSource(audio, "audio/horse.ogg");
      audio.play();

      return new Promise(resolve => {
        audio.addEventListener("ended", resolve, {once: true});
      });
    }

    function playMessage () {
      setAudioSource(audio, message.audio);
      audio.play();
      text.innerHTML = `<time>${message.queue}</time> ${message.text}`;

      return new Promise(resolve => {
        audio.addEventListener("ended", resolve, {once: true});
      });
    }
  }

  function getUpcoming () {
    const now = Date.now();
    let lastTime = 0;

    for (let message of alertMessages) {
      const timeout = nextTime(message.queue.split(":")) - now;
      if (timeout < 0) continue;
      console.log("next up", timeout);
      return {message, timeout};
    }

    function nextTime (moment) {
      let time = new Date(...today, ...moment).getTime();
      if (time < lastTime) {
        time = new Date(...tomorrow, ...moment).getTime();
      }
      lastTime = time;
      return time;
    }
  }

  function toggleAlertState (on) {
    document.documentElement.classList.toggle("state-alert", on);
  }
}

function setAudioSource (audio, src) {
  const [, search] = src.split("#");
  audio.src = src;

  if (!search) return;

  const [, playbackStop] = search.split(",");
  if (!playbackStop) return;

  endPlaybackAfter(playbackStop);

  function endPlaybackAfter (durationString) {
    const duration = Number(durationString);
    audio.addEventListener("pause", checkProgress);

    function checkProgress () {
      if (audio.currentTime < duration) return;

      audio.removeEventListener("pause", checkProgress);
      audio.dispatchEvent(new window.Event("ended"));
    }
  }
}
