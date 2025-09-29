const { put } = require("@vercel/blob");
const axios = require("axios");

const BLOB_KEY = "API_Data/wildfires.json";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

let blobUrl = null;
let lastModified = null;

module.exports = async (req, res) => {
  const now = Date.now();

  // Serve cached data if fresh
  if (blobUrl && lastModified && now - lastModified < CACHE_TTL) {
    try {
      const response = await axios.get(blobUrl);
      console.log("Serving wildfire cached data");
      return res.json(response.data);
    } catch (err) {
      // If blob fetch fails, continue to try API
    }
  }

  try {
    // Fetch wildfires data
    const url = "https://eonet.gsfc.nasa.gov/api/v3/events?category=wildfires";
    const { data } = await axios.get(url);
    const wildfires = data.events.flatMap((event) =>
      event.geometry.map((geo) => ({
        lat: geo.coordinates[1],
        lon: geo.coordinates[0],
        title: event.title,
      })),
    );

    // Upload to Vercel Blob and update cache pointers
    const { url: uploadedUrl } = await put(
      BLOB_KEY,
      JSON.stringify(wildfires),
      {
        access: "public",
        contentType: "application/json",
        allowOverwrite: true,
      },
    );
    blobUrl = uploadedUrl;
    lastModified = now;
    console.log("Wildfire fetched from API");

    return res.json(wildfires);
  } catch (err) {
    if (blobUrl) {
      try {
        const response = await axios.get(blobUrl);
        return res.json(response.data);
      } catch (blobErr) {
        // Blob fetch also failed
      }
    }
    return res.status(500).json({ error: "Failed to fetch wildfire data" });
  }
};
