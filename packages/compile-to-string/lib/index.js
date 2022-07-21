// The name of this parameter is path, so code editors show this
// in their intellisense, but what is actually happening is that
// the path that developers provide get replace with the source
// code of the path, so we really don't have to do anything here
// other than returning the provided source string
module.exports.compileToString = function compileToString(path) {
  return path;
};
