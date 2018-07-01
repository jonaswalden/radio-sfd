'use strict';

const Koa = require('koa');
const serve = require('koa-static');

const app = new Koa();
app.use(serve('.'));

let server;
module.exports = {
  app,
  start () {
    server = app.listen(4000);
  },
  stop (callback) {
    server.close(callback);
  },
};
