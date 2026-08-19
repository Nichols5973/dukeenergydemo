module.exports = {
  root: true,
  extends: [
    'airbnb-base',
    'plugin:json/recommended',
    'plugin:xwalk/recommended',
  ],
  env: {
    browser: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  rules: {
    'import/extensions': ['error', { js: 'always' }], // require js file extensions in imports
    'linebreak-style': ['error', 'unix'], // enforce unix linebreaks
    'no-param-reassign': [2, { props: false }], // allow modifying properties of param
    // AEM GraphQL content-fragment responses expose fields like _authorUrl,
    // _publishUrl, _url and _path — allow these leading-underscore names.
    'no-underscore-dangle': ['error', { allow: ['_authorUrl', '_publishUrl', '_url', '_path'] }],
    // The content-fragment block renders via GraphQL (not block table cells);
    // its 5 dialog fields (picker + hidden variation + 3 style selects) are
    // configuration, so allow up to 5 cells for that model.
    'xwalk/max-cells': ['error', { contentfragment: 5 }],
  },
};
