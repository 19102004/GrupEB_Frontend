import api from "./api";
import type { Rol, PrivilegiosPorRol } from "../types/rol.types";

export const getRoles = async (): Promise<Rol[]> => {
  const response = await api.get<Rol[]>("/roles");
  return response.data;
};

/**
 * Obtener privilegios predefinidos de un rol
 */
export const getPrivilegiosByRol = async (rolId: number): Promise<PrivilegiosPorRol> => {
  const response = await api.get<PrivilegiosPorRol>(`/roles/${rolId}/privilegios`);
  return response.data;
};