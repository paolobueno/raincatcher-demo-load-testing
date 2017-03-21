'use strict';

const _ = require('lodash');

module.exports = function syncDataset(baseUrl, request, clientId, dataset, previousSyncRecordsResult) {

  const creations = _.get(previousSyncRecordsResult, 'create', {});
  const clientRecs = _.transform(creations, (out, v, k) => out[k] = v.hash);
  const payload = {
    fn: 'syncRecords',
    dataset_id: dataset,
    query_params: {},
    meta_data: {
      clientIdentifier: clientId
    },
    clientRecs: clientRecs
  };

  return request.post({
    url: `${baseUrl}/mbaas/sync/${dataset}`,
    body: payload,
    json: true
  });
};
