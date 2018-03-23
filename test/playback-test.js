"use strict";

const {test} = require("ava");
const addMediaInterface = require("./helpers/addMediaInterface");
const addTimeout = require("./helpers/addTimeout");
const ck = require("chronokinesis");
const navigateTo = require("./helpers/navigateTo");

let browser, audio;
test.serial("loads document", async t => {
  browser = await navigateTo("./index.html");
  audio = browser.document.getElementById("audio-player");
  t.truthy(audio);

  addTimeout(browser.window);
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

test.serial("the second key track is queued" , t => {
  t.is(browser.window._timeouts.length, 1);

  const [playKeyTrack, timeout] = browser.window._timeouts.pop();
  t.is(timeout, 60 * 60 * 1000);
});

test.after(t => ck.reset());
