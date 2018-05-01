
customElements.define('record-player', class RecordPlayer extends HTMLElement {
  constructor () {
    super();
    const doc = document.currentScript.ownerDocument;
    const [template] = doc.getElementsByTagName('template');

    const shadow = this.attachShadow({mode: 'open'});
    shadow.appendChild(template.content.cloneNode(true));

    Object.assign(this, _RecordPlayer(this));
  }

  connectedCallback () {
    this.record = this.querySelector('vinyl-record');
    this.start();
  }
});

function _RecordPlayer (element) {
  const audio = element.shadowRoot.querySelector('audio');
  // const [pauseButton] = document.getElementsByClassName("music-player__pause-button");
  // const [playButton] = document.getElementsByClassName("music-player__play-button");
  let playing = false;
  let disabled = false;
  let wasPlayingWhenPaused = false;

  // pauseButton.addEventListener("click", playPause);
  // playButton.addEventListener("click", playPause);
  window.addEventListener('keyup', keyboardPlayPause);
  audio.addEventListener('play', toggleMusicState);
  audio.addEventListener('pause', toggleMusicState);
  audio.addEventListener('ended', playNext);
  audio.volume = 0.4;

  return {
    audio,
    start () {
      play(this.record.currentTrack);
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
    }
  };

  function play (track) {
    audio.src = track;
    audio.play();
  }

  function playNext () {
    play(this.record.nextTrack());
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
