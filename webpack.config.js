var path = require('path')

module.exports = {
    mode: 'production',
    entry: './src/k6-html-report.js',
    output: {
        path: path.resolve(__dirname, 'build'),
        libraryTarget: 'commonjs',
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.ejs/,
                type: "asset/source",
            },
        ],
    },
    stats: {
        colors: true,
    },
    target: 'web',
};