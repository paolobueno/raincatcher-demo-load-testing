'use strict';

const _ = require('lodash');

/**
 * Get a base `sync` request body.
 *
 * @returns {Object} - A base `sync` request body.
 */
function getBaseSyncBody() {
  return ({
    fn: 'sync',
    dataset_id: 'myShoppingList',
    query_params: {},
    config: {
      "sync_frequency": 10,
      "auto_sync_local_updates": true,
      "notify_client_storage_failed": true,
      "notify_sync_started": true,
      "notify_sync_complete": true,
      "notify_offline_update": true,
      "notify_collision_detected": true,
      "notify_remote_update_failed": true,
      "notify_local_update_applied": true,
      "notify_remote_update_applied": true,
      "notify_delta_received": true,
      "notify_record_delta_received": true,
      "notify_sync_failed": true,
      "do_console_log": true,
      "crashed_count_wait": 10,
      "resend_crashed_updates": true,
      "sync_active": true,
      "storage_strategy": "dom",
      "file_system_quota": 61644800,
      "has_custom_sync": false,
      "icloud_backup": false
    },
    meta_data: {},
    dataset_hash: 'c3893f5314ca1a5e01b961497dafba3fb938aa3d',
    acknowledgements: [],
    pending: []
  });
}

/**
 * Get a base `headers` object, without prepended `X-FH-`.
 *
 * @returns {Object} - A base `headers` object.
 */
function getBaseRequestHeaders() {
  return ({
    'X-FH-appid': "ExampleAppId",
    'X-FH-appkey': "ExampleAppKey",
    'X-FH-apptitle': 'SyncLoadTesting',
    'X-FH-connectiontag': '0.0.1',
    'X-FH-cuid': 'ExampleCuid',
    'X-FH-host': 'http://localhost:8001',
    'X-FH-projectid': 'SyncLoadTesting',
    'X-FH-sdk_version': 'FH_JS_SDK/2.18.1'
  });
}

/**
 * Get a base `sync records` request body.
 *
 * @returns {Object} - A base `sync records` request body.
 */
function getBaseSyncRecordsBody() {
  return ({
    fn: 'syncRecords',
    dataset_id: 'myShoppingList',
    query_params: {},
    clientRecs: {}
  });
}

/**
 * Get a copy of the default headers merged with the provided options.
 *
 * @param {Object} options - The object to merge with the base headers.
 * @returns {Object} - Sync request headers.
 */
function getSyncRequestHeaders(options) {
  return (_.merge(getBaseRequestHeaders(), options));
}

/**
 * Get a copy of a blank sync request body merged with the provided options.
 *
 * @param {Object} options - The object to merge the base body with.
 * @returns {Object} - A sync request body.
 */
function getSyncRequestBody(options) {
  return (_.merge(getBaseSyncBody(), options));
}

/**
 * Get a copy of a blank sync records request body merged with the provided
 * options.
 *
 * @param {Object} options - The object to merge the base body with.
 * @returns {Object} - A syncRecords request body.
 */
function getSyncRecordsRequestBody(options) {
  return (_.merge(getBaseSyncRecordsBody(), options));
}

module.exports = {
  getSyncRequestHeaders: getSyncRequestHeaders,
  getSyncRequestBody: getSyncRequestBody,
  getSyncRecordsRequestBody: getSyncRecordsRequestBody
};
