'use strict';

const urlFor = require('./urlFor');
const recordUtils = require('./generate_record');
const requestBodyUtils = require('./sync_request_bodies');

module.exports = function createRecord(baseUrl, request, clientId, dataset, data) {

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
};
