import {createCognitoUserPool, createCognitoUser, userDataManager, authToken} from '../../modules/cognitoAuth';
import {awsCognito_poolId, awsCognito_appClient, awsApiGateway_invokeUrl, awsApiGateway_keyWeddingWebsiteToken, aws_region} from '../../../keys/keys.json';
import {setElementsDisabled} from '../../modules/uiManager';
import {ExpandingBox} from '../expanding-box/expanding-box.js';
import '../expanding-box/expanding-box.less';

const login = '/login';

(function(window, document){
	const
		form = {
			group: document.getElementById('rsvp'),
			message: document.getElementById('message'),
			guests: document.getElementById('guests'),
			input: {
				contactNumber: document.getElementById('contactNumber'),
				attendance: document.getElementById('attendance'),
				accomodation: document.getElementById('accomodation'),
				transport: document.getElementById('transport'),
				addGuest: document.getElementById('addGuestButton'),
				removeGuest: document.getElementById('removeGuestButton'),
				submit: document.getElementById('submitButton'),
				guests: [{
					guestName: document.getElementById('guestName'),
					guestDiet: document.getElementById('guestDiet')
				}]
			},
			box: {
				message: new ExpandingBox(document.getElementById('messageBox')),
				removeGuest: new ExpandingBox(document.getElementById('removeGuestBox')),
				guests: [
					new ExpandingBox(document.getElementById('guestBox'))
				]
			},
		},
		userData = userDataManager(awsCognito_poolId, awsCognito_appClient),
		responseSanitiser = function(response, data = {}) {
			let noUser = data.email ? data.email + ' is not yet registered' : 'User not registered';
			switch (response.code) {
			case 'UserNotFoundException':
				updateMessage('warn',
					`${noUser}.
					Please complete user registration below.`
				);
				state.register.init();
				break;
			case 'UsernameExistsException':
				if (data.email && data.password) {
					loginAction(data.email, data.password);
				} else {
					updateMessage('error', 'The email requested is already in use.');
				}
				break;
			case 'UserNotConfirmedException':
				updateMessage('warn', `${data.email} already registered, but is not verified.`);
				state.verify.init();
				break;
			case 'InvalidParameterException':
				updateMessage('error', 'Password must be at least 8 characters long and contain an uppercase letter and a number.');
				break;
			case 'LimitExceededException':
				updateMessage('error', 'Attempt limit exceeded.\nFor your security, please wait a while before trying again.');
				break;
			case 'NotAuthorizedException':
				updateMessage('error', response.message);
				promptForgotPassword();
				break;
			default:
				updateMessage('error', response.message);
				// console.info(response);
				break;
			}
		},
		updateMessage = function(type, message) {
			form.box.message.expand(() => {
				form.message.innerText = message;
				form.message.parentElement.setAttribute('data-message-type', type);
			});
		},
		load = function(location) {
			setTimeout(() => {
				if (location) {
					window.location.href = location;
				} else {
					window.location.reload();
				}
			}, 3000);
		},
		checkAuth = function(callback, errorResponse) {
			authToken(userData.userPool)
				.then(function setAuthToken(token) {
					if (token && callback) {
						callback(token);
					} else {
						updateMessage('warn', 'No user signed in, redirecting to sign in page.');
						load(login);
					}
				})
				.catch(function handleTokenError(error) {
					updateMessage('error', error.message || error);
					if (errorResponse) {
						errorResponse(error);
					}
				});
		},
		captureFormData = function() {
			const
				guestNumber = form.guests.children.length,
				username = userData.currentUser;
			let guests = [];

			for (let guest = 0; guest < guestNumber; guest++) {
				const guestId = guest > 0 ? guest : '';
				guests.push({
					name: document.getElementById('guestName' + guestId).value,
					diet: document.getElementById('guestDiet' + guestId).value
				});
			}
			return {
				id: atob(username),
				username,
				contactNumber: form.input.contactNumber.value,
				guests,
				attendance: form.input.attendance.checked,
				// accomodation: form.input.accomodation.checked,
				transport: form.input.transport.checked,
			};
		},
		postForm = function() {
			// window.data = captureFormData();
			// console.log(window.data);
			fetch(/*awsApiGateway_invokeUrl*/'https://3beqontg3a.execute-api.ap-southeast-2.amazonaws.com/stage' + '/rsvp', {
				method: 'POST',
				mode: 'cors',
				headers: {
					'Content-Type': 'Application/json',
					'X-Amz-Docs-Region': aws_region,
					'X-Api-Key': awsApiGateway_keyWeddingWebsiteToken
				},
				body: JSON.stringify(captureFormData())
			}).then((error, response) => {
				console.log(error, response);
			});
		},
		rsvpEvent = function(event) {
			event.preventDefault();
			checkAuth(postForm);
		},
		addGuestEvent = function(event) {
			event.preventDefault();
			addGuestAction();
		},
		addGuestAction = function() {
			const
				guestNumber = form.guests.children.length,
				guestCloneBox = form.box.guests[0].element.cloneNode(true),
				guestCloneInputs = {
					guestName: null,
					guestDiet: null
				};

			setElementsDisabled(true, form.input.addGuest, form.input.removeGuest);
			guestCloneBox.id = 'guestBox' + guestNumber;
			guestCloneBox.setAttribute('data-expanded', false);
			Array.from(guestCloneBox.firstElementChild.getElementsByTagName('input'))
				.forEach(input => {
					guestCloneInputs[input.id] = input;
					input.id = input.id + guestNumber;
				});
			Array.from(guestCloneBox.firstElementChild.getElementsByTagName('label'))
				.forEach(label => label.setAttribute('for', label.getAttribute('for') + guestNumber));

			form.guests.appendChild(guestCloneBox);
			form.input.guests[guestNumber] = guestCloneInputs;
			form.box.guests[guestNumber] = new ExpandingBox(guestCloneBox);
			form.box.guests[guestNumber].expand(null, () => {
				guestCloneInputs.guestName.focus();
				setElementsDisabled(false, form.input.addGuest, form.input.removeGuest);
			});
			if (guestNumber === 1) {
				form.box.removeGuest.expand();
			}
		},
		removeGuestEvent = function(event) {
			const guestNumber = form.guests.children.length;
			event.preventDefault();
			if (guestNumber > 1) {
				form.box.guests[guestNumber - 1].collapse(() => {
					form.input.guests.pop();
					form.box.guests.pop().element.remove();
				});
				if (guestNumber === 2) {
					setElementsDisabled(true, form.input.removeGuest);
					form.box.removeGuest.collapse();
				}
			}
		};

	window.userData = userData;
	window.form = form;
	window.test = captureFormData;

	checkAuth(
		() => {
			form.group.addEventListener('submit', rsvpEvent);
			form.input.addGuest.addEventListener('click', addGuestEvent);
			form.input.removeGuest.addEventListener('click', removeGuestEvent);
		},
		() => load(login)
	);
}(window, document));
