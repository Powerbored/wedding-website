const
	path = require('path'),
	merge = require('webpack-merge'),
	common = require('./webpack.common.js');

module.exports = merge(common, {
	devServer: {
		contentBase: [
			path.resolve(__dirname, 'src', 'assets'),
		],
	},
});
