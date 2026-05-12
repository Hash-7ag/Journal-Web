import axios from "axios";
import { getUserStoreData } from "../store/userStore.js";

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
      originalRequest?.url?.includes("refreshToken") ||
      originalRequest?.url?.includes("getMyProfile"); // <-- добавь это

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        if (!isRefreshing) {
          isRefreshing = true;
          // динамически берём роль вместо захардкоженного admin
          const role = getUserStoreData().role || "admin";
          refreshPromise = api.post(`/auth/${role}/refreshToken`);
        }

        await refreshPromise;
        isRefreshing = false;
        refreshPromise = null;

        return api(originalRequest);
      } catch (refreshErr) {
        isRefreshing = false;
        refreshPromise = null;
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
