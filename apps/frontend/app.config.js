const { expo } = require('./app.json');

module.exports = () => {
  return {
    ...expo,
    android: {
      ...expo.android,
      package: 'com.parapixel.amora',
    },
    ios: {
      ...expo.ios,
      bundleIdentifier: 'com.parapixel.amora',
    },
  };
};
