import controls from './controls.js';
import fetchMessages from './fetchMessages.js';
import fetchSchedule from './fetchSchedule.js';
import MC from './MC.js';
import MusicPlayer from './MusicPlayer.js';
import Playlist from './Playlist.js';

start();

async function start () {
  const playlist = Playlist(window.tracks);
  const musicPlayer = MusicPlayer(playlist);
  musicPlayer.start();

  const [schedule, messages] = await Promise.all([
    fetchSchedule(window.scheduleUrl),
    fetchMessages(window.messagesUrl),
  ]);

  const mc = MC(schedule, messages, musicPlayer);
  mc.start();
  controls(musicPlayer, mc);
}
