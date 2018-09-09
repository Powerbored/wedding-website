const
	pages = {
		home: {
			title: 'Home',
			body: 'This is the home page'
		},
		about: {
			title: 'About',
			body: 'This is the about page'
		},
		news: {
			title: 'News',
			body: 'The latest news'
		},
		author: {
			title: 'Powerbored',
			body: 'Authored by Powerbored'
		}
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
