'use strict';

const lr = require('load-runner')();
const request = require('request');

const requestBodyUtils = require('../util/sync_request_bodies');

const argv = require('yargs')
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
      })
      .argv;

const fhRequest = request.defaults({
  headers: requestBodyUtils.getSyncRequestHeaders()
});

new Promise(login)
  .then(() => lr.finish('ok'))
  .catch(() => lr.finish('failed'));

function login(resolve, reject) {
  lr.actStart('LOGIN');

  const reqBody = {
    "params": {
      "userId": argv.username,
      "password": argv.password
    }
  };

  fhRequest.post({
    url: `${argv.app}/box/srv/1.1/admin/authpolicy/auth`,
    body: reqBody,
    json: true
  }, (err, httpResponse, resBody) => {
    if (err) {
      return reject(err);
    }
    lr.actEnd('LOGIN');
    return resolve(resBody);
  });
}
