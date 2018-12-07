// Given the context, add content from a specified js module
const evalConstantExports = require('../modules/evalConstantExports');

module.exports = function(jsFile, content = 'content') {
	const context = arguments[arguments.length - 1];
	// return Object.keys(context.data);
	content = typeof content === 'string' ? content : 'content';
	let jsContent = evalConstantExports(jsFile)[content];
	if (jsContent) {
		if (context.data.root) {
			context.data.root[content] = Object.assign(context.data.root[content] || {}, jsContent);
			return;
		} else {
			throw new Error('Could not acceess context');
		}
	} else {
		throw new Error('Unable to access js file');
	}
};
