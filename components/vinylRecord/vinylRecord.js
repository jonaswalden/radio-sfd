customElements.define('vinyl-record', class VinylRecord extends HTMLElement {
  constructor () {
    super();
    const template = window.appTemplates.vinylRecord;

    const shadowRoot = this.attachShadow({mode: 'open'});
    shadowRoot.appendChild(template.content.cloneNode(true));

    this.currentTrackIndex = 0;
    this.currentSideIndex = 0;
  }

  connectedCallback () {
    this.tracks = toTrackList(this.querySelectorAll('[slot]'));
  }

  get currentTrack () {
    return this.tracks[this.currentSideIndex][this.currentTrackIndex];
  }

  async nextTrack () {
    // const previousSide = this.currentSideIndex;
    const {tracks} = this;
    const track = getTrack(this.currentSideIndex, ++this.currentTrackIndex)
      || getTrack(++this.currentSideIndex, this.currentTrackIndex = 0)
      || getTrack(this.currentSideIndex = 0, this.currentTrackIndex);

    // if (previousSide !== this.currentSideIndex) {
    //   await this.flip();
    // }

    return track;

    function getTrack (sideIndex, trackIndex) {
      return tracks[sideIndex] && tracks[sideIndex][trackIndex];
    }
  }

  // async flip () {
  //   let element = this;
  //   const nextSideRotation = 0;
  //
  //   let transition = Transition('ease-in');
  //   this.style.transform = `rotateX(${nextSideRotation - 90}deg)`;
  //   await transition;
  //   this.style.filter = `hue-rotate(${this.currentSideIndex * 90}deg)`;
  //   this.style.transform = `rotateX(${nextSideRotation + 90}deg)`;
  //   transition = Transition('ease-out');
  //   this.style.transform = `rotateX(${nextSideRotation}deg)`;
  //   await transition;
  //
  //   function Transition (easing) {
  //     element.style.transition = `transform 0.5s ${easing}`;
  //     return new Promise(resolve => element.addEventListener('transitionend', resolve, {once: true}));
  //   }
  // }
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
