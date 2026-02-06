import api from "./api";

export const loginService = async (codigo: string) => {
  const response = await api.post("/auth/login", { codigo });
  return response.data;
};

export const logoutService = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

// ✅ NUEVO: Verificar si el token es válido
export const verifyTokenService = async () => {
  const response = await api.get("/auth/verify");
  return response.data;
};