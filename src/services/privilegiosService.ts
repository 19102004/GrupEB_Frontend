import api from "./api";
import type { Privilegio } from "../types/privilegio.types";

export const getPrivilegios = async (): Promise<Privilegio[]> => {
  const response = await api.get<Privilegio[]>("/privilegios");
  return response.data;
};