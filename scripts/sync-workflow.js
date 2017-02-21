'use strict';

const crypto = require('crypto');
const lr = require('load-runner')();
const Promise = require('bluebird');
const rp = require('request-promise');
const util = require('util');

const requestBodyUtils = require('../util/sync_request_bodies');
const clientIdentifier = `${crypto.randomBytes(16).toString('hex')}_${Date.now()}`;

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

/**
 * Configures defaults in a custom request-promise instance
 *
 * @param {string} clientIdentifier
 * @param {string} sessionToken
 * @returns {object} a request-promise instance
 */
function configureRequest(clientIdentifier, sessionToken) {
  const optionalHeaders = {
    'X-FH-cuid': clientIdentifier
  };

  if (sessionToken) {
    optionalHeaders['X-FH-sessionToken'] = sessionToken;
  }

  return rp.defaults({
    headers: requestBodyUtils.getSyncRequestHeaders(optionalHeaders)
  });
}

/**
 * Test step: login to Raincatcher cloud app
 * @returns {promise} A promise that resolves with a session token
 */
function login() {
  const fhRequest = configureRequest(clientIdentifier);
  const reqBody = {
    "params": {
      "userId": argv.username,
      "password": argv.password
    }
  };

  return new Promise(resolve => {
    lr.actStart('Login');
    return fhRequest.post({
      url: `${argv.app}/box/srv/1.1/admin/authpolicy/auth`,
      body: reqBody,
      json: true
    }).then(resBody => {
      lr.actEnd('Login');
      return resolve(resBody.sessionToken);
    });
  });
}

/**
 * Test step: logout / revoke session
 * @param {} previousResolution - Contains sessionToken
 * @returns {promise} A promise that doesn't return anything
 */
function logout(previousResolution) {
  const fhRequest = configureRequest(clientIdentifier, previousResolution.sessionToken);

  return new Promise(resolve => {
    lr.actStart('Logout');
    return fhRequest.post({
      url: `${argv.app}/box/srv/1.1/admin/authpolicy/revokesession`,
      body: {},
      json: true
    }).then(() => {
      lr.actEnd('Logout');
      return resolve();
    });
  });
}

/**
 * Test step: Initial sync request to get dataset hash
 * @param {string} sessionToken - the token from the login step
 * @returns {promise} A promise that resolves with an object
 * containing session token and dataset hash
 */
function initialSync(sessionToken) {
  const fhRequest = configureRequest(clientIdentifier, sessionToken);
  const reqBody = requestBodyUtils.getSyncRequestBody({
    dataset_id: 'workorders',
    query_params: {
      "filter": {
        "key": "assignee",
        "value": "rkX1fdSH"
      }
    },
    meta_data: {
      clientIdentifier: clientIdentifier
    },
    pending: []
  });

  return new Promise(resolve => {
    lr.actStart('Initial Sync');
    return fhRequest.post({
      url: `${argv.app}/mbaas/sync/workorders`,
      body: reqBody,
      json: true
    }).then(resBody => {
      // lr.log(`Sync response: ${util.inspect(resBody.records)}`);
      lr.actEnd('Initial Sync');

      const resolution = {
        sessionToken: sessionToken,
        serverHash: resBody.hash
      };
      return resolve(resolution);
    });
  });
}

/**
 * Test step: SyncRecords request to get the data from the server
 * @param {object} previousResolution - contains session token and dataset hash
 * @returns {promise} A promise that resolves with an object
 * containing session token and dataset hash
 */
function syncRecords(previousResolution) {
  const sessionToken = previousResolution.sessionToken;
  const serverHash = previousResolution.serverHash;
  const fhRequest = configureRequest(clientIdentifier, sessionToken);
  const reqBody = requestBodyUtils.getSyncRecordsRequestBody({
    dataset_id: 'workorders',
    query_params: {
      "filter": {
        "key": "assignee",
        "value": "rkX1fdSH"
      }
    },
    dataset_hash: serverHash,
    meta_data: {
      clientIdentifier: clientIdentifier
    },
    pending: []
  });

  return new Promise(resolve => {
    lr.actStart('Sync Records');
    return fhRequest.post({
      url: `${argv.app}/mbaas/sync/workorders`,
      body: reqBody,
      json: true
    }).then(resBody => {
      lr.actEnd('Sync Records');

      const resolution = {
        sessionToken: sessionToken,
        serverHash: resBody.hash
      };
      return resolve(resolution);
    });
  });
}

// Execution starts here
login()
  .then(initialSync)
  .then(syncRecords)
  .then(logout)
  .then(() => lr.finish('ok'))
  .catch(() => lr.finish('failed'));
