"use strict";

const Tracklist = require("./tracklist");

module.exports = function Playlist (...args) {
  const tracklist = Tracklist(...args);
  return tracklist.join("\n");
};
