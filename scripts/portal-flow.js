'use strict';

const configureRequest = require('../util/configureRequest');
const requestBodyUtils = require('../util/sync_request_bodies');
const recordUtils = require('../util/generate_record');
const makeUser = require('../util/fixtures/makeUser');
const makeWorkorder = require('../util/fixtures/makeWorkorder');
const makeWorkflow = require('../util/fixtures/makeWorkflow');
const makeMessage = require('../util/fixtures/makeMessage');
const createUserAndGroup = require('../util/createUserAndGroup');
const promiseAct = require('../util/promiseAct');
const Promise = require('bluebird');

function urlFor(baseUrl, dataset) {
  return `${baseUrl}/mbaas/sync/${dataset}`;
}

function syncDataset(baseUrl, request, clientId, name) {
  const payload = requestBodyUtils.getSyncRecordsRequestBody({
    dataset_id: name,
    meta_data: {
      clientIdentifier: clientId
    },
    pending: []
  });
  return request.post({
    url: urlFor(baseUrl, name),
    body: payload,
    json: true
  });
}

function createRecord(baseUrl, request, clientId, dataset, data) {
  const payload = requestBodyUtils.getSyncRecordsRequestBody({
    fn: 'sync',
    meta_data: {
      clientIdentifier: clientId
    },
    pending: [recordUtils.generateRecord(data)]
  });
  return request.post({
    url: urlFor(baseUrl, dataset),
    body: payload,
    json: true
  }).then(() => data);
}

module.exports = function portalFlow(runner, argv) {
  return function portalFlowAct(previousResolution) {
    runner.actStart('Portal Flow');
    const baseUrl = argv.app;
    const clientId = previousResolution.clientIdentifier;
    const request = configureRequest(clientId, previousResolution.sessionToken);

    // partially apply constant params so further calls are cleaner
    const create = createRecord.bind(this, baseUrl, request, clientId);
    const doSync = syncDataset.bind(this, baseUrl, request, clientId);

    const syncPromise = promiseAct(runner, 'Portal: initialSync', () => Promise.all([
      doSync('workorders'),
      doSync('workflows'),
      doSync('result'),
      doSync('messages')
    ]));

    return syncPromise.then(() => Promise.all([
      promiseAct(runner, 'Portal: create user and group',
        () => createUserAndGroup(request, baseUrl, makeUser(1))),
      promiseAct(runner, 'Portal: create workflow',
        () => create('workflows', makeWorkflow(1)))
    ]))

    .spread((user, workflow) =>
      Promise.all([
        promiseAct(runner, 'Portal: create workorder',
          () => create('workorders', makeWorkorder(String(user.id), String(workflow.id)))),
        promiseAct(runner, 'Portal: create message',
          () => create('messages', makeMessage(user)))
      ]))

    .then(() => {
      runner.actEnd('Portal Flow');
      return Promise.resolve(previousResolution);
    });
  };
};
