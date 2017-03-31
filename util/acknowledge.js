'use strict';

const _ = require('lodash');
const Promise = require('bluebird');

function getCreatedRecord(syncResponse, syncRecordsResponse) {
  const newAndUpdated = _.merge(_.get(syncRecordsResponse, 'res.create', {}),
                                _.get(syncRecordsResponse, 'res.update', {}));

  return _.find(newAndUpdated, r => r.data.id === _.map(syncResponse.updates.applied, a => a.uid)[0]);
}

module.exports = function acknowledge(sync, syncRecords, makeSyncBody, baseUrl, clientId, datasets, dataset, incomingClientRecs, incomingSyncResponse) {

  const datasetUrl = `${baseUrl}/mbaas/sync/${dataset}`;

  return syncRecords(dataset, incomingClientRecs)

    .then(syncRecordsResponse => Promise.all([
      Promise.resolve(incomingSyncResponse),
      Promise.resolve(getCreatedRecord(incomingSyncResponse, syncRecordsResponse)),
      Promise.resolve(syncRecordsResponse.clientRecs)
    ]))

    .spread((syncResponse, createdRecord, clientRecs) => Promise.all([
      sync(datasetUrl, makeSyncBody(dataset, clientId, syncResponse.hash, {}, [], _.values(_.get(syncResponse, 'updates.applied')))),
      Promise.resolve(createdRecord),
      Promise.resolve(clientRecs)
    ]))

    .spread((syncResponse, createdRecord, clientRecs) =>
            syncRecords(dataset, clientRecs)
            .then(doSyncRecordsResult => Promise.all([
              Promise.resolve(syncResponse),
              Promise.resolve(createdRecord),
              Promise.resolve(doSyncRecordsResult.clientRecs)
            ])))

    .spread((syncResponse, createdRecord, clientRecs) => Promise.all([
      sync(datasetUrl, makeSyncBody(dataset, clientId, syncResponse.hash, {}, [], _.values(_.get(syncResponse, 'updates.applied')))),
      Promise.resolve(createdRecord),
      Promise.resolve(clientRecs)
    ]));
};
