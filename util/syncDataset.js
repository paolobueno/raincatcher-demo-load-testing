'use strict';

const _ = require('lodash');


function updateClientRecs(inRecs, syncRecordsResponse) {
  const deletedRecs = _.keys(syncRecordsResponse.delete);
  const createdRecs = _.transform(syncRecordsResponse.create, (acc, rec) => acc[rec.data.id] = rec.hash);
  const updatedRecs = _.transform(syncRecordsResponse.update, (acc, rec) => acc[rec.data.id] = rec.hash);
  const outRecs = _.merge(_.omit(inRecs, deletedRecs), createdRecs, updatedRecs);

  return outRecs;
}

module.exports = function syncDataset(baseUrl, request, clientId, dataset, previousSyncRecordsResult) {

  // TODO: use `updateClientRecs` function above so that updates and deletes are handled
  // it'll mean that 'clientRecs' will need to be passed into (and out of) this function
  // Maybe that updateClientRecs function should be somewhere else than this function, and just pass in the pre-processed clientRecs here, and not previousSyncrecordsresult (and old clientRecs)
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
