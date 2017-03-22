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
        .then(() => Promise.all(datasets.map(doSyncRecords)))
      // Then do another sync of each dataset
        .then(syncRecordsResults => Promise.all([
          Promise.all(datasets.map(ds => doSync(`${baseUrl}/mbaas/sync/${ds}`, makeSyncBody(ds, clientId)))),
          Promise.resolve(syncRecordsResults)
        ]))
      // Then do another syncRecords, this time with clientRecs
        .spread((syncResults, syncRecordsResults) => Promise.all([
          Promise.resolve(_.zipObject(datasets, syncResults.map(x => x.hash))),
          Promise.all(datasets.map(ds => doSyncRecords(ds, syncRecordsResults[datasets.indexOf(ds)]))),
          Promise.resolve(syncRecordsResults)
        ])));

    return syncPromise.spread((hashes, syncRecordsResults, previousSyncRecordsResults) => Promise.all([
      Promise.resolve(hashes),
      Promise.resolve(syncRecordsResults),
      Promise.resolve(previousSyncRecordsResults),
      request.get({
        url: `${baseUrl}/api/wfm/user`
      })]))

      .spread((hashes, syncRecordsResults, previousSyncRecordsResults, users) => {

        const user = _.find(users, {username: `loaduser${process.env.LR_RUN_NUMBER}`});
        const myWorkorders = _.filter(
          previousSyncRecordsResults[datasets.indexOf('workorders')].create,
          wo => wo.data.assignee === user.id);
        const myWorkorderId = myWorkorders[0].data.id;
        const resultId = randomstring.generate(6);

        return Promise.all([
          // create one result
          act('Device: create New Result',
              () => create('results', makeResult.createNew(), hashes.results))
            .delay(1000) //TODO: set the interval
            .then(res => doSync(`${baseUrl}/mbaas/sync/results`, makeSyncBody('results', clientId, res.hash)))
            .then(() => doSyncRecords('results', previousSyncRecordsResults[datasets.indexOf('results')]))
            .then(() => act('Device: sync In Progress result', () => create(
              'results',
              makeResult.updateInProgress(resultId, user.id, myWorkorderId),
              hashes.results)))
            .then(() => act('Device: sync Complete result', () => create(
              'results',
              makeResult.updateComplete(resultId, user.id, myWorkorderId),
              hashes.results)))
        ]);
      })
      .then(() => runner.actEnd('Mobile Flow'))
      .then(() => sessionToken);
  };
};
