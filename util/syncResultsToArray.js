'use strict';
const _ = require('lodash');
module.exports = function syncResultsToArray(results, key) {
  // each result is in the form
  // {
  //   create:
  //   {
  //     rkX1fdSH: [Object],
  //     rJeXyfdrH: [Object],
  //     ByzQyz_BS: [Object],
  //     ByzQyz_Bw: [Object],
  //     SyVXyMuSr: [Object],
  //     B1r71fOBr: [Object],
  //     HJ8QkzOSH: [Object],
  //     BJwQJfdrH: [Object],
  //     HJQTjsUr: [Object],
  //     Syx76jiUH: [Object],
  //     HJbXpioIS: [Object],
  //     ryMXaos8S: [Object],
  //     SJEXaso8r: [Object],
  //     H1H76ij8r: [Object],
  //     BkuXajsIB: [Object],
  //     B1ZVqK_Q5x: [Object],
  //     'rk-aqKOQcx': [Object]
  //   },
  //   update: {},
  //   delete: {},
  //   hash: '31124754f5f8867d4348cfff23294881442c9ffa'
  // }

  // default params only available by default on node 6.x
  key = key || 'create';
  return _(results).map(key)
    // ids is an object of id: {data, hash}
    .map(ids => _.map(ids, 'data'))
    .value();
};
