
customElements.define('vinyl-record', class VinylRecord extends HTMLElement {
  constructor () {
    super();
    const doc = document.currentScript.ownerDocument;
    const [template] = doc.getElementsByTagName("template");

    this.attachShadow({mode: 'open'})
      .appendChild(template.content.cloneNode(true));

    this.sideA = toTrackList(this.querySelector('[slot="side-a"]'));
    this.sideB = toTrackList(this.querySelector('[slot="side-b"]'));
    this.tracks = [...this.sideA, ...this.sideB];
    this.currentTrackIndex = this.tracks.length + 1;
  }
  nextTrack () {
    return this.tracks[++this.currentTrackIndex % this.tracks.length];
  }
});

function toTrackList (list) {
  return Array.prototype.map.call(list.children, item => item.dataset.src);
}
//
// function Playlist (tracks) {
//   const amountTracks = tracks.length;
//   let currentTrackIndex = amountTracks + 1;
//   let cacheChecked = false;
//
//   return {
//     next,
//     initCache
//   };
//
//   function  next () {
//     if (!cacheChecked) {
//       const cachedTrack = getFromCache();
//       if (cachedTrack) return cachedTrack;
//     }
//
//     const track = tracks[++currentTrackIndex % amountTracks];
//     return track;
//   }
//
//   function getFromCache () {
//     cacheChecked = true;
//     const cache = localStorage.getItem("playingTrack");
//     localStorage.removeItem("playingTrack");
//     if (!cache) return;
//
//     const [trackIndexString, time] = cache.split("@");
//     currentTrackIndex = Number(trackIndexString);
//     const track = tracks[currentTrackIndex % amountTracks];
//
//     if (!track.includes("#t=")) return track + "#t=" + time;
//
//     let [path, anchor] = track.split("#t=");
//     const [end] = anchor.split(",");
//     return path + "#t=" + [time, end].filter(t => t).join(",")
//   }
//
//   function initCache (audio) {
//     window.addEventListener("beforeunload", cachePlayingTrack);
//
//     function cachePlayingTrack () {
//       localStorage.setItem("playingTrack", currentTrackIndex + "@" + audio.currentTime);
//     }
//   }
// }
