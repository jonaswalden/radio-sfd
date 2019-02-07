'use strict';

module.exports = function addTimout (window) {
  const timeouts = [];
  window.setTimeout = setMockTimeout;
  return timeouts;

  function setMockTimeout (fn, delay) {
    timeouts.push([fn, delay]);
  }
};
