'use strict';

const Koa = require('koa');
const serve = require('koa-static');

const app = new Koa();
app.use(serve('.'));

const server = app.listen(4000);

module.exports = app;
module.exports.stop = callback => server.close(callback);
