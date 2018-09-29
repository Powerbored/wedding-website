const
	apiKey = require('../../../keys.json').googlemaps,
	// maps = require('@google/maps'),
	theme = require('./map-theme.json'),
	tanglewoodLogo = require('../../assets/tanglewood-estate.svg');

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
		let
			tanglewoodMarker = new google.maps.Marker({
				position: tanglewood,
				icon: 'assets/heart.svg',
				title: 'Tanglewood Estate',
				map: map
			}),
			tanglewoodInfoWindow = new google.maps.InfoWindow({
				content: `<div id="tanglewoodInfoBox">${tanglewoodLogo}</div>`,
			});

		tanglewoodMarker.addListener('click', function() {
			tanglewoodInfoWindow.open(map, tanglewoodMarker);
		});

		if (window.innerWidth > 480) {
			tanglewoodInfoWindow.open(map, tanglewoodMarker);
		}
	};

	head.insertAdjacentElement('beforeend', mapsApi);
}

initMaps();
