import setAudioSource from './setAudioSource.js';

export default function MusicPlayer (playlist) {
  const audio = document.getElementById('music-player');
  let playing = false;
  let disabled = false;
  let wasPlayingWhenPaused = false;
  audio.addEventListener('play', toggleMusicState);
  audio.addEventListener('pause', toggleMusicState);
  audio.volume = 0.4;

  return {
    start,
    pause,
    resume,
    pauseResume,
  }

  function start () {
    playNext().catch(toggleMusicState);
    audio.addEventListener('ended', playNext);
    playlist.initCache(audio);
  }

  function pause () {
    disabled = true;
    wasPlayingWhenPaused = playing;
    audio.pause();
  }

  function resume () {
    disabled = false;
    if (!wasPlayingWhenPaused) return;
    audio.play();
  }

  function playNext () {
    setAudioSource(audio, playlist.next());
    return audio.play();
  }

  function pauseResume () {
    if (disabled) return;

    if (playing) audio.pause();
    else audio.play();
  }

  function toggleMusicState (event) {
    playing = event.type === 'play';
    document.documentElement.classList.toggle('state-music-playing', playing);
    document.documentElement.classList.toggle('state-music-paused', !playing);
  }
}
