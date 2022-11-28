const path = require("path");
const nodeExternals = require("webpack-node-externals");
const ESLintPlugin = require("eslint-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const NodemonPlugin = require("nodemon-webpack-plugin");

module.exports = [
  {
    mode: "none",
    entry: "./src/server/server.ts",
    devtool: "inline-source-map",
    externals: [nodeExternals()],
    node: {
      __dirname: false,
    },
    output: {
      path: path.resolve(__dirname, "dist/server"),
      filename: "server.js",
    },
    plugins: [
      new ESLintPlugin({
        files: ["src/**/*.ts", "src/**/*.js"],
        extensions: ["ts", "js"],
        exclude: ["node_modules", "dist"],
      }),
      new CopyPlugin({
        patterns: [{ from: "src/templates", to: "../templates" }],
      }),
      new NodemonPlugin(),
    ],
    resolve: {
      fallback: { path: require.resolve("path-browserify") },
      extensions: [".tsx", ".ts", ".js", ".jsx"],
    },
    module: {
      rules: [
        {
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
  },
  {
    mode: "none",
    entry: "./src/client/client.ts",
    devtool: "inline-source-map",
    output: {
      path: path.resolve(__dirname, "dist/client"),
      filename: "client.js",
    },
    plugins: [
      new ESLintPlugin({
        files: ["src/**/*.ts", "src/**/*.js"],
        extensions: ["ts", "js"],
        exclude: ["node_modules", "dist"],
      }),
      new CopyPlugin({
        patterns: [{ from: "src/client/Door.jpg" }, { from: "src/client/index.html" }],
      }),
    ],
    resolve: {
      extensions: [".tsx", ".ts", ".js", ".jsx"],
    },
    module: {
      rules: [
        {
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
  },
];

