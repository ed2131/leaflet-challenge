// Initialize the map
const map = L.map('map').setView([0, 0], 2); // Set the initial view to a world map

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

// Fetch earthquake data from the USGS API
fetch(usgsApiUrl)
    .then(response => response.json())
    .then(data => {
        // Process and display the earthquake data on the map
        displayEarthquakeData(data.features);
    })
    .catch(error => {
        console.error("Error fetching earthquake data:", error);
    });

// Function to display earthquake data on the map
function displayEarthquakeData(earthquakes) {
    earthquakes.forEach(earthquake => {
        const { geometry, properties } = earthquake;
        const coordinates = geometry.coordinates;
        const mag = properties.mag;
        const depth = coordinates[2];

        // Create a marker with a popup for each earthquake
        L.circleMarker([coordinates[1], coordinates[0]], {
            radius: getMarkerSize(mag),
            fillColor: getMarkerColor(depth),
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map).bindPopup(`<b>Magnitude:</b> ${mag}<br><b>Depth:</b> ${depth} km<br><b>Location:</b> ${properties.place}`);
    });
}

// Set up the legend
let legend = L.control({ position: "bottomright" });
legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend");
    const depths = [-10, 10, 30, 50, 70];
    const colors = ["#FFD700", "#FFA500", "#FF6347", "#FF0000", "#800000"];

    div.innerHTML = '<h4>Earthquake Depth</h4>';
    for (let i = 0; i < depths.length; i++) {
        div.innerHTML += '<i style="background:' + colors[i] + '">&nbsp;</i> ' +
                         depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + ' km<br>' : '+ km');
    }
    return div;
};

// Add the legend to the map
legend.addTo(map);
