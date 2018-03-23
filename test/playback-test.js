"use strict";

const {test} = require("ava");
const addMediaInterface = require("./helpers/addMediaInterface");
const addTimeout = require("./helpers/addTimeout");
const ck = require("chronokinesis");
const navigateTo = require("./helpers/navigateTo");

test.after(() => {
  delete global.window;
  ck.reset();
});

let browser, audio, timeouts;
test.serial("loads document", async t => {
  browser = await navigateTo("./index.html");
  audio = browser.document.getElementById("audio-player");
  t.truthy(audio);

  addTimeout(browser.window, timeouts = []);
  addMediaInterface(audio);
});

test.serial("tracks are available", t => {
  t.plan(0);
  browser.window.tracks = ["a", "b", "c"];
});

test.serial("keytracks are available", t => {
  t.plan(0);
  browser.window.keyTracks = [
    ["X", "08:00"],
    ["Y", "10:00"],
    ["Z", "12:00"]
  ];
});

test.serial("scripts are loaded at 09:00", t => {
  t.plan(0);

  ck.freeze("2012-04-02 09:00");
  global.window = browser.window;
  require("../scripts/main");
});

test.serial("tracks are played in a loop", t => {
  t.is(audio.src, "a");
  t.is(audio._playing, true);

  audio.dispatchEvent("ended");

  t.is(audio.src, "b");
  t.is(audio._playing, true);

  audio.dispatchEvent("ended");

  t.is(audio.src, "c");
  t.is(audio._playing, true);

  audio.dispatchEvent("ended");

  t.is(audio.src, "a");
  t.is(audio._playing, true);
});

test.serial("the key track 2 is queued in 60 minutes" , t => {
  t.is(timeouts.length, 1);

  const [, timeout] = timeouts[0];
  t.is(timeout, 60 * 60 * 1000);
});

test.serial("track 1 is playing at 20s on 70% volume", t => {
  t.is(audio.src, "a");
  t.is(audio._playing, true);
  audio.volume = 0.7;
  audio.currentSrc = audio.src;
  audio.currentTime = 20;
});

test.serial("key track 2 is a go and plays at 100% volume", t => {
  const [playNextTrack] = timeouts[0];
  playNextTrack();

  t.is(audio.src, "Y");
  t.is(audio._playing, true);
  t.is(audio.volume, 1);
});

test.serial("afterwards playback continues with track 1 at 20 s on 70% volume", t => {
  audio.dispatchEvent("ended");

  t.is(audio.src, "a");
  t.is(audio._playing, true);
  t.is(audio.volume, 0.7);
  t.is(audio.currentTime, 20);
});
