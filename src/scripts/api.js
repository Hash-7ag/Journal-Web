import axios from "axios";

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
      originalRequest?.url?.includes("/admin/loginAsAdmin") ||
      originalRequest?.url?.includes("/teacher/loginAsTeacher") ||
      originalRequest?.url?.includes("/student/loginAsStudent") ||
      originalRequest?.url?.includes("/auth/student/refreshToken") ||
      originalRequest?.url?.includes("/auth/teacher/refreshToken") ||
      originalRequest?.url?.includes("/auth/admin/refreshToken");

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = api.post("/auth/admin/refreshToken");
        }

        await refreshPromise;

        isRefreshing = false;
        refreshPromise = null;

        return api(originalRequest);
      } catch (refreshErr) {
        isRefreshing = false;
        refreshPromise = null;

        //   try {
        //     // await api.post("/auth/customer/logout");
        //   } catch (e) {
        //   }
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
