import api from "./api";

// ============================================================
// OBTENER TODAS LAS VENTAS
// ============================================================
export const getVentas = async () => {
  const response = await api.get("/ventas");
  return response.data;
};

// ============================================================
// OBTENER VENTA POR ID (con historial de pagos)
// ============================================================
export const getVentaById = async (idventas: number) => {
  const response = await api.get(`/ventas/${idventas}`);
  return response.data;
};

// ============================================================
// OBTENER VENTA POR no_pedido (con historial de pagos)
// ============================================================
export const getVentaByPedido = async (noPedido: number) => {
  const response = await api.get(`/ventas/pedido/${noPedido}`);
  return response.data;
};

// ============================================================
// REGISTRAR PAGO / ABONO
// ============================================================
export const registrarPago = async (
  idventas: number,
  datos: {
    metodoPagoId: number;
    monto:        number;
    esAnticipo?:  boolean;
    observacion?: string;
  }
) => {
  const response = await api.post(`/ventas/${idventas}/pagos`, datos);
  return response.data;
};

// ============================================================
// ELIMINAR PAGO
// ============================================================
export const eliminarPago = async (idventa_pago: number) => {
  const response = await api.delete(`/ventas/pagos/${idventa_pago}`);
  return response.data;
};

// ============================================================
// OBTENER MÉTODOS DE PAGO
// ============================================================
export const getMetodosPago = async () => {
  const response = await api.get("/ventas/metodos-pago");
  return response.data;
};