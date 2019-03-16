'use strict';

const assert = require('assert');
const addMediaInterface = require('./helpers/addMediaInterface');
const addTimeoutInterface = require('./helpers/addTimeoutInterface');
const ck = require('chronokinesis');
const navigate = require('./helpers/navigate');
const nock = require('nock');
const {Storage} = require('@expressen/tallahassee/lib');

Feature('Playback', () => {
  Scenario('Generic playback', () => {
    after(() => {
      delete global.window;
      ck.reset();
    });

    const config = {};
    Given('tracks are available', () => {
      config.tracks = [
        '/local/track-a.mp3',
        '/local/track-b.mp3',
      ];
    });

    And('messages are available', () => {
      config.messagesUrl = 'https://cdn.radio-sfd/messages.csv';

      const messagesCSV = '' +
        'id,audio,text\n' +
        'msg-a,http://cdn.radio-sfd/msg-a-audio.mp3,First message A\n' +
        'msg-b,http://cdn.radio-sfd/msg-b-audio.mp3,Then message B\n' +
        'msg-c,http://cdn.radio-sfd/msg-c-audio.mp3,Finally message C';

      nock('https://cdn.radio-sfd')
        .get('/messages.csv')
        .reply(200, messagesCSV);
    });

    And('schedule is available', () => {
      config.scheduleUrl = 'https://cdn.radio-sfd/schedule.csv';

      const scheduleCSV = '' +
        'queue,message\n' +
        '10:00,msg-a\n' +
        '10:30,msg-b\n' +
        '11:00,msg-c';

      nock('https://cdn.radio-sfd')
        .get('/schedule.csv')
        .reply(200, scheduleCSV);
    });

    And('event is today', () => {
      config.today = new Date('2012-04-02 09:00');
      config.tonight = new Date('2012-04-03');
      ck.freeze(config.today);
    });

    let browser, music, alert, timeouts;
    When('page loads', async () => {
      browser = await navigate.toFile('./index.html');
      browser.window.config = config;

      music = browser.document.getElementById('music-player');
      assert(music, 'no music audio');
      addMediaInterface(music);

      alert = browser.document.getElementById('alert-player');
      assert(alert, 'no alert audio');
      addMediaInterface(alert);

      timeouts = addTimeoutInterface(browser.window);
      browser.window.localStorage = new Storage();
    });

    And('scripts load', () => {
      require('../scripts/main');
    });

    Then('playback has started', () => {
      assert.equal(music.src, '/local/track-a.mp3', 'unexpected music src');
      assert.equal(music._playing, true, 'music not playing');
    });

    And('tracks are played in a loop', () => {
      music.dispatchEvent(new browser.window.Event('ended'));

      assert.equal(music.src, '/local/track-b.mp3', 'unexpected music src');
      assert.equal(music._playing, true, 'music not playing');

      music.dispatchEvent(new browser.window.Event('ended'));

      assert.equal(music.src, '/local/track-a.mp3', 'unexpected music src');
      assert.equal(music._playing, true, 'music not playing');
    });

    When('schedule and messages loads', async () => {
      await Promise.all(browser.window.fetch._pendingRequests);
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    Then('message A is queued for 10:00' , () => {
      assert.equal(timeouts.length, 1, 'unexpected amount of timeouts');

      const [, delay] = timeouts[0];
      assert.equal(delay, 60 * 60 * 1000, 'unexpected delay');
    });

    And('track A is still playing', () => {
      assert.equal(music.src, '/local/track-a.mp3', 'unexpected music src');
      assert.equal(music._playing, true, 'music not playing');
    });

    When('the clock strikes 10:00', () => {
      ck.freeze('2012-04-02 10:00');
      const [playNextTrack] = timeouts.pop();
      playNextTrack();
    });

    Then('music is paused', () => {
      assert.equal(music._playing, false, 'music still playing');
    });

    let alertText;
    And('message A is introduced by a vignette and its timestamp', () => {
      assert.equal(alert.src, 'audio/messages/vignette.ogg', 'not vignette audio source');
      assert.equal(alert._playing, true, 'vignette not playing');

      [alertText] = browser.document.getElementsByClassName('alert-player__text');
      assert.equal(alertText.textContent, '10:00', 'unexpected alert text');
    });

    And('message A is played', async () => {
      alert.dispatchEvent(new browser.window.Event('ended'));
      await new Promise(resolve => setTimeout(resolve));

      assert.equal(music._playing, false, 'music still playing');

      assert.equal(alert.src, 'http://cdn.radio-sfd/msg-a-audio.mp3', 'not message audio source');
      assert.equal(alert._playing, true, 'message not playing');
      assert.equal(alertText.textContent, 'First message A', 'unexpected alert text');
    });

    And('then a small pause', async () => {
      alert.dispatchEvent(new browser.window.Event('ended'));
      await new Promise(resolve => setTimeout(resolve));

      assert.equal(timeouts.length, 1, 'unexpected amount of timeouts');
      const [postMessagePause] = timeouts.pop();
      postMessagePause();
    });

    Then('then music continues', async () => {
      assert.equal(music.src, '/local/track-a.mp3');
      assert.equal(music._playing, true, 'music not playing');

      assert.equal(alert._playing, false, 'alert still playing');
    });
  });
});
