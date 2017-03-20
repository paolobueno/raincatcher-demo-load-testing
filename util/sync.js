'use strict';

const urlFor = require('./urlFor');
const requestBodyUtils = require('./sync_request_bodies');

module.exports = function sync(baseUrl, request, clientIdentifier, name) {
  const reqBody = requestBodyUtils.getSyncRequestBody({
    // TODO: take a dataset_hash as a parameter
    // TODO: take acknowledgements as a parameter
    // TODO: just take this entire object as a parameter?
    dataset_id: name,
    query_params: {}, // TODO: mobile clients filter some datasets here
    meta_data: {
      sync_frequency: 5,
      storage_strategy: "dom",
      do_console_log: false,
      clientIdentifier: clientIdentifier
    },
    pending: []
  });

  return request.post({
    url: urlFor(baseUrl, name),
    body: reqBody,
    json: true
  });
};
