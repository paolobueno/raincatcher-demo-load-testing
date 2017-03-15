#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
const lr = require('load-runner')();
const Promise = require('bluebird');
const configureRequest = require('../util/configureRequest');
const clientIdentifier = `${crypto.randomBytes(16).toString('hex')}_${Date.now()}`;
const login = require('../util/login');

const argv = require('../util/yargopts').argv;

/**
 * Test step: logout / revoke session
 * @param {} previousResolution - Contains sessionToken
 * @returns {promise} A promise that doesn't return anything
 */
function logout(sessionToken) {
  const fhRequest = configureRequest(clientIdentifier, sessionToken);

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

const flows = [require('./mobile-flow'), require('./portal-flow')];
// gets current flow number
const flowNumber = process.env.LR_FLOW_NUMBER;

if (flowNumber > flows.length) {
  lr.finish(`flow number can be max ${flows.length}`);
} else {

// Execution starts here
  login(lr, configureRequest(clientIdentifier), argv.app, `loaduser${process.env.LR_RUN_NUMBER}`, argv.password)
    .then(flows[flowNumber](lr, argv, clientIdentifier))
    .then(logout)
    .then(() => lr.finish('ok'))
    .catch(err => {
      console.error(err.stack);
      return lr.finish('failed');
    });
}
