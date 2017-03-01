'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const configureRequest = require('../util/configureRequest');
const syncDataset = require('../util/syncDataset.js');

module.exports = function mobileFlow(runner, argv) {
  return previousResolution => {
    runner.actStart('Mobile Flow');

    const baseUrl = argv.app;
    const clientId = previousResolution.clientIdentifier;
    const request = configureRequest(clientId, previousResolution.sessionToken);
    const doSync = syncDataset.bind(this, baseUrl, request, clientId);
    const datasets = ['workorders', 'workflows', 'messages', 'result'];

    runner.actStart('Device: initialSync');
    const initialSync = Promise.all(datasets.map(doSync))
          .then(arr => {
            runner.actEnd('Device: initialSync');
            return arr;
          });

    return initialSync
      .then(() => runner.actEnd('Mobile Flow'));
  };
};
