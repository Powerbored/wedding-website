// Given the context, add content from a specified js module
const
	fs = require('fs'),
	path = require('path'),
	rootPath = 'src/';
module.exports = function(jsFile, context, content = 'content') {
	let jsContent = eval(`(function () {
		${fs.readFileSync(path.resolve(rootPath, jsFile)).toString()}
		return module.exports;
	})()`);
	content = typeof content === 'string' ? content : 'content';
	if (jsContent) {
		if (context) {
			context[content] = Object.assign(context[content] || {}, jsContent);
			return;
		} else {
			throw new Error('Could not acceess context');
		}
	} else {
		throw new Error('Unable to access js file');
	}
};
