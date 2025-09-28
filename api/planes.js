const axios = require("axios");

module.exports = async (req, res) => {
  try {
    const response = await axios.get(
      "https://opensky-network.org/api/states/all",
    );
    const states = response.data.states || [];
    const planes = states
      .filter((s) => s[5] !== null && s[6] !== null)
      .slice(0, 75)
      .map((s) => ({
        callsign: s[1] || "Unknown",
        lat: s[6],
        lon: s[5],
        altitude: s[13],
      }));
    res.json(planes);
  } catch (err) {
    console.error("Error fetching planes", {
      message: err.message,
      code: err.code,
      response: err.response && err.response.data,
    });
    res.status(500).json({ error: "Failed to fetch planes" });
  }
};
