const path = require('path'),
	HtmlWebpackPlugin = require('html-webpack-plugin'),
	MiniCssExtractPlugin = require('mini-css-extract-plugin'),
	CleanWebpackPlugin = require('clean-webpack-plugin'),
	content = require('./src/content.js');

let
	resolveStructure = function(structure, name, pagePath, resolvedStructure = []) {
		if (structure.index) {
			resolvedStructure.push({
				path: path.resolve(pagePath, 'index.html'),
				ref: name,
				template: structure.index.template,
			});
		}
		let subPages = Object.assign({}, structure.pages);
		if (subPages && Object.keys(subPages).length > 0) {
			Object.keys(subPages).forEach(page => {
				resolvedStructure = resolveStructure(subPages[page], page, path.resolve(pagePath, page), resolvedStructure);
			});
		}
		return resolvedStructure;
	},
	htmlPages = resolveStructure(content.structure, 'home', 'pages').map(page => new HtmlWebpackPlugin({
		filename: page.path,
		template: path.resolve(__dirname, page.template),
		ref: page.ref,
	}));

module.exports = {
	entry: {
		content: path.resolve(__dirname, 'src/content.js'),
		site: path.resolve(__dirname, 'src/index.js'),
		map: path.resolve(__dirname, 'src/components/map/index.js'),
	},
	plugins: [
		...htmlPages,
		new HtmlWebpackPlugin({
			filename: 'test.html',
			template: path.resolve(__dirname, 'src/index.hbs'),
			content: htmlPages,
		}),
		new MiniCssExtractPlugin({
			filename: '[name].css'
		}),
		new CleanWebpackPlugin([path.resolve(__dirname, 'pages/*')]),
	],
	devServer: {
		contentBase: [
			path.resolve(__dirname, 'pages'),
		],
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'pages'),
	},
	module: {
		rules: [
			{
				test: /\.less$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {},
					}, {
						loader: 'postcss-loader',
						options: {},
					}, {
						loader: 'less-loader',
						options: {},
					},
				],
			}, {
				test: /\.min\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							url: false,
						},
					},
				],
			}, {
				test: /\.hbs$/,
				use: [
					{
						loader: 'handlebars-loader',
						options: {
							helperDirs: __dirname + '/src/helpers',
							partialDirs: [
								__dirname + '/src/templates',
								__dirname + '/src/components'
							],
							knownHelpersOnly: false,
						},
					},
				],
			}, {
				test: /\.(?:png|jpg)$/,
				loader: 'file-loader'
			},
		],
	},
};
