/// Initialize the map
const map = L.map('map').setView([0, 0], 2); // Set the initial view to a world map

// Set the maximum bounds for the map to stop map repeating
var southWest = L.latLng(-90, -180),
    northEast = L.latLng(90, 180),
    bounds = L.latLngBounds(southWest, northEast);
// Add a tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Define the USGS Earthquake API URL - Past 7 days
const usgsApiUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Function to set marker size based on magnitude
function getMarkerSize(magnitude) {
    return magnitude * 2; // magnitude is scaled to 2x.
}

// Function to set marker color based on depth of earthquake source
function getMarkerColor(depth) {
    if (depth < 10) {
        return "#FFD700"; // Yellow for shallow earthquakes
    } else if (depth < 30) {
        return "#FFA500"; // Orange for moderate depth
    } else if (depth < 50) {
        return "#FF6347"; // Red for intermediate depth
    } else {
        return "#800000"; // Maroon for deep earthquakes
    }
}

// Earthquake Layer
var earthquakeLayer = new L.LayerGroup();

fetch(usgsApiUrl)
    .then(response => response.json())
    .then(data => {
        data.features.forEach(earthquake => {
            const { geometry, properties } = earthquake;
            const coordinates = geometry.coordinates;
            const mag = properties.mag;
            const depth = coordinates[2];

            L.circleMarker([coordinates[1], coordinates[0]], {
                radius: getMarkerSize(mag),
                fillColor: getMarkerColor(depth),
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(earthquakeLayer).bindPopup(`<b>Magnitude:</b> ${mag}<br><b>Depth:</b> ${depth} km<br><b>Location:</b> ${properties.place}`);
        });
    });

// Tectonic Plates Layer
const tectonicPlatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";
var tectonicPlatesLayer = new L.LayerGroup();

fetch(tectonicPlatesUrl)
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            color: "#ff6500",
            weight: 2
        }).addTo(tectonicPlatesLayer);
    });

// Adding layers to the map
earthquakeLayer.addTo(map);
tectonicPlatesLayer.addTo(map);

// Layer Control
var baseLayers = {
    "Street Map": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
};

var overlays = {
    "Earthquakes": earthquakeLayer,
    "Tectonic Plates": tectonicPlatesLayer
};

L.control.layers(baseLayers, overlays).addTo(map);
