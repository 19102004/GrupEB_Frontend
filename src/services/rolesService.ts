import api from "./api";
import type { Rol } from "../types/rol.types";

export const getRoles = async (): Promise<Rol[]> => {
  const response = await api.get<Rol[]>("/roles");
  return response.data;
};