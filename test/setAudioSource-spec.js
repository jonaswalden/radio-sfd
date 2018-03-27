"use strict";

const {setAudioSource} = require("../scripts/main");
const {test} = require("ava");
const addMediaInterface = require("./helpers/addMediaInterface");
const MockEvent = require("./helpers/MockEvent");
const Tallahassee = require("@expressen/tallahassee");

let audio, Event;
test.beforeEach(t => {
  const browser = Tallahassee({}).load({
    text: `
      <html>
        <audio></audio>
      </html>
    `
  });

  Event = browser.window.Event = MockEvent;
  [audio] = browser.document.getElementsByTagName("audio");
  t.truthy(audio);

  addMediaInterface(audio);
  t.is(audio.src, "");
});

test("sets supplied audio source on supplied audio", t => {
  setAudioSource(audio, "/path/to/audio.mp3#t=10");
  t.is(decodeURIComponent(audio.src), "/path/to/audio.mp3#t=10", "unexpected audio source");
});

test("ends audio playback on pause if it matches media range stop", t => {
  let stopCount = 0;
  audio.addEventListener("ended", () => ++stopCount);

  setAudioSource(audio, "/path/to/audio.mp3#t=10,65.2");
  t.is(decodeURIComponent(audio.src), "/path/to/audio.mp3#t=10,65.2", "unexpected audio source");

  audio.currentTime = 10;
  audio.dispatchEvent(new Event("pause"));
  t.is(stopCount, 0, "unexpected stopCount");

  audio.currentTime = 65.2;
  audio.dispatchEvent(new Event("pause"));
  t.is(stopCount, 1, "unexpected stopCount");

  audio.dispatchEvent(new Event("pause"));
  t.is(stopCount, 1, "unexpected stopCount");
});
