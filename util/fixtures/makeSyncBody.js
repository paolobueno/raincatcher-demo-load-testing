'use strict';

const requestBodyUtils = require('../sync_request_bodies');

module.exports = function makeRequestBodyOverrides(name, clientIdentifier, dataset_hash, query_params, pending, acknowledgements) {
  return requestBodyUtils.getSyncRequestBody({
    dataset_id: name,
    query_params: query_params,
    meta_data: {
      clientIdentifier: clientIdentifier
    },
    pending: pending,
    acknowledgements: acknowledgements,
    dataset_hash: dataset_hash
  });
};
