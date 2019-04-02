import csvToArray from './csvToArray.js';

export default function fetchMessages (url) {
  return window.fetch(url, {mode: 'cors'})
    .then(data => data.text())
    .then(csvToArray)
    .catch(err => {
      console.warn('Error fetching schedule', err); // eslint-disable-line no-console
      return [];
    })
    .then(toObject);

  function toObject (messageList) {
    return messageList
      .map(addAudio)
      .reduce(listToObject, {});

    function addAudio (message) {
      return Object.assign({}, message, {
        audio: `audio/messages/${message.id}.mp3`,
      });
    }

    function listToObject (obj, message) {
      obj[message.id] = message;
      return obj;
    }
  }
}
