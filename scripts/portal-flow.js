module.exports = function(runner) {
  return function(previousResolution) {
    runner.actStart('Portal Flow');
    runner.actEnd('Portal Flow');
    return Promise.resolve(previousResolution);
  };
};