'use script';

module.exports = function(runner, argv) {
  return function(previousResolution) {
    runner.actStart('Mobile Flow');
    runner.actEnd('Mobile Flow');
    return Promise.resolve(previousResolution);
  };
};
