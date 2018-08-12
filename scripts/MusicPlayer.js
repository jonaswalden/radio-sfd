import setAudioSource from './setAudioSource.js';

export default function MusicPlayer (playlist) {
  const audio = document.getElementById('music-player');
  const [pauseButton] = document.getElementsByClassName('music-player__pause-button');
  const [playButton] = document.getElementsByClassName('music-player__play-button');
  let playing = false;
  let disabled = false;
  let wasPlayingWhenPaused = false;

  pauseButton.addEventListener('click', playPause);
  playButton.addEventListener('click', playPause);
  window.addEventListener('keyup', keyboardPlayPause);
  audio.addEventListener('play', toggleMusicState);
  audio.addEventListener('pause', toggleMusicState);
  audio.volume = 0.4;

  return {
    start () {
      playNext();
      audio.addEventListener('ended', playNext);
      playlist.initCache(audio);
    },
    pause () {
      disabled = true;
      wasPlayingWhenPaused = playing;
      audio.pause();
    },
    resume () {
      disabled = false;
      if (!wasPlayingWhenPaused) return;
      audio.play();
    },
  };

  function playNext () {
    setAudioSource(audio, playlist.next());
    audio.play();
  }

  function keyboardPlayPause (event) {
    if (event.key === ' ') playPause();
  }

  function playPause () {
    if (disabled) return;

    document.documentElement.classList.toggle('state-music-paused', playing);
    if (playing) audio.pause();
    else audio.play();
  }

  function toggleMusicState (event) {
    playing = event.type === 'play';
    document.documentElement.classList.toggle('state-music', playing);
  }
}
