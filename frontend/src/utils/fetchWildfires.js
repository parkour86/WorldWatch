import axios from "axios";
const API_BASE = process.env.REACT_APP_API_BASE;

export const fetchWildfires = async () => {
  try {
    const res = await axios.get(`${API_BASE}/api/wildfires`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("Error fetching wildfires:", err.message);
    return [];
  }
};
