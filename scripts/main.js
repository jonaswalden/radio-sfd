"use strict";

init();

if (typeof module !== "undefined") {
  module.exports = {
    Playlist,
    MusicPlayer,
    mC,
    setAudioSource
  };
}

function init () {
  const playlist = Playlist(window.tracks);
  const musicPlayer = MusicPlayer(playlist);
  mC(window.scheduleUrl, window.messages, musicPlayer);
  musicPlayer.start();
  playlist.initCache(musicPlayer.audio);
}

function Playlist (tracks) {
  const amountTracks = tracks.length;
  let currentTrackIndex = amountTracks + 1;
  let cacheChecked = false;

  return {
    next,
    initCache
  };

  function  next () {
    if (!cacheChecked) {
      const cachedTrack = getFromCache();
      if (cachedTrack) return cachedTrack;
    }

    const track = tracks[++currentTrackIndex % amountTracks];
    return track;
  }

  function getFromCache () {
    cacheChecked = true;
    const cache = localStorage.getItem("playingTrack");
    localStorage.removeItem("playingTrack");
    if (!cache) return;

    const [trackIndexString, time] = cache.split("@");
    currentTrackIndex = Number(trackIndexString);
    const track = tracks[currentTrackIndex % amountTracks];

    if (!track.includes("#t=")) return track + "#t=" + time;

    let [path, anchor] = track.split("#t=");
    const [start, end] = anchor.split(",");
    return path + "#t=" + [time, end].filter(t => t).join(",")
  }

  function initCache (audio) {
    window.addEventListener("beforeunload", cachePlayingTrack);

    function cachePlayingTrack () {
      console.log("track was", tracks[currentTrackIndex % amountTracks], audio.currentTime)
      localStorage.setItem("playingTrack", currentTrackIndex + "@" + audio.currentTime);
    }
  }
}

function MusicPlayer (playlist) {
  const audio = document.getElementById("music-player");
  const [pauseButton] = document.getElementsByClassName("music-player__pause-button");
  const [playButton] = document.getElementsByClassName("music-player__play-button");
  let playing = false;
  let disabled = false;
  let wasPlayingWhenPaused = false;

  pauseButton.addEventListener("click", playPause);
  playButton.addEventListener("click", playPause);
  window.addEventListener("keyup", keyboardPlayPause);
  audio.addEventListener("play", toggleMusicState);
  audio.addEventListener("pause", toggleMusicState);

  return {
    audio,
    start () {
      playNext();
      audio.addEventListener("ended", playNext);
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

  function playNext () {
    setAudioSource(audio, playlist.next());
    audio.play();
  }

  function keyboardPlayPause (event) {
    if (event.key === " ") playPause();
  }

  function playPause () {
    if (disabled) return;

    document.documentElement.classList.toggle("state-music-paused", playing);
    if (playing) audio.pause();
    else audio.play();
  }

  function toggleMusicState (event) {
    playing = event.type === "play";
    document.documentElement.classList.toggle("state-music", playing);
  }
}

async function mC (scheduleUrl, messages, musicPlayer) {
  const audio = document.getElementById("alert-player__audio");
  const [text] = document.getElementsByClassName("alert-player__text");
  const [repeatButton] = document.getElementsByClassName("alert-player__repeat-button");
  const date = new Date();
  const thisMonth = [date.getFullYear(), date.getMonth()];
  const today = [...thisMonth, date.getDate()];
  const tomorrow = [...thisMonth, today[2] + 1];
  const schedule = await getSchedule();
  const vignetteAudio = "audio/messages/vignette.ogg";
  console.log(schedule);

  repeatButton.addEventListener("click", repeatLast);
  window.addEventListener("keyup", keyboardRepeatLast);

  queueNext();

  function getSchedule () {
    if (window.location.hash === "#dev") {
      return Promise.resolve(window.devSchedule)
        .then(sortSchedule);
    }

    return fetch(scheduleUrl, {mode: "cors"})
      .then(data => data.text())
      .then(CSVToArray)
      .then(toItemList)
      .then(removeEmpty)
      .then(sortSchedule)

    function toItemList (list) {
      const [keys, ...rows] = list;
      return rows.map(toObject);

      function toObject (vals) {
        return keys.reduce((obj, key, index) => {
          obj[key] = vals[index];
          return obj;
        }, {});
      }
    }

    function removeEmpty (objList) {
      return objList.filter(obj => {
        return !Object.values(obj).includes("");
      });
    }
  }

  function queueNext () {
    const upcoming = getUpcoming();
    const moment = upcoming.queue.split(":");
    const now = Date.now();
    let timeout = new Date(...today, ...moment).getTime() - now;

    if (timeout < 0) {
      timeout = new Date(...tomorrow, ...moment).getTime() - now;
    }

    window.setTimeout(playNext, timeout);

    function playNext () {
      play(upcoming.message);
      schedule.passed.push(schedule.upcoming.shift());
    }
  }

  function repeatLast () {
    const last = schedule.passed[schedule.passed.length - 1];
    if (!last) return;

    play(last.message);
  }

  function keyboardRepeatLast (event) {
    if (event.key === "backspace") repeatLast();
  }

  async function play (messageKey) {
    const messageAudio = `audio/messages/${messageKey}.mp3`;
    const messageText = messages[messageKey];
    text.textContent = "...";
    toggleAlertState(true);
    musicPlayer.pause();

    await playVignette();
    await playMessage();
    await new Promise(resolve => setTimeout(resolve, 500));

    toggleAlertState(false);
    musicPlayer.resume();
    queueNext();

    function playVignette () {
      setAudioSource(audio, vignetteAudio);
      audio.play();

      return new Promise(resolve => {
        audio.addEventListener("ended", resolve, {once: true});
      });
    }

    function playMessage () {
      setAudioSource(audio, messageAudio);
      audio.play();
      text.innerHTML = messageText;

      return new Promise(resolve => {
        audio.addEventListener("ended", resolve, {once: true});
      });
    }
  }

  function sortSchedule (events) {
    const now = Date.now();

    return events
      .map(addTimeSize)
      .sort(byTimeSize)
      .reduce(alignToTime, {passed: [], upcoming: []});

    function addTimeSize (msg) {
      msg.timeSize = timeSize(msg.queue);
      return msg;
    }

    function byTimeSize (a, b) {
      return a.timeSize > b.timeSize;
    }

    function alignToTime (stacks, msg) {
      const stack = now > msg.timeSize ? stacks.passed : stacks.upcoming;
      stack.push(msg);
      return stacks;
    }

    function timeSize (timeString) {
      const moment = timeString.split(":");
      return new Date(...today, ...moment).getTime();
    }
  }

  function getUpcoming () {
     if (!schedule.upcoming.length) {
       schedule.upcoming = schedule.passed;
       schedule.passed = [];
     }

     return schedule.upcoming[0];
  }

  function toggleAlertState (on) {
    document.documentElement.classList.toggle("state-alert", on);
  }
}

function setAudioSource (audio, src) {
  const [, search] = src.split("#");
  audio.src = src;

  if (!search) return;

  const [, playbackStop] = search.split(",");
  if (!playbackStop) return;

  endPlaybackAfter(playbackStop);

  function endPlaybackAfter (durationString) {
    const duration = Number(durationString);
    audio.addEventListener("pause", checkProgress);

    function checkProgress () {
      if (audio.currentTime < duration) return;

      audio.removeEventListener("pause", checkProgress);
      audio.dispatchEvent(new window.Event("ended"));
    }
  }
}

/**
 * CSVToArray parses any String of Data including '\r' '\n' characters,
 * and returns an array with the rows of data.
 * @param {String} CSV_string - the CSV string you need to parse
 * @param {String} delimiter - the delimeter used to separate fields of data
 * @returns {Array} rows - rows of CSV where first row are column headers
 */
function CSVToArray (CSV_string, delimiter) {
   delimiter = (delimiter || ","); // user-supplied delimeter or default comma

   var pattern = new RegExp( // regular expression to parse the CSV values.
     ( // Delimiters:
       "(\\" + delimiter + "|\\r?\\n|\\r|^)" +
       // Quoted fields.
       "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
       // Standard fields.
       "([^\"\\" + delimiter + "\\r\\n]*))"
     ), "gi"
   );

   var rows = [[]];  // array to hold our data. First row is column headers.
   // array to hold our individual pattern matching groups:
   var matches = false; // false if we don't find any matches
   // Loop until we no longer find a regular expression match
   while (matches = pattern.exec( CSV_string )) {
       var matched_delimiter = matches[1]; // Get the matched delimiter
       // Check if the delimiter has a length (and is not the start of string)
       // and if it matches field delimiter. If not, it is a row delimiter.
       if (matched_delimiter.length && matched_delimiter !== delimiter) {
         // Since this is a new row of data, add an empty row to the array.
         rows.push( [] );
       }
       var matched_value;
       // Once we have eliminated the delimiter, check to see
       // what kind of value was captured (quoted or unquoted):
       if (matches[2]) { // found quoted value. unescape any double quotes.
        matched_value = matches[2].replace(
          new RegExp( "\"\"", "g" ), "\""
        );
       } else { // found a non-quoted value
         matched_value = matches[3];
       }
       // Now that we have our value string, let's add
       // it to the data array.
       rows[rows.length - 1].push(matched_value);
   }
   return rows; // Return the parsed data Array
}
