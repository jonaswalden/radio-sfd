"use strict";

import assert from "assert";
import addMediaInterface from "./helpers/addMediaInterface";
import addTimeoutInterface from "./helpers/addTimeoutInterface";
import ck from "chronokinesis";
import MC from "../scripts/MC";
import navigate from "./helpers/navigate";

describe('MC', () => {
  const today = "2012-04-02";
  const now = new Date(`${today} 10:00`);
  const recently = new Date(`${today} 09:50`);
  const soon = new Date(`${today} 10:10`);
  const messages = {
    "no": {text: "nope", audio: "audio/nope.mp3"},
    "a": {text: "Message a", audio: "audio/message-a.mp3"},
    "b": {text: "Message b", audio: "audio/message-b.mp3"},
    "c": {text: "Message c", audio: "audio/message-c.mp3"},
  };

  const Browser = navigate.toDomString.bind(null, `
    <html>
      <audio id="alert-player"></audio>
      <blockquote class="alert-player__text"></blockquote>
    </html>
  `);

  before(() => ck.freeze(now));

  after(() => {
    ck.reset();
    delete global.window;
    delete global.document;
  });

  describe(".start()", () => {
    describe("queues upcoming event", () => {
      let browser, timeouts, alertAudio, alertText;
      before('page loads', async () => {
        browser = await Browser();
        timeouts = addTimeoutInterface(browser.window);

        alertAudio = browser.document.getElementById("alert-player");
        assert(alertAudio);
        addMediaInterface(alertAudio);

        [alertText] = browser.document.getElementsByClassName("alert-player__text");
        assert(alertText);
      });

      let musicPlayer;
      when('starts', () => {
        const schedule = {
          passed: [],
          upcoming: [
            {queue: soon, message: "a"},
          ]
        };
        MC(schedule, messages, musicPlayer = MockMusicPlayer()).start();
      });

      then('upcoming message is queued', () => {
        assertTimeout(timeouts, 10 * 60 * 1000);
      });
    });

    describe("plays upcoming event", () => {
      let browser, timeouts, alertAudio, alertText;
      before('page loads', async () => {
        browser = await Browser();
        timeouts = addTimeoutInterface(browser.window);

        alertAudio = browser.document.getElementById("alert-player");
        assert(alertAudio);
        addMediaInterface(alertAudio);

        [alertText] = browser.document.getElementsByClassName("alert-player__text");
        assert(alertText);
      });

      let musicPlayer;
      before('starts', () => {
        const schedule = {
          passed: [],
          upcoming: [
            {queue: now, message: "a"},
          ]
        };
        MC(schedule, messages, musicPlayer = MockMusicPlayer()).start();
      });

      let pendingMessage;
      before('message A is queued', () => {
        assert.equal(musicPlayer._playing, true);
        assert.equal(browser.document.documentElement.classList.contains("state-alert"), false);
        pendingMessage = assertTimeout(timeouts, 0);
      });

      when('message A plays', () => {
        pendingMessage();
      });

      then('it is introduced with a vignette', async () => {
        assert.equal(alertAudio.src, "audio/messages/vignette.ogg");
        assert.equal(alertText.textContent, "...");
        assert.equal(browser.document.documentElement.classList.contains("state-alert"), true);
        assert.equal(musicPlayer._playing, false);

        alertAudio._emitter.emit("ended");
        await awaitAsync();
      });

      and('message is played', async () => {
        assert.equal(alertAudio.src, "audio/message-a.mp3");
        assert.equal(alertText.textContent, "Message a");
        assert.equal(browser.document.documentElement.classList.contains("state-alert"), true);
        assert.equal(musicPlayer._playing, false);

        alertAudio._emitter.emit("ended");
        await awaitAsync();
      });

      and('followed by a breif pause', async () => {
        assertTimeout(timeouts, 500)();
        await awaitAsync();

        assert.equal(browser.document.documentElement.classList.contains("state-alert"), false);
      });
    });

    describe('allows repeat of passed events', () => {
      let browser;
      before('page loads', async () => {
        browser = await Browser();
        addTimeoutInterface(browser.window);
      });

      it('sets repeatable state when passed events', () => {
        const schedule = {
          passed:  [
            {queue: now, message: "a"},
          ],
          upcoming: []
        };
        MC(schedule, messages, MockMusicPlayer()).start();
        assert.equal(browser.document.documentElement.classList.contains("state-alert-repeatable"), true);
      });

      it('doesn\'t set repeatable state when no passed events', () => {
        const schedule = {
          passed: [],
          upcoming: []
        };
        MC(schedule, messages, MockMusicPlayer()).start();
        assert.equal(browser.document.documentElement.classList.contains("state-alert-repeatable"), false);
      });
    });
  });

  describe('.repeatLast()', () => {
    describe("replay passed event", () => {
      let browser, timeouts, alertAudio, alertText;
      before('page loads', async () => {
        browser = await Browser();
        timeouts = addTimeoutInterface(browser.window);

        alertAudio = browser.document.getElementById("alert-player");
        assert(alertAudio);
        addMediaInterface(alertAudio);

        [alertText] = browser.document.getElementsByClassName("alert-player__text");
        assert(alertText);
      });

      let mc, musicPlayer;
      before('starts', () => {
        const schedule = {
          passed: [
            {queue: recently, message: "a"}
          ],
          upcoming: [
            {queue: soon, message: "b"},
          ]
        };
        mc = MC(schedule, messages, musicPlayer = MockMusicPlayer());
        mc.start();
      });

      let pendingMessage;
      when('repeatLast is called', () => {
        mc.repeatLast();
      });

      then('last passed message A is played', async () => { 
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

        assertTimeout(timeouts, 500, 2, 1)();
        await awaitAsync();

        assert.equal(browser.document.documentElement.classList.contains("state-alert"), false);
      });

      and('upcoming message remains queued', () => {
        assertTimeout(timeouts, 10 * 60 * 1000)();
      });
    });
  });
});

function assertTimeout (timeouts, expectedDelay, expectedCount = 1, index = 0) {
  assert.equal(timeouts.length, expectedCount);
  const [[fn, delay]] = timeouts.splice(index, index + 1);

  assert.equal(expectedDelay, delay);
  return fn;
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
