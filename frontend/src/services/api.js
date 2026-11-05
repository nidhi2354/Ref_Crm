
import axios from "axios";
import { installSessionInterceptor } from "./session";
import { API_URL } from "../config";

const api = axios.create({
  baseURL: API_URL,
});

// Har request ke saath login token bhejega
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // JSON aur FormData dono ko support karega
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Expired token => back to login
installSessionInterceptor(api);

export default api;
