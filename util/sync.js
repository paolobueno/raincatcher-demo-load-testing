'use strict';

const urlFor = require('./urlFor');
const requestBodyUtils = require('./sync_request_bodies');

module.exports = function sync(baseUrl, request, clientIdentifier, name, dataset_hash, pending, acknowledgements, query_params) {
  const reqBody = requestBodyUtils.getSyncRequestBody({
    // TODO: just take this entire object as a parameter?
    dataset_id: name,
    query_params: query_params,
    meta_data: {
      clientIdentifier: clientIdentifier
    },
    pending: pending,
    acknowledgements: acknowledgements,
    dataset_hash: dataset_hash
  });

  return request.post({
    url: urlFor(baseUrl, name),
    body: reqBody,
    json: true
  });
};
