const axios = require("axios");
const { parse } = require("csv-parse/sync");

let cachedData = [];

// Function to fetch and cache data
async function refreshTornadoes() {
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

    cachedData = allRecords;
    console.log("Tornado data refreshed");
  } catch (err) {
    console.error("Failed to refresh tornado data", err.message);
  }
}

// Refresh every 5 minutes
refreshTornadoes();
setInterval(refreshTornadoes, 5 * 60 * 1000);

module.exports = (req, res) => {
  res.json(cachedData);
};
