module.exports = function(runner, argv) {
  return function(previousResolution) {
    runner.actStart('Portal Flow');
    runner.actEnd('Portal Flow');
    return Promise.resolve(previousResolution);
  };
};