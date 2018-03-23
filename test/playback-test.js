"use strict";

const {test} = require("ava");
const navigateTo = require("./helpers/navigateTo");
const nock = require("nock");

let trackRequests;
test.before("tracks are available", t => {
  const tracks = [
    {src: "a", duration: 10},
    {src: "b", duration: 20},
    {src: "c", duration: 30},
  ];

  trackRequests = nock("http://radio-api.sfd")
    .get("/tracks.json")
    .reply(200, tracks);
});

let browser, audio;
test.serial("loads document", async t => {
  browser = await navigateTo("./index.html");
  audio = browser.document.getElementById("audio-player");
  t.truthy(audio);

  addMediaApi(audio);
});

test.serial("scripts are loaded", t => {
  t.plan(0);

  require("../scripts/main");
});

test.serial("tracks are loaded", async t => {
  t.true(!!browser.window._pending);
  await browser.window._pending;
  t.is(trackRequests.pendingMocks().length, 0);
});

test.serial("tracks are played in a loop", t => {
  console.log("reading", audio.src);
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

function addMediaApi (element) {
  element.src = "";
  element.addEventListener("playing", () => {
    console.log("trying to play");
    element._playing = true;
  });
  element.addEventListener("ended", () => {
    element._playing = false;
  });
  element.play = function playMedia () {
    element.dispatchEvent("playing");
  };
}
