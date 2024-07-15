const path = require('path');
const glob = require('glob');

// Dynamically find all TypeScript files in the workers directory
const workerEntries = glob.sync('./workers/**/*.ts').reduce((acc, path) => {
  const entryKey = path.replace('./workers/', '').replace('.ts', '');
  acc[entryKey] = path;
  return acc;
}, {});

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: workerEntries,
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, 'tsconfig.json'),
            }
          }
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../public/workers'),
  },
};
