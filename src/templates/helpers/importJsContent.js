// Given the context, add content from a specified js module
const jsContent = require('../../content.js');
module.exports = function(context) {
	if (jsContent) {
		context.content = Object.assign(context.content || {}, jsContent);
		return;
	} else {
		return `Unable to find ${jsContent}`;
	}
};
