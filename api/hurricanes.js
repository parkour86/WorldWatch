const { put } = require("@vercel/blob");
const axios = require("axios");

const BLOB_KEY = "API_Data/hurricanes.json";
const CACHE_TTL = 5 * 60 * 1000;

let blobUrl = null;
let lastModified = null;

module.exports = async (req, res) => {
  const now = Date.now();

  if (blobUrl && lastModified && now - lastModified < CACHE_TTL) {
    try {
      const response = await axios.get(blobUrl);
      console.log("Serving hurricane cached data");
      return res.json(response.data);
    } catch (err) {
      // If blob fetch fails, continue to try API
    }
  }

  try {
    // Fetch hurricanes data
    const url =
      "https://eonet.gsfc.nasa.gov/api/v3/events?category=severeStorms";
    const { data } = await axios.get(url);
    const hurricanes = data.events.flatMap((event) =>
      event.geometry.map((geo) => ({
        lat: geo.coordinates[1],
        lon: geo.coordinates[0],
        title: event.title,
      })),
    );

    const { url: uploadedUrl } = await put(
      BLOB_KEY,
      JSON.stringify(hurricanes),
      {
        access: "public",
        contentType: "application/json",
        allowOverwrite: true,
      },
    );
    blobUrl = uploadedUrl;
    lastModified = now;
    console.log("Hurricanes fetched from API");

    return res.json(hurricanes);
  } catch (err) {
    if (blobUrl) {
      try {
        const response = await axios.get(blobUrl);
        console.log("Serving hurricane cached data");
        return res.json(response.data);
      } catch (blobErr) {
        // Blob fetch also failed
      }
    }
    return res.status(500).json({ error: "Failed to fetch hurricane data" });
  }
};
