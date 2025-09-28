import axios from "axios";
const API_BASE = process.env.REACT_APP_API_BASE;

export const fetchTornadoes = async () => {
  try {
    const res = await axios.get(`${API_BASE}/api/tornadoes`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("Error fetching tornadoes:", err.message);
    return [];
  }
};
