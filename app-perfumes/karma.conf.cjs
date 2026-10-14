// Configuración de Karma + Jasmine para probar los componentes React
process.env.NODE_ENV = 'test';
process.env.BABEL_ENV = 'test'; // activa la instrumentación de cobertura (babel-plugin-istanbul)

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'webpack'],
    plugins: [
      'karma-jasmine',
      'karma-webpack',
      'karma-chrome-launcher',
      'karma-jsdom-launcher',
      'karma-coverage',
      'karma-spec-reporter',
      'karma-sourcemap-loader',
    ],

    // Todas las pruebas viven en src/__tests__ y terminan en .spec.js / .spec.jsx
    files: [{ pattern: 'src/__tests__/**/*.spec.js*', watched: false }],
    preprocessors: {
      'src/__tests__/**/*.spec.js*': ['webpack', 'sourcemap'],
    },

    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',
      resolve: { extensions: ['.js', '.jsx'] },
      module: {
        rules: [
          // El package.json usa "type": "module": permite importar sin escribir la extensión
          { test: /\.jsx?$/, resolve: { fullySpecified: false } },
          { test: /\.jsx?$/, exclude: /node_modules/, use: 'babel-loader' },
          { test: /\.css$/, type: 'asset/source' }, // los CSS no importan en las pruebas
        ],
      },
    },

    reporters: ['spec', 'coverage'],
    coverageReporter: {
      dir: 'coverage',
      reporters: [
        { type: 'text-summary' },
        { type: 'html', subdir: 'html' },
        { type: 'lcovonly', subdir: '.' },
      ],
    },

    browsers: ['ChromeHeadless'],
    customLaunchers: {},
    singleRun: true,
    autoWatch: false,
    jasmine: { random: false },
  });
};
