const componentDocument = document.currentScript.ownerDocument;

customElements.define('vinyl-record', class VinylRecord extends HTMLElement {
  constructor () {
    super();
    const [template] = componentDocument.getElementsByTagName('template');

    this.attachShadow({mode: 'open'})
      .appendChild(componentDocument.importNode(template.content, true));

    this.currentTrackIndex = 0;
    this.currentSideIndex = 0;
  }

  connectedCallback () {
    this.tracks = toTrackList(this.querySelectorAll('[slot]'));
  }

  get currentTrack () {
    return this.tracks[this.currentSideIndex][this.currentTrackIndex];
  }

  nextTrack () {
    const {tracks} = this;
    return track(this.currentSideIndex, ++this.currentTrackIndex)
      || track(++this.currentSideIndex, this.currentTrackIndex = 0)
      || track(this.currentSideIndex = 0, this.currentTrackIndex);

    function track (sideIndex, trackIndex) {
      return tracks[sideIndex] && tracks[sideIndex][trackIndex];
    }
  }
});

function toTrackList (slots) {
  return Array.prototype.map.call(slots, slotToSide);

  function slotToSide (slot) {
    return Array.prototype.map.call(slot.children, itemToTrack);
  }

  function itemToTrack (item) {
    return item.dataset.src;
  }
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
