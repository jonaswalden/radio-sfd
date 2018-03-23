"use strict";

module.exports = function addTimout (window, timeouts) {
  window.setTimeout = setMockTimeout;

  function setMockTimeout (...args) {
    timeouts.push(args);
  }
};
