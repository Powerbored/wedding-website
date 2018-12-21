const
	evalConstantExports = require('./src/modules/evalConstantExports'),
	content = evalConstantExports('./src/content.js').content,
	path = require('path'),
	HtmlWebpackPlugin = require('html-webpack-plugin'),
	MiniCssExtractPlugin = require('mini-css-extract-plugin'),
	entries = {
		site: path.resolve(__dirname, 'src/index.js'),
	},
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
	htmlPages = resolveStructure(content.structure, 'home', 'docs')
		.map(page => {
			const pluginData = {};
			if (page.path && page.ref) {
				pluginData.filename = page.path;
				pluginData.ref = page.ref;
				pluginData.template = path.resolve(__dirname, page.template.name) || './src/index.hbs';
				if (page.template && page.template.components) {
					pluginData.chunks = [
						...Object.keys(entries),
						...page.template.components.map(component => component.chunk)
					];
				}
				return new HtmlWebpackPlugin(pluginData);
			} else {
				return;
			}
		}),
	components = Object.keys(content.components)
		.reduce((acc, key) => {
			let component = content.components[key];
			acc[component.chunk] = path.resolve(__dirname, component.resource);
			return acc;
		}, {});

module.exports = {
	entry: Object.assign(entries, components),
	output: {
		filename: 'js/[name].js',
		path: path.resolve(__dirname, 'docs'),
	},
	plugins: [
		...htmlPages,
		new MiniCssExtractPlugin({
			filename: 'css/[name].css'
		}),
	],
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
								__dirname + '/src/components',
							],
							knownHelpersOnly: false,
						},
					},
				],
			}, {
				test: /\.(?:svg)$/,
				loader: 'raw-loader'
			}, {
				test: /\.(?:png|jpg)$/,
				loader: 'file-loader'
			},
		],
	},
};
