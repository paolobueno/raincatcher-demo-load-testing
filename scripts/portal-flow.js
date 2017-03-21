'use strict';

const configureRequest = require('../util/configureRequest');
const sync = require('../util/sync.js');
const syncDataset = require('../util/syncDataset');
const createRecord = require('../util/createRecord');
const makeUser = require('../util/fixtures/makeUser');
const makeWorkorder = require('../util/fixtures/makeWorkorder');
const makeWorkflow = require('../util/fixtures/makeWorkflow');
const makeMessage = require('../util/fixtures/makeMessage');
const makeSyncBody = require('../util/fixtures/makeSyncBody');
const createUserAndGroup = require('../util/createUserAndGroup');
const promiseAct = require('../util/promiseAct');
const Promise = require('bluebird');

module.exports = function portalFlow(runner, argv, clientId) {
  return function portalFlowAct(sessionToken) {
    runner.actStart('Portal Flow');

    const baseUrl = argv.app;
    const request = configureRequest(clientId, sessionToken);
    const datasets = ['workorders', 'workflows', 'messages', 'results'];

    // partially apply constant params so further calls are cleaner
    const create = createRecord.bind(this, baseUrl, request, clientId);
    const doSync = sync.bind(this, request);
    const doSyncRecords = syncDataset.bind(this, baseUrl, request, clientId);
    const act = promiseAct.bind(this, runner);

    const syncPromise = act(
      'Initial sync and syncRecords dance',
      // First do a sync of each dataset
      () => Promise.all(datasets.map(ds => doSync(`${baseUrl}/mbaas/sync/${ds}`, makeSyncBody(ds, clientId))))
      // Then do a syncRecords for each datasets (no clientRecs yet)
        .then(syncResults => Promise.all([
          Promise.resolve(syncResults),
          Promise.all(datasets.map(doSyncRecords))
        ]))
      // Then do another sync of each dataset
        .spread((syncResults, syncRecordsResults) => Promise.all([
          Promise.all(datasets.map(ds => doSync(`${baseUrl}/mbaas/sync/${ds}`, makeSyncBody(ds, clientId)))),
          Promise.resolve(syncRecordsResults)
        ]))
      // Then do another syncRecords, this time with clientRecs
        .spread((syncResults, syncRecordsResults) => Promise.all([
          Promise.resolve(syncResults),
          () => Promise.all(datasets.map(ds => doSyncRecords(ds, syncRecordsResults[datasets.indexOf(ds)])))
        ])));

    return syncPromise.spread((syncResults, syncRecordsResults) => Promise.all([
      Promise.resolve(syncResults),
      Promise.resolve(syncRecordsResults),
      act('Portal: create user and group',
          () => createUserAndGroup(request, baseUrl, makeUser(`-portalflow${process.env.LR_RUN_NUMBER}`))),
      act('Portal: create workflow',
          () => create('workflows', makeWorkflow(process.env.LR_RUN_NUMBER), syncResults[datasets.indexOf('workflows')].hash))
    ]))

      .spread((syncResults, syncRecordsResults, user, workflow) => Promise.all([
        act('Portal: create workorder',
            () => create('workorders', makeWorkorder(String(user.id), String(workflow.id)), syncResults[datasets.indexOf('workorders')].hash)),
        act('Portal: create message',
            () => create('messages', makeMessage(user), syncResults[datasets.indexOf('messages')].hash))
      ]))

      .then(() => runner.actEnd('Portal Flow'))
      .then(() => sessionToken);
  };
};
