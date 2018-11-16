// Time should probably be carried by a global scope rather than passed to each function?

const
	moment = require('moment');

require('moment-precise-range-plugin');

function init(targetElement, updateRate) {
	const
		endTimeString = targetElement.getAttribute('data-target-time') || 'January 19, 2038 03:14:08',
		values = evaluateDifferenceFromNow(endTimeString),
		targetElements = {
			months: targetElement.querySelector('.months'),
			days: targetElement.querySelector('.days'),
			hours: targetElement.querySelector('.hours'),
			minutes: targetElement.querySelector('.minutes'),
			seconds: targetElement.querySelector('.seconds'),
		};
	updateElements(targetElements, values.difference, null);
	let previousDiff = Object.assign({}, values.difference);
	setInterval(() => {
		const values = evaluateDifferenceFromNow(endTimeString);
		updateElements(targetElements, values.difference, previousDiff);
		previousDiff = Object.assign({}, values.difference);
	}, Math.floor(1000/updateRate));
}

function evaluateDifferenceFromNow(endTimeString) {
	const
		time = moment(moment.now()),
		endTime = moment(endTimeString),
		difference = moment.preciseDiff(endTime, time, true);
	window.diff = difference;
	return {time, endTime, difference};
}

function updateElements(targetElements, diff, previous) {
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

init(document.querySelector('.countdown-timer'), 1);
