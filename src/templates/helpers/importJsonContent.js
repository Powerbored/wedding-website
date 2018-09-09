// Given the context, add content from a specified json file
const fs = require('fs'),
	path = require('path'),
	rootPath = 'src';
module.exports = function(context, contentPath) {
	const jsonContent = fs.readFileSync(path.resolve(rootPath, contentPath));
	if (jsonContent) {
		context.content = Object.assign(context.content || {}, JSON.parse(jsonContent));
	}
	return;
};
