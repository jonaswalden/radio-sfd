"use strict";

var audio = document.getElementById("audio-player");
window._pending = window.fetch("http://radio-api.sfd/tracks.json")
  .then(res => res.json())
  .then(Playlist)
  .then(audioPlayer);

function Playlist (tracks) {
  var amountTracks = tracks.length;
  var t = amountTracks;

  return { next };

  function next () {
    const track = tracks[t++ % amountTracks];
    console.log(track);
    return track.src;
  }
}

function audioPlayer (playlist) {
  playNext();

  audio.addEventListener("ended", playNext);

  function playNext() {
    audio.src = playlist.next();
    audio.play();
  }
}
