'use strict';

const app = require('../../app');
const router = require('koa-route');

const basePath = '/resource/';
const resources = [];

module.exports = {
  add,
  serve,
};

function add (resource) {
  const id = resources.push(resource) - 1;
  return basePath + id;
}

function serve () {
  const route = router.get(basePath + ':idString', get);
  app.use(route);

  function get (ctx, idString) {
    const resource = resources[Number(idString)];
    if (!resource) return ctx.throw(404);

    ctx.body = resource;
  }
}
