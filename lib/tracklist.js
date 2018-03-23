"use strict";

// const fillTracks = [
//   ["Tom Waits - Frank's Theme", 109],
//   ["Brian Eno - Blank Frank", 215],
// ];

module.exports = function Playlist (tracks, minDuration, keyTracks = []) {
  const amountTracks = tracks.length;
  let t = amountTracks;
  let currentDuration = 0;
  const playlist = [];

  while (currentDuration < minDuration || keyTracks.length) {
    const track = getNextKeyTrack() || tracks[t++ % amountTracks];
    currentDuration += track.duration;
    playlist.push(track.title);
  }

  return playlist;

  function getNextKeyTrack () {
    const [track] = keyTracks;
    if (!track) return;
    if (currentDuration < track.queue) return;

    return keyTracks.shift();
  }
};
