'use strict';

const urlFor = require('./urlFor');
const requestBodyUtils = require('./sync_request_bodies');

module.exports = function sync(baseUrl, request, clientIdentifier, name) {
  const reqBody = requestBodyUtils.getSyncRequestBody({
    dataset_id: name,
    query_params: {
      "filter": {
        "key": "assignee",
        "value": "rkX1fdSH"
      }
    },
    meta_data: {
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
