// Given the webpack compilation, find a resource based on it's name and return it's source
module.exports = function(resourceName, compilation) {
	if (compilation.assets) {
		if(compilation.assets[resourceName]) {
			return compilation.assets[resourceName].source();
		} else {
			return `could not access ${resourceName} in compilation assets: [ ${Object.keys(compilation.assets).join(', ')} ]`;
		}
	} else {
		return 'could not access compilation assets.';
	}
};
