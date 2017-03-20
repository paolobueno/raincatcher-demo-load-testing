'use strict';

module.exports = function makeWorkorder(userId, workflowId) {
  return {
    assignee: userId,
    title: `Load test workorder for ${userId}`,
    type: "Job Order",
    status: "New",
    workflowId: workflowId,
    address: "The Moon, Earth Orbit",
    location: {
      "0": 4,
      "1": 4
    },
    finishDate: "2029-02-23T00:00:00Z",
    finishTime: "2029-02-23T00:00:00Z",
    summary: "Do the work",
    // TODO: for some reason 'startTimestamp' now shows up as 'finish date/time' in the portal
    startTimestamp: "2017-02-23T00:00:00Z"
  };
};
