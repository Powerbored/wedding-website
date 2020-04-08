const
	components = {
		countdown: {
			chunk: 'countdown',
			resource: 'src/components/countdown-timer/index.js'
		},
		map: {
			chunk: 'map',
			resource: 'src/components/map/index.js'
		},
		cognitoLogin: {
			chunk: 'cognito-login',
			resource: 'src/components/cognito/index.js'
		},
		rsvp: {
			chunk: 'rsvp',
			resource: 'src/components/rsvp/index.js'
		}
	},
	pages = {
		home: {
			title: 'Home',
			template: {
				name: 'src/index.hbs',
				components: [
					components.countdown,
					components.map
				]
			},
		},
		photos: {
			title: 'Photos',
			template: {
				name: 'src/photos.hbs',
				components: [],
			},
		},
		login: {
			title: 'Sign in',
			template: {
				name: 'src/login.hbs',
				components: [
					components.cognitoLogin
				]
			},
		},
		rsvp: {
			title: 'RSVP',
			template: {
				name: 'src/rsvp.hbs',
				components: [
					components.rsvp
				]
			},
		},
	},
	structure = {
		index: pages.home,
		pages: {
			photos: {
				index: pages.photos,
			},
			rsvp: {
				index: pages.rsvp,
			},
			login: {
				index: pages.login,
			}
		},
	};

export const content = {
	pages,
	structure,
	components,
};
