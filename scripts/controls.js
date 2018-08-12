export default function controls (musicPlayer, mc) {
  const [container] = document.getElementsByClassName('controls');
  const [musicPauseButton, musicPlayButton, messageRepeatButton] = container.children;

  musicPauseButton.addEventListener('click', musicPlayer.playPause);
  musicPlayButton.addEventListener('click', musicPlayer.playPause);
  window.addEventListener('keyup', KeyboardListener(' ', musicPlayer.pauseResume));

  messageRepeatButton.addEventListener('click', mc.repeatLast);
  window.addEventListener('keyup', KeyboardListener('backspace', mc.repeatLast));

  function KeyboardListener (which, callback) {
    return function keyboardListener (event) {
      if (event.which !== which) return;
      callback();
    }
  }
}
