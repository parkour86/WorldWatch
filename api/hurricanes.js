const { put } = require("@vercel/blob");
const axios = require("axios");

const BLOB_KEY = "API_Data/hurricanes.json";
const CACHE_TTL = 5 * 60 * 1000;

let blobUrl = null;
let lastModified = null;

module.exports = async (req, res) => {
  const now = Date.now();

  if (blobUrl && lastModified && now - lastModified < CACHE_TTL) {
    const response = await axios.get(blobUrl);
    return res.json(response.data);
  }

  // Fetch hurricanes data
  const url = "https://eonet.gsfc.nasa.gov/api/v3/events?category=severeStorms";
  const { data } = await axios.get(url);
  const hurricanes = data.events.flatMap((event) =>
    event.geometry.map((geo) => ({
      lat: geo.coordinates[1],
      lon: geo.coordinates[0],
      title: event.title,
    })),
  );

  const { url: uploadedUrl } = await put(BLOB_KEY, JSON.stringify(hurricanes), {
    access: "public",
    contentType: "application/json",
    allowOverwrite: true,
  });
  blobUrl = uploadedUrl;
  lastModified = now;

  return res.json(hurricanes);
};
