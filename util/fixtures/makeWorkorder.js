module.exports = function makeWorkorder(user) {
  return {
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
  };
};