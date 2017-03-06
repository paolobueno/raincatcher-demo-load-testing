'use strict';

const urlFor = require('./urlFor');
const recordUtils = require('./generate_record');
const requestBodyUtils = require('./sync_request_bodies');

module.exports = function createRecord(baseUrl, request, clientId, dataset, data, dataset_hash, action) {

  const meta_data = clientId ? { clientIdentifier: clientId } : null;
  const payload = requestBodyUtils.getSyncRecordsRequestBody({
    fn: 'sync',
    dataset_id: dataset,
    dataset_hash: dataset_hash,
    meta_data: meta_data,
    pending: [recordUtils.generateRecord(data)]
  });
  return request.post({
    url: urlFor(baseUrl, dataset),
    body: payload,
    json: true
  }).then(() => data);
};
