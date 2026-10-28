module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: 'current' },
        modules: 'auto'
      }
    ],
    ['@babel/preset-typescript', { onlyRemoveTypeImports: true, allowDeclareFields: true }]
  ],
  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: { node: 'current' },
            modules: 'commonjs'
          }
        ]
      ]
    }
  }
};
