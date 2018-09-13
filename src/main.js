import * as countdown from './modules/countdown';

const dateTime = 'March 16, 2019 16:00:00';
const testTime = 'April 16, 2019 16:00:00';

countdown.init(document.querySelector('.countdown-timer'), dateTime);
