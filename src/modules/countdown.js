// Time should probably be carried by a global scope rather than passed to each function?

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

function updateElement(targetElement, diff, time) {
	targetElement.innerHTML = `
		${formatSecondsDeciaml(diff, time)}
	`;
	// ${formatMonths(difference, currentTime, padAndSplitNumber(difference.months)[0], padAndSplitNumber())}
	// ${formatMonths(difference, currentTime, padAndSplitNumber(difference.months)[1], padAndSplitNumber())}
	// ${formatDays(difference, currentTime, padAndSplitNumber(difference.days)[0], padAndSplitNumber())}
	// ${formatDays(difference, currentTime, padAndSplitNumber(difference.days)[1], padAndSplitNumber())}
	// ${formatHours(difference, currentTime, padAndSplitNumber(difference.hours)[0], padAndSplitNumber(difference.time.clone().add(25, 'days').daysInMonth()[0]))}
	// ${formatHours(difference, currentTime, padAndSplitNumber(difference.hours)[1], padAndSplitNumber(difference.time.clone().add(25, 'days').daysInMonth())[1])}
	// ${formatMinutes(difference, currentTime, padAndSplitNumber(difference.minutes)[0], padAndSplitNumber())}
	// ${formatMinutes(difference, currentTime, padAndSplitNumber(difference.minutes)[1], padAndSplitNumber())}
}

function padAndSplitNumber(number) {
	number = '0' + number;
	return number.substring(number.length - 2).split('');
}

function formatValuesAsHtml(classList, value, remainder, nextMax) {
	return `
		<div class="${classList}">
			<span style="transform: rotateX(${((value >= 0 ? remainder : 0) - 1) * -36}deg) translateZ(4.8rem)">
				${value}
			</span>
			<span style="transform: rotateX(${(value >= 0 ? remainder : 0) * -36}deg) translateZ(4.8rem)" role="presentation">
				${value - 1 >= 0 ? value - 1 : nextMax}
			</span>
		</div>
	`;
}

function ones(number) {
	return number%10;
}
function tens(number) {
	return Math.floor(number/10);
}

function formatSeconds(diff, time) {
	return formatValuesAsHtml('seconds', diff.seconds, 1 - time.milliseconds()/1000, 60);
}
function formatSecondsOnes(diff, time, value, maxValue) {
	return formatValuesAsHtml('seconds ones', value, 1 - time.milliseconds()/1000, maxValue);
}
function formatSecondsTens(diff, time, value, ones, maxValue) {
	return formatValuesAsHtml('seconds tens', value, (1- time.milliseconds()/1000) * 0.1 + ones/10, maxValue);
}
function formatSecondsDeciaml(diff, time) {
	const
		nextMax = 59;
	return `
		${formatSecondsTens(diff, time, tens(diff.seconds), ones(diff.seconds), tens(nextMax))}
		${formatSecondsOnes(diff, time, ones(diff.seconds), ones(nextMax))}
	`;
}

function formatMinutes(diff, time, value = diff.minutes) {
	return formatValuesAsHtml('minutes', value, diff.seconds/60 - time.milliseconds()/(1000 * 60), maxValue);
}

function formatHours(diff, time, value = diff.hours) {
	return formatValuesAsHtml('hours', value, diff.minutes/60 + diff.seconds/(60 * 60), maxValue);
}

function formatDays(diff, time, value = diff.days) {
	return formatValuesAsHtml('days', value, diff.hours/24 + diff.minutes/(60 * 24), maxValue);
}

function formatMonths(diff, time, value = diff.months) {
	return formatValuesAsHtml('months', value, diff.days/time.daysInMonth() + diff.hours/(24 * time.daysInMonth()), maxValue);
}
