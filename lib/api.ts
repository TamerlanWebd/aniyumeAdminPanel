import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000", // ❗ Используем localhost (не 127.0.0.1!)
  withCredentials: true, // ❗ ВАЖНО для cookies!
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

api.interceptors.request.use((config) => {
  console.log("📤 Sending request:", config.url);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log("✅ Response:", response.status);
    return response;
  },
  (error) => {
    console.error(
      "❌ API Error:",
      error.response?.status,
      error.response?.data
    );

    if (error.response?.status === 401) {
      console.log("🚪 401 — редирект на login");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
