import fetchMessages from './fetchMessages.js';
import fetchSchedule from './fetchSchedule.js';
import mc from './mc.js';
import MusicPlayer from './MusicPlayer.js';
import Playlist from './Playlist.js';

const playlist = Playlist(window.tracks);
const musicPlayer = MusicPlayer(playlist);
musicPlayer.start();

Promise.all([
  fetchSchedule(window.scheduleUrl),
  fetchMessages(window.messagesUrl),
])
  .then(([schedule, messages]) => {
    mc(schedule, messages, musicPlayer);
  });
