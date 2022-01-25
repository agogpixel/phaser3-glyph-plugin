/* eslint-disable @typescript-eslint/no-var-requires */

const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { DefinePlugin } = require('webpack');

const { resolve } = require('path');

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

const onValues = ['true', true, '1', 1, 'on'];
const offValues = ['false', false, '0', 0, 'off'];

const canvasRenderer = offValues.includes(process.env.CANVAS_RENDERER) ? false : true;
const webglRenderer = offValues.includes(process.env.WEBGL_RENDERER) ? false : true;
const demo = onValues.includes(process.env.DEMO) ? true : false;

if (!canvasRenderer && !webglRenderer) {
  throw new Error('At least one renderer must be enabled');
}

const srcPath = resolve(__dirname, 'src');
const dstPath = resolve(__dirname, 'dist');
const demoPath = resolve(__dirname, 'demo');

let outputFilename = 'main.bundle.js';

if (!canvasRenderer) {
  outputFilename = 'main-canvas.bundle.js';
} else if (!webglRenderer) {
  outputFilename = 'main-webgl.bundle.js';
}

if (demo) {
  outputFilename = 'demo.bundle.js';
}

module.exports = {
  mode: isProd ? 'production' : 'development',
  devtool: isProd ? 'hidden-source-map' : 'source-map',
  entry: {
    main: `${demo ? demoPath : srcPath}/index.ts`
  },
  output: {
    filename: outputFilename,
    path: dstPath + (demo ? '/demo' : ''),
    library: demo
      ? undefined
      : {
          name: 'Phaser3GlyphPlugin',
          type: 'umd'
        }
  },
  externals: demo ? undefined : /^(phaser.*)$/,
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
              configFile: demo ? 'demo/tsconfig.json' : 'tsconfig.build.json'
            }
          },
          'source-map-loader'
        ],
        include: demo ? [srcPath, demoPath] : srcPath,
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
      'typeof WEBGL_RENDERER': JSON.stringify(webglRenderer),
      ...(demo
        ? {
            'typeof PLUGIN_FBINSTANT': JSON.stringify(false),
            'typeof FEATURE_SOUND': JSON.stringify(false),
            'typeof PLUGIN_CAMERA3D': JSON.stringify(false)
          }
        : {})
    }),
    demo
      ? new HtmlWebpackPlugin({
          title: 'Phaser 3 Glyph Plugin Demos',
          template: `!!ejs-loader?{"esModule":false}!${demoPath}/index.html`,
          filename: 'index.html',
          inject: 'body',
          minify: {
            minifyCSS: isProd,
            minifyJS: isProd,
            collapseWhitespace: isProd,
            keepClosingSlash: !isProd,
            removeComments: isProd,
            removeRedundantAttributes: isProd,
            removeScriptTypeAttributes: isProd,
            removeStyleLinkTypeAttributes: isProd,
            useShortDoctype: isProd
          },
          meta: {
            viewport: 'user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0',
            description: 'Phaser 3 Glyph Plugin demo.',
            version: 'latest'
          }
        })
      : undefined,
    demo
      ? new CopyWebpackPlugin({
          patterns: [{ from: `${demoPath}/assets`, to: 'assets' }]
        })
      : undefined
  ].filter(Boolean),
  devServer: {
    static: {
      directory: demoPath,
      publicPath: '/'
    },
    host: 'localhost',
    port: 4200,
    compress: true,
    hot: false
  }
};
