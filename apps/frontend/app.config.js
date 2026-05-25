const { expo } = require('./app.json');

module.exports = () => {
  return {
    ...expo,
    android: {
      ...expo.android,
      package: 'com.amora.parapixel',
    },
    ios: {
      ...expo.ios,
      bundleIdentifier: 'com.amora.parapixel',
    },
  };
};
