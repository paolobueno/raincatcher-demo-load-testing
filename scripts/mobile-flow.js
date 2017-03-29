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

module.exports = function mobileFlow(runner, argv, clientId) {
  return function mobileFlowAct(sessionToken) {
    runner.actStart('Mobile Flow');

    const baseUrl = argv.app;
    const request = configureRequest(clientId, sessionToken);
    const datasets = ['workorders', 'workflows', 'messages', 'result'];

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
        .then(() => Promise.all(datasets.map(ds => doSyncRecords(ds, {}))))
        .map(dsResponse => dsResponse.clientRecs)
      // Then do another sync of each dataset
        .then(clientRecs => Promise.all([
          Promise.all(datasets.map(ds => doSync(`${baseUrl}/mbaas/sync/${ds}`, makeSyncBody(ds, clientId)))),
          Promise.resolve(clientRecs)
        ]))
      // Then do another syncRecords, this time with clientRecs
        .spread((syncResults, clientRecs) => Promise.all([
          // TODO: in the browser, I see a hash in the response from syncRecords, but not here in the script
          Promise.resolve(_.zipObject(datasets, syncResults.map(x => x.hash))),
          Promise.all(datasets.map(ds => doSyncRecords(ds, clientRecs[datasets.indexOf(ds)]))),

          request.get({
            url: `${baseUrl}/api/wfm/user`
          })
            .then(users => _.find(users, {username: `loaduser${process.env.LR_RUN_NUMBER}`}))
        ])));

    return syncPromise.spread((hashes, clientRecs, user) => Promise.all([
      Promise.resolve(hashes),
      Promise.resolve(clientRecs),
      Promise.resolve(user),

      doSyncRecords('workorders', {}, {filter: {key: 'assignee', value: user.id}})
        .then(workorders => _.keys(workorders.clientRecs)[0])
    ]))

      .spread(
        (hashes, clientRecs, user, myWorkorderId) =>
          act('Device: create New Result', () => create('result', makeResult.createNew(), null, hashes.result, {}, [], 'create'))
          .then(result => doSyncRecords('result', clientRecs[datasets.indexOf('result')])
                .then(doSyncRecordsResult => Promise.all([
                  Promise.resolve(result),
                  Promise.resolve(_.find(
                    _.get(doSyncRecordsResult, 'res.create', {}),
                    r => r.data.id === _.map(result.updates.applied, a => a.uid)[0]
                  )),
                  Promise.resolve(doSyncRecordsResult.clientRecs)
                ])))
          .spread((syncResponse, createdRecord, clientRecs) => Promise.all([
            // TODO: sync with acknowledgements (still old dataset hash)
            Promise.resolve(syncResponse),
            Promise.resolve(createdRecord),
            Promise.resolve(clientRecs)

          ]))
          .spread((syncResponse, createdRecord, clientRecs) =>
                  doSyncRecords('result', clientRecs)
                  .then(doSyncRecordsResult => Promise.all([
                    Promise.resolve(syncResponse),
                    Promise.resolve(createdRecord),
                    Promise.resolve(doSyncRecordsResult.clientRecs)
                  ])))
        // TODO: sync with acknowledgements again, this time with updated dataset hash
          .spread((syncResponse, createdRecord, clientRecs) => Promise.all([
            // TODO: sync with acknowledgements (with new dataset hash)
            Promise.resolve(syncResponse),
            Promise.resolve(createdRecord),
            Promise.resolve(clientRecs)
          ]))

        // TODO: The below two steps will each need the steps that follow the above step also
          .spread((syncResponse, createdRecord, clientRecs) => act('Device: sync In Progress result', () => create(
            'result',
            makeResult.updateInProgress(createdRecord.data.id, user.id, myWorkorderId),
            createdRecord, hashes.result, {}, [], 'update'))
                  .then(result => doSyncRecords('result', clientRecs[datasets.indexOf('result')])
                        .then(doSyncRecordsResult => Promise.all([
                          Promise.resolve(result),
                          Promise.resolve(_.find(
                            _.get(doSyncRecordsResult, 'res.create', {}),
                            r => r.data.id === _.map(result.updates.applied, a => a.uid)[0]
                          )),
                          Promise.resolve(doSyncRecordsResult.clientRecs)
                        ])))
                  .spread((syncResponse, updatedRecord, clientRecs) => Promise.all([
                    // TODO: sync with acknowledgements (still old dataset hash)
                    Promise.resolve(syncResponse),
                    Promise.resolve(updatedRecord),
                    Promise.resolve(clientRecs)

                  ]))
                  .spread((syncResponse, updatedRecord, clientRecs) =>
                          doSyncRecords('result', clientRecs)
                          .then(doSyncRecordsResult => Promise.all([
                            Promise.resolve(syncResponse),
                            Promise.resolve(updatedRecord),
                            Promise.resolve(doSyncRecordsResult.clientRecs)
                          ]))))
          .spread((syncResponse, updatedRecord, clientRecs) => act('Device: sync Complete result', () => create(
            'result',
            makeResult.updateComplete(updatedRecord.data.id, user.id, myWorkorderId),
            updatedRecord, hashes.result, {}, [], 'update')))
          .then(() => runner.actEnd('Mobile Flow'))
          .then(() => sessionToken));
  };
};
