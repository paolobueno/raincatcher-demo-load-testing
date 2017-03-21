'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const configureRequest = require('../util/configureRequest');
const sync = require('../util/sync');
const syncDataset = require('../util/syncDataset');
const createRecord = require('../util/createRecord');
const promiseAct = require('../util/promiseAct');
const makeSyncBody = require('../util/fixtures/makeSyncBody');
const makeResult = require('../util/fixtures/makeResult');
const randomstring = require('randomstring');

module.exports = function mobileFlow(runner, argv, clientId) {
  return function mobileFlowAct(sessionToken) {
    runner.actStart('Mobile Flow');

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
          Promise.resolve(syncRecordsResults),
          Promise.resolve(_.map(syncRecordsResults[0].create, x => x.data)) //workorders
        ]))
      // Then do another syncRecords, this time with clientRecs
        .spread((syncResults, syncRecordsResults, workorders) => Promise.all([
          Promise.resolve(syncResults),
          Promise.all(datasets.map(
            ds => doSyncRecords(ds, syncRecordsResults[datasets.indexOf(ds)]))),
          Promise.resolve(workorders)
        ])));

    return syncPromise.spread((syncResults, syncRecordsResults, workorders) => Promise.all([
      Promise.resolve(syncResults),
      Promise.resolve(syncRecordsResults),
      Promise.resolve(workorders),
      request.get({
        url: `${baseUrl}/api/wfm/user`
      })]))
      .spread((syncResults, syncRecordsResults, workorders, users) => {
        const user = _.find(users, {username: `loaduser${process.env.LR_RUN_NUMBER}`});
        const myWorkorder = workorders.filter(wo => wo.assignee === user.id)[0];
        const resultId = randomstring.generate(6);

        return Promise.all([
          // create one result
          act('Device: create New Result', () => create('results',
            makeResult.createNew()))
            .then(() => act('Device: sync In Progress result', () => create('results',
              makeResult.updateInProgress(resultId, user.id, myWorkorder.id), syncResults[datasets.indexOf('results')].hash)))
            .then(() => act('Device: sync Complete result', () => create('results',
              makeResult.updateComplete(resultId, user.id, myWorkorder.id), syncResults[datasets.indexOf('results')].hash)))
        ]);
      })
      .then(() => runner.actEnd('Mobile Flow'))
      .then(() => sessionToken);
  };
};
