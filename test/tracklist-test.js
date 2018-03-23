"use strict";

const {test} = require("ava");
const Tracklist = require("../lib/tracklist");

test("tracklist filled with looped tracks to supplied duration", t => {
  const tracks = [
    {filepath: "a", duration: 10},
    {filepath: "b", duration: 20},
    {filepath: "c", duration: 30},
  ];

  const tracklist = Tracklist(tracks, 121);

  t.is(tracklist.length, 7);

  t.is(tracklist[0], "a");
  t.is(tracklist[1], "b");
  t.is(tracklist[2], "c");
  t.is(tracklist[3], "a");
  t.is(tracklist[4], "b");
  t.is(tracklist[5], "c");
  t.is(tracklist[6], "a");
});

test("inserts key tracks in desired places", t => {
  const tracks = [
    {filepath: "a", duration: 3 * 60},
    {filepath: "b", duration: 3 * 60},
    {filepath: "c", duration: 3 * 60},
  ];

  const keyTracks = [
    {filepath: "X", duration: 1 * 60, queue: 10 * 60},
    {filepath: "X", duration: 1 * 60, queue: 20 * 60},
    {filepath: "Y", duration: 1 * 60, queue: 30 * 60},
  ];

  const tracklist = Tracklist(tracks, 30 * 60, keyTracks);

  t.is(tracklist.length, 13);

  t.is(tracklist[0], "a");
  t.is(tracklist[1], "b");
  t.is(tracklist[2], "c");
  t.is(tracklist[3], "a");
  t.is(tracklist[4], "X");
  t.is(tracklist[5], "b");
  t.is(tracklist[6], "c");
  t.is(tracklist[7], "a");
  t.is(tracklist[8], "X");
  t.is(tracklist[9], "b");
  t.is(tracklist[10], "c");
  t.is(tracklist[11], "a");
  t.is(tracklist[12], "Y");
});
