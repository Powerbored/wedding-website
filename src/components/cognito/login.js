
import {createCognitoUserPool, registerCognitoUser, verifyCognitoUser, createCognitoUser, signIn, signOut, signUpStatus, authToken} from '../../modules/cognitoAuth';
import {awsCognito_poolId, awsCognito_appClient} from '../../../keys/keys.json';
import {ExpandingBox} from '../expanding-box/expanding-box.js';
import '../expanding-box/expanding-box.less';
import './form.less';

(function(window){
	class State {
		constructor(requiredElements, requiredBoxes, event, action) {
			this.requiredElements = requiredElements;
			this.requiredBoxes = requiredBoxes;
			this.event = event;
			this.action = action;
			this.init = function () {
				if (state.current) {
					state.current.uninit(requiredBoxes);
				}
				state.current = this;
				setElementsRequired(requiredElements, true);
				requiredBoxes.forEach(box => box.expanded ? null : box.expand());
				form.group.addEventListener('submit', event);
			};
			this.uninit = function (retainBoxes) {
				const collapseBoxes = requiredBoxes.filter(item => retainBoxes.indexOf(item) < 0);
				console.log(requiredBoxes, retainBoxes, collapseBoxes);
				state.current = null;
				setElementsRequired(requiredElements, false);
				collapseBoxes.forEach(box => box.collapse());
				form.group.removeEventListener('submit', event);
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
				resendEmail: window.resendEmailButton,
			},
			box: {
				message: new ExpandingBox(window.messageBox),
				password: new ExpandingBox(window.passwordBox),
				passwordConfirm: new ExpandingBox(window.passwordConfirmBox),
				verify: new ExpandingBox(window.verifyBox),
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
		responseSanitiser = function(response, data) {
			switch (response.code) {
			case 'UsernameExistsException':
				loginAction(data.email, data.password);
				break;
			case 'UserNotConfirmedException':
				updateMessage('warn', `${data.email} already registered, but is not verified.`);
				initVerify();
				break;
			default:
				updateMessage('error', response.message);
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
		loginEvent = function(event) {
			const data = {
				email: form.input.email.value,
				password: form.input.password.value,
			};
			event.preventDefault();
			setElementsDisabled(Object.values(form.input), true);
			loginAction(data.email, data.password);
		},
		loginAction = function(email, password) {
			signIn(
				userData.setUser(email),
				email,
				password,
				result => loginSuccess(result),
				error => responseSanitiser(error, {email, password})
			);
		},
		loginSuccess = function(result) {
			console.log(result);
			updateMessage('success', 'Successfully signed in.\nRedirecting to RSVP page');
			// setTimeout(() => window.location.href = '/', 4000);
		},
		initRegister = function() {
			form.group.addEventListener('submit', registerEvent);
		},
		registerEvent = function(event) {
			const data = {
				email: form.input.email.value,
				password: form.input.password.value,
				passwordConfirm: form.input.passwordConfirm.value
			};
			event.preventDefault();
			setElementsDisabled(Object.values(form), true);

			if (data.password === data.passwordConfirm) {
				registerCognitoUser(
					userData.userPool,
					data.email,
					data.password,
					result => {
						console.log(result.user);
						updateMessage(
							'success',
							`A verification code has been sent to ${result.user.username}\n
							Please enter the verification code below to complete registration.`
						);
						initVerify();
						setElementsDisabled(Object.values(form), false);
					},
					error => {
						responseSanitiser(error, data);
						setElementsDisabled(Object.values(form), false);
					}
				);
			} else {
				updateMessage('error', 'Passwords do not match.');
				setElementsDisabled(Object.values(form), false);
			}
		},
		initVerify = function() {
			form.group.removeEventListener('submit', registerEvent);
			form.verifyBox.expand();
			setElementsRequired([form.verify], true);
			form.passwordBox.collapse();
			setElementsRequired([form.password1Field, form.password2Field], false);
			form.submitButton.firstElementChild.innerText = 'Verify';
			form.group.addEventListener('submit', verifyEvent);
			form.resendEmail.addEventListener('click', resendEmailEvent);
		},
		verifyEvent = function(event) {
			const data = {
				email: form.emailField.value,
				code: form.verify.value
			};
			event.preventDefault();
			setElementsDisabled(Object.values(form), true);
			verifyCognitoUser(
				userData.setUser(data.email),
				data.code,
				result => {
					updateMessage(
						'success',
						`${result.user.username} verified successfully.`
					);
					setElementsDisabled(Object.values(form), false);
				},
				error => {
					responseSanitiser(error, data);
					setElementsDisabled(Object.values(form), false);
				}
			);
		},
		resendEmailEvent = function(event) {
			event.preventDefault();
			setElementsDisabled([form.resendEmail], true);
			if (userData.currentUser) {
				userData.currentUser.resendConfirmationCode(
					(err, result) => {
						updateMessage(
							'success',
							`A verification code has been sent to ${userData.currentUser.username}\n
							Please enter the verification code below to complete registration.`
						);
					}
				);
			} else {
				updateMessage('error', 'Current username is invalid, resetting form');
				// reset form..?
			}
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
		state = {
			login: new State(
				[
					form.input.password
				], [
					form.box.password
				],
				loginEvent,
				loginAction
			),
			register: new State(
				[
					form.input.password,
					form.input.passwordConfirm
				], [
					form.box.password,
					form.box.passwordConfirm
				],
				registerEvent
			),
			verify: new State(
				[
					form.input.verifyCode
				], [
					form.box.verify
				],
				verifyEvent
			)
		};
	form.group.addEventListener('submit', loginEvent);
	window.form = form;
	window.userData = userData;
	window.logout = logOut;
	window.state = state;
	// window.userData = userData;
	// window.updateMessage = updateMessage;
	window.checkAuth = checkAuth;
	window.test = function(code) {
		// console.log(createCognitoUserPool(awsCognito_poolId, awsCognito_appClient));
		initVerify();
		// createCognitoUser(
		// 	createCognitoUserPool(awsCognito_poolId, awsCognito_appClient),
		// 	form.emailField.value
		// ).confirmRegistration(code, true, (error, result) => console.log(error, result));
	};
}(window));

// =====================================================================================================================

function scopeWrapper($) {
	var signinUrl = '/signin.html';

	if (!(_config.cognito.userPoolId &&
			_config.cognito.userPoolClientId &&
			_config.cognito.region)) {
		$('#noCognitoMessage').show();
		return;
	}

	$(function onDocReady() {
		$('#signinForm').submit(handleSignin);
		$('#registrationForm').submit(handleRegister);
		$('#verifyForm').submit(handleVerify);
	});

	function handleSignin(event) {
		var email = $('#emailInputSignin').val();
		var password = $('#passwordInputSignin').val();
		event.preventDefault();
		signin(email, password,
			function signinSuccess() {
				console.log('Successfully Logged In');
				window.location.href = 'ride.html';
			},
			function signinError(err) {
				alert(err);
			}
		);
	}

	function handleRegister(event) {
		var email = $('#emailInputRegister').val();
		var password = $('#passwordInputRegister').val();
		var password2 = $('#password2InputRegister').val();

		var onSuccess = function registerSuccess(result) {
			var cognitoUser = result.user;
			console.log('user name is ' + cognitoUser.getUsername());
			var confirmation = ('Registration successful. Please check your email inbox or spam folder for your verification code.');
			if (confirmation) {
				window.location.href = 'verify.html';
			}
		};
		var onFailure = function registerFailure(err) {
			alert(err);
		};
		event.preventDefault();

		if (password === password2) {
			register(email, password, onSuccess, onFailure);
		} else {
			alert('Passwords do not match');
		}
	}

	function handleVerify(event) {
		var email = $('#emailInputVerify').val();
		var code = $('#codeInputVerify').val();
		event.preventDefault();
		verify(email, code,
			function verifySuccess(result) {
				console.log('call result: ' + result);
				console.log('Successfully verified');
				alert('Verification successful. You will now be redirected to the login page.');
				window.location.href = signinUrl;
			},
			function verifyError(err) {
				alert(err);
			}
		);
	}
};
