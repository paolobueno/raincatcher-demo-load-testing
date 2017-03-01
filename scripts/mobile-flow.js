'use strict';

const Promise = require('bluebird');
const configureRequest = require('../util/configureRequest');
const syncDataset = require('../util/syncDataset.js');
const promiseAct = require('../util/promiseAct');
const syncResultsToArray = require('../util/syncResultsToArray');
const makeResult = require('../util/fixtures/makeResult');
const makeMessage = require('../util/fixtures/makeMessage');
const randomstring = require('randomstring');

module.exports = function mobileFlow(runner, argv) {
  return previousResolution => {
    runner.actStart('Mobile Flow');

    const baseUrl = argv.app;
    const clientId = previousResolution.clientIdentifier;
    const request = configureRequest(clientId, previousResolution.sessionToken);
    const doSync = syncDataset.bind(this, baseUrl, request, clientId);
    const datasets = ['workorders', 'workflows', 'messages', 'result'];
    const act = promiseAct.bind(this, runner);

    const initialSync = act('Device: initialSync',
      () => Promise.all(datasets.map(doSync)))
      .then(syncResultsToArray);

    return Promise.join(
      initialSync,
      request.get({
        url: `${baseUrl}/api/wfm/user`
      }),
      (data, users) => {
        const workorders = data[0];
        return Promise.all([
          // create one result per user
          act('Device: create results', () => Promise.map(users, u =>
            makeResult(randomstring.generate(6), workorders[0], u))),
          // create one message per user
          act('Device: create messages', () => Promise.map(users, u => makeMessage(u)))
        ]);
      })
    .then(() => runner.actEnd('Mobile Flow'));
  };
};
