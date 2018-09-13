/* eslint import window */
const
	moment = require('moment');

require('moment-precise-range-plugin');

export function init(targetElement, endTimeString) {
	// updateElement(targetElement, values.difference, values.time);
	// window.update = function(diff) {
	// 	updateElement(targetElement, diff, values.time);
	// };
	return setInterval(() => {
		const values = evaluateDifferenceFromNow(endTimeString);
		// const a = values.time.milliseconds()/1000;
		// updateElement(targetElement, {
		// 	days: a * 24,
		// 	firstDateWasLater: true,
		// 	hours: a * 24,
		// 	minutes: a * 60,
		// 	months: a * 12,
		// 	seconds: a * 60,
		// 	years: 0
		// }, values.time);
		updateElement(targetElement, values.difference, values.time);
	}, 100);
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

function updateElement(targetElement, difference, currentTime) {
	targetElement.innerHTML = `
		${formatMonths(difference, currentTime, padAndSplitNumber(difference.months)[0], padAndSplitNumber())}
		${formatMonths(difference, currentTime, padAndSplitNumber(difference.months)[1], padAndSplitNumber())}
		${formatDays(difference, currentTime, padAndSplitNumber(difference.days)[0], padAndSplitNumber())}
		${formatDays(difference, currentTime, padAndSplitNumber(difference.days)[1], padAndSplitNumber())}
		${formatHours(difference, currentTime, padAndSplitNumber(difference.hours)[0], padAndSplitNumber(difference.time.clone().add(25, 'days').daysInMonth()[0]))}
		${formatHours(difference, currentTime, padAndSplitNumber(difference.hours)[1], padAndSplitNumber(difference.time.clone().add(25, 'days').daysInMonth())[1])}
		${formatMinutes(difference, currentTime, padAndSplitNumber(difference.minutes)[0], padAndSplitNumber())}
		${formatMinutes(difference, currentTime, padAndSplitNumber(difference.minutes)[1], padAndSplitNumber())}
	`;
}

function padAndSplitNumber(number) {
	number = '0' + number;
	return number.substring(number.length - 2).split('');
}

function formatValuesAsHtml(classList, value, remainder, nextMax) {
	return `
		<div class="${classList}">
			<span style="transform: rotateX(${((value > 0 ? remainder : 0) - 1) * -36}deg) translateZ(4.8rem)">
				${value}
			</span>
			<span style="transform: rotateX(${(value > 0 ? remainder : 0) * -36}deg) translateZ(4.8rem)" role="presentation">
				${value - 1 >= 0 ? value - 1 : nextMax}
			</span>
		</div>
	`;
}

function formatSeconds(preciseDifferenceObject, time, value = preciseDifferenceObject.seconds, maxValue = 60) {
	return formatValuesAsHtml('seconds', value, 1 - time.milliseconds()/1000, maxValue);
}
function formatSecondsTens(preciseDifferenceObject, time, value = preciseDifferenceObject.seconds, maxValue = 60) {
	return formatValuesAsHtml('seconds', value, 1 - preciseDifferenceObject.seconds % 10 - time.milliseconds()/1000, maxValue);
}

function formatMinutes(preciseDifferenceObject, time, value = preciseDifferenceObject.minutes, maxValue = 60) {
	return formatValuesAsHtml('minutes', value, preciseDifferenceObject.seconds/60 - time.milliseconds()/(1000 * 60), maxValue);
}

function formatHours(preciseDifferenceObject, time, value = preciseDifferenceObject.hours, maxValue = 24) {
	return formatValuesAsHtml('hours', value, preciseDifferenceObject.minutes/60 + preciseDifferenceObject.seconds/(60 * 60), maxValue);
}

function formatDays(preciseDifferenceObject, time, value = preciseDifferenceObject.days, maxValue = 30) {
	return formatValuesAsHtml('days', value, preciseDifferenceObject.hours/24 + preciseDifferenceObject.minutes/(60 * 24), time.clone().add(25, 'days').daysInMonth());
}

function formatMonths(preciseDifferenceObject, time, value = preciseDifferenceObject.months, maxValue = 12) {
	return formatValuesAsHtml('months', value, preciseDifferenceObject.days/time.daysInMonth() + preciseDifferenceObject.hours/(24 * time.daysInMonth()), maxValue);
}
