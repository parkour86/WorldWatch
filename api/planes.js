const { put } = require("@vercel/blob");
const axios = require("axios");

const BLOB_KEY = "API_Data/planes.json";
const CACHE_TTL = 5 * 60 * 1000;

let blobUrl = null;
let lastModified = null;

module.exports = async (req, res) => {
  const now = Date.now();

  // Try to serve cached data if fresh
  if (blobUrl && lastModified && now - lastModified < CACHE_TTL) {
    try {
      const response = await axios.get(blobUrl);
      return res.json(response.data);
    } catch (err) {
      // If blob fetch fails, continue to try API
    }
  }

  // Try to fetch new data from API
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

    // Upload to Vercel Blob and update cache pointers
    const { url: uploadedUrl } = await put(BLOB_KEY, JSON.stringify(planes), {
      access: "public",
      contentType: "application/json",
      allowOverwrite: true,
    });
    blobUrl = uploadedUrl;
    lastModified = now;

    return res.json(planes);
  } catch (err) {
    // If API fetch fails, try to serve stale blob data if available
    if (blobUrl) {
      try {
        const response = await axios.get(blobUrl);
        return res.json(response.data);
      } catch (blobErr) {
        // Blob fetch also failed
      }
    }
    // If all else fails, return error
    return res.status(500).json({ error: "Failed to fetch plane data" });
  }
};
