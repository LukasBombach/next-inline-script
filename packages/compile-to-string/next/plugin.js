/* eslint-disable  @typescript-eslint/no-var-requires */

const { name } = require('../package.json');

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

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options);
      }

      return config;
    },
  });
};
