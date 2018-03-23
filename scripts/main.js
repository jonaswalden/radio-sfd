"use strict";

init(window.tracks, window.keyTracks);

if (typeof module !== "undefined") {
  module.exports = {
    Playlist,
    AudioPlayer,
    schedule
  };
}

function init (tracks, keyTracks) {
  if (!tracks || !keyTracks) return;

  const playlist = Playlist(tracks);
  const audioPlayer = AudioPlayer(playlist);
  schedule(window.keyTracks, audioPlayer.alert);
  audioPlayer.playNext(keyTracks);
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

function AudioPlayer (playlist) {
  const audio = document.getElementById("audio-player");
  audio.addEventListener("ended", playNext);

  return {
    alert,
    playNext
  };

  function playNext () {
    audio.src = playlist.next();
    audio.play();
  }

  function alert (src) {
    const {currentSrc, currentTime, volume} = audio;
    audio.removeEventListener("ended", playNext);

    audio.src = src;
    audio.volume = 1;
    audio.play();
    audio.addEventListener("ended", resume);

    function resume () {
      audio.src = currentSrc;
      audio.currentTime = currentTime;
      audio.volume = volume;
      audio.play();
      audio.removeEventListener("ended", resume);
      audio.addEventListener("ended", playNext);
    }
  }
}

function schedule (keyTracks, alert) {
  const date = new Date();
  const thisMonth = [date.getFullYear(), date.getMonth()];
  const today = [...thisMonth, date.getDate()];
  const tomorrow = [...thisMonth, today[2] + 1];

  queueNext();

  function queueNext () {
    const keyTrack = getUpcomingTrack();
    if (!keyTrack) return;

    const [track, timeout] = keyTrack;
    window.setTimeout(play, timeout);

    function play () {
      alert(track);
      queueNext();
    }
  }

  function getUpcomingTrack() {
    const now = Date.now();
    let lastTime = 0;

    for (let [track, timeString] of keyTracks) {
      const queue = nextTime(timeString.split(":")) - now;
      if (queue < 0) continue;

      return [track, queue];
    }

    function nextTime(moment) {
      let time = new Date(...today, ...moment).getTime();
      if (time < lastTime) {
        time = new Date(...tomorrow, ...moment).getTime();
      }
      lastTime = time;
      return time;
    }
  }
}
