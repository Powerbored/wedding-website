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

	updateElements(targetElements, values.difference, {});
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
	updateElement(targetElements.seconds, diff.seconds, previous.seconds) &&
	updateElement(targetElements.minutes, diff.minutes, previous.minutes) &&
	updateElement(targetElements.hours,   diff.hours,   previous.hours) &&
	updateElement(targetElements.days,    diff.days,    previous.days) &&
	updateElement(targetElements.months,  diff.months,  previous.months);
}

function updateElement(targetElement, diff, previous) {
	let oldNumber = `<span class="old" role="presentation">${previous}</span>`;
	if (!previous || diff !== previous) {
		targetElement.querySelector('.value').innerHTML = `
			<span class="new">${diff}</span>
			${isNaN(previous) ? '' : oldNumber}
		`;
		if (diff === 1) {
			targetElement.querySelector('.s').setAttribute('role', 'presentation');
		} else if (diff === 0) {
			targetElement.querySelector('.s').removeAttribute('role');
		}
		return true;
	} else {
		return false;
	}
}

init(document.querySelector('.countdown-timer'), 1);
