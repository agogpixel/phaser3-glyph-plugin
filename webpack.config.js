/* eslint-disable @typescript-eslint/no-var-requires */

const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { DefinePlugin } = require('webpack');

const { resolve } = require('path');

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

const offValues = ['false', false, '0', 0, 'off'];
const canvasRenderer = offValues.includes(process.env.CANVAS_RENDERER) ? false : true;
const webglRenderer = offValues.includes(process.env.WEBGL_RENDERER) ? false : true;

if (!canvasRenderer && !webglRenderer) {
  throw new Error('At least one renderer must be enabled');
}

let outputFilename = 'main.bundle.js';

if (!canvasRenderer) {
  outputFilename = 'main-canvas.bundle.js';
} else if (!webglRenderer) {
  outputFilename = 'main-webgl.bundle.js';
}

const srcPath = resolve(__dirname, 'src');
const dstPath = resolve(__dirname, 'dist');

module.exports = {
  mode: isProd ? 'production' : 'development',
  devtool: isProd ? 'hidden-source-map' : 'source-map',
  entry: {
    main: `${srcPath}/index.ts`
  },
  output: {
    filename: outputFilename,
    path: dstPath,
    library: {
      name: 'Phaser3GlyphPlugin',
      type: 'umd'
    }
  },
  externals: /^(phaser.*)$/,
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.build.json'
            }
          },
          'source-map-loader'
        ],
        include: srcPath,
        exclude: /node_modules/
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              minimize: isProd
            }
          }
        ]
      },
      {
        test: /\.s?css$/,
        use: [
          isProd ? { loader: MiniCssExtractPlugin.loader } : { loader: 'style-loader' },
          {
            loader: 'css-loader'
          },
          {
            loader: 'sass-loader'
          }
        ]
      }
    ]
  },
  plugins: [
    isProd ? new MiniCssExtractPlugin() : undefined,
    new DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(nodeEnv)
      },
      // Phaser build flags.
      'typeof CANVAS_RENDERER': JSON.stringify(canvasRenderer),
      'typeof WEBGL_RENDERER': JSON.stringify(webglRenderer)
    }),
    new CopyWebpackPlugin({
      patterns: ['package.json', 'README.md', 'LICENSE']
    })
  ].filter(Boolean)
};
