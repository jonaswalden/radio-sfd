"use strict";

const {test} = require("ava");
const addMediaInterface = require("./helpers/addMediaInterface");
const navigateTo = require("./helpers/navigateTo");

let browser, audio;
test.serial("loads document", async t => {
  browser = await navigateTo("./index.html");
  audio = browser.document.getElementById("audio-player");
  t.truthy(audio);

  addMediaInterface(audio);
});

test.serial("tracks are available", t => {
  t.plan(0);
  browser.window.tracks = ["a", "b", "c"];
});

test.serial("scripts are loaded", t => {
  t.plan(0);
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
