import api from "./api";
import type { LoginResponse, LoginRequest, RegisterRequest } from "../types/auth.types";

export const loginService = async (codigo: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/login", { codigo } as LoginRequest);
  return response.data;
};

export const registerService = async (data: RegisterRequest): Promise<any> => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const saveAuthData = (token: string, usuario: any) => {
  localStorage.setItem("token", token);
  localStorage.setItem("usuario", JSON.stringify(usuario));
};

export const getAuthData = () => {
  const token = localStorage.getItem("token");
  const usuarioStr = localStorage.getItem("usuario");
  const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
  
  return { token, usuario };
};

export const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
};