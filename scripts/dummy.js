'use strict';

const lr = require('load-runner')();

/*
 * Dummy test does 3 async actions taking 200, 400 & 800 milliseconds, in that order
 */
const p = new Promise(mockFirstAction)
      .then(() => new Promise(mockSecondAction))
      .then(() => new Promise(mockFinalAction))
      .then(() => lr.finish('ok'))
      .catch(err => lr.finish('failed'));

function mockFirstAction(resolve, reject) {
  lr.actStart('FIRST');

  // no actual code, just mock async thing happening
  return setTimeout(function firstTimeout() {
    lr.actEnd('FIRST');
    return resolve();
  }, 200);
}

function mockSecondAction(resolve, reject) {
  lr.actStart('SECOND');

  // no actual code, just mock async thing happening
  return setTimeout(function secondTimeout() {
    lr.actEnd('SECOND');
    return resolve();
  }, 400);
}

function mockFinalAction(resolve, reject) {
  lr.actStart('FINAL');

  // no actual code, just mock async thing happening
  return setTimeout(function finalTimeout() {
    lr.actEnd('FINAL');
    return resolve(10);
  }, 800);
}
