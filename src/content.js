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
	templates = {
		index: {
			name: 'src/index.hbs',
			components: [
				components.countdown,
				components.map
			]
		},
		login: {
			name: 'src/login.hbs',
			components: [
				components.cognitoLogin
			]
		},
		rsvp: {
			name: 'src/rsvp.hbs',
			components: [
				components.rsvp
			]
		}
	},
	pages = {
		home: {
			title: 'Home',
			template: templates.index,
		},
		login: {
			title: 'Sign in',
			template: templates.login,
		},
		rsvp: {
			title: 'RSVP',
			template: templates.rsvp,
		},
	},
	structure = {
		index: pages.home,
		pages: {
			about: {
				index: pages.about,
				pages: {
					author: {
						index: pages.author,
					},
				},
			},
			rsvp: {
				index: pages.rsvp,
			},
			login: {
				index: pages.login
			}
		},
	};

export const content = {
	pages,
	structure,
	templates,
	components,
};
