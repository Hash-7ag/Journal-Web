import axios from "axios";

const baseApi = "https://journal-p8ru.onrender.com/api";

export const api = axios.create({
  baseURL: baseApi,
  withCredentials: true,
});
