const path = require("path");

module.exports = {
  entry: "./fp.js",
  output: {
    filename: "fpromise.js",
    path: path.resolve(__dirname, "dist"),
    library: "FLOODING-PROMISE",
    libraryTarget: "umd",
    globalObject: "this"
  },
  node:{
      fs:'empty'    
  },
  module:{
      rules: [
        {
          test: /\.m?js$/,
          exclude: /(bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              "presets": [
                "@babel/preset-env",
                "@babel/preset-typescript"
              ],
              "plugins": [
                "@babel/plugin-proposal-private-methods",
                "@babel/plugin-proposal-class-properties",
                "@babel/plugin-proposal-object-rest-spread"
              ]
            }
          }
        }
      ]
  },
  mode: "production",
  devtool: "source-map",
};
