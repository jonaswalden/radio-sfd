import mc from './mc';
import MusicPlayer from './MusicPlayer';
import Playlist from './Playlist';
import getSchedule from './getSchedule';

const playlist = Playlist(window.tracks);
const musicPlayer = MusicPlayer(playlist);
musicPlayer.start();
playlist.initCache(musicPlayer.audio);

getSchedule(window.scheduleUrl).then(schedule => {
  mc(schedule, window.messages, musicPlayer);
})
