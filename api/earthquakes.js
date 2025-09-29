import { put, get } from "@vercel/blob";
import axios from "axios";

const BLOB_KEY = "earthquakes/data.json";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default async function handler(req, res) {
  let cached = await get(BLOB_KEY);
  let data, lastModified;

  if (cached) {
    data = JSON.parse(await cached.text());
    lastModified = new Date(cached.lastModified).getTime();
  }

  const now = Date.now();
  if (data && lastModified && now - lastModified < CACHE_TTL) {
    return res.json(data);
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

  await put(BLOB_KEY, JSON.stringify(earthquakes), {
    access: "private",
    contentType: "application/json",
  });
  return res.json(earthquakes);
}
