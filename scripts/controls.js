export default function controls (musicPlayer, mc) {
  const [container] = document.getElementsByClassName('controls');
  const [pauseMusicButton, playMusicButton, repeatAlertButton] = container.children;

  pauseMusicButton.addEventListener('click', musicPlayer.pause);
  playMusicButton.addEventListener('click', musicPlayer.resume);
  repeatAlertButton.addEventListener('click', mc.repeatLast);

  window.addEventListener('keyup', KeyboardListener({
    ' ': musicPlayer.pauseResume,
    'Backspace': mc.repeatLast,
  }));

  function KeyboardListener (map) {
    return function keyboardListener (event) {
      const callback = map[event.key];
      if (!callback) return;

      callback(event);
    }
  }
}
