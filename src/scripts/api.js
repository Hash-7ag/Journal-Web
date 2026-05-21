import axios from "axios";
import { getUserStoreData, clearUserStoreData } from "../store/userStore.js";

const baseApi = "https://journal-p8ru.onrender.com/api";

const api = axios.create({
  baseURL: baseApi,
  withCredentials: true,
});

let isRefreshing = false;
let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) return Promise.reject(error);

    const status = error.response.status;
    const isAuthEndpoint =
      originalRequest?.url?.includes("loginAs") ||
      originalRequest?.url?.includes("refreshToken");

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        if (!isRefreshing) {
          isRefreshing = true;

          // LocalStorage dən rolu alırıq
          const role = getUserStoreData()?.role || "admin";
          refreshPromise = api.post(`/auth/${role}/refreshToken`);
        }

        await refreshPromise;
        isRefreshing = false;
        refreshPromise = null;

        return api(originalRequest);
      } catch (refreshErr) {
        isRefreshing = false;
        refreshPromise = null;

        // Refresh alınmadısa - "/"
        clearUserStoreData();
        window.location.href = "/";

        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
