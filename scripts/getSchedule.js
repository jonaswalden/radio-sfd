import csvToArray from './csvToArray';

export default function getSchedule (url) {
  if (window.location.hash === '#dev') {
    return Promise.resolve(window.devSchedule)
      .then(sortSchedule);
  }

  return window.fetch(url, {mode: 'cors'})
    .then(data => data.text())
    .then(csvToArray)
    .then(toItemList)
    .then(removeEmpty)
    .then(sortSchedule)

  function toItemList (list) {
    const [keys, ...rows] = list;
    return rows.map(toObject);

    function toObject (vals) {
      return keys.reduce((obj, key, index) => {
        obj[key] = vals[index];
        return obj;
      }, {});
    }
  }

  function removeEmpty (objList) {
    return objList.filter(obj => {
      return !Object.values(obj).includes('');
    });
  }

  function sortSchedule (events) {
    const now = Date.now();

    return events
      .map(addTimeSize)
      .sort(byTimeSize)
      .reduce(alignToTime, {passed: [], upcoming: []});

    function addTimeSize (msg) {
      msg.timeSize = timeSize(msg.queue);
      return msg;
    }

    function byTimeSize (a, b) {

      return a.timeSize > b.timeSize ? 1 : -1;
    }

    function alignToTime (stacks, msg) {
      const stack = now > msg.timeSize ? stacks.passed : stacks.upcoming;
      stack.push(msg);
      return stacks;
    }

    function timeSize (timeString) {
      const moment = timeString.split(':');
      return new Date(...today, ...moment).getTime();
    }
  }
}
