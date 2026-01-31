import api from "./api";
import type { LoginResponse, RegisterRequest } from "../types/auth.types";

export const loginService = async (codigo: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/login", { codigo });
  return response.data;
};

export const registerService = async (data: RegisterRequest) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

// 👉 SOLO guardamos usuario, NO token
export const saveUsuario = (usuario: any) => {
  localStorage.setItem("usuario", JSON.stringify(usuario));
};

export const getUsuario = () => {
  const usuarioStr = localStorage.getItem("usuario");
  return usuarioStr ? JSON.parse(usuarioStr) : null;
};

export const clearUsuario = () => {
  localStorage.removeItem("usuario");
};
