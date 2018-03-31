"use strict";

init(window.tracks, window.messages);

if (typeof module !== "undefined") {
  module.exports = {
    Playlist,
    MusicPlayer,
    schedule,
    setAudioSource
  };
}

function init (tracks, messages) {
  if (!tracks || !messages) return;

  const playlist = Playlist(tracks);
  const musicPlayer = MusicPlayer(playlist);
  schedule(messages, musicPlayer);
  musicPlayer.start();
}

function Playlist (tracks) {
  const amountTracks = tracks.length;
  let t = amountTracks;

  return {
    next
  };

  function  next () {
    const track = tracks[t++ % amountTracks];
    return track;
  }
}

function MusicPlayer (playlist) {
  const audio = document.getElementById("music-player");
  const [pauseButton] = document.getElementsByClassName("music-player__pause-button");
  const [playButton] = document.getElementsByClassName("music-player__play-button");
  let playing = false;
  let disabled = false;
  let wasPlayingWhenPaused = false;

  window.addEventListener("keyup", keyboardPlayPause);
  pauseButton.addEventListener("click", playPause);
  playButton.addEventListener("click", playPause);
  audio.addEventListener("play", toggleMusicState);
  audio.addEventListener("pause", toggleMusicState);

  return {
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
    if (![" "].includes(event.key)) return;
    playPause();
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

async function schedule ({itemsCsvUrl, vignetteAudio}, musicPlayer) {
  const audio = document.getElementById("alert-player__audio");
  const [text] = document.getElementsByClassName("alert-player__text");
  const [repeatButton] = document.getElementsByClassName("alert-player__repeat-button");
  if (!audio || !text) return;

  const date = new Date();
  const thisMonth = [date.getFullYear(), date.getMonth()];
  const today = [...thisMonth, date.getDate()];
  const tomorrow = [...thisMonth, today[2] + 1];
  const messages = await getMessages();
  console.log(messages);
  let [passedMessages, upcomingMessages] = sortMessages();

  queueNext();

  if (repeatButton) {
    repeatButton.addEventListener("click", repeatLast);
  }

  function getMessages () {
    return fetch(itemsCsvUrl)
      .then(data => data.text())
      .then(CSVToArray)
      .then(toItemList);

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
      play(upcoming);
      passedMessages.push(upcomingMessages.shift());
    }
  }

  function repeatLast () {
    const last = passedMessages[passedMessages.length - 1];
    if (!last) return;

    play(last);
  }

  async function play (message) {
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
      setAudioSource(audio, message.audio);
      audio.play();
      text.innerHTML = `<time>${message.queue}</time> ${message.text}`;

      return new Promise(resolve => {
        audio.addEventListener("ended", resolve, {once: true});
      });
    }
  }

  function sortMessages () {
    const now = Date.now();

    return messages
      .map(addTimeSize)
      .sort(byTimeSize)
      .reduce(passedAndUpcoming, [[], []]);

    function addTimeSize (msg) {
      msg.timeSize = timeSize(msg.queue);
      return msg;
    }

    function byTimeSize (a, b) {
      return a.timeSize > b.timeSize;
    }

    function passedAndUpcoming (stacks, msg) {
      const stack = now > msg.timeSize ? stacks[0] : stacks[1];
      stack.push(msg);
      return stacks;
    }

    function timeSize (timeString) {
      const moment = timeString.split(":");
      return new Date(...today, ...moment).getTime();
    }
  }

  function getUpcoming () {
     if (!upcomingMessages.length) {
       upcomingMessages = passedMessages;
       passedMessages = [];
     }

     return upcomingMessages[0];
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
