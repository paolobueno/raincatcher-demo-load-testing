'use strict';

const _ = require('lodash');
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
    const datasets = ['workorders', 'workflows', 'messages', 'result'];
    const workflow = makeWorkflow(process.env.LR_RUN_NUMBER);

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
          Promise.all(datasets.map(ds => doSyncRecords(ds, clientRecs[datasets.indexOf(ds)])))
        ])));

    return syncPromise.spread((hashes, clientRecs) => Promise.all([
      Promise.resolve(hashes),
      Promise.resolve(clientRecs),
      act('Portal: create user and group', () => createUserAndGroup(request, baseUrl, makeUser(`-portalflow${process.env.LR_RUN_NUMBER}`))),
      act('Portal: create workflow', () => create('workflows', workflow, null, hashes.workflows, {}, [], 'create'))
        .then(workflow => doSyncRecords('workflows', clientRecs[datasets.indexOf('result')])
              .then(doSyncRecordsResult => Promise.all([
                Promise.resolve(workflow),
                Promise.resolve(_.find(
                  _.get(doSyncRecordsResult, 'res.create', {}),
                  r => r.data.id === _.map(workflow.updates.applied, a => a.uid)[0]
                )),
                Promise.resolve(doSyncRecordsResult.clientRecs)
              ])))
        .spread((syncResponse, createdRecord, clientRecs) => Promise.all([
          doSync(`${baseUrl}/mbaas/sync/workflows`, makeSyncBody('workflows', clientId, syncResponse.hash, {}, [], _.values(_.get(syncResponse, 'updates.applied')))),
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
        .spread((syncResponse, createdRecord, clientRecs) => Promise.all([
          doSync(`${baseUrl}/mbaas/sync/workflows`, makeSyncBody('workflows', clientId, syncResponse.hash, {}, [], _.values(_.get(syncResponse, 'updates.applied')))),
          Promise.resolve(createdRecord),
          Promise.resolve(clientRecs)
        ]))
    ]))

      .spread((hashes, clientRecs, user, workflowCreationResult) => Promise.all([
        act('Portal: create workorder', () => create('workorders', makeWorkorder(String(user.id), String(workflow.id)), null, hashes.workorders, {}, [], 'create'))
          .then(workorder => doSyncRecords('workorders', clientRecs[datasets.indexOf('result')])
                .then(doSyncRecordsResult => Promise.all([
                  Promise.resolve(workorder),
                  Promise.resolve(_.find(
                    _.get(doSyncRecordsResult, 'res.create', {}),
                    r => r.data.id === _.map(workorder.updates.applied, a => a.uid)[0]
                  )),
                  Promise.resolve(doSyncRecordsResult.clientRecs)
                ])))
          .spread((syncResponse, createdRecord, clientRecs) => Promise.all([
            doSync(`${baseUrl}/mbaas/sync/workorders`, makeSyncBody('workorders', clientId, syncResponse.hash, {}, [], _.values(_.get(syncResponse, 'updates.applied')))),
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
          .spread((syncResponse, createdRecord, clientRecs) => Promise.all([
            doSync(`${baseUrl}/mbaas/sync/workorders`, makeSyncBody('workorders', clientId, syncResponse.hash, {}, [], _.values(_.get(syncResponse, 'updates.applied')))),
            Promise.resolve(createdRecord),
            Promise.resolve(clientRecs)
          ])),
        act('Portal: create message', () => create('messages', makeMessage(user), null, hashes.messages, {}, [], 'create'))
          .then(message => doSyncRecords('messages', clientRecs[datasets.indexOf('result')])
                .then(doSyncRecordsResult => Promise.all([
                  Promise.resolve(message),
                  Promise.resolve(_.find(
                    _.get(doSyncRecordsResult, 'res.create', {}),
                    r => r.data.id === _.map(message.updates.applied, a => a.uid)[0]
                  )),
                  Promise.resolve(doSyncRecordsResult.clientRecs)
                ])))
          .spread((syncResponse, createdRecord, clientRecs) => Promise.all([
            doSync(`${baseUrl}/mbaas/sync/messages`, makeSyncBody('messages', clientId, syncResponse.hash, {}, [], _.values(_.get(syncResponse, 'updates.applied')))),
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
          .spread((syncResponse, createdRecord, clientRecs) => Promise.all([
            doSync(`${baseUrl}/mbaas/sync/messages`, makeSyncBody('messages', clientId, syncResponse.hash, {}, [], _.values(_.get(syncResponse, 'updates.applied')))),
            Promise.resolve(createdRecord),
            Promise.resolve(clientRecs)
          ]))
      ]))

      .then(() => runner.actEnd('Portal Flow'))
      .then(() => sessionToken);
  };
};
