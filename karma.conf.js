var path = require('path');
module.exports = function (config) {
    config.set({

        basePath: '',

        frameworks: ['mocha', 'chai', 'sinon'],
        singleRun: true, //just run once by default

         client: {
            //mocha configuration
            mocha: {
                timeout: 3000 // adding 1s to default timeout of 2000ms
            }
        },

        files: [
            'tests.webpack.js', //just load this file
            {pattern: 'test/index.html', watched: false, served:true} // load html file
        ],
        preprocessors: {
            'test/index.html': ['html2js'], // helps load html file for dom testing
            'tests.webpack.js': [ 'webpack', 'sourcemap'] //preprocess with webpack and our sourcemap loader
        },

        webpack: { //kind of a copy of your webpack config
            debug:true,
            devtool: 'inline-source-map', //just do inline source maps instead of the default
            output: {
                library: 'gremlinConsole',
                libraryTarget: 'umd'
            },
            module: {
                preLoaders: [
                    // instrument only testing sources with Istanbul
                    {
                        test: /\.js$/,
                        include: path.resolve('src/'),
                        loader: 'isparta'
                    }
                ],
                loaders: [
                    { test: /\.js$/, exclude: /node_modules/, loader: 'babel' }
                ]
            }
        },

        reporters: ['mocha', 'coverage', 'coveralls'],

        coverageReporter: {
            type: 'lcov', // lcov or lcovonly are required for generating lcov.info files
            dir: 'coverage/'
        },

        port: 9876,
        colors: true,
        autoWatch: false,
        singleRun: false,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        browsers: ['Firefox'],
        plugins: [
            'karma-phantomjs-launcher',
            'karma-firefox-launcher',
            'karma-mocha',
            'karma-chai',
            'karma-webpack',
            'karma-sourcemap-loader',
            'karma-mocha-reporter',
            'karma-coverage',
            'karma-coveralls',
            'karma-html2js-preprocessor',
            'karma-sinon'
        ]

    });
};
