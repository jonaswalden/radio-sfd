"use strict";

const audio = document.getElementById("audio-player");
window.fetch("http://radio-api.sfd/tracks.json")
  .then(res => res.json())
  .then(audioPlayer);

function audioPlayer (tracks) {
  if (!tracks) return;
  console.log("writing", tracks[0].src);
  audio.src = tracks[0].src;
  audio.play();
}
