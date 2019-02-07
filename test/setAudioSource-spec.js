"use strict";

import addMediaInterface from "./helpers/addMediaInterface";
import assert from "assert";
import navigate from "./helpers/navigate";
import setAudioSource from "../scripts/setAudioSource";

describe('setAudioSource', () => {
  let browser, audio;
  beforeEach("load page with audio element", async () => {
    browser = await navigate.toDomString(`
      <html>
        <audio></audio>
      </html>
    `);

    [audio] = browser.document.getElementsByTagName("audio");
    assert(audio);

    addMediaInterface(audio);
    assert.equal(audio.src, "");
  });

  it("sets supplied audio source on supplied audio", () => {
    setAudioSource(audio, "/path/to/audio.mp3#t=10");
    assert.equal(decodeURIComponent(audio.src), "/path/to/audio.mp3#t=10", "unexpected audio source");
  });

  it("ends audio playback on pause if it matches media range stop", () => {
    let stopCount = 0;
    audio.addEventListener("ended", () => ++stopCount);

    setAudioSource(audio, "/path/to/audio.mp3#t=10,65.2");
    assert.equal(decodeURIComponent(audio.src), "/path/to/audio.mp3#t=10,65.2", "unexpected audio source");

    audio.currentTime = 10;
    audio.dispatchEvent(new browser.window.Event("pause"));
    assert.equal(stopCount, 0, "unexpected stopCount");

    audio.currentTime = 65.2;
    audio.dispatchEvent(new browser.window.Event("pause"));
    assert.equal(stopCount, 1, "unexpected stopCount");

    audio.dispatchEvent(new browser.window.Event("pause"));
    assert.equal(stopCount, 1, "unexpected stopCount");
  });
});