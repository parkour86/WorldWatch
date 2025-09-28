const axios = require("axios");

let cachedData = [];

// Function to fetch and cache data
async function refreshEarthquakes() {
  try {
    const url =
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
    const { data } = await axios.get(url);
    cachedData = data.features.map((f) => ({
      lat: f.geometry.coordinates[1],
      lon: f.geometry.coordinates[0],
      mag: f.properties.mag,
    }));
    console.log("Earthquake data refreshed");
  } catch (err) {
    console.error("Failed to refresh earthquake data", err.message);
  }
}

// Refresh every 5 minutes
refreshEarthquakes();
setInterval(refreshEarthquakes, 5 * 60 * 1000);

module.exports = (req, res) => {
  res.json(cachedData);
};
