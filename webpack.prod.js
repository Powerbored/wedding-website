const
	path = require('path'),
	merge = require('webpack-merge'),
	common = require('./webpack.common.js'),
	CopyWebpackPlugin = require('copy-webpack-plugin'),
	CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = merge(common, {
	plugins: [
		new CleanWebpackPlugin([path.resolve(__dirname, 'docs/*')]),
		new CopyWebpackPlugin([
			{
				from: 'CNAME',
			}, {
				from: 'src/assets/',
				to: 'assets',
			}
		]),
	],
});
