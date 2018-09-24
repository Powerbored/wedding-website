const
	pages = {
		home: {
			title: 'Andrew & Kirsty',
			body: '',
			template: 'src/index.hbs',
		},
		about: {
			title: 'About',
			body: 'This is the about page',
			template: 'src/index.hbs',
		},
		news: {
			title: 'News',
			body: 'The latest news',
			template: 'src/index.hbs',
		},
		author: {
			title: 'Powerbored',
			body: 'Authored by Powerbored',
			template: 'src/index.hbs',
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
			news: {
				index: pages.news,
			},
		},
	};

module.exports = {
	pages,
	structure,
};
