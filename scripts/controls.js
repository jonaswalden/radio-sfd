export default function controls (musicPlayer, mc) {
  const [container] = document.getElementsByClassName('controls');
  const [pauseMusicButton, playMusicButton, repeatAlertButton] = container.children;

  pauseMusicButton.addEventListener('click', musicPlayer.playPause);
  playMusicButton.addEventListener('click', musicPlayer.playPause);
  window.addEventListener('keyup', KeyboardListener(' ', musicPlayer.pauseResume));

  repeatAlertButton.addEventListener('click', mc.repeatLast);
  window.addEventListener('keyup', KeyboardListener('backspace', mc.repeatLast));

  function KeyboardListener (which, callback) {
    return function keyboardListener (event) {
      if (event.which !== which) return;
      callback();
    }
  }
}
