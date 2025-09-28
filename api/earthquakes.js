const axios = require("axios");

module.exports = async (req, res) => {
  try {
    const url =
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
    const { data } = await axios.get(url);
    const result = data.features.map((f) => ({
      lat: f.geometry.coordinates[1],
      lon: f.geometry.coordinates[0],
      mag: f.properties.mag,
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch earthquakes" });
  }
};
