import moment from 'moment';

export function init(targetElement, endTimeString) {
	return setInterval(() => {
		updateElement(targetElement, moment(endTimeString));
	}, 500);
}

export function timeRemaining(endTime) {
	return endTime.fromNow();
}

export function updateElement(targetElement, endTime) {
	const time = moment.duration(endTime.diff(moment.now()));
	targetElement.innerHTML = `
		${time}
	`;
}

export function htmlFormatCounter(time, timeFormat = 'MM DD HH') {
	const htmlFormat = function(type, value, remainder) {
		return `<span class="${type}"${remainder ? ` data-remainder="${remainder}"` : ''}">${value}</span>`;
	};
	timeFormat.split[' '].map(token => {
		let digits = token.length;
		switch (token[0].toUpperCase()) {
			case 'Y':
				return htmlFormat('years', );

			default:
				break;
		}
	});
}
