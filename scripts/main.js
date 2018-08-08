import mc from "./mc.js";
import MusicPlayer from "./MusicPlayer.js";
import Playlist from "./Playlist.js";
import getSchedule from "./getSchedule.js";

const playlist = Playlist(window.tracks);
const musicPlayer = MusicPlayer(playlist);
musicPlayer.start();
playlist.initCache(musicPlayer.audio);

getSchedule(window.scheduleUrl).then(schedule => {
  mc(schedule, window.messages, musicPlayer);
})
