const
	apiKey = require('../../../keys.json').googlemaps,
	// maps = require('@google/maps'),
	theme = require('./map-theme.json'),
	icons = {
		google: {
			website: require('./google-website.svg'),
			directions: require('./google-directions.svg'),
		}
	},
	tanglewood = {
		coords: {
			lat: -38.317643,
			lng: 145.060885,
		},
		title: 'Tanglewood Estate',
		logo: require('../../assets/tanglewood-estate.svg'),
		website: 'https://tanglewoodestate.com.au/',
		directions: 'https://maps.google.com.au/maps?trex=1&um=1&ie=UTF-8&fb=1&gl=au&entry=s&sa=X&geocode=KStovjuz3NVqMVJivOisdJnA&daddr=60+Bulldog+Creek+Rd,+Dromana+VIC+3936&gmm=CgIgAQ%3D%3D&ved=2ahUKEwjx69jquuHdAhXS62EKHV0tAVgQlDsoADAEegQIARA9'
	},
	mapOptions = {
		center: tanglewood.coords,
		zoom:11,
		mapTypeId: 'terrain',
		styles: theme,
		disableDefaultUI: true,
	}
;

function initMaps() {
	const
		head = document.getElementsByTagName('head')[0],
		mapsApi = document.createElement('script'),
		mapElement = document.getElementById('map')
	;

	mapsApi.setAttribute('async', '');
	mapsApi.setAttribute('defer', '');
	mapsApi.setAttribute('src', `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=init`);

	window.init = function() {
		const
			google = window.google,
			map = new google.maps.Map(mapElement, mapOptions),
			directionsService = new google.maps.DirectionsService(),
			directionsDisplay = new google.maps.DirectionsRenderer()
		;

		directionsDisplay.setMap(map);
		tanglewood.marker = new google.maps.Marker({
			position: tanglewood.coords,
			icon: 'assets/heart.svg',
			title: tanglewood.title,
			map: map
		});
		tanglewood.infoWindow = new google.maps.InfoWindow({
			content: `
				<div id="tanglewoodInfoBox">
					${tanglewood.logo}
					<ul>
						<li><a class="directions" href="${tanglewood.directions}">${icons.google.directions} <span>Directions</span></a></li>
						<li><a class="website" href="${tanglewood.website}">${icons.google.website} <span>Website</span></a></li>
					</ul>
				</div>
			`,
		});

		tanglewood.marker.addListener('click', function() {
			tanglewood.infoWindow.open(map, tanglewood.marker);
		});

		if (window.innerWidth > 480) {
			tanglewood.infoWindow.open(map, tanglewood.marker);
		}
	};

	head.insertAdjacentElement('beforeend', mapsApi);
}

initMaps();
