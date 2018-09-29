// Time should probably be carried by a global scope rather than passed to each function?

const
	moment = require('moment');

require('moment-precise-range-plugin');

function init(targetElement, endTimeString, updateRate) {
	const
		values = evaluateDifferenceFromNow(endTimeString),
		targetElements = {
			months: targetElement.querySelector('.months'),
			days: targetElement.querySelector('.days'),
			hours: targetElement.querySelector('.hours'),
			minutes: targetElement.querySelector('.minutes'),
			seconds: targetElement.querySelector('.seconds'),
		};
	updateElements(targetElements, values.difference, values.time, null);
	let previousDiff = Object.assign({}, values.difference);
	setInterval(() => {
		const values = evaluateDifferenceFromNow(endTimeString);
		updateElements(targetElements, values.difference, values.time, previousDiff);
		previousDiff = Object.assign({}, values.difference);
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

function updateElements(targetElements, diff, time, previous) {
	updateElement(targetElements, 'seconds', diff, previous) &&
	updateElement(targetElements, 'minutes', diff, previous) &&
	updateElement(targetElements, 'hours', diff, previous) &&
	updateElement(targetElements, 'days', diff, previous) &&
	updateElement(targetElements, 'months', diff, previous);
}

function updateElement(targetElements, period, diff, previous) {
	if (!previous || diff[period] !== previous[period]) {
		if (!previous) {
			targetElements[period].querySelector('.value').innerHTML = `
				<span class="new">${diff[period]}</span>
			`;
		} else {
			targetElements[period].querySelector('.value').innerHTML = `
				<span class="new">${diff[period]}</span>
				<span class="old" role="presentation">${previous[period]}</span>
			`;
		}
		if (diff[period] === 1) {
			targetElements[period].querySelector('.s').setAttribute('role', 'presentation');
		} else if (diff[period] === 0) {
			targetElements[period].querySelector('.s').removeAttribute('role');
		}
		return true;
	} else {
		return false;
	}
}

// function updateElement(targetElement, diff, time) {
// 	targetElement.innerHTML = `
// 		${formatMonths(diff, time)}
// 		${formatDays(diff, time)}
// 		${formatHours(diff, time)}
// 		${formatMinutes(diff, time)}
// 		${formatSeconds(diff, time)}
// 	`;
// }

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

init(document.querySelector('.countdown-timer'), window.countdownDateTime || 'January 19, 2038 03:14:08', 1);
