'use strict';
const configureRequest = require('../util/configureRequest');
const requestBodyUtils = require('../util/sync_request_bodies');
const recordUtils = require('../util/generate_record');
const makeUser = require('../util/fixtures/makeUser');
const makeWorkorder = require('../util/fixtures/makeWorkorder');
const makeWorkflow = require('../util/fixtures/makeWorkflow');
const Promise = require('bluebird');
let baseUrl = '';
let clientId = '';
let request;

function urlFor(dataset) {
  return `${baseUrl}/mbaas/sync/${dataset}`;
}

function syncDataset(name) {
  const payload = requestBodyUtils.getSyncRecordsRequestBody({
    dataset_id: name,
    meta_data: {
      clientIdentifier: clientId
    },
    pending: []
  });
  return request.post({
    url: urlFor(name),
    body: payload,
    json: true
  }).then();
}

function create(dataset, data) {
  const payload = requestBodyUtils.getSyncRecordsRequestBody({
    fn: 'sync',
    meta_data: {
      clientIdentifier: clientId
    },
    pending: [recordUtils.generateRecord(data)]
  });
  return request.post({
    url: urlFor('workorders'),
    body: payload,
    json: true
  }).then(() => data);
}

module.exports = function(runner, argv) {
  return function(previousResolution) {
    runner.actStart('Portal Flow');
    baseUrl = argv.app;
    clientId = previousResolution.clientIdentifier;
    request = configureRequest(clientId, previousResolution.sessionToken);

    // sync everything
    runner.actStart('Portal: initialSync');
    var syncPromise = Promise.all([
      syncDataset('workorders'),
      syncDataset('workflows'),
      syncDataset('result'),
      syncDataset('messages'),
      syncDataset('user')
    ]);

    return syncPromise
    .then(() => Promise.all([
      create('user', makeUser(1)),
      create('workflows', makeWorkflow(1))
    ]))

    .then(arr =>
      // ([user, workflow] => // no destructuring without flags in node 4.x :(
      create('workorders', makeWorkorder(String(arr[0].id), String(arr[1].id))))

    .then(function() {
      runner.actEnd('Portal: initialSync');
      runner.actEnd('Portal Flow');
      return Promise.resolve(previousResolution);
    });
  };
};