module.exports = function(runner) {
  return function(previousResolution) {
    runner.actStart('Mobile Flow');
    runner.actEnd('Mobile Flow');
    return Promise.resolve(previousResolution);
  };
};