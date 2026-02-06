import api from "./api";
import type { RegimenFiscal, MetodoPago, FormaPago } from "../types/clientes.types";

export const getRegimenesFiscales = async (): Promise<RegimenFiscal[]> => {
  const response = await api.get<RegimenFiscal[]>("/catalogos/regimenes-fiscales");
  return response.data;
};

export const getMetodosPago = async (): Promise<MetodoPago[]> => {
  const response = await api.get<MetodoPago[]>("/catalogos/metodos-pago");
  return response.data;
};

export const getFormasPago = async (): Promise<FormaPago[]> => {
  const response = await api.get<FormaPago[]>("/catalogos/formas-pago");
  return response.data;
};