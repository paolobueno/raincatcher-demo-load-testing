'use strict';

module.exports = function syncDataset(baseUrl, request, clientId, dataset, clientRecs) {
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
