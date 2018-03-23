"use strict";

const {test} = require("ava");
const Playlist = require("../lib/playlist");

test("formats tracklist to a playlist", t => {
  const tracks = [
    {filepath: "/a.mp3", duration: 100},
    {filepath: "/b.mp3", duration: 100},
  ];

  const playlist = Playlist(tracks, 300);

  t.is(playlist, "/a.mp3\n/b.mp3\n/a.mp3");
});
