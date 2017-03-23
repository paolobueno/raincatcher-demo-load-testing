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
        .then(initialSyncRecordsResponses => Promise.all([
          Promise.all(datasets.map(ds => doSync(`${baseUrl}/mbaas/sync/${ds}`, makeSyncBody(ds, clientId)))),
          Promise.resolve(initialSyncRecordsResponses)
        ]))
      // Then do another syncRecords, this time with clientRecs
        .spread((syncResults, initialSyncRecordsResponses) => Promise.all([
          // TODO: in the browser, I see a hash in the response from syncRecords, but not here in the script
          Promise.resolve(_.zipObject(datasets, syncResults.map(x => x.hash))),
          Promise.all(datasets.map(ds => doSyncRecords(ds, initialSyncRecordsResponses[datasets.indexOf(ds)]))),
          Promise.resolve(initialSyncRecordsResponses)
        ])));

    return syncPromise.spread((hashes, syncRecordsResults, initialSyncRecordsResponses) => Promise.all([
      Promise.resolve(hashes),
      Promise.resolve(syncRecordsResults),
      Promise.resolve(initialSyncRecordsResponses),
      request.get({
        url: `${baseUrl}/api/wfm/user`
      })]))

      .spread((hashes, syncRecordsResults, initialSyncRecordsResponses, users) => {

        const user = _.find(users, {username: `loaduser${process.env.LR_RUN_NUMBER}`});
        const myWorkorders = _.filter(
          initialSyncRecordsResponses[datasets.indexOf('workorders')].create,
          wo => wo.data.assignee === user.id);
        const myWorkorderId = myWorkorders[0].data.id;
        const resultId = randomstring.generate(6);

        return Promise.all([
          // create one result
          act('Device: create New Result',
              () => create('results', makeResult.createNew(), hashes.results))
            .then(() => doSyncRecords('results', initialSyncRecordsResponses[datasets.indexOf('results')]))
            .then(previousResultSyncRecordsResponse => Promise.all([
              // TODO: sync with acknowledgements (still old dataset hash)
              Promise.resolve({}),
              Promise.resolve(previousResultSyncRecordsResponse)
            ]))
            .spread((syncResponse, syncRecordsResponse) => Promise.all([
              Promise.resolve(syncResponse),
              // TODO: see TODO comment in syncDataset file and update here as appropriate
              doSyncRecords('results', syncRecordsResponse)
            ]))
          // TODO: sync with acknowledgements again, this time with updated dataset hash
            .spread((syncResponse, syncRecordsResponse) => Promise.all([
              // TODO: sync with acknowledgements (with new dataset hash)
              Promise.resolve(syncResponse),
              Promise.resolve(syncRecordsResponse)
            ]))

          // TODO: The below two steps will each need the steps that follow the above step also
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
