import axios from "axios";
import { useToast } from '../hooks/useToast';



const API_URL = import.meta.env.VITE_API_BASE_URL;
if (!API_URL) {
  console.error('VITE_API_BASE_URL is not defined in environment variables');
}
// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      window.location.href = "/login";
    } else if (error.response?.status === 403) {
      // Permission denied
      console.error("Access denied:", error.response.data.message);
      // You can redirect to an unauthorized page or show a message
    }
    return Promise.reject(error);
  }
);

export default api;
