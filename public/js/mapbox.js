export const displayMap = (locations) => {
	mapboxgl.accessToken =
		'pk.eyJ1IjoibGlzYW5kcm8tMTAiLCJhIjoiY2x1dnFuNzl0MDY4YTJxbXh2OGM4amIzYiJ9.upzZbqv1nIJX913soqQgcQ'
	const map = new mapboxgl.Map({
		container: 'map', // container ID
		style: 'mapbox://styles/lisandro-10/cluvqqwni004101pkfkqe3mgn',
		scrollZoom: false,
		// center: [-118.113491, 34.111745],
		// zoom: 8,
	})

	const bounds = new mapboxgl.LngLatBounds()

	locations.forEach((loc) => {
		//Add marker
		const el = document.createElement('div')
		el.className = 'marker'

		new mapboxgl.Marker({
			element: el,
			anchor: 'bottom',
		})
			.setLngLat(loc.coordinates)
			.addTo(map)

		//Add popup
		new mapboxgl.Popup({
			offset: 30,
		})
			.setLngLat(loc.coordinates)
			.setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
			.addTo(map)

		bounds.extend(loc.coordinates)
	})

	map.fitBounds(bounds, {
		padding: {
			top: 200,
			bottom: 150,
			left: 100,
			right: 100,
		},
	})
}
