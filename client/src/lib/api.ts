import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  timeout: 60000, // 60s timeout to allow for Render cold-starts
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // 1. Detect Network Error / Server Cold-Start (Render Spin-Up, 502, 503, 504, Timeout)
    const isNetworkOrColdStart =
      error.code === "ERR_NETWORK" ||
      error.code === "ECONNABORTED" ||
      error.code === "ETIMEDOUT" ||
      error.message?.includes("Network Error") ||
      (error.response && [502, 503, 504].includes(error.response.status));

    if (isNetworkOrColdStart && !originalRequest._coldStartRetry) {
      originalRequest._coldStartRetry = true;

      // Trigger global UI banner
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("server-wake-trigger"));

        // Wait for server-awake event (up to 45s) and then auto-retry
        return new Promise((resolve, reject) => {
          let timeoutId: NodeJS.Timeout;

          const onServerAwake = async () => {
            clearTimeout(timeoutId);
            window.removeEventListener("server-awake", onServerAwake);
            try {
              const retryRes = await api(originalRequest);
              resolve(retryRes);
            } catch (retryErr) {
              reject(retryErr);
            }
          };

          window.addEventListener("server-awake", onServerAwake);

          timeoutId = setTimeout(() => {
            window.removeEventListener("server-awake", onServerAwake);
            reject(error);
          }, 45000);
        });
      }
    }

    // 2. Refresh Token handling on 401 Unauthorized
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;
      try {
        const refreshRes = await api.get("/auth/refresh");
        const newAccessToken = refreshRes.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
