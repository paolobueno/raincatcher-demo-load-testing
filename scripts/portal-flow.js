'use strict';

const configureRequest = require('../util/configureRequest');
const requestBodyUtils = require('../util/sync_request_bodies');
const recordUtils = require('../util/generate_record');
const makeUser = require('../util/fixtures/makeUser');
const makeWorkorder = require('../util/fixtures/makeWorkorder');
const makeWorkflow = require('../util/fixtures/makeWorkflow');
const makeMessage = require('../util/fixtures/makeMessage');
const createUserAndGroup = require('../util/createUserAndGroup');
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
  }).then();
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

module.exports = function(runner, argv) {
  return function(previousResolution) {
    runner.actStart('Portal Flow');
    const baseUrl = argv.app;
    const clientId = previousResolution.clientIdentifier;
    const request = configureRequest(clientId, previousResolution.sessionToken);

    // partially apply constant params so further calls are cleaner
    const create = createRecord.bind(this, baseUrl, request, clientId);
    const doSync = syncDataset.bind(this, baseUrl, request, clientId);

    // sync everything
    runner.actStart('Portal: initialSync');
    const syncPromise = Promise.all([
      doSync('workorders'),
      doSync('workflows'),
      doSync('result'),
      doSync('messages')
    ]).then(() => runner.actEnd('Portal: initialSync'));

    return syncPromise
    .then(() => Promise.all([
      createUserAndGroup(request, baseUrl, makeUser(1)),
      create('workflows', makeWorkflow(1))
    ]))

    .then(arr =>
      // ([user, workflow] => // no destructuring without flags in node 4.x :(
      Promise.all([
        create('workorders', makeWorkorder(String(arr[0].id), String(arr[1].id))),
        create('messages', makeMessage(arr[0]))
      ])
    )

    .then(function() {
      runner.actEnd('Portal Flow');
      return Promise.resolve(previousResolution);
    })
    .catch(console.error);
  };
};
