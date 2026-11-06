// babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@services': './services',
            '@store': './store',
            '@screens': './screens',
            '@components': './components',
          }
        }
      ]
    ]
  };
};