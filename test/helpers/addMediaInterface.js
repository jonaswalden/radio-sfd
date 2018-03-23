"use strict";

module.exports = function addMediaApi (element) {
  element.src = "";
  element.addEventListener("playing", () => element._playing = true);
  element.addEventListener("ended", () => element._playing = false);
  element.play = () => element.dispatchEvent("playing");
};
