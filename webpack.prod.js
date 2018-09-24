const
	path = require('path'),
	merge = require('webpack-merge'),
	common = require('./webpack.common.js'),
	CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = merge(common, {
	plugins: [
		new CleanWebpackPlugin([path.resolve(__dirname, 'pages/*')]),
	],
});
