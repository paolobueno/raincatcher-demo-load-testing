'use strict';

const configureRequest = require('../util/configureRequest');
const syncDataset = require('../util/syncDataset');
const createRecord = require('../util/createRecord');
const makeUser = require('../util/fixtures/makeUser');
const makeWorkorder = require('../util/fixtures/makeWorkorder');
const makeWorkflow = require('../util/fixtures/makeWorkflow');
const makeMessage = require('../util/fixtures/makeMessage');
const createUserAndGroup = require('../util/createUserAndGroup');
const promiseAct = require('../util/promiseAct');
const Promise = require('bluebird');

module.exports = function portalFlow(runner, argv) {
  return function portalFlowAct(previousResolution) {
    runner.actStart('Portal Flow');
    const baseUrl = argv.app;
    const clientId = previousResolution.clientIdentifier;
    const request = configureRequest(clientId, previousResolution.sessionToken);

    // partially apply constant params so further calls are cleaner
    const create = createRecord.bind(this, baseUrl, request, clientId);
    const doSync = syncDataset.bind(this, baseUrl, request, clientId);

    const syncPromise = promiseAct(runner, 'Portal: initialSync', () => Promise.all([
      doSync('workorders'),
      doSync('workflows'),
      doSync('result'),
      doSync('messages')
    ]));

    return syncPromise.then(() => Promise.all([
      promiseAct(runner, 'Portal: create user and group',
        () => createUserAndGroup(request, baseUrl, makeUser(1))),
      promiseAct(runner, 'Portal: create workflow',
        () => create('workflows', makeWorkflow(1)))
    ]))

    .then(arr =>
      // ([user, workflow] => // no destructuring without flags in node 4.x :(
      Promise.all([
        promiseAct(runner, 'Portal: create workorder',
          () => create('workorders', makeWorkorder(String(user.id), String(workflow.id)))),
        promiseAct(runner, 'Portal: create message',
          () => create('messages', makeMessage(user)))
      ]))

    .then(() => {
      runner.actEnd('Portal Flow');
      return Promise.resolve(previousResolution);
    });
  };
};
