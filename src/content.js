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
			resource: 'src/components/cognito/login.js'
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
		}
	},
	pages = {
		home: {
			title: 'Andrew and Kirsty',
			template: templates.index,
			body: 'are getting married',
		},
		about: {
			title: 'About',
			template: templates.index,
			body: 'This is the about page',
		},
		login: {
			title: 'Sign in',
			template: templates.login,
			body: 'Sign in or register to RSVP',
		},
		rsvp: {
			title: 'RSVP',
			template: templates.login,
			body: 'RSVP here',
		},
		author: {
			title: 'Powerbored',
			template: templates.index,
			body: 'Authored by Powerbored',
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
