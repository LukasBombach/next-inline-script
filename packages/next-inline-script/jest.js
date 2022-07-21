const { createElement, useEffect } = require('react');
const { default: dynamic } = require('next/dynamic');

module.exports.createInlineScript = function createInlineScript(promiseReturningTheCompiledScriptAsString) {
  return dynamic(async () => {
    const { getScriptProps } = await promiseReturningTheCompiledScriptAsString;
    return props => {
      // If you expect specific elements to exist in your inline code
      // and in you render those elements in your test setup with react,
      // they might not have been mounted yet (because react is still rendering)
      // this useEffect will postpone the execution of the inline script after
      // the initial render phase so the inital DOM will be available
      useEffect(() => {
        getScriptProps(props);
      });

      return createElement('script', {}, '/* inline script source not visible for jest, but executed properly */');
    };
  });
};
