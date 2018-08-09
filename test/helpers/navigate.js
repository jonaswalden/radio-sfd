'use strict';

const fs = require('fs');
const Tallahassee = require('@expressen/tallahassee');
const {Compiler} = require('@expressen/tallahassee/lib/Compiler');

module.exports = {
  toFile,
  toDomString,
};

function toFile (filepath) {
  if (!filepath) return Promise.reject('no file path');

  return new Promise((resolve, reject) => {
    fs.readFile(filepath, 'utf-8', (err, data) => {
      if (err) return reject(err);

      try {
        resolve(Browser(data));
      }
      catch (err) {
        reject(err);
      }
    });
  });
}

function toDomString (domString) {
  if (!domString) return Promise.reject('no dom string');

  return new Promise((resolve, reject) => {
    try {
      resolve(Browser(domString));
    }
    catch (err) {
      reject(err);
    }
  });
}

function Browser (text) {
  Compiler([/scripts/]);
  return Tallahassee({}).load({ text });
}
