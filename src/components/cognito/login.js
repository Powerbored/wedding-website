
import {createCognitoUserPool, registerCognitoUser, verifyCognitoUser, createCognitoUser, signIn, signOut, signUpStatus, authToken} from '../../modules/cognitoAuth';
import {awsCognito_poolId, awsCognito_appClient} from '../../../keys/keys.json';
import {ExpandingBox} from '../expanding-box/expanding-box.js';
import '../expanding-box/expanding-box.less';
import './form.less';

(function(window){
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
				setElementsRequired(requiredElements, true);
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
				setElementsRequired(requiredElements, false);
				collapseBoxes.forEach(box => box.collapse());
				form.group.removeEventListener('submit', state.current.submit.event);
				if (state.current.support) {
					form.input.support.removeEventListener('click', state.current.support.event);
				}
				setElementsDisabled([form.input.support], false);
				state.current = null;
			};
		}
	}
	const
		form = {
			group: window.cognitoRegistration,
			message: window.message,
			input: {
				email: window.emailInput,
				password: window.passwordInput,
				passwordConfirm: window.passwordConfirmInput,
				verifyCode: window.verifyCodeInput,
				submit: window.submitButton,
				support: window.supportButton
			},
			box: {
				message: new ExpandingBox(window.messageBox),
				password: new ExpandingBox(window.passwordBox),
				passwordConfirm: new ExpandingBox(window.passwordConfirmBox),
				verify: new ExpandingBox(window.verifyBox),
				support: new ExpandingBox(window.supportBox)
			},
		},
		userData = {
			get userPool() {
				if (!this._userPool) {
					this._userPool = createCognitoUserPool(awsCognito_poolId, awsCognito_appClient);
				}
				return this._userPool;
			},
			set userPool(userPool) {
				this._userPool = userPool;
			},
			setUser: function(username) {
				this._currentUser = createCognitoUser(
					this.userPool,
					username
				);
				return this._currentUser;
			},
			get currentUser() {
				return this._currentUser || null;
			},
			set currentUser(user) {
				if (typeof user === 'string') {
					this._currentUser = this.setUser(user);
				} else {
					this._currentUser = user;
				}
			}
		},
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
				console.info(response);
				break;
			}
		},
		updateMessage = function(type, message) {
			form.box.message.expand(() => {
				form.message.innerText = message;
				form.message.parentElement.setAttribute('data-message-type', type);
			});
		},
		setElementsDisabled = function(elements, disabled) {
			elements.forEach(element => {
				switch (element.tagName) {
				case 'INPUT':
				case 'BUTTON':
					if (disabled) {
						element.setAttribute('disabled', 'disabled');
					} else {
						element.removeAttribute('disabled');
					}
					break;
				default:
					break;
				}
			});
		},
		setElementsRequired = function(elements, required) {
			elements.forEach(element => {
				switch (element.tagName) {
				case 'INPUT':
				case 'BUTTON':
					if (required) {
						element.setAttribute('required', '');
					} else {
						element.removeAttribute('required');
					}
					break;
				default:
					break;
				}
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
			setElementsDisabled(Object.values(form.input), true);
			signIn(
				userData.setUser(email),
				email,
				password,
				result => loginSuccess(result),
				error => {
					responseSanitiser(error, {email, password});
					setElementsDisabled(Object.values(form.input), false);
				}
			);
		},
		loginSuccess = function(result) {
			console.log(result);
			updateMessage('success', 'Successfully signed in.\nRedirecting to RSVP page.');
			load('/rsvp');
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
			setElementsDisabled(Object.values(form.input), true);

			userData.setUser(data.email).confirmPassword(
				data.code,
				data.password,
				{
					onSuccess: (result) => {
						updateMessage('success', 'Password successfully changed.\nPlease sign in below');
						setElementsDisabled(Object.values(form.input), false);
						state.login.init();
					},
					onFailure: (error) => {
						responseSanitiser(error);
						setElementsDisabled(Object.values(form.input), false);
					}
				}
			);
		},
		resendPasswordChangeEmailEvent = function() {
			const activeUser = userData.currentUser;

			setElementsDisabled(Object.values(form.input), true);
			activeUser.forgotPassword(
				{
					onSuccess: () => {
						resendEmailSuccess(activeUser.username, 'password change');
						setElementsDisabled(Object.values(form.input), false);
					},
					onFailure: (error) => {
						responseSanitiser(error);
						setElementsDisabled(Object.values(form.input), false);
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
			setElementsDisabled(Object.values(form.input), true);

			if (data.password === data.passwordConfirm) {
				registerCognitoUser(
					userData.userPool,
					data.email,
					data.password,
					result => {
						console.log(result.user);
						resendEmailSuccess(result.user.username, 'registration');
						userData.setUser(data.email);
						state.verify.init();
						setElementsDisabled(Object.values(form.input), false);
					},
					error => {
						responseSanitiser(error, data);
						setElementsDisabled(Object.values(form.input), false);
					}
				);
			} else {
				updateMessage('error', 'Passwords do not match.');
				setElementsDisabled(Object.values(form.input), false);
			}
		},
		verifyEvent = function(event) {
			event.preventDefault();
			verifyAction(form.input.email.value, form.input.verifyCode.value);
		},
		verifyAction = function(email, code) {
			setElementsDisabled(Object.values(form.input), true);
			verifyCognitoUser(
				userData.setUser(email),
				code,
				result => {
					updateMessage('success',
						`${email} verified successfully.
						Please sign in to continue.`
					);
					setElementsDisabled(Object.values(form.input), false);
					state.login.init();
				},
				error => {
					responseSanitiser(error, {email, code});
					setElementsDisabled(Object.values(form.input), false);
				}
			);
		},
		resendVerifyEmailEvent = function(event) {
			event.preventDefault();
			setElementsDisabled([form.input.support], true);
			resendEmailAction();
		},
		resendEmailAction = function() {
			const activeUser = userData.currentUser;
			if (activeUser) {
				activeUser.resendConfirmationCode(
					(error, result) => {
						if (error) {
							responseSanitiser(error);
							setElementsDisabled([form.input.support], false);
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
				Please enter the verification code below${action ? ' to complete ' + action : ''}.`
			);
		},
		checkAuth = function() {
			authToken(userData.userPool).then(function setAuthToken(token) {
				if (token) {
					console.log(token);
				} else {
					console.log('nope');
				}
			}).catch(function handleTokenError(error) {
				console.error(error);
			});
		},
		logOut = function() {
			signOut(userData.userPool);
		},
		state = {};

	state.register = new State([
		form.input.password,
		form.input.passwordConfirm
	], [
		form.box.password,
		form.box.passwordConfirm,
	], {
		text: 'Register',
		event: registerEvent
	});
	state.login = new State([
		form.input.password
	], [
		form.box.password,
		form.box.support
	], {
		text: 'Sign in',
		event: loginEvent
	}, {
		text: 'Register new user',
		event: state.register.init
	});
	state.verify = new State([
		form.input.verifyCode
	], [
		form.box.verify,
		form.box.support
	], {
		text: 'Verify',
		event: verifyEvent
	}, {
		text: 'Re-send verification email',
		event: resendVerifyEmailEvent
	});
	state.changePassword = new State([
		form.input.password,
		form.input.verifyCode
	], [
		form.box.password,
		form.box.verify,
		form.box.support
	], {
		text: 'Change Password',
		event: passwordChangeEvent
	}, {
		text: 'Re-send verification email',
		event: resendPasswordChangeEmailEvent
	});
	state.current = state.login;
	state.login.init();

	window.form = form;
	window.userData = userData;
	window.logout = logOut;
	window.state = state;
	window.checkAuth = checkAuth;
}(window));
