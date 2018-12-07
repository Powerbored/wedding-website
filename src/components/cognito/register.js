import {createCognitoUserPool, registerCognitoUser, verifyCognitoUser, createCognitoUser, signIn, signUpStatus} from '../../modules/cognitoAuth';
import {awsCognito_poolId, awsCognito_appClient} from '../../../keys/keys.json';
import './form.less';

(function(window){
	const
		expandingBox = function(element) {
			const
				once = {
					once: true
				},
				transitionToAutoHeight = function(event) {
					event.target.style.height = 'auto';
				},
				transitionToCollapsed = function(event) {
					event.target.setAttribute('data-expanded', false);
				};
			this.element = element;
			this.lockHeight = function() {
				this.element.style.height = this.element.clientHeight;
			};
			this.expand = function(resize) {
				this.lockHeight();
				this.element.setAttribute('data-expanded', true);
				if (resize) {
					resize();
				}
				window.requestAnimationFrame(
					// LockHeight gets painted here
					() => window.requestAnimationFrame(
						() => {
							this.element.style.height = this.element.firstElementChild.clientHeight;
							this.element.addEventListener(
								'transitionend',
								transitionToAutoHeight,
								once
							);
						}
					)
				);
			};
			this.collapse = function() {
				this.lockHeight();
				window.requestAnimationFrame(
					// LockHeight gets painted here
					() => window.requestAnimationFrame(
						() => {
							this.element.style.height = 0;
							this.element.addEventListener(
								'transitionend',
								transitionToCollapsed,
								once
							);
						}
					)
				);
			};
		},
		form = {
			group: window.cognitoRegistration,
			message: window.registrationMessage,
			messageBox: new expandingBox(window.messageBox),
			emailField: window.emailInputRegister,
			password1Field: window.password1InputRegister,
			password2Field: window.password2InputRegister,
			passwordBox: new expandingBox(window.passwordBox),
			submitButton: window.submitButton,
			verify: window.verifyRegister,
			verifyBox: new expandingBox(window.verifyBox),
			resendEmail: window.resendEmail,
			resendBox: new expandingBox(window.resendBox)
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
		updateMessage = function(type, message) {
			form.messageBox.expand(() => {
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
		initRegister = function() {
			form.group.addEventListener('submit', registerEvent);
		},
		registerEvent = function(event) {
			const data = {
				email: form.emailField.value,
				password1: form.password1Field.value,
				password2: form.password2Field.value
			};
			event.preventDefault();
			setElementsDisabled(Object.values(form), true);

			if (data.password1 === data.password2) {
				registerCognitoUser(
					userData.userPool,
					data.email,
					data.password1,
					(result) => {
						// result.user;
						console.log(result.user.username);
						// window.location.href = 'verify.html';
						updateMessage(
							'success',
							`A verification code has been sent to ${result.user.username}\n
							Please enter the verification code below to complete registration.`
						);
						initVerify();
						setElementsDisabled(Object.values(form), false);
					},
					(err) => {
						switch (err.code) {
						case 'UsernameExistsException':
							signIn(
								userData.setUser(data.email),
								data.email,
								data.password1,
								result => console.log('youre signed in!'),
								err => {
									if (err.code === 'UserNotConfirmedException') {
										updateMessage('warn', `${data.email} already registered, but is not verified.`);
										initVerify();
									} else {
										updateMessage('error', err.message);
									}
								}
							);
							break;
						default:
							updateMessage('error', err.message);
							break;
						}
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
			form.resendBox.expand();
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
						`${data.email} verified successfully.`
					);
					setElementsDisabled(Object.values(form), false);
				},
				err => {
					updateMessage('error', err.message);
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
		};
	initRegister();
	// window.userData = userData;
	// window.updateMessage = updateMessage;
	window.test = function(code) {
		// console.log(createCognitoUserPool(awsCognito_poolId, awsCognito_appClient));
		initVerify();
		// createCognitoUser(
		// 	createCognitoUserPool(awsCognito_poolId, awsCognito_appClient),
		// 	form.emailField.value
		// ).confirmRegistration(code, true, (error, result) => console.log(error, result));
	};
}(window));
