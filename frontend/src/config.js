// Backend API address. Set VITE_API_URL at build time for production,
// e.g. VITE_API_URL=https://your-backend.onrender.com/api
export const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");
