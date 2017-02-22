'use strict';
const configureRequest = require('../util/configureRequest');
const requestBodyUtils = require('../util/sync_request_bodies');
const recordUtils = require('../util/generate_record');
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
  });
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
  });
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
    // create workorder
    .then(() => create('workorders', {
      "type": "Job Order",
      "status": "New",
      "workflowId": "B1r71fOBr",
      "assignee": "rkX1fdSH",
      "title": "test",
      "address": "asdfzxcv",
      "location": {
        "0": -2,
        "1": -2
      },
      "finishDate": "2017-05-05T04:01:00Z",
      "finishTime": "2017-05-05T04:01:00Z",
      "summary": "blah",
      "startTimestamp": "2017-05-05T04:01:00Z",
      "_localuid": "1ea4997ad3aff8b1b9e2452537209da57fa3e1f4"
    }))
    // create workflow
    // create user
    // create message
    .then(function() {
      runner.actEnd('Portal: initialSync');
      runner.actEnd('Portal Flow');
      return Promise.resolve(previousResolution);
    });
  };
};