// import {Config, AuthenticationDetails} from 'aws-sdk';
import {CognitoUserPool, CognitoUser, CognitoUserAttribute, AuthenticationDetails} from 'amazon-cognito-identity-js';
// const AWS = require('aws-sdk');

/**
 *
 * @param {String} userPoolId
 * @param {String} userPoolClientId
 * @returns {CognitoUserPool} CognitoUserPool ?promise
 */
export function createCognitoUserPool(userPoolId, userPoolClientId) {
	return new CognitoUserPool({
		UserPoolId: userPoolId,
		ClientId: userPoolClientId
	});
}

/**
 *
 * @param {CognitoUserPool} userPool
 * @param {String} email
 * @returns {CognitoUser} CognitoUser ?promise
 */
export function createCognitoUser(userPool, email) {
	return new CognitoUser({
		Username: email,
		Pool: userPool
	});
}

/**
 *
 * @param {CognitoUser} CognitoUser
 * @param {String} email
 * @param {String} password
 * @param {Function} onSuccess Callback
 * @param {Function} onFailure Callback
 * @returns {Promise} authenticateUser
 */
export function signIn(CognitoUser, email, password, onSuccess, onFailure) {
	return CognitoUser.authenticateUser(
		new AuthenticationDetails({
			Username: email,
			Password: password
		}), {
			onSuccess: onSuccess,
			onFailure: onFailure
		}
	);
}

/**
 *
 * @param {CognitoUserPool} userPool
 * @returns {CurrentUser} signed out user from getCurrentUser.signOut()
 */
export function signOut(userPool) {
	let user = userPool.getCurrentUser();
	user.signOut();
	return user;
}

/**
 *
 * @param {CognitoUser} cognitoUser
 * @param {String} code
 * @param {Function} onSuccess Callback
 * @param {Function} onFailure Callback
 * @returns {Promise} verification
 */
export function verifyCognitoUser(cognitoUser, code, onSuccess, onFailure) {
	return cognitoUser.confirmRegistration(code, true, (err, result) => {
		if (!err) {
			onSuccess(result);
		} else {
			onFailure(err);
		}
	});
}

export function signUpStatus() {

}

/**
 *
 * @param {CognitoUserPool} userPool
 * @returns {Promise} JWT Token
 */
export function authToken(userPool) {
	return new Promise(function fetchCurrentAuthToken(resolve, reject) {
		const cognitoUser = userPool.getCurrentUser();

		if (cognitoUser) {
			cognitoUser.getSession(function sessionCallback(err, session) {
				if (err) {
					reject(err);
				} else if (!session.isValid()) {
					resolve(null);
				} else {
					resolve(session.getIdToken().getJwtToken());
				}
			});
		} else {
			resolve(null);
		}
	});
}

/**
 *
 * @param {CognitoUserPool} userPool
 * @param {String} email
 * @param {String} password
 * @param {Function} onSuccess Callback
 * @param {Function} onFailure Callback
 * @returns {Promise}
 */
export function registerCognitoUser(userPool, email, password, onSuccess, onFailure) {
	return userPool.signUp(
		email,
		password,
		[
			new CognitoUserAttribute({
				Name: 'email',
				Value: email
			})
		],
		null,
		function signUpCallback(err, result) {
			if (!err) {
				onSuccess(result);
			} else {
				onFailure(err);
			}
		}
	);
}

/**
 * returns object
 * @param {String} poolId
 * @param {String} appClient
 */
export function userDataManager(poolId, appClient) {
	return {
		get userPool() {
			if (!this._userPool) {
				this._userPool = createCognitoUserPool(poolId, appClient);
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
			return this._currentUser || this.userPool.getCurrentUser();
		},
		set currentUser(user) {
			if (typeof user === 'string') {
				this._currentUser = this.setUser(user);
			} else {
				this._currentUser = user;
			}
		}
	};
}
