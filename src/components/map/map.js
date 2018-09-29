const
	apiKey = require('../../../keys.json').googlemaps,
	// maps = require('@google/maps'),
	theme = require('./map-theme.json');

function initMaps() {
	const
		head = document.getElementsByTagName('head')[0],
		mapsApi = document.createElement('script'),
		mapElement = document.getElementById('map'),
		tanglewood = {
			lat: -38.317643,
			lng: 145.060885,
		},
		mapOptions = {
			center: tanglewood,
			zoom:11,
			mapTypeId: 'terrain',
			styles: theme,
			disableDefaultUI: true,
		};

	mapsApi.setAttribute('async', '');
	mapsApi.setAttribute('defer', '');
	mapsApi.setAttribute('src', `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=init`);

	window.init = function() {
		const
			google = window.google,
			map = new google.maps.Map(mapElement, mapOptions),
			directionsService = new google.maps.DirectionsService(),
			directionsDisplay = new google.maps.DirectionsRenderer();

		directionsDisplay.setMap(map);
/*
		directionsService.route({
			origin: {lat: -38.311103, lng: 145.084773}, //new google.maps.LatLng(-38.285397, 145.070321),
			destination: tanglewood,
			travelMode: 'DRIVING',
			waypoints: [
				// {
				// 	location: {lat: -38.311103, lng: 145.084773},
				// },
				{
					location: {lat: -38.308701, lng: 145.064618},
				}
			],
		},
		function(result, status) {
			if (status == 'OK') {
				directionsDisplay.setDirections(result);
			}
		});
*/
		new google.maps.Marker({
			position: tanglewood,
			icon: 'heart.svg',
			map: map
		});
	};

	head.insertAdjacentElement('beforeend', mapsApi);
}

initMaps();
