'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const configureRequest = require('../util/configureRequest');
const syncDataset = require('../util/syncDataset');
const createRecord = require('../util/createRecord');
const promiseAct = require('../util/promiseAct');
const syncResultsToArray = require('../util/syncResultsToArray');
const makeResult = require('../util/fixtures/makeResult');
const makeMessage = require('../util/fixtures/makeMessage');
const randomstring = require('randomstring');

module.exports = function mobileFlow(runner, argv) {
  return function mobileFlowAct(previousResolution) {
    runner.actStart('Mobile Flow');

    const baseUrl = argv.app;
    const clientId = previousResolution.clientIdentifier;
    const request = configureRequest(clientId, previousResolution.sessionToken);
    const create = createRecord.bind(this, baseUrl, request, clientId);
    const doSync = syncDataset.bind(this, baseUrl, request, clientId);
    const datasets = ['workorders', 'workflows', 'messages', 'results'];
    const act = promiseAct.bind(this, runner);

    return Promise.join(
      act('Device: initialSync', () => Promise.all(datasets.map(doSync))),
      request.get({
        url: `${baseUrl}/api/wfm/user`
      }),
      (syncData, users) => {
        const data = syncResultsToArray(syncData);
        const workorders = data[0];
        const user = _.find(users, {username: `loaduser${process.env.LR_RUN_NUMBER}`});
        const resultId = randomstring.generate(6);

        return Promise.all([
          // create one result
          act('Device: create New Result', () => create('results',
            makeResult.createNew()))
            .then(() => act('Device: sync In Progress result', () => create('results',
              makeResult.updateInProgress(resultId, user.id, workorders[0].id), undefined, 'update')))
            .then(() => act('Device: sync Complete result', () => create('results',
              makeResult.updateComplete(resultId, user.id, workorders[0].id), undefined, 'update'))),
          // create one message // TODO: demo client app doesn't *SEND* any messages
          act('Device: create messages', () => makeMessage(user))
            .then(message => act('Device: sync messages', () => create('messages', message, syncData[datasets.indexOf('messages')].hash)))
        ]);
      })
      .then(() => runner.actEnd('Mobile Flow'))
      .then(() => previousResolution);
  };
};
