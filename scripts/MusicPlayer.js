import setAudioSource from './setAudioSource.js';

export default function MusicPlayer (playlist) {
  let playing = false;
  let wasPlayingWhenPaused = false;
  const audio = document.getElementById('music-player');
  audio.volume = 0.4;

  return {
    start,
    pause,
    resume,
    pauseResume,
  }

  async function start () {
    try {
      await playNext();
      toggleMusicState(true);
    }
    catch (err) {
      toggleMusicState(false, false);
    }

    audio.addEventListener('ended', playNext);
    playlist.initCache(audio);
  }

  function pause (manual) {
    wasPlayingWhenPaused = playing;

    audio.pause();
    toggleMusicState(false, !!manual);
  }

  function resume (manual) {
    if (!manual && !wasPlayingWhenPaused) return;

    audio.play();
    toggleMusicState(true, !!manual);
  }

  function pauseResume (...args) {
    if (playing) pause(...args);
    else resume(...args);
  }

  function playNext () {
    setAudioSource(audio, playlist.next());
    return audio.play();
  }

  function toggleMusicState (playingValue, hard) {
    playing = playingValue;
    document.documentElement.classList.toggle('state-music-playing', playing);

    if (playing) {
      document.documentElement.classList.remove('state-music-paused');
    }
    else if (hard) {
      document.documentElement.classList.add('state-music-paused');
    }
  }
}
