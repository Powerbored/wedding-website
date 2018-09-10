// Given the context, add content from a specified js module
const
	rootPath = 'src/',
	resolveImport = function* (file) {
		let jsContent = yield wait.for(import(file));
		return jsContent;
	};
module.exports = async function(jsFile, context, content) {
	if (typeof jsFile !== 'string') {
		throw new Error('importJsContent helper file is invalid');
	}
	if (!context) {
		throw new Error('importJsContent helper could not acceess given context');
	}
	content = typeof content === 'string' ? content : 'content';
	context[content] = Object.assign(context[content] || {},  resolveImport(rootPath + jsFile));
	return;
	// new Promise((resolve, reject) => {
	// 	try {
	// 		resolveImport(rootPath + jsFile, (imported) => resolve(imported));
	// 	} catch {
	// 		reject(new Error('importJsContent helper unable to load ' + jsFile));
	// 	}
	// }).then((result) => {
	// 	context[content] = Object.assign(context[content] || {}, result);
	// 	throw new Error('Success!');
	// 	//return;
	// }, reason => {throw reason});
};
