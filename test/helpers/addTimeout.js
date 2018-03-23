"use strict";

module.exports = function addTimout (window) {
  window._timeouts = [];
  window.setTimeout = setMockTimeout;

  function setMockTimeout (...args) {
    window._timeouts.push(args);
  }
};
