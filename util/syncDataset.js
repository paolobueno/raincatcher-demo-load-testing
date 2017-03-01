'use strict';
const urlFor = require('./urlFor');
const requestBodyUtils = require('./sync_request_bodies');

module.exports = function syncDataset(baseUrl, request, clientId, name) {
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
};
