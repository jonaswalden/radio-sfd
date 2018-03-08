"use strict";

const {test} = require("ava");
const Playlist = require("../lib/playlist");

test("playlist fills looped tracklist to supplied duration", t => {
  const tracks = [
    {title: "a", duration: 10},
    {title: "b", duration: 20},
    {title: "c", duration: 30},
  ];

  const playlist = Playlist(tracks, 121);

  t.is(playlist.length, 7);

  t.is(playlist[0], "a");
  t.is(playlist[1], "b");
  t.is(playlist[2], "c");
  t.is(playlist[3], "a");
  t.is(playlist[4], "b");
  t.is(playlist[5], "c");
  t.is(playlist[6], "a");
});

test("inserts key tracks in desired places", t => {
  const tracks = [
    {title: "a", duration: 3 * 60},
    {title: "b", duration: 3 * 60},
    {title: "c", duration: 3 * 60},
  ];

  const keyTracks = [
    {title: "X", duration: 1 * 60, queue: 10 * 60},
    {title: "X", duration: 1 * 60, queue: 20 * 60},
    {title: "Y", duration: 1 * 60, queue: 30 * 60},
  ];

  const playlist = Playlist(tracks, 30 * 60, keyTracks);

  t.is(playlist.length, 13);

  t.is(playlist[0], "a");
  t.is(playlist[1], "b");
  t.is(playlist[2], "c");
  t.is(playlist[3], "a");
  t.is(playlist[4], "X");
  t.is(playlist[5], "b");
  t.is(playlist[6], "c");
  t.is(playlist[7], "a");
  t.is(playlist[8], "X");
  t.is(playlist[9], "b");
  t.is(playlist[10], "c");
  t.is(playlist[11], "a");
  t.is(playlist[12], "Y");
});
