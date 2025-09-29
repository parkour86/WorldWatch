const { put } = require("@vercel/blob");
const axios = require("axios");

const BLOB_KEY = "earthquakes/data.json";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Store the blob URL in memory (for demonstration; use a DB or env for persistence)
let blobUrl = null;
let lastModified = null;

module.exports = async (req, res) => {
  const now = Date.now();

  // Try to read from blob if URL and lastModified are set and cache is fresh
  if (blobUrl && lastModified && now - lastModified < CACHE_TTL) {
    const response = await axios.get(blobUrl);
    return res.json(response.data);
  }

  // Fetch and cache new data
  const url =
    "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
  const { data: quakeData } = await axios.get(url);
  const earthquakes = quakeData.features.map((f) => ({
    lat: f.geometry.coordinates[1],
    lon: f.geometry.coordinates[0],
    mag: f.properties.mag,
  }));

  // Upload to Vercel Blob and save the URL and timestamp
  const { url: uploadedUrl } = await put(
    BLOB_KEY,
    JSON.stringify(earthquakes),
    {
      access: "private",
      contentType: "application/json",
    },
  );
  blobUrl = uploadedUrl;
  lastModified = now;

  return res.json(earthquakes);
};
