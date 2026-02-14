import api from "./api";
import type { 
  Cliente, 
  CreateClienteRequest, 
  UpdateClienteRequest,
  ClienteBusqueda,
  CreateClienteLigeroRequest,
  CreateClienteLigeroResponse
} from "../types/clientes.types";

// ====================================
// FUNCIONES EXISTENTES
// ====================================

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

// ====================================
// NUEVAS FUNCIONES
// ====================================

/**
 * Busca clientes con filtro o devuelve los últimos 50
 * @param query - Término de búsqueda (opcional)
 * @returns Array de clientes simplificados
 */
export const searchClientes = async (query?: string): Promise<ClienteBusqueda[]> => {
  const params = query ? { query } : {};
  const response = await api.get<ClienteBusqueda[]>("/clientes/search", { params });
  return response.data;
};

/**
 * Crea un cliente ligero para cotizaciones
 * @param data - Datos mínimos del cliente
 * @returns Respuesta con el cliente creado
 */
export const createClienteLigero = async (
  data: CreateClienteLigeroRequest
): Promise<CreateClienteLigeroResponse> => {
  const response = await api.post<CreateClienteLigeroResponse>("/clientes/ligero", data);
  return response.data;
};