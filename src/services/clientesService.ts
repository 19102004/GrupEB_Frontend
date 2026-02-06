import api from "./api";
import type { Cliente, CreateClienteRequest, UpdateClienteRequest } from "../types/clientes.types";

export const getClientes = async (): Promise<Cliente[]> => {
  const response = await api.get<Cliente[]>("/clientes");
  return response.data;
};

export const getClienteById = async (id: number): Promise<Cliente> => {
  const response = await api.get<Cliente>(`/clientes/${id}`);
  return response.data;
};

export const createCliente = async (data: CreateClienteRequest) => {
  const response = await api.post("/clientes", data);
  return response.data;
};

export const updateCliente = async (id: number, data: UpdateClienteRequest) => {
  const response = await api.put(`/clientes/${id}`, data);
  return response.data;
};

export const deleteCliente = async (id: number) => {
  const response = await api.delete(`/clientes/${id}`);
  return response.data;
};