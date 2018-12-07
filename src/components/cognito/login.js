
(function scopeWrapper($) {
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
}(jQuery));
