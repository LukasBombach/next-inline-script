module.exports = function testLoader(content, map, meta) {
  const loaderCallback = this.async();

  debugger;

  loaderCallback(null, `module.exports = ${JSON.stringify("(() => { console.log('test loader'); })()")};`);
};

module.exports.pitch = function (remainingRequest, precedingRequest, data) {
  debugger;
};
