import controls from './controls.js';
import fetchMessages from './fetchMessages.js';
import fetchSchedule from './fetchSchedule.js';
import MC from './MC.js';
import MusicPlayer from './MusicPlayer.js';
import Playlist from './Playlist.js';

(async config => {
  ['tracks', 'scheduleUrl', 'today', 'tonight', 'messagesUrl']
    .forEach(key => {
      if (key in config) return;
      throw `requiring config "${key}"`;
    });

  const playlist = Playlist(config.tracks);
  const musicPlayer = MusicPlayer(playlist);
  musicPlayer.start();

  const [schedule, messages] = await Promise.all([
    fetchSchedule(config.scheduleUrl, config.today, config.tonight),
    fetchMessages(config.messagesUrl),
  ]);

  const mc = MC(schedule, messages, musicPlayer);
  mc.start();
  controls(musicPlayer, mc);
})(window.config || {});
