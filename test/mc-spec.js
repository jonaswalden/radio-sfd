'use strict';

const {test} = require('ava');
const addMediaInterface = require('./helpers/addMediaInterface');
const addTimeout = require('./helpers/addTimeout');
const ck = require('chronokinesis');
const navigate = require('./helpers/navigate');

const today = '2012-04-02';
let browser, timeouts;
test.beforeEach(async () => {
	browser = await navigate.toDomString(`
    <html>
      <audio id="alert-player__audio"></audio>
      <blockquote class="alert-player__text"></blockquote>
      <button class="alert-player__repeat-button" type="button">
        Repeat
      </button>
    </html>
  `);
	addTimeout(browser.window, timeouts = []);
});

let alertAudio, alertText, alertRepeat;
test.beforeEach(t => {
	alertAudio = browser.document.getElementById('alert-player__audio');
	t.truthy(alertAudio);
	addMediaInterface(alertAudio);

	[alertText] = browser.document.getElementsByClassName('alert-player__text');
	t.truthy(alertText);

	[alertRepeat] = browser.document.getElementsByClassName('alert-player__repeat-button');
	t.truthy(alertRepeat);
});

let mc;
test.beforeEach(() => {
	mc = require('../scripts/mc').default;
});

let musicPlayer;
test.beforeEach(() => {
	musicPlayer = {
		_playing: true,
		pause() {
			this._playing = false;
		},
		resume() {
			this._playing = true;
		},
	};
});

test.afterEach(() => {
	ck.reset();
	delete global.window;
	delete global.document;
});

test('skips passed key tracks', async t => {
	ck.freeze(`${today} 10:00`);
	const messages = {
		'no': {text: 'nope', audio: 'audio/nope.mp3'},
		'a': {text: 'Message a', audio: 'audio/message-a.mp3'},
	};
	const schedule = {
		passed: [],
		upcoming: [
			{queue: '10:00', message: 'a'},
		]
	};

	mc(schedule, messages, musicPlayer);
	t.true(musicPlayer._playing);
	t.false(browser.document.documentElement.classList.contains('state-alert'));

	assertTimeout(t, 0);

	t.is(alertAudio.src, 'audio/messages/vignette.ogg');
	t.is(alertText.textContent, '...');
	t.true(browser.document.documentElement.classList.contains('state-alert'));
	t.false(musicPlayer._playing);

	alertAudio._emitter.emit('ended');
	await awaitAsync();

	t.is(alertAudio.src, 'audio/message-a.mp3');
	t.is(alertText.textContent, 'Message a');
	t.true(browser.document.documentElement.classList.contains('state-alert'));
	t.false(musicPlayer._playing);

	alertAudio._emitter.emit('ended');
	await awaitAsync();

	assertTimeout(t, 500);
	await awaitAsync();

	t.false(browser.document.documentElement.classList.contains('state-alert'));
});

//
// test("queues next key track", () => {
//   let currentTrack;
//   const keyTracks = [
//     ["10:00", "a"],
//     ["11:00", "b"],
//     ["11:30", "c"],
//   ];
//   ck.freeze(`${today} 08:00`);
//   mc(keyTracks, track => currentTrack = track);
//
//   ck.freeze(`${today} 10:10`);
//   assertTimeout(t, 120 * minute);
//   t.is(currentTrack, "a");
//
//   ck.freeze(`${today} 11:10`);
//   assertTimeout(t, 50 * minute);
//   t.is(currentTrack, "b");
//
//   ck.freeze(`${today} 11:31`);
//   assertTimeout(t, 20 * minute);
//   t.is(currentTrack, "c");
//
//   t.is(timeouts.length, 0);
// });
//
// test("schedule can seep in to tomorrow", () => {
//   let currentTrack;
//   const keyTracks = [
//     ["a", "22:00"],
//     ["b", "01:00"],
//   ];
//   ck.freeze(`${today} 22:00`);
//   mc(keyTracks, track => currentTrack = track);
//
//   ck.freeze(`${today} 22:10`);
//   assertTimeout(t, 0);
//   t.is(currentTrack, "a");
//
//   assertTimeout(t, 170 * minute);
//   t.is(currentTrack, "b");
// });

function assertTimeout (t, expectedTimeout) {
	t.is(timeouts.length, 1);
	const [fn, timeout] = timeouts.pop();

	t.is(expectedTimeout, timeout);
	fn();
}

function awaitAsync () {
	return new Promise(r => setTimeout(r));
}
