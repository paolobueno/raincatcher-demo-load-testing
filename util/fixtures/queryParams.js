'use strict';

module.exports = function queryParams(userId) {
  return {
    workflows: {},
    result: {},
    workorders: {
      filter: {
        key: "assignee",
        value: userId
      }
    },
    messages: {
      filter: {
        key: "receiverId",
        value: userId
      }
    }
  };
};
