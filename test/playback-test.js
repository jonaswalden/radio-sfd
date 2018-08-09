'use strict';

const {Storage} = require('@expressen/tallahassee/lib');
const {test} = require('ava');
const addMediaInterface = require('./helpers/addMediaInterface');
const addTimeout = require('./helpers/addTimeout');
const ck = require('chronokinesis');
const navigate = require('./helpers/navigate');
const nock = require('nock');

test.after(() => {
  delete global.window;
  ck.reset();
});

let browser, music, alert, timeouts;
test.serial('loads document', async t => {
  browser = await navigate.toFile('./index.html');

  music = browser.document.getElementById('music-player');
  t.truthy(music, 'no music audio');
  addMediaInterface(music);

  alert = browser.document.getElementById('alert-player');
  t.truthy(alert, 'no alert audio');
  addMediaInterface(alert);

  addTimeout(browser.window, timeouts = []);
  browser.window.localStorage = new Storage();
});

test.serial('tracks are available', t => {
  t.plan(0);
  browser.window.tracks = [
    '/local/track-a.mp3',
    '/local/track-b.mp3',
  ];
});

test.serial('schedule is fetchable', t => {
  t.plan(0);
  const scheduleCSV = '' +
    'queue,message\n' +
    '10:00,msg-a\n' +
    '10:30,msg-b\n' +
    '11:00,msg-c';

  browser.window.scheduleUrl = 'https://cdn.radio-sfd/schedule.csv';
  nock('https://cdn.radio-sfd')
    .get('/schedule.csv')
    .reply(200, scheduleCSV);
});

test.serial('messages are fetchable', t => {
  t.plan(0);
  const messagesCSV = '' +
    'id,audio,text\n' +
    'msg-a,http://cdn.radio-sfd/msg-a-audio.mp3,First message A\n' +
    'msg-b,http://cdn.radio-sfd/msg-b-audio.mp3,Then message B\n' +
    'msg-c,http://cdn.radio-sfd/msg-c-audio.mp3,Finally message C';

  browser.window.messagesUrl = 'https://cdn.radio-sfd/messages.csv';
  nock('https://cdn.radio-sfd')
    .get('/messages.csv')
    .reply(200, messagesCSV);
});

test.serial('scripts are loaded at 09:00', t => {
  t.plan(0);

  ck.freeze('2012-04-02 09:00');
  global.window = browser.window;
  require('../scripts/main');
});

test.serial('playback has started', t => {
  t.is(music.src, '/local/track-a.mp3', 'unexpected music src');
  t.is(music._playing, true, 'music not playing');
});

test.serial.skip('tracks are played in a loop', t => {
  music.dispatchEvent('ended');

  t.is(music.src, '/local/track-b.mp3', 'unexpected music src');
  t.is(music._playing, true, 'music not playing');

  music.dispatchEvent('ended');

  t.is(music.src, '/local/track-c.mp3', 'unexpected music src');
  t.is(music._playing, true, 'music not playing');

  music.dispatchEvent('ended');

  t.is(music.src, '/local/track-a.mp3', 'unexpected music src');
  t.is(music._playing, true, 'music not playing');
});

test.serial.skip('the key track 2 is queued in 60 minutes' , t => {
  t.is(timeouts.length, 1, 'unexpected amount of timeouts');

  const [, timeout] = timeouts[0];
  t.is(timeout, 60 * 60 * 1000, 'unexpected timeout');
});

test.serial.skip('track 1 is still playing', t => {
  t.is(music.src, '/local/track-a.mp3', 'unexpected music src');
  t.is(music._playing, true, 'music not playing');
});

test.serial.skip('key track 2 is a go', t => {
  const [playNextTrack] = timeouts[0];
  playNextTrack();

  t.is(music._playing, false, 'music still playing');

  t.is(alert.src, 'Y', 'unexpected alert.src');
  t.is(alert._playing, true, 'alert not playing');
});

test.serial.skip('afterwards playback continues with track 1', t => {
  alert.dispatchEvent('ended');

  t.is(music.src, '/local/track-a.mp3');
  t.is(music._playing, true, 'music not playing');

  t.is(alert._playing, false, 'alert still playing');
});
