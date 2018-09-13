const
	moment = require('moment');

require('moment-precise-range-plugin');

export function init(targetElement, endTimeString) {
	updateElement(targetElement, endTimeString);
	// return setInterval(() => {
	// 	updateElement(targetElement, endTimeString);
	// }, 1000);
}

function updateElement(targetElement, endTimeString) {
	const
		time = moment(moment.now()),
		endTime = moment(endTimeString),
		// duration = moment.duration(endTime.preciseDiff(time));
		duration = moment.preciseDiff(endTime, time, true);
	targetElement.innerHTML = `
		${formatValueAsHtml('months', duration.months, duration.days/time.daysInMonth())}
		${formatValueAsHtml('days', duration.months, duration.hours/24)}
		${formatValueAsHtml('hours', duration.hours, duration.minutes/60)}
		${formatValueAsHtml('minutes', duration.minutes, duration.seconds/60)}
	`;
}

function formatValueAsHtml(classList, value, remainder) {
	return `
		<div class="${classList}" data-remainder="${value > 0 ? remainder : 1}">
			<span>${value}</span>
			<span>${value - 1}</span>
		</div>
	`;
}
