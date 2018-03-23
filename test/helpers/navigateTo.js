"use strict";

const fs = require("fs");
const Tallahassee = require("@expressen/tallahassee");
const {Compiler} = require("@expressen/tallahassee/lib/Compiler");

module.exports = function navigateTo (filepath) {
  if (!filepath) return Promise.reject("no file path");

  return new Promise((resolve, reject) => {
    fs.readFile(filepath, "utf-8", (err, data) => {
      if (err) return reject(err);

      try {
        Compiler([/scripts/]);
        const browser = Tallahassee({}).load({
          text: data
        });
        resolve(browser);
      }
      catch (err) {
        reject(err);
      }
    });
  });
};
