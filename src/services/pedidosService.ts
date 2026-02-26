import api from "./api";

// ============================================================
// OBTENER PEDIDOS
// Retorna tanto pedidos directos como cotizaciones convertidas
// ============================================================
export const getPedidos = async () => {
  const response = await api.get("/pedidos");
  return response.data;
};

// ============================================================
// CANCELAR PEDIDO — cascade completo
// Elimina: cotizacion_detalle → cotizacion_producto → cotizacion
// Aplica tanto para pedidos directos como los que vinieron de cotización
// ============================================================
export const eliminarPedido = async (noPedido: number) => {
  const response = await api.delete(`/pedidos/${noPedido}`);
  return response.data; // { message, no_pedido, no_cotizacion, tenia_cotizacion }
};