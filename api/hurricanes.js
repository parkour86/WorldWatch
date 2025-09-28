const axios = require("axios");

let cachedData = [];

// Function to fetch and cache data
async function refreshHurricanes() {
  try {
    const url =
      "https://eonet.gsfc.nasa.gov/api/v3/events?category=severeStorms";
    const { data } = await axios.get(url);

    cachedData = data.events.flatMap((event) =>
      event.geometry.map((geo) => ({
        lat: geo.coordinates[1],
        lon: geo.coordinates[0],
        title: event.title,
      })),
    );
    console.log("Hurricane data refreshed");
  } catch (err) {
    console.error("Failed to refresh hurricane data", err.message);
  }
}

// Refresh every 5 minutes
refreshHurricanes();
setInterval(refreshHurricanes, 5 * 60 * 1000);

module.exports = (req, res) => {
  res.json(cachedData);
};
