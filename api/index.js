module.exports = (req, res) => {
  res
    .status(200)
    .send(
      "API is running. Available endpoints: /api/earthquakes, /api/tornadoes, /api/hurricanes, /api/planes, /api/wildfires",
    );
};
