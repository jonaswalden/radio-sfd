'use strict';

import assert from 'assert';
import addMediaInterface from './helpers/addMediaInterface';
import ck from 'chronokinesis';
import MusicPlayer from '../scripts/MusicPlayer';
import navigate from './helpers/navigate';

describe('MusicPlayer', () => {
  const Browser = navigate.toDomString.bind(null, `
    <html>
      <audio id="music-player"></audio>
    </html>
  `);

  after(() => {
    ck.reset();
    delete global.window;
    delete global.document;
  });

  describe('Pausing playback', () => {
    scenario('User pause and resume', () => {
      let browser, audio;
      before('page loads', async () => {
        browser = await Browser();
        audio = browser.document.getElementById('music-player');
        assert(audio);
        addMediaInterface(audio);
      });

      let musicPlayer;
      before('player is started', () => {
        musicPlayer = MusicPlayer(MockPlaylist());
        musicPlayer.start();
      });

      given('music is playing', () => {
        assert.equal(true, audio._playing);
        assert.equal(true, browser.document.documentElement.classList.contains('state-music-playing'));
        assert.equal(false, browser.document.documentElement.classList.contains('state-music-paused'));
      });

      when('user hits pause', () => {
        musicPlayer.pause(new browser.window.Event('click'));
      });

      then('music is fully paused', () => {
        assert.equal(false, audio._playing);
        assert.equal(false, browser.document.documentElement.classList.contains('state-music-playing'));
        assert.equal(true, browser.document.documentElement.classList.contains('state-music-paused'));
      });

      when('user hits resume', () => {
        musicPlayer.resume(new browser.window.Event('click'));
      });

      then('music is playing', () => {
        assert.equal(true, audio._playing);
        assert.equal(true, browser.document.documentElement.classList.contains('state-music-playing'));
        assert.equal(false, browser.document.documentElement.classList.contains('state-music-paused'));
      });
    });    

    scenario('System pause and resume', () => {
      let browser, audio;
      before('page loads', async () => {
        browser = await Browser();
        audio = browser.document.getElementById('music-player');
        assert(audio);
        addMediaInterface(audio);
      });

      let musicPlayer;
      before('player is started', () => {
        musicPlayer = MusicPlayer(MockPlaylist());
        musicPlayer.start();
      });

      given('music is playing', () => {
        assert.equal(true, audio._playing);
        assert.equal(true, browser.document.documentElement.classList.contains('state-music-playing'));
        assert.equal(false, browser.document.documentElement.classList.contains('state-music-paused'));
      });

      when('system hits pause', () => {
        musicPlayer.pause();
      });

      then('music is half paused', () => {
        assert.equal(false, audio._playing);
        assert.equal(false, browser.document.documentElement.classList.contains('state-music-playing'));
        assert.equal(false, browser.document.documentElement.classList.contains('state-music-paused'));
      });

      when('system hits resume', () => {
        musicPlayer.resume();
      });

      then('music is playing', () => {
        assert.equal(true, audio._playing);
        assert.equal(true, browser.document.documentElement.classList.contains('state-music-playing'));
        assert.equal(false, browser.document.documentElement.classList.contains('state-music-paused'));
      });
    });

    scenario('System pause and resume while music was already paused', () => {
      let browser, audio;
      before('page loads', async () => {
        browser = await Browser();
        audio = browser.document.getElementById('music-player');
        assert(audio);
        addMediaInterface(audio);
      });

      let musicPlayer;
      before('player is started', () => {
        musicPlayer = MusicPlayer(MockPlaylist());
        musicPlayer.start();
      });

      given('music is paused by user', () => {
        musicPlayer.pause(new browser.window.Event('click'));
      });

      when('system hits pause', () => {
        musicPlayer.pause();
      });

      then('music is fully paused', () => {
        assert.equal(false, audio._playing);
        assert.equal(false, browser.document.documentElement.classList.contains('state-music-playing'));
        assert.equal(true, browser.document.documentElement.classList.contains('state-music-paused'));
      });

      when('system hits resume', () => {
        musicPlayer.resume();
      });

      then('music is fully paused', () => {
        assert.equal(false, audio._playing);
        assert.equal(false, browser.document.documentElement.classList.contains('state-music-playing'));
        assert.equal(true, browser.document.documentElement.classList.contains('state-music-paused'));
      });
    });

    scenario('User resume after non-effective system resume', () => {
      let browser, audio;
      before('page loads', async () => {
        browser = await Browser();
        audio = browser.document.getElementById('music-player');
        assert(audio);
        addMediaInterface(audio);
      });

      let musicPlayer;
      before('player is started', () => {
        musicPlayer = MusicPlayer(MockPlaylist());
        musicPlayer.start();
      });

      given('music is paused by user', () => {
        musicPlayer.pause(new browser.window.Event('click'));
      });

      and('system hits pause and resume', () => {
        musicPlayer.pause();
        musicPlayer.resume();
      });

      when('user hits resume', () => {
        musicPlayer.resume(new browser.window.Event('click'));
      });

      then('music is playing', () => {
        assert.equal(true, audio._playing);
        assert.equal(true, browser.document.documentElement.classList.contains('state-music-playing'));
        assert.equal(false, browser.document.documentElement.classList.contains('state-music-paused'));
      });
    });
  });
});

function MockPlaylist () {
  let trackNumber = 0;
  return {
    initCache () {},
    next () {
      return 'track-' + trackNumber;
    },
  };
}
