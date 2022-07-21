/* eslint-disable @typescript-eslint/no-var-requires */

const { minify } = require('terser');

/**
 * This loader will compile and bundle the file it has been called on
 * along with its dependencies and create a module that returns the
 * bundle's source code as a string
 *
 * Webpack is badly documented and a lot of thing you will have to
 * search for for a while so here are some useful links:
 *
 *  - how to set the library target of the child compiler
 *    https://github.com/webpack/webpack/issues/11909
 *
 * Known Caveats and todos:
 *
 *  - The code is being compiled via a child compiler, which uses the
 *    config it gets from the compilation process it is called from.
 *    The parent compilation may not fit our needs of creating opti-
 *    mized client-side code. Next for instance compiles things on the
 *    server so we need to watch out of this and override configs that
 *    do not fit our needs here
 *
 *  - The compiled output will not be minified, and it is very hard
 *    to get the parent compiler's TerserPlugin working
 *
 *  - the compiled code exports some esModule definitions that we don't
 *    need
 *
 * @type {import('webpack').LoaderDefinitionFunction}
 */
module.exports = function compileToStringLoader(content, map, meta) {
  const COMPILER_NAME = 'CompileToString Child Compiler';
  const isDev = this._compilation.options.mode === 'development';
  const loaderCallback = this.async();

  /**
   * We are running into an issue where our node process crashes with
   * an error that reads "heap out of memory" and it might be related
   * to the cache not being cleared properly. We don't know of that
   * really is the case yet, nor do we know if this setting will patch
   * this (as an interim fix), but we want to try this albeit this
   * being a shot in the dark.
   */
  this.cacheable(false);

  const outputOptions = {
    /**
     * We are matching the chunk file output of next js so that integration with next
     * and possibly plugins of next go smoothly
     */
    filename: isDev ? 'static/chunks/[id].js' : 'static/chunks/[id]-[chunkhash].js',

    /**
     * This prevents webpack from wrapping the generated sources in an iife
     * We do this, because we are wrapping the source in our own iife that
     * other that webpack's iife returns the module output to its caller
     * This allows us to access the module exports in our app
     *
     * webpack iife: !function(){ module.exports = ... }()
     * our iife (function(){ module.exports = ...; return module.exports; }())
     *
     * this allows us to create inline scripts like so
     *
     * <script>
     *   (function(){ module.exports = ...; return module.exports; }()).myModuleFunction()
     * </script>
     */
    iife: false,

    /**
     * Webpack can generate output formats (esm, jsonp, you name it)
     * `commonjs-module` generates code that assings its bundle to module.exports.
     * This is a little trick, browsers cannot consume commonjs modules, but we
     * need to decide on _some_ way to expose our module to the outside and
     * webpack provides a limited set of options.
     * What we do here is to have webpack generate the source as module.exports = x
     * and we wrap that generated code in our own iife which defines and accesses
     * the module var in a closure sourrounding the generated module code.
     * This way we can access the exports.
     */
    library: {
      type: 'commonjs-module',
    },
  };

  /**
   * we need to set module: true to tell terser to minify top-level variable
   * names and omit some boilerplate code
   */
  const terserOptions = { module: true };

  /**
   * setting compress: false and mangle: true will speed up terer up to 3-4x
   * which we use for dev mode. Terser itself documents this under the name
   * `fastMinifyMode`
   */
  const terserFastMinifyMode = { compress: false, mangle: true };

  /**
   * This is important to prevent recursion, otherwise this compiler
   * _can_ possibly spawn another instance of itsself recursively because
   * will reuse its parent's settings and loaders which in turn will call
   * this compiler
   */
  if (this._compiler.name === COMPILER_NAME) {
    loaderCallback(new Error(`Recursively calling ${COMPILER_NAME}, this should not happen`));
  }

  /**
   * We are creating a child compiler from the current compilation which
   * allows us to independently compile code with the same config as
   * the compilation that the rest of the code is using
   *
   * We can also override settings from the parent compiler by passing
   * plugins as the third parameter
   */
  const childCompiler = this._compilation.createChildCompiler(COMPILER_NAME, outputOptions, [
    new this._compiler.webpack.LoaderTargetPlugin('web'),
    new this._compiler.webpack.EntryPlugin(this._compiler.context, this.resourcePath),
    new this._compiler.webpack.library.EnableLibraryPlugin('commonjs-module'),
  ]);

  /**
   * This removes the cheap-replace-loader from all module requests so we
   * won't process files of the child compilation with this library.
   * If we don't do this we might run add a compilation process with every
   * re-compilation in dev mode and exeed the JS heap's memory eventually
   */
  childCompiler.hooks.thisCompilation.tap(COMPILER_NAME, compilation => {
    const normalModuleHook = this._compiler.webpack.NormalModule.getCompilationHooks(compilation).loader;
    normalModuleHook.tap(COMPILER_NAME, (_loaderContext, module) => {
      module.loaders = module.loaders.filter(l => !l.loader.endsWith('cheap-replace-loader.js'));
    });
  });

  /**
   * This will start the compilation and call a callback when its done
   * we still need to apply error handling and extract the source code
   * files that webpack generated.
   *
   * There is no way to tell webpack to return its output as a string so
   * we need to take this little extra route
   */
  childCompiler.runAsChild(async (error, entries, childCompilation) => {
    try {
      const { warnings, errors } = childCompilation?.getStats().toJson() ?? {};
      const fileName = isDev ? entries[0].id : `${entries[0].id}-${entries[0].hash.substr(0, 20)}`;
      const source = childCompilation?.assets[`static/chunks/${fileName}.js`]?.source();

      if (isDev) {
        Object.assign(terserOptions, terserFastMinifyMode);
      }

      if (warnings.length) {
        warnings.forEach(warning => console.warn(warning));
      }

      if (error) {
        throw error;
      }

      if (errors.length) {
        throw new Error(errors[0].message);
      }

      if (!source) {
        throw new Error('Failed to get source in vanilla extract loader');
      }

      const { code } = await minify(source, terserOptions);

      const iifeThatReturnsModuleExports = `(function () {var module = {};${code};return module.exports;})()`;
      const moduleThatReturnsTheSourceAsString = `module.exports = ${JSON.stringify(iifeThatReturnsModuleExports)};`;

      loaderCallback(null, moduleThatReturnsTheSourceAsString);
    } catch (error) {
      loaderCallback(error);
    }
  });
};
