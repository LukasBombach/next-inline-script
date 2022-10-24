const { name } = require("./package.json");

class NextInlineScriptPlugin {
  // Define `apply` as its prototype method which is supplied with compiler as its argument
  apply(compiler) {
    compiler.hooks.normalModuleFactory.tap(NextInlineScriptPlugin.name, nmf => {
      nmf.hooks.beforeResolve.tap(NextInlineScriptPlugin.name, resolveData => {
        console.log("# REQ", resolveData.request);

        if (typeof resolveData.request === "string" && resolveData.request.test(/next-inline-script\/test-loader/)) {
          debugger;
        }
      });
    });
  }
}

/**
 * @param {import('next').NextConfig} nextConfig
 */
module.exports = (nextConfig = {}) => {
  return Object.assign({}, nextConfig, {
    /**
     * @param {import('webpack').Configuration} config
     * @param {unknown} options
     */
    webpack(config, options) {
      // rules are chained and applied bottom to top so this
      // one will modify the original sources and then let
      // next transpile everything
      config.module.rules.push({
        test: /\.(tsx|ts)$/,
        exclude: /node_modules/,
        use: `${name}/webpack/cheap-replace-loader.js`,
      });

      config.plugins.push(new NextInlineScriptPlugin());

      if (typeof nextConfig.webpack === "function") {
        return nextConfig.webpack(config, options);
      }

      return config;
    },
  });
};
