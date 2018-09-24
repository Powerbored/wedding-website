const
	apiKey = require('../../../keys.json').googlemaps,
	maps = require('@google/maps'),
	theme = require('./map-theme.json');

function initMaps() {
	const
		head = document.getElementsByTagName('head')[0],
		mapsApi = document.createElement('script'),
		mapEl = document.getElementById('map'),
		tanglewood = {
			lat: -25.344,
			lng: 131.036
		},
		mapOptions = {
			center: tanglewood,
			zoom: 12,
			mapTypeId: 'terrain',
			styles: theme
		};

	mapsApi.setAttribute('async', '');
	mapsApi.setAttribute('defer', '');
	mapsApi.setAttribute('src', `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=init`);

	window.init = function() {
		let map = new window.google.maps.Map(mapEl, mapOptions);
		new window.google.maps.Marker({position: tanglewood, map: map});
	};

	head.insertAdjacentElement('beforeend', mapsApi);
}

initMaps();
