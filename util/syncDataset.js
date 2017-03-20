'use strict';

const urlFor = require('./urlFor');

module.exports = function syncDataset(baseUrl, request, clientId, name, clientRecs) {
  const payload = {
    fn: 'syncRecords',
    dataset_id: name,
    query_params: {},
    meta_data: {
      clientIdentifier: clientId
    },
    clientRecs: clientRecs
  };

  return request.post({
    url: urlFor(baseUrl, name),
    body: payload,
    json: true
  });
};
