"use strict";

module.exports = function addMediaApi (element) {
  element.src = "";
  element._playing = false;
  element.addEventListener("play", () => element._playing = true);
  element.addEventListener("ended", () => element._playing = false);
  element.addEventListener("pause", () => element._playing = false);
  element.play = () => element.dispatchEvent("play");
  element.pause = () => element.dispatchEvent("pause");
};
