const path = require('path'),
	HtmlWebpackPlugin = require('html-webpack-plugin'),
	MiniCssExtractPlugin = require('mini-css-extract-plugin'),
	CleanWebpackPlugin = require('clean-webpack-plugin'),
	content = require('./src/content.js');

let
	resolveStructure = function(structure, name = '', path = '', resolvedStructure = []) {
		if (structure.index) {
			resolvedStructure.push({
				path: path + 'index.html',
				ref: name,
				template: structure.index.template,
			});
		}
		if (structure.pages && Object.keys(structure.pages).length > 0) {
			Object.keys(structure.pages).forEach(page => {
				resolvedStructure = resolveStructure(structure.pages, page, `${path}/${page}/`, resolvedStructure);
			});
		}
		return resolvedStructure;
	},
	htmlPages = resolveStructure(content.structure, 'home').map(page => new HtmlWebpackPlugin({
		filename: page.path,
		template: path.resolve(__dirname, page.template),
		ref: page.ref,
	}));

module.exports = {
	entry: {
		site: path.resolve(__dirname, 'src/index.js'),
		content: path.resolve(__dirname, 'src/content.js'),
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
				test: /\.(:?css|less)$/,
				exclude: /node_modules/,
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
				test: /\.(:?hbs)$/,
				use: [
					{
						loader: 'handlebars-loader',
						options: {
							helperDirs: __dirname + '/src/helpers',
							partialDirs: __dirname + '/src/templates',
							knownHelpersOnly: false,
						},
					},
				],
			}, {
				test: /\.(png|jpg)$/,
				loader: 'file-loader'
			},
		],
	},
};

// module.exports = {
// 	context: path.resolve(__dirname),
// 	entry: {
// 		home: './src/views/index.js',
// 	},
// 	output: {
// 		path: path.resolve(__dirname, 'dist'),
// 		filename: 'js/[name].js'
// 	},
// 	module: {
// 		loaders: [
// 			{
// 				test: /\.hbs$/,
// 				loader: 'handlebars-loader',
// 				query: {
// 					partialDirs: [path.resolve(__dirname, 'src', 'partials')]
// 				}
// 			},
// 			{
// 				test: /\.(png|jpg)$/,
// 				loader: 'file-loader'
// 			}
// 		]
// 	},
// 	plugins: [
// 		// this gets the favicon among other things... might be useful
// 		new CopyWebpackPlugin([{ from: './src/static' }]),
// 		new HtmlWebpackPlugin({
// 			title: 'Home',
// 			filename: 'index.html',
// 			template: './src/views/index.hbs',
// 			chunks: ['home']
// 		}),
// 		new HtmlWebpackPlugin({
// 			title: 'About',
// 			filename: 'about/index.html',
// 			template: './src/views/about/index.hbs',
// 			chunks: ['about']
// 		})
// 	],
// 	resolve: {
// 		extensions: ['', '.js', '.json', '.hbs']
// 	}
// };
