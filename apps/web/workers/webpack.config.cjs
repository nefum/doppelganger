const path = require("path");
const globEntries = require("webpack-glob-entries");

module.exports = {
  mode: process.env.NODE_ENV || "development",
  entry: globEntries("./workers/**/*.ts"),
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: path.resolve(__dirname, "tsconfig.json"),
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "../public/workers"),
  },
};
