export default function Playlist (tracks) {
  const amountTracks = tracks.length;
  let currentTrackIndex = amountTracks + 1;
  let cacheChecked = false;

  return {
    next,
    initCache,
  };

  function  next () {
    if (!cacheChecked) {
      const cachedTrack = getFromCache();
      if (cachedTrack) return cachedTrack;
    }

    const track = tracks[++currentTrackIndex % amountTracks];
    return track;
  }

  function getFromCache () {
    cacheChecked = true;
    let cache;
    try {
      cache = window.localStorage.getItem('playingTrack');
      window.localStorage.removeItem('playingTrack');
      if (!cache) return;
    } catch (err) {
      return;
    }

    const [trackIndexString, time] = cache.split('@');
    currentTrackIndex = Number(trackIndexString);
    const track = tracks[currentTrackIndex % amountTracks];

    if (!track.includes('#t=')) return track + '#t=' + time;

    let [path, anchor] = track.split('#t=');
    const [end] = anchor.split(',');
    return path + '#t=' + [time, end].filter(t => t).join(',')
  }

  function initCache (audio) {
    window.addEventListener('beforeunload', cachePlayingTrack);

    function cachePlayingTrack () {
      window.localStorage.setItem('playingTrack', currentTrackIndex + '@' + audio.currentTime);
    }
  }
}
