'use strict';

const recordUtils = require('./generate_record');
const makeSyncBody = require('./fixtures/makeSyncBody');
const sync = require('./sync');

module.exports = function createRecord(baseUrl, request, clientId, dataset, data, dataset_hash, query_params, acknowledgements) {

  const pending = [recordUtils.generateRecord(data)];
  const payload = makeSyncBody(dataset, clientId, dataset_hash, query_params, pending, acknowledgements);

  return sync(request, `${baseUrl}/mbaas/sync/${dataset}`, payload).then(() => data);
};
