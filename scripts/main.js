(() => {
  "use strict";

  const audioPlayer = AudioPlayer(Playlist(window.tracks));
  audioPlayer.playNext();

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
    }
  }
})();
