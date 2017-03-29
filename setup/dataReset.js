#!/usr/bin/env node

'use strict';

const rp = require('request-promise');

const appConfig = require('../util/yargopts').app;
const argv = require('yargs')
  .reset()
  .option('app', appConfig)
  .argv;

const request = rp.defaults({
  json: true
});

// configure request to app url
request({
  url: `${argv.app}/admin/data`,
  method: 'DELETE'
})
// send delete request
.then(() => console.log('Reset Data call finished'))
.catch((err, response) => console.error('Reset Data call failed', err, response));

// TODO: change this to login beforehand (see util/login) if endpoint
// is changed to require authentication