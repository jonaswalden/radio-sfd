export default function setAudioSource (audio, src) {
  const [, search] = src.split('#');
  audio.src = src;
  if (!search) return;

  const [, playbackStop] = search.split(',');
  if (!playbackStop) return;

  endPlaybackAfter(playbackStop);

  function endPlaybackAfter (durationString) {
    const duration = Number(durationString);
    audio.addEventListener('pause', checkProgress);

    function checkProgress () {
      if (audio.currentTime < duration) return;

      audio.removeEventListener('pause', checkProgress);
      audio.dispatchEvent(new window.Event('ended'));
    }
  }
}
