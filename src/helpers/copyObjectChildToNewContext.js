// Given an object with a child, change it's context to that of a different object
module.exports = function(object, objectChild, target, targetChild) {
	if (object) {
		if (target) {
			if (typeof targetChild === 'string') {
				if (objectChild && object[objectChild]) {
					target[targetChild] = object[objectChild];
					return;
				} else {
					return 'Could not access object child';
				}
			} else {
				return 'Invalid target child';
			}
		} else {
			return 'Could not access target';
		}
	} else {
		return 'Could not access object';
	}
};
