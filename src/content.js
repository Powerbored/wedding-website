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
		cognitoRegister: {
			chunk: 'cognito-register',
			resource: 'src/components/cognito/index.js'
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
		rsvp: {
			name: 'src/rsvp.hbs',
			components: [
				components.cognitoRegister
			]
		}
	},
	pages = {
		home: {
			title: '',
			template: templates.index,
			body: 'are getting married',
		},
		about: {
			title: 'About',
			template: templates.index,
			body: 'This is the about page',
		},
		rsvp: {
			title: 'RSVP',
			template: templates.rsvp,
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
		},
	};

export const content = {
	pages,
	structure,
	templates,
	components,
};
