import api from "./api";

export interface ProductoEstadoCuenta {
  idsolicitud_producto:  number;
  no_produccion:         string;
  nombre:                string;
  tintas:                number;
  caras:                 number;
  modo_cantidad:         string;
  cantidad_original:     number;
  precio_total_original: number;
  cantidad_real:         number;
  peso_kg_real:          number;
  precio_unitario_real:  number;
  precio_total_real:     number;
  diferencia_piezas:     number;
  diferencia_precio:     number;
}

export interface EstadoCuenta {
  no_pedido:         number;
  no_cotizacion:     number | null;
  fecha:             string;
  cliente:           string;
  empresa:           string;
  telefono:          string;
  correo:            string;
  productos:         ProductoEstadoCuenta[];
  // ── Original — nunca cambia ───────────────────────────────
  subtotal_original: number;
  iva_original:      number;
  total_original:    number;
  // ── Real — calculado con producción final ─────────────────
  subtotal_real:     number;
  iva_real:          number;
  total_real:        number;
  // ── Pagos ─────────────────────────────────────────────────
  anticipo:          number;
  abono:             number;
  saldo:             number;
  // ── Diferencia guardada en BD ─────────────────────────────
  diferencia_total:  number;
}

export interface ResumenEstadoCuenta {
  no_pedido:           number;
  no_cotizacion:       number | null;
  fecha:               string;
  cliente:             string;
  empresa:             string;
  total:               number;
  abono:               number;
  saldo:               number;
  anticipo:            number;
  total_real:          number | null;
  diferencia_total:    number | null;
  total_ordenes:       number;
  ordenes_completas:   number;
  produccion_completa: boolean;
}

export const getListaEstadoCuenta = async (): Promise<ResumenEstadoCuenta[]> => {
  const response = await api.get("/estado-cuenta");
  return response.data;
};

export const getEstadoCuenta = async (noPedido: number): Promise<EstadoCuenta> => {
  const response = await api.get(`/estado-cuenta/${noPedido}`);
  return response.data;
};