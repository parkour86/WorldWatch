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
    const response = await axios.get(blobUrl);
    return res.json(response.data);
  }

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
  const { url: uploadedUrl } = await put(BLOB_KEY, JSON.stringify(wildfires), {
    access: "public",
    contentType: "application/json",
  });
  blobUrl = uploadedUrl;
  lastModified = now;

  return res.json(wildfires);
};
