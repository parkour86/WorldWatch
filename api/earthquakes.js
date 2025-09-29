const { put } = require("@vercel/blob");
const axios = require("axios");

const BLOB_KEY = "API_Data/earthquakes.json";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

let blobUrl = null;
let lastModified = null;

module.exports = async (req, res) => {
  const now = Date.now();

  // Try to serve cached data if fresh
  if (blobUrl && lastModified && now - lastModified < CACHE_TTL) {
    try {
      const response = await axios.get(blobUrl);
      console.log("Serving earthquake cached data");
      return res.json(response.data);
    } catch (err) {
      // If blob fetch fails, continue to try API
    }
  }

  // Try to fetch new data from API
  try {
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
        access: "public",
        contentType: "application/json",
        allowOverwrite: true,
      },
    );
    blobUrl = uploadedUrl;
    lastModified = now;
    console.log("Earthquakes fetched from API");

    return res.json(earthquakes);
  } catch (err) {
    // If API fetch fails, try to serve stale blob data if available
    if (blobUrl) {
      try {
        const response = await axios.get(blobUrl);
        console.log("Serving earthquake cached data");
        return res.json(response.data);
      } catch (blobErr) {
        // Blob fetch also failed
      }
    }
    // If all else fails, return error
    return res.status(500).json({ error: "Failed to fetch earthquake data" });
  }
};
