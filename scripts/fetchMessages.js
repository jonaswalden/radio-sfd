import csvToArray from './csvToArray.js';

export default function fetchMessages (url) {
  return window.fetch(url, {mode: 'cors'})
    .then(data => data.text())
    .then(csvToArray)
    .catch(err => {
      console.warn('Error fetching schedule', err);
      return [];
    })
    .then(toObject);

  function toObject (messageList) {
    return messageList.reduce(listToObject, {});

    function listToObject (obj, message) {
      obj[message.id] = message;
      return obj;
    }
  }
}
