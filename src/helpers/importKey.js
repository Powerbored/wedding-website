// Check for a key in the keys file
let keys = require('../../keys/keys.json'); // webpack parses JSON for us
module.exports = function(key) {
	if (typeof key === 'string') {
		if (keys && keys[key]) {
			return keys[key];
		} else {
			return `Could not find ${key} in keys.json`;
		}
	} else {
		return 'Invalid key, key must be of type string';
	}
};
