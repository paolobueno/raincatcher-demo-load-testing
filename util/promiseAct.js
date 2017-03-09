'use strict';
const Promise = require('bluebird');
/**
 * Wraps the start and end of an Act in a Promise
 */
module.exports = function promiseAct(runner, actName, fn) {
  return Promise.resolve(runner.actStart(actName))
    .then(fn)
    .tap(() => runner.actEnd(actName))
    .catch(runner.checkError.bind(runner));
};
