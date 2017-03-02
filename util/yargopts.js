'use strict';

module.exports = require('yargs')
  .reset()
  .option('app', {
    demand: true,
    type: 'string',
    alias: 'a',
    describe: 'Cloud app base URL to target'
  })
  .option('username', {
    demand: true,
    type: 'string',
    alias: 'u',
    describe: 'Username to use to login to the app'
  })
  .option('password', {
    demand: true,
    type: 'string',
    alias: 'p',
    describe: 'Password to use to login to the app'
  });
