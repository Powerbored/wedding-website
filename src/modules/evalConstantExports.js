const
	fs = require('fs'),
	path = require('path');

function evalExports(jsFile, target) {
	let jsContent = eval(`(function () {
		const exports = {};
		${fs.readFileSync(path.resolve(jsFile)).toString().replace(/export\s+const\s+/gi, 'exports.').replace('export ', '')}
		return exports${typeof target === 'string' ? '[' + target + ']' : ''};
	})()`);
	return jsContent;
}

module.exports = evalExports;
