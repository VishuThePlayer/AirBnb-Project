mapboxgl.accessToken = mapToken; // Use the token passed from the server

const map = new mapboxgl.Map({
    container: 'map', // Ensure this ID matches the ID of your map div
    style: 'mapbox://styles/mapbox/streets-v12', // Map style
    center: coordinates, // Map center [lng, lat]
    zoom: 9, // Map zoom level
});

new mapboxgl.Marker()
            .setLngLat(coordinates)
            .addTo(map);