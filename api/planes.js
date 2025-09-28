const axios = require("axios");

let cachedData = [];

// Function to fetch and cache data
async function refreshPlanes() {
  try {
    const response = await axios.get(
      "https://opensky-network.org/api/states/all",
    );
    const states = response.data.states || [];
    cachedData = states
      .filter((s) => s[5] !== null && s[6] !== null)
      .slice(0, 75)
      .map((s) => ({
        callsign: s[1] || "Unknown",
        lat: s[6],
        lon: s[5],
        altitude: s[13],
      }));
    console.log("Plane data refreshed");
  } catch (err) {
    console.error("Error fetching planes", {
      message: err.message,
      code: err.code,
      response: err.response && err.response.data,
    });
  }
}

// Refresh every 5 minutes
refreshPlanes();
setInterval(refreshPlanes, 5 * 60 * 1000);

module.exports = (req, res) => {
  res.json(cachedData);
};
