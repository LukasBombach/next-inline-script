/* eslint-disable  @typescript-eslint/no-var-requires */

const { createElement } = require('react');
const { default: dynamic } = require('next/dynamic');

/**
 * The parameter of this function differs from the TypeScript definition
 * The reason for this is that the typesscript definition is what is being
 * exposed to other developers when they use this function. What they don't
 * see is that their implementation is being changed at build time and instead
 * of the script that they import, the (compiled) sources of their script are
 * being passed to this function. So the actual implementation differs a bit
 * from what developers get to see of it.
 *
 * The parameter this function receives is a promise resolving to the compiled
 * source-code of the script developers intend to import. It is not a function
 * that returns a promise, but the promise itself, so that is why there is this
 * weird line that just awaits a variable name
 *
 * @param {Promise<string>} promiseReturningTheCompiledScriptAsString
 * @returns {import('react').VFC}
 */
module.exports.createInlineScript = function createInlineScript(promiseReturningTheCompiledScriptAsString) {
  /**
   * We are getting a promise as a parameter (something that is asnyc) and we
   * return a react component (synchronously). If we were to wait for the
   * promise to resolve and return the react component, we would actually
   * have to return a promise returning the react component. Without react
   * suspence, that react component cannot be rendered. Currently, this is
   * an issue especially with SSR.
   *
   * Luckily, even without suspence, next js provides `next/dynamic` which
   * allows us to return the component synchronously and internally write
   * async code.
   *
   * This is why we wrap the entire return in `dynamic`
   */
  return dynamic(async () => {
    // This may look weird, we are waiting for a variable, not a function call.
    // The parameter we get is already a promise, that we need to wait for it to
    // resolve.
    const { default: compiledScriptSourcesAsString } = await promiseReturningTheCompiledScriptAsString;

    return props => {
      // We expected to export a function called `script` from developers using this library.
      // The script they provided to is now compiled as a string and resides inside
      // `compiledScriptSourcesAsString`. So what we have to do here is write the code to call
      // `script` as plain text
      //
      // At this print we are inside the react component returned by createInlineScript so we do
      // have the props available which we also include in the plain text source code.
      //
      // The string we generate here is the source code that ends up as the body of the script
      // node the the react component renders which now contains the module with its exports
      // and the call of its `script` export using the props of the react component.
      //
      // In other words: This calls the `script` function of the script (module) provided by the
      // developers using the props passed to the react component (the one we return)
      const scriptContents = `${compiledScriptSourcesAsString}.getScriptProps(${JSON.stringify(props)});`;
      return createElement('script', { dangerouslySetInnerHTML: { __html: scriptContents } }, null);
    };
  });
};
