import axios from "axios";

const serverUrl = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/+$/, "");
const userApiUrl = `${serverUrl}/api/v1/user`;

export const userApi = axios.create({
  baseURL: userApiUrl,
  headers: { "Content-Type": "application/json" },
});

userApi.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshRequest;
userApi.interceptors.response.use((response) => response, async (error) => {
  const originalRequest = error.config;
  const requestUrl = originalRequest?.url || "";
  if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || requestUrl.endsWith("/login") || requestUrl.endsWith("/admin/login") || requestUrl.endsWith("/refresh")) {
    return Promise.reject(error);
  }

  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return Promise.reject(error);
  originalRequest._retry = true;

  try {
    refreshRequest ||= axios.post(`${userApiUrl}/refresh`, { refreshToken })
      .then((response) => {
        localStorage.setItem("accessToken", response.data.accessToken);
        return response.data.accessToken;
      })
      .catch((refreshError) => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.dispatchEvent(new Event("ekart:session-expired"));
        throw refreshError;
      })
      .finally(() => { refreshRequest = undefined; });

    const accessToken = await refreshRequest;
    originalRequest.headers = originalRequest.headers || {};
    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
    return userApi(originalRequest);
  } catch (refreshError) {
    return Promise.reject(refreshError);
  }
});

export const authConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}` },
});
