const axios = require("axios");

module.exports = async (req, res) => {
  try {
    const url = "https://eonet.gsfc.nasa.gov/api/v3/events?category=wildfires";
    const { data } = await axios.get(url);

    const result = data.events
      .flatMap((event) =>
        event.geometry.map((geo) => ({
          lat: geo.coordinates[1],
          lon: geo.coordinates[0],
          title: event.title,
        })),
      )
      .slice(50, 210);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch wildfires" });
  }
};
