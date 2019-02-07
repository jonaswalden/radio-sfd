"use strict";

import assert from "assert";
import addMediaInterface from "./helpers/addMediaInterface";
import addTimeoutInterface from "./helpers/addTimeoutInterface";
import ck from "chronokinesis";
import MC from "../scripts/MC";
import navigate from "./helpers/navigate";

describe('MC', () => {
  const Browser = navigate.toDomString.bind(null, `
    <html>
      <audio id="alert-player"></audio>
      <blockquote class="alert-player__text"></blockquote>
    </html>
  `);

  after(() => {
    ck.reset();
    delete global.window;
    delete global.document;
  });

  describe(".start()", () => {
    describe("queues upcoming event", () => {
      const today = "2012-04-02";
      const now = new Date(`${today} 10:00`);
      const messages = {
        "no": {text: "nope", audio: "audio/nope.mp3"},
        "a": {text: "Message a", audio: "audio/message-a.mp3"},
      };
      const schedule = {
        passed: [],
        upcoming: [
          {queue: now, message: "a"},
        ]
      };

      before(() => ck.freeze(now));

      let browser, timeouts, alertAudio, alertText;
      when('page loads', async () => {
        browser = await Browser();
        timeouts = addTimeoutInterface(browser.window);

        alertAudio = browser.document.getElementById("alert-player");
        assert(alertAudio);
        addMediaInterface(alertAudio);

        [alertText] = browser.document.getElementsByClassName("alert-player__text");
        assert(alertText);
      });

      let musicPlayer;
      and('starts', () => {    
        MC(schedule, messages, musicPlayer = MockMusicPlayer()).start();
      });

      then('step 1', () => {
        assert.equal(musicPlayer._playing, true);
        assert.equal(browser.document.documentElement.classList.contains("state-alert"), false);
        assertTimeout(timeouts, 0);
      });

      and('step 2..4?', async () => {
        assert.equal(alertAudio.src, "audio/messages/vignette.ogg");
        assert.equal(alertText.textContent, "...");
        assert.equal(browser.document.documentElement.classList.contains("state-alert"), true);
        assert.equal(musicPlayer._playing, false);

        alertAudio._emitter.emit("ended");
        await awaitAsync();

        assert.equal(alertAudio.src, "audio/message-a.mp3");
        assert.equal(alertText.textContent, "Message a");
        assert.equal(browser.document.documentElement.classList.contains("state-alert"), true);
        assert.equal(musicPlayer._playing, false);

        alertAudio._emitter.emit("ended");
        await awaitAsync();

        assertTimeout(timeouts, 500);
        await awaitAsync();

        assert.equal(browser.document.documentElement.classList.contains("state-alert"), false);
      });
    });
  });

  //
  // test("queues next key track", () => {
  //   let currentTrack;
  //   const keyTracks = [
  //     ["10:00", "a"],
  //     ["11:00", "b"],
  //     ["11:30", "c"],
  //   ];
  //   ck.freeze(`${today} 08:00`);
  //   mc(keyTracks, track => currentTrack = track);
  //
  //   ck.freeze(`${today} 10:10`);
  //   assertTimeout(120 * minute);
  //   assert.equal(currentTrack, "a");
  //
  //   ck.freeze(`${today} 11:10`);
  //   assertTimeout(50 * minute);
  //   assert.equal(currentTrack, "b");
  //
  //   ck.freeze(`${today} 11:31`);
  //   assertTimeout(20 * minute);
  //   assert.equal(currentTrack, "c");
  //
  //   assert.equal(timeouts.length, 0);
  // });
  //
  // test("schedule can seep in to tomorrow", () => {
  //   let currentTrack;
  //   const keyTracks = [
  //     ["a", "22:00"],
  //     ["b", "01:00"],
  //   ];
  //   ck.freeze(`${today} 22:00`);
  //   mc(keyTracks, track => currentTrack = track);
  //
  //   ck.freeze(`${today} 22:10`);
  //   assertTimeout(0);
  //   assert.equal(currentTrack, "a");
  //
  //   assertTimeout(170 * minute);
  //   assert.equal(currentTrack, "b");
  // });
});

function assertTimeout (timeouts, expectedDelay) {
  assert.equal(timeouts.length, 1, 'unexpected amount of timeouts');
  const [fn, delay] = timeouts.pop();

  assert.equal(expectedDelay, delay, 'unexpected delay');
  fn();
}

function awaitAsync () {
  return new Promise(r => setTimeout(r));
}

function MockMusicPlayer () {
  return {
    _playing: true,
    pause() {
      this._playing = false;
    },
    resume() {
      this._playing = true;
    },
  };
}
