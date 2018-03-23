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

let browser, audioPlayer;
test.serial("loads document", async t => {
  browser = await navigateTo("./index.html");
  audioPlayer = browser.document.getElementById("audio-player");
  t.truthy(audioPlayer);

  addMediaApi(audioPlayer);
});

test.serial("scripts are loaded", t => {
  t.plan(0);

  require("../scripts/main");
});

test.serial("tracks are loaded", async t => {
  await Promise.all(browser.window.fetch._pendingRequests);
  t.is(trackRequests.pendingMocks().length, 0);
});

test.serial("first track is playing", async t => {
  await new Promise(resolve => setTimeout(resolve, 10));
  console.log("reading", audioPlayer.src);
  t.is(audioPlayer._playing, true);
  t.is(audioPlayer.src, "a");
});

test.serial("first track ends", t => {
  t.plan(0);
  audioPlayer.dispatchEvent("ended");
});

test.serial("second track is playing", t => {
  t.is(audioPlayer.src, "b");
  t.is(audioPlayer._playing, true);
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
