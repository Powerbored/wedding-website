// Given the context, add content from a specified js module
const
	fs = require('fs'),
	path = require('path'),
	rootPath = 'src/';
module.exports = function(file) {
	let content = fs.readFileSync(path.resolve(rootPath, file)).toString();
	if (content) {
		return content;
	} else {
		throw new Error('Unable to read file ' + file);
	}
};
