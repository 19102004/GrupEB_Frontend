import axios from "axios";

// URL base de tu API
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // 👉 ENVÍA COOKIES
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Sesión inválida → limpiar frontend
      localStorage.removeItem("usuario");
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;
