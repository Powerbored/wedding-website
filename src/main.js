import * as countdown from './modules/countdown';

const dateTime = 'March 13, 2019 16:00:00';
const testTime = 'September 13, 2018 16:00:00';

countdown.init(document.querySelector('main'), dateTime);
