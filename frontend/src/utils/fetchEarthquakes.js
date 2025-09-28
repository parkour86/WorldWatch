import axios from "axios";
const API_BASE = process.env.REACT_APP_API_BASE;

export const fetchEarthquakes = async () => {
  try {
    const res = await axios.get(`${API_BASE}/api/earthquakes`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("Error fetching earthquakes:", err.message);
    return [];
  }
};
