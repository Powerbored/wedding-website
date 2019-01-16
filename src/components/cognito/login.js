import {registerCognitoUser, verifyCognitoUser, userDataManager, signIn} from '../../modules/cognitoAuth';
import {awsCognito_poolId, awsCognito_appClient} from '../../../keys/keys.json';
import {setElementsDisabled, setElementsRequired} from '../../modules/uiManager';
import appendScriptToHead from '../../modules/appendScriptToHead';
import {ExpandingBox} from '../expanding-box/expanding-box.js';
import '../expanding-box/expanding-box.less';

const rsvp = '/rsvp';

(function(window, document){
	class State {
		constructor(requiredElements, requiredBoxes, submit, support) {
			const thisState = this;
			this.requiredElements = requiredElements;
			this.requiredBoxes = requiredBoxes;
			this.submit = submit;
			this.support = support;
			this.init = function () {
				if (state.current) {
					state.current.uninit(requiredBoxes);
				}
				state.current = thisState;
				setElementsRequired(true, ...requiredElements);
				requiredBoxes.forEach(box => box.expanded ? null : box.expand());
				form.group.addEventListener('submit', submit.event);
				form.input.submit.firstElementChild.innerText = submit.text;
				if (support) {
					form.input.support.addEventListener('click', support.event);
					form.input.support.firstElementChild.innerText = support.text;
				}
			};
			this.uninit = function (retainBoxes) {
				const collapseBoxes = requiredBoxes.filter(item => retainBoxes.indexOf(item) < 0);
				setElementsRequired(false, ...requiredElements);
				collapseBoxes.forEach(box => box.collapse());
				form.group.removeEventListener('submit', state.current.submit.event);
				if (state.current.support) {
					form.input.support.removeEventListener('click', state.current.support.event);
				}
				setElementsDisabled(false, form.input.support);
				state.current = null;
			};
		}
	}
	const
		form = {
			group: document.getElementById('cognitoRegistration'),
			message: document.getElementById('message'),
			input: {
				email: document.getElementById('emailInput'),
				password: document.getElementById('passwordInput'),
				passwordConfirm: document.getElementById('passwordConfirmInput'),
				verifyCode: document.getElementById('verifyCodeInput'),
				submit: document.getElementById('submitButton'),
				support: document.getElementById('supportButton')
			},
			box: {
				message: new ExpandingBox(document.getElementById('messageBox')),
				password: new ExpandingBox(document.getElementById('passwordBox')),
				passwordConfirm: new ExpandingBox(document.getElementById('passwordConfirmBox')),
				verify: new ExpandingBox(document.getElementById('verifyBox')),
				support: new ExpandingBox(document.getElementById('supportBox'))
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
		loginEvent = function(event) {
			event.preventDefault();
			loginAction(form.input.email.value, form.input.password.value);
		},
		loginAction = function(email, password) {
			setElementsDisabled(true, ...Object.values(form.input));
			signIn(
				userData.setUser(email),
				email,
				password,
				result => loginSuccess(result),
				error => {
					responseSanitiser(error, {email, password});
					setElementsDisabled(false, ...Object.values(form.input));
				}
			);
		},
		loginSuccess = function() {
			updateMessage('success', 'Successfully signed in.\nRedirecting to RSVP page.');
			load(rsvp);
		},
		promptForgotPassword = function() {
			if (state.current.support) {
				form.input.support.removeEventListener('click', state.current.support.event);
			}
			state.current.support = {
				text: 'Forgot password?',
				event: forgotPasswordEvent
			};
			form.input.support.firstElementChild.innerText = state.current.support.text;
			form.input.support.addEventListener('click', state.current.support.event);
		},
		forgotPasswordEvent = function(event) {
			event.preventDefault();
			state.changePassword.init();
			resendPasswordChangeEmailEvent();
		},
		passwordChangeEvent = function() {
			const data = {
				email: form.input.email.value,
				password: form.input.password.value,
				code: form.input.verifyCode.value
			};
			event.preventDefault();
			setElementsDisabled(true, ...Object.values(form.input));

			userData.setUser(data.email).confirmPassword(
				data.code,
				data.password,
				{
					onSuccess: () => {
						updateMessage('success', 'Password successfully changed.\nPlease sign in below');
						setElementsDisabled(false, ...Object.values(form.input));
						state.login.init();
					},
					onFailure: (error) => {
						responseSanitiser(error);
						setElementsDisabled(false, ...Object.values(form.input));
					}
				}
			);
		},
		resendPasswordChangeEmailEvent = function() {
			const activeUser = userData.currentUser;

			setElementsDisabled(true, ...Object.values(form.input));
			activeUser.forgotPassword(
				{
					onSuccess: () => {
						resendEmailSuccess(activeUser.username, 'password change');
						setElementsDisabled(false, ...Object.values(form.input));
					},
					onFailure: (error) => {
						responseSanitiser(error);
						setElementsDisabled(false, ...Object.values(form.input));
					}
				}
			);
		},
		registerEvent = function(event) {
			const data = {
				email: form.input.email.value,
				password: form.input.password.value,
				passwordConfirm: form.input.passwordConfirm.value
			};
			event.preventDefault();
			setElementsDisabled(true, ...Object.values(form.input));

			if (data.password === data.passwordConfirm) {
				registerCognitoUser(
					userData.userPool,
					data.email,
					data.password,
					result => {
						resendEmailSuccess(result.user.username, 'registration');
						userData.setUser(data.email);
						state.verify.init();
						setElementsDisabled(false, ...Object.values(form.input));
					},
					error => {
						responseSanitiser(error, data);
						setElementsDisabled(false, ...Object.values(form.input));
					}
				);
			} else {
				updateMessage('error', 'Passwords do not match.');
				setElementsDisabled(false, ...Object.values(form.input));
			}
		},
		verifyEvent = function(event) {
			event.preventDefault();
			verifyAction(form.input.email.value, form.input.verifyCode.value);
		},
		verifyAction = function(email, code) {
			setElementsDisabled(true, ...Object.values(form.input));
			verifyCognitoUser(
				userData.setUser(email),
				code,
				() => {
					updateMessage('success',
						`${email} verified successfully.
						Please sign in to continue.`
					);
					setElementsDisabled(false, ...Object.values(form.input));
					state.login.init();
				},
				error => {
					responseSanitiser(error, {email, code});
					setElementsDisabled(false, ...Object.values(form.input));
				}
			);
		},
		resendVerifyEmailEvent = function(event) {
			event.preventDefault();
			setElementsDisabled(true, form.input.support);
			resendEmailAction();
		},
		resendEmailAction = function() {
			const activeUser = userData.currentUser;
			if (activeUser) {
				activeUser.resendConfirmationCode(
					(error) => {
						if (error) {
							responseSanitiser(error);
							setElementsDisabled(false, form.input.support);
						} else {
							resendEmailSuccess(activeUser.username, 'registration');
						}
					}
				);
			} else {
				updateMessage('error', 'Current username is invalid, resetting form');
				load();
			}
		},
		resendEmailSuccess = function(username, action) {
			updateMessage('success',
				`A verification code has been sent${username ? ' to ' + username : ''}.
				Please enter the verification code below${action ? ' to complete ' + action : ''}.
				Verification emails may be sent to your spam folder.`
			);
		},
		state = {};

	state.register = new State(
		[form.input.password, form.input.passwordConfirm],
		[form.box.password, form.box.passwordConfirm],
		{
			text: 'Register',
			event: registerEvent
		}
	);
	state.login = new State(
		[form.input.password],
		[form.box.password, form.box.support],
		{
			text: 'Sign in',
			event: loginEvent
		}, {
			text: 'Register new user',
			event: state.register.init
		}
	);
	state.verify = new State(
		[form.input.verifyCode],
		[form.box.verify, form.box.support],
		{
			text: 'Verify',
			event: verifyEvent
		}, {
			text: 'Re-send verification email',
			event: resendVerifyEmailEvent
		}
	);
	state.changePassword = new State(
		[form.input.password, form.input.verifyCode],
		[form.box.password, form.box.verify, form.box.support],
		{
			text: 'Change Password',
			event: passwordChangeEvent
		}, {
			text: 'Re-send verification email',
			event: resendPasswordChangeEmailEvent
		}
	);

	if (window.fetch === undefined) {
		appendScriptToHead(document, '/js/fetch.js');
		console.log('Please stop using Internet Explorer');
	}

	state.login.init();

	if (userData.currentUser) {
		const link = document.createElement('a');
		link.setAttribute('href', rsvp);
		link.innerText = 'Click here to RSVP';
		updateMessage('success',
			`You are already signed in as ${userData.currentUser.username}`
		);
		form.message.appendChild(link);
	}
}(window, document));
