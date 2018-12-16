/**
 * Add or remove the disabled attribute from all elements
 * @param {Boolean} disabled set the elements to be disabled
 * @param {...any} elements
 */
export function setElementsDisabled(disabled, ...elements) {
	elements.forEach(element => {
		switch (element.tagName) {
		case 'INPUT':
		case 'BUTTON':
			if (disabled) {
				element.setAttribute('disabled', '');
			} else {
				element.removeAttribute('disabled');
			}
			break;
		default:
			break;
		}
	});
}

/**
 * Add or remove the required attribute from all elements
 * @param {Boolean} required set the elements to be required
 * @param {...any} elements
 */
export function setElementsRequired(required, ...elements) {
	elements.forEach(element => {
		switch (element.tagName) {
		case 'INPUT':
		case 'BUTTON':
			if (required) {
				element.setAttribute('required', '');
			} else {
				element.removeAttribute('required');
			}
			break;
		default:
			break;
		}
	});
}
