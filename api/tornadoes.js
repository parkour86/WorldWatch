const axios = require("axios");
const { parse } = require("csv-parse/sync");

module.exports = async (req, res) => {
  try {
    const today = new Date();
    const urls = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const url = `https://www.spc.noaa.gov/climo/reports/${y}${m}${day}_rpts_torn.csv`;
      urls.push(url);
    }

    let allRecords = [];

    for (const url of urls) {
      try {
        const { data } = await axios.get(url);
        const records = parse(data, { columns: true, skip_empty_lines: true });

        const cleaned = records.map((r) => ({
          lat: parseFloat(r.LAT),
          lon: parseFloat(r.LON),
          location: r.LOCATION || "Unknown",
          time: r.TIME || "N/A",
        }));

        allRecords = allRecords.concat(cleaned);
      } catch (err) {
        // Ignore missing data for a day
      }
    }

    res.json(allRecords);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tornadoes" });
  }
};
