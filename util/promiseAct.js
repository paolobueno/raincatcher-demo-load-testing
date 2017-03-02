'use strict';
const Promise = require('bluebird');
/**
 * Wraps the start and end of an Act in a Promise
 */
module.exports = function promiseAct(runner, actName, fn) {
  return Promise.resolve(runner.actStart(actName))
    .tap(() => runner.actEnd(actName))
    .then(fn)
    .catch(err => console.error(`Got an error in: ${actName}`, err));
};
