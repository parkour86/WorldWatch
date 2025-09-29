const { put } = require("@vercel/blob");
const axios = require("axios");
const { parse } = require("csv-parse/sync");

const BLOB_KEY = "API_Data/tornadoes.json";
const CACHE_TTL = 5 * 60 * 1000;

let blobUrl = null;
let lastModified = null;

module.exports = async (req, res) => {
  const now = Date.now();

  if (blobUrl && lastModified && now - lastModified < CACHE_TTL) {
    const response = await axios.get(blobUrl);
    return res.json(response.data);
  }

  // Fetch tornadoes data
  const today = new Date();
  const urls = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    urls.push(
      `https://www.spc.noaa.gov/climo/reports/${y}${m}${day}_rpts_torn.csv`,
    );
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

  const { url: uploadedUrl } = await put(BLOB_KEY, JSON.stringify(allRecords), {
    access: "public",
    contentType: "application/json",
  });
  blobUrl = uploadedUrl;
  lastModified = now;

  return res.json(allRecords);
};
