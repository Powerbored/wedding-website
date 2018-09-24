// Time should probably be carried by a global scope rather than passed to each function?

const
	moment = require('moment');

require('moment-precise-range-plugin');

export function init(targetElement, endTimeString, updateRate) {
	const values = evaluateDifferenceFromNow(endTimeString);
	updateElement(targetElement, values.difference, values.time);
	setInterval(() => {
		const values = evaluateDifferenceFromNow(endTimeString);
		updateElement(targetElement, values.difference, values.time);
	}, Math.floor(1000/updateRate));
	// function step() {
	// 	updateElement(targetElement, endTimeString);
	// 	window.requestAnimationFrame(step);
	// }
	// step();
}

function evaluateDifferenceFromNow(endTimeString) {
	const
		time = moment(moment.now()),
		endTime = moment(endTimeString),
		difference = moment.preciseDiff(endTime, time, true);
	window.diff = difference;
	return {time, endTime, difference};
}

function updateElement(targetElement, diff, time) {
	targetElement.innerHTML = `
		${formatMonths(diff, time)}
		${formatDays(diff, time)}
		${formatHours(diff, time)}
		${formatMinutes(diff, time)}
		${formatSeconds(diff, time)}
	`;
}

function formatValuesAsHtml(label, value) {
	const s = value === 1 ? '' : 's';
	return `
		<span class="${label}">
			<span class="value">${value}</span>
			<span class="label">${label}${s}</span>
		</span>
	`;
}

function formatSeconds(diff, time) {
	return formatValuesAsHtml('second', diff.seconds, 1 - time.milliseconds()/1000, 60);
}
function formatMinutes(diff, time, value = diff.minutes) {
	return formatValuesAsHtml('minute', value, diff.seconds/60 - time.milliseconds()/(1000 * 60));
}
function formatHours(diff, time, value = diff.hours) {
	return formatValuesAsHtml('hour', value, diff.minutes/60 + diff.seconds/(60 * 60));
}
function formatDays(diff, time, value = diff.days) {
	return formatValuesAsHtml('day', value, diff.hours/24 + diff.minutes/(60 * 24));
}
function formatMonths(diff, time, value = diff.months) {
	return formatValuesAsHtml('month', value, diff.days/time.daysInMonth() + diff.hours/(24 * time.daysInMonth()));
}
