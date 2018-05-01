'use strict';

const {test} = require('ava');
const addMediaInterface = require('./helpers/addMediaInterface');
const addTimeout = require('./helpers/addTimeout');
const ck = require('chronokinesis');
const navigateTo = require('./helpers/navigateTo');

test.after(() => {
  delete global.window;
  ck.reset();
});

let browser, music, alert, timeouts;
test.serial('loads document', async t => {
  browser = await navigateTo('./index.html');
  music = browser.document.getElementById('music-player');
  t.truthy(music, 'no music audio');
  addMediaInterface(music);
  alert = browser.document.getElementById('alert-player');
  t.truthy(alert, 'no alert audio');
  addMediaInterface(alert);

  addTimeout(browser.window, timeouts = []);
});

test.serial('tracks are available', t => {
  t.plan(0);
  browser.window.tracks = ['a', 'b', 'c'];
});

test.serial('keytracks are available', t => {
  t.plan(0);
  browser.window.keyTracks = [
    ['X', '08:00'],
    ['Y', '10:00'],
    ['Z', '12:00']
  ];
});

test.serial('scripts are loaded at 09:00', t => {
  t.plan(0);

  ck.freeze('2012-04-02 09:00');
  global.window = browser.window;
  require('../scripts/main');
});

test.serial('playback has started', t => {
  t.is(music.src, 'a', 'unexpected music src');
  t.is(music._playing, true, 'music not playing');
});

test.serial('tracks are played in a loop', t => {
  music.dispatchEvent('ended');

  t.is(music.src, 'b', 'unexpected music src');
  t.is(music._playing, true, 'music not playing');

  music.dispatchEvent('ended');

  t.is(music.src, 'c', 'unexpected music src');
  t.is(music._playing, true, 'music not playing');

  music.dispatchEvent('ended');

  t.is(music.src, 'a', 'unexpected music src');
  t.is(music._playing, true, 'music not playing');
});

test.serial('the key track 2 is queued in 60 minutes' , t => {
  t.is(timeouts.length, 1, 'unexpected amount of timeouts');

  const [, timeout] = timeouts[0];
  t.is(timeout, 60 * 60 * 1000, 'unexpected timeout');
});

test.serial('track 1 is still playing', t => {
  t.is(music.src, 'a', 'unexpected music src');
  t.is(music._playing, true, 'music not playing');
});

test.serial('key track 2 is a go', t => {
  const [playNextTrack] = timeouts[0];
  playNextTrack();

  t.is(music._playing, false, 'music still playing');

  t.is(alert.src, 'Y', 'unexpected alert.src');
  t.is(alert._playing, true, 'alert not playing');
});

test.serial('afterwards playback continues with track 1', t => {
  alert.dispatchEvent('ended');

  t.is(music.src, 'a');
  t.is(music._playing, true, 'music not playing');

  t.is(alert._playing, false, 'alert still playing');
});
