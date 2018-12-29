import {userDataManager, authToken} from '../../modules/cognitoAuth';
import {awsCognito_poolId, awsCognito_appClient, awsApiGateway_invokeUrl, awsApiGateway_keyWeddingWebsiteToken, aws_region} from '../../../keys/keys.json';
import {ExpandingBox} from '../expanding-box/expanding-box.js';
import {setElementsDisabled} from '../../modules/uiManager';
import appendScriptToHead from '../../modules/appendScriptToHead';
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
				recovery: document.getElementById('recovery'),
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
		// TODO: response sanitisation
		userData = userDataManager(awsCognito_poolId, awsCognito_appClient),
		updateMessage = function(type, message) {
			form.box.message.expand(() => {
				form.message.innerText = message;
				form.message.parentElement.setAttribute('data-message-type', type);
			});
			try {
				document.body.scrollTo({top: 0, behavior: 'smooth'});
			} catch(error) {
				console.log('Stop using internet explorer!');
			}
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
			return authToken(userData.currentUser)
				.then(token => {
					if (token) {
						if (callback) {
							callback(token);
						}
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
				})
			;
		},
		captureFormData = function() {
			const
				guestNumber = form.guests.children.length,
				username = userData.currentUser.username;
			let guests = [];

			for (let guest = 0; guest < guestNumber; guest++) {
				const guestId = guest > 0 ? guest : '';
				guests.push({
					name: document.getElementById('guestName' + guestId).value,
					diet: document.getElementById('guestDiet' + guestId).value
				});
			}
			return {
				username,
				contactNumber: form.input.contactNumber.value,
				guests,
				attendance: form.input.attendance.checked,
				transport: form.input.transport.checked,
				recovery: form.input.recovery.checked,
			};
		},
		postForm = function(authorisation) {
			return fetch(awsApiGateway_invokeUrl + '/prod/rsvp', {
				method: 'POST',
				mode: 'cors',
				headers: {
					'Content-Type': 'Application/json',
					'X-Amz-Docs-Region': aws_region,
					'X-Api-Key': awsApiGateway_keyWeddingWebsiteToken,
					Authorisation: authorisation
				},
				body: JSON.stringify(captureFormData())
			}).then(response => {
				response.json().then(json => {
					if (response.ok) {
						updateMessage('success', json.message);
					} else {
						updateMessage('error', json.message);
					}
				});
			}).catch(error => updateMessage('error', 'Failed to save RSVP\n' + error));
		},
		rsvpEvent = function(event) {
			event.preventDefault();
			setElementsDisabled(true, form.input.submit);
			checkAuth(token => {
				postForm(token).finally(() => {
					setElementsDisabled(false, form.input.submit);
				});
			},
			() => {
				setElementsDisabled(false, form.input.submit);
			});
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
		},
		init = function() {
			checkAuth(
				() => {
					form.group.addEventListener('submit', rsvpEvent);
					form.input.addGuest.addEventListener('click', addGuestEvent);
					form.input.removeGuest.addEventListener('click', removeGuestEvent);
				},
				() => load(login)
			);
		}
	;

	if (window.fetch === undefined) {
		new Promise((resolve, reject) => {
			const validate = function(breakoutNumber) {
				if (window.fetch === undefined) {
					if (breakoutNumber > 0) {
						setTimeout(() => {
							validate(breakoutNumber-1);
						}, 500);
					} else {
						reject();
					}
				} else {
					resolve();
				}
			};
			appendScriptToHead(document, '/js/fetch.js');
			validate(20);
		}).then(() => {
			init();
		}).catch(() => {
			alert('Please use a modern web browser to continue.');
		});
	} else {
		init();
	}

}(window, document));
