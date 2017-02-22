'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const rp = require('request-promise');
const login = require('../util/login');
const recordUtils = require('../util/generate_record.js');
const requestBodyUtils = require('../util/sync_request_bodies');
const argv = require('yargs')
      .reset()
      .option('app', {
        demand: true,
        type: 'string',
        alias: 'a',
        describe: 'Cloud app base URL to target'
      })
      .option('username', {
        demand: true,
        type: 'string',
        alias: 'u',
        describe: 'Username to use to login to the app'
      })
      .option('password', {
        demand: true,
        type: 'string',
        alias: 'p',
        describe: 'Password to use to login to the app'
      })
      .option('numUsers', {
        demand: true,
        type: 'number',
        alias: 'n',
        describe: 'The number of users/workorders needed'
      })
      .option('concurrency', {
        demand: true,
        type: 'number',
        alias: 'c',
        describe: 'The concurrency at which to create resources'
      })
      .argv;

function makeUser(id) {
  return {
    "password": "123",
    "name" : "Jim Loader",
    "phone" : "(999) 999 9999",
    "username" : `loaduser${id}`,
    "group": "Syl1GdSS", // Drivers
    "position" : "Senior Load Tester",
    "email" : `loaduser${id}@example.com`,
    "notes" : "There certainly are a lot of Jim's around here...",
    "banner" : "https://www.walldevil.com/wallpapers/w01/awesome-face-meme-wallpaper.jpg",
    "avatar" : "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/718smiley.svg/2000px-718smiley.svg.png"
  };
}

function postUsers(sessionToken, numUsers, concurrency) {
  const users = _.times(numUsers, makeUser);
  const sessionRequest = rp.defaults({
    json: true,
    headers: requestBodyUtils.getSyncRequestHeaders({'X-FH-sessionToken': sessionToken})
  });

  process.stdout.write(`Creating users at a concurrency of ${concurrency}`);
  return Promise.map(users, user => {
    process.stdout.write('.');
    return sessionRequest.post({
      url: `${argv.app}/api/wfm/user`,
      body: user
    })
      .then(createdUser => sessionRequest.post({
        url: `${argv.app}/api/wfm/membership`,
        body: {group: createdUser.group, user: createdUser.id}
      }));
  }, {concurrency: concurrency}) // concurrency of users to process
    .then(membershipResultsArray => {
      console.log('done!');
      return {
        sessionRequest: sessionRequest,
        users: membershipResultsArray.map(res => res.user)
      };
    });
}

function initialSync(previousResolution) {
  const sessionRequest = previousResolution.sessionRequest;
  const users = previousResolution.users;

  const reqBody = requestBodyUtils.getSyncRequestBody({
    dataset_id: 'workorders',
    pending: []
  });

  return new Promise(resolve => sessionRequest.post({
    url: `${argv.app}/mbaas/sync/workorders`,
    body: reqBody,
    json: true
  }).then(resBody => {
    const resolution = {
      users: users,
      serverHash: resBody.hash,
      sessionRequest: sessionRequest
    };
    return resolve(resolution);
  }));
}

function makeWorkorderRecords(previousResolution) {
  const users = previousResolution.users;
  const serverHash = previousResolution.serverHash;
  const sessionRequest = previousResolution.sessionRequest;

  const records = users.map(user => recordUtils.generateRecord({
    assignee: user,
    title: `Load test workorder for ${user}`,
    type: "Job Order",
    status: "New",
    workflowId: "HJ8QkzOSH",
    address: "The Moon, Earth Orbit",
    location: {
      "0": 4,
      "1": 4
    },
    finishDate: "2029-02-23T00:00:00Z",
    finishTime: "2029-02-23T00:00:00Z",
    summary: "Do the work",
    startTimestamp: "2017-02-23T00:00:00Z"
  }));

  return {
    records: records,
    serverHash: serverHash,
    sessionRequest: sessionRequest
  };
}

function batchWorkorderRecords(previousResolution, batchSize) {
  console.log(`Creating workorders in batches of ${batchSize}.`);
  return {
    serverHash: previousResolution.serverHash,
    sessionRequest: previousResolution.sessionRequest,
    recordBatches: _.chunk(previousResolution.records, batchSize)
  };
}

function sendWorkorderSyncRequests(previousResolution) {
  const serverHash = previousResolution.serverHash;
  const recordBatches = previousResolution.recordBatches;
  const sessionRequest = previousResolution.sessionRequest;

  process.stdout.write('Sending batches over sync');
  return Promise.mapSeries(recordBatches, batch => {
    const body = requestBodyUtils.getSyncRequestBody({
      dataset_id: 'workorders',
      dataset_hash: serverHash,
      pending: batch
    });
    process.stdout.write('.');
    return sessionRequest.post({
      url: `${argv.app}/mbaas/sync/workorders`,
      body: body
    });
  }).then(() => console.log('done!'));
}

login({ actStart: _.noop, actEnd: _.noop }, rp, argv.app, argv.username, argv.password)
  .then(sessionToken => postUsers(sessionToken, argv.numUsers, argv.concurrency))
  .then(initialSync)
  .then(makeWorkorderRecords)
  .then(res => batchWorkorderRecords(res, argv.concurrency))
  .then(sendWorkorderSyncRequests)
  .catch(console.err);
