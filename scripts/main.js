(() => {
  "use strict";

  const playlist = Playlist(window.tracks);
  const audioPlayer = AudioPlayer(playlist);
  schedule(window.keyTracks, audioPlayer);
  audioPlayer.playNext();
})();

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
    console.log("alert", src);

    function resume () {
      audio.src = currentSrc;
      audio.currentTime = currentTime;
      audio.volume = volume;
      audio.play();
      console.log("resume", currentSrc);
      audio.removeEventListener("ended", resume);
      audio.addEventListener("ended", playNext);
    }
  }
}

function schedule (keyTracks, audioPlayer) {
  const now = new Date();
  const today = [now.getFullYear(), now.getMonth(), now.getDate()];

  queueNext();

  function queueNext () {
    const keyTrack = getUpcomingTrack();
    if (!keyTrack) return;

    const [track, timeout] = keyTrack;
    window.setTimeout(play, timeout);

    function play () {
      audioPlayer.alert(track);
      queueNext();
    }
  }

  function getUpcomingTrack() {
    for (let [track, queue] of keyTracks) {
      const [nextHour, nextMinutes] = queue.split(":");
      const timeTo = new Date(...today, nextHour, nextMinutes).getTime() - now.getTime();
      if (timeTo < 0) continue;

      return [track, timeTo];
    }
  }
}
