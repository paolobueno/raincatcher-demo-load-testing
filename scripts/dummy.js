'use strict';

const lr = require('load-runner')();
const Promise = require('bluebird');

/*
 * Dummy test does 3 async actions taking 200, 400 & 800 milliseconds, in that order
 */
new Promise(mockFirstAction)
  .then(() => new Promise(mockSecondAction))
  .then(() => new Promise(mockFinalAction))
  .then(() => lr.finish('ok'))
  .catch(() => lr.finish('failed'));

function mockFirstAction(resolve) {
  lr.actStart('FIRST');

  // no actual code, just mock async thing happening
  return setTimeout(function firstTimeout() {
    lr.actEnd('FIRST');
    return resolve();
  }, 200);
}

function mockSecondAction(resolve) {
  lr.actStart('SECOND');

  // no actual code, just mock async thing happening
  return setTimeout(function secondTimeout() {
    lr.actEnd('SECOND');
    return resolve();
  }, 400);
}

function mockFinalAction(resolve) {
  lr.actStart('FINAL');

  // no actual code, just mock async thing happening
  return setTimeout(function finalTimeout() {
    lr.actEnd('FINAL');
    return resolve(10);
  }, 800);
}
