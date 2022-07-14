const path = require('path')      // provides us a bunch of utilities for working w/ paths

module.exports = { 
            // Polyfill runs before your code runs – e.g. converts newer function to code that can be used by a wider range of browsers including some older ones 
    entry: ['babel-polyfill', './src/index.js'],    // relative path to where our code lives
    output: {                   // where to save our processed code 
        path: path.resolve(__dirname, 'public/scripts'),  // needs to be an absolute path;  path.resolve essentially concats the 2 parts of this
        filename: 'bundle.js'       // renames from default of main.js to bundle.js 
    }, 
    module: {
        rules: [{
            test: /\.js$/,   // want to include just .js;  escape the '.';  $ means end of file
            // exclude will help determine which files to apply the rule to (exclude the items in node_modules)
            exclude: /node_modules/,       // exclude all paths that have node_modules as part of their path
            use: {
                loader: 'babel-loader',   // 'use' tells rules which loaders to use -- in this case the babel-loader we installed via npm
                options: {          // specifies which options we need (e.g. presets env as found in package.json 'build')
                    presets: ['env'], 
                    plugins: ['transform-object-rest-spread']
                }
            }
        }]
    }, 
    devServer: {
        contentBase: path.resolve(__dirname, 'public'),  // needs an absolute path here;  serve up the public folder 
        publicPath: '/scripts/'  // tells devServer where, relative to the public folder, webpack stores our assets 
    }, 
    devtool: 'source-map'
}

//  node provides __dirname var which is absolute path from root directory to current folder