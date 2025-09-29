const { put } = require("@vercel/blob");
const axios = require("axios");

const BLOB_KEY = "API_Data/planes.json";
const CACHE_TTL = 5 * 60 * 1000;

let blobUrl = null;
let lastModified = null;

module.exports = async (req, res) => {
  const now = Date.now();

  if (blobUrl && lastModified && now - lastModified < CACHE_TTL) {
    const response = await axios.get(blobUrl);
    return res.json(response.data);
  }

  // Fetch planes data
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

  const { url: uploadedUrl } = await put(BLOB_KEY, JSON.stringify(planes), {
    access: "public",
    contentType: "application/json",
  });
  blobUrl = uploadedUrl;
  lastModified = now;

  return res.json(planes);
};
