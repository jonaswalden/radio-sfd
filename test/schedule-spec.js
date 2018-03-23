"use strict";

const {schedule} = require("../scripts/main");
const {test} = require("ava");
const addTimeout = require("./helpers/addTimeout");
const ck = require("chronokinesis");

let today, timeouts, minute = 60 * 1000;
test.beforeEach(() => {
  const window = global.window = {};
  addTimeout(window, timeouts = []);
  today = "2012-04-02";
});

test.afterEach(() => {
  ck.reset();
  delete global.window;
});

test("skips passed key tracks", t => {
  let currentTrack;
  const keyTracks = [
    ["no", "07:00"],
    ["no", "08:00"],
    ["no", "09:00"],
    ["a", "10:00"],
  ];
  ck.freeze(`${today} 10:00`);
  schedule(keyTracks, track => currentTrack = track);

  assertTimeout(t, 0);
  t.is(currentTrack, "a");
});

test("queues next key track", t => {
  let currentTrack;
  const keyTracks = [
    ["a", "10:00"],
    ["b", "11:00"],
    ["c", "11:30"],
  ];
  ck.freeze(`${today} 08:00`);
  schedule(keyTracks, track => currentTrack = track);

  ck.freeze(`${today} 10:10`);
  assertTimeout(t, 120 * minute);
  t.is(currentTrack, "a");

  ck.freeze(`${today} 11:10`);
  assertTimeout(t, 50 * minute);
  t.is(currentTrack, "b");

  ck.freeze(`${today} 11:31`);
  assertTimeout(t, 20 * minute);
  t.is(currentTrack, "c");

  t.is(timeouts.length, 0);
});

test("schedule can seep in to tomorrow", t => {
  let currentTrack;
  const keyTracks = [
    ["a", "22:00"],
    ["b", "01:00"],
  ];
  ck.freeze(`${today} 22:00`);
  schedule(keyTracks, track => currentTrack = track);

  ck.freeze(`${today} 22:10`);
  assertTimeout(t, 0);
  t.is(currentTrack, "a");

  assertTimeout(t, 170 * minute);
  t.is(currentTrack, "b");
});

function assertTimeout (t, expectedTimeout) {
  t.is(timeouts.length, 1);
  const [fn, timeout] = timeouts.pop();

  t.is(expectedTimeout, timeout);
  fn();
}
