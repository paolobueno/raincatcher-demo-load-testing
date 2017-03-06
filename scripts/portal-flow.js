'use strict';

const configureRequest = require('../util/configureRequest');
const syncDataset = require('../util/syncDataset');
const createRecord = require('../util/createRecord');
const makeUser = require('../util/fixtures/makeUser');
const makeWorkorder = require('../util/fixtures/makeWorkorder');
const makeWorkflow = require('../util/fixtures/makeWorkflow');
const makeMessage = require('../util/fixtures/makeMessage');
const createUserAndGroup = require('../util/createUserAndGroup');
const promiseAct = require('../util/promiseAct');
const Promise = require('bluebird');

module.exports = function portalFlow(runner, argv) {
  return function portalFlowAct(previousResolution) {
    runner.actStart('Portal Flow');
    const baseUrl = argv.app;
    const clientId = previousResolution.clientIdentifier;
    const request = configureRequest(clientId, previousResolution.sessionToken);
    const datasets = ['workorders', 'workflows', 'messages', 'results'];

    // partially apply constant params so further calls are cleaner
    const create = createRecord.bind(this, baseUrl, request, clientId);
    const doSync = syncDataset.bind(this, baseUrl, request, clientId);
    const act = promiseAct.bind(this, runner);

    const syncPromise = act('Portal: initialSync',
                            () => Promise.all(datasets.map(doSync)));

    return syncPromise.then(syncResults => Promise.all([
      new Promise(resolve => resolve(syncResults)),
      act('Portal: create user and group',
          () => createUserAndGroup(request, baseUrl, makeUser(`-portalflow${process.env.LR_RUN_NUMBER}`))),
      act('Portal: create workflow',
          () => create('workflows', makeWorkflow(process.env.LR_RUN_NUMBER), syncResults[datasets.indexOf('workflows')].hash))
    ]))

    .spread((syncResults, user, workflow) =>
      Promise.all([
        act('Portal: create workorder',
            () => create('workorders', makeWorkorder(String(user.id), String(workflow.id)), syncResults[datasets.indexOf('workorders')].hash)),
        act('Portal: create message',
            () => create('messages', makeMessage(user), syncResults[datasets.indexOf('messages')].hash))
      ]))

      .then(() => runner.actEnd('Portal Flow'))
      .then(() => Promise.resolve(previousResolution));
  };
};
