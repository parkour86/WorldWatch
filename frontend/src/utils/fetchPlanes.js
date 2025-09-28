import axios from "axios";
const API_BASE = process.env.REACT_APP_API_BASE;

export const fetchPlanes = async () => {
  try {
    const res = await axios.get(`${API_BASE}/api/planes`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("Error fetching planes:", err.message);
    return [];
  }
};
