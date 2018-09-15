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
		updateElement(targetElement, values.difference, values.time, window.matchMedia('(prefers-reduced-motion)').matches);
	}, Math.floor(1000/30));
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

function updateElement(targetElement, diff, time, reduceMotion) {
	targetElement.innerHTML = `
		${formatMonthsDeciaml(diff, time)}
		${formatDaysDeciaml(diff, time)}
		${formatHoursDeciaml(diff, time)}
		${formatMinutesDeciaml(diff, time)}
		${formatSecondsDeciaml(diff, time)}
	`;
}

function padAndSplitNumber(number) {
	number = '0' + number;
	return number.substring(number.length - 2).split('');
}

function formatValuesAsHtml(classList, value, remainder, nextMax) {
	return `
		<div class="${classList}">
			<span style="transform: rotateX(${(1 - (value >= 0 ? remainder : 0)) * 36}deg) translateZ(3.4rem)">
				${value}
			</span>
			<span style="transform: rotateX(${(value >= 0 ? remainder : 0) * -36}deg) translateZ(3.4rem); background: hsl(16, 5%, ${(1 - remainder) * 30 + 50}%)" role="presentation">
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
		nextMax = 60,
		remainder = 1 - time.milliseconds()/1000,
		formatTensParams = [
			'seconds tens',
			tens(diff.seconds),
			remainder * 0.1 + ones(diff.seconds)/10,
			tens(nextMax - 1),
		],
		formatOnesParams = [
			'seconds ones',
			ones(diff.seconds),
			remainder,
			ones(nextMax - 1),
		];
	return `
		${formatValuesAsHtml(...formatTensParams)}
		${formatValuesAsHtml(...formatOnesParams)}
	`;
}

function formatMinutesDeciaml(diff, time) {
	const
		nextMax = 60,
		remainder = diff.seconds/60 - time.milliseconds()/(1000 * 60),
		formatTensParams = [
			'minutes tens',
			tens(diff.minutes),
			remainder * 0.1 + ones(diff.minutes)/10,
			tens(nextMax - 1),
		],
		formatOnesParams = [
			'minutes ones',
			ones(diff.minutes),
			remainder,
			ones(nextMax - 1),
		];
	return `
		${formatValuesAsHtml(...formatTensParams)}
		${formatValuesAsHtml(...formatOnesParams)}
	`;
}

function formatHoursDeciaml(diff, time) {
	const
		nextMax = 24,
		remainder = diff.minutes/60 + diff.seconds/(60 * 60),
		formatTensParams = [
			'hours tens',
			tens(diff.hours),
			remainder * 0.1 + ones(diff.hours - 1)/10,
			tens(nextMax),
		],
		formatOnesParams = [
			'hours ones',
			ones(diff.hours),
			remainder,
			ones(nextMax - 1),
		];
	return `
		${formatValuesAsHtml(...formatTensParams)}
		${formatValuesAsHtml(...formatOnesParams)}
	`;
}

function formatDaysDeciaml(diff, time) {
	const
		nextMax = time.clone().add(diff.days + 15, 'days').daysInMonth(),
		remainder = diff.hours/24 + diff.minutes/(60 * 24),
		formatTensParams = [
			'days tens',
			tens(diff.days),
			remainder * 0.1 + ones(diff.days)/10,
			tens(nextMax - 1),
		],
		formatOnesParams = [
			'days ones',
			ones(diff.days),
			remainder,
			ones(nextMax - 1),
		];
	return `
		${formatValuesAsHtml(...formatTensParams)}
		${formatValuesAsHtml(...formatOnesParams)}
	`;
}

function formatMonthsDeciaml(diff, time) {
	const
		nextMax = 12,
		remainder = diff.days/time.daysInMonth() + diff.hours/(24 * time.daysInMonth()),
		formatTensParams = [
			'months tens',
			tens(diff.months),
			remainder * 0.1 + ones(diff.months)/10,
			tens(nextMax - 1),
		],
		formatOnesParams = [
			'months ones',
			ones(diff.months),
			remainder,
			ones(nextMax - 1),
		];
	return `
		${formatValuesAsHtml(...formatTensParams)}
		${formatValuesAsHtml(...formatOnesParams)}
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
