// ============================================================
// MÉTODO DE PAGO
// ============================================================
export interface MetodoPago {
  idmetodo_pago: number;
  codigo:        string;
  tipo_pago:     string;
}

// ============================================================
// PAGO INDIVIDUAL (historial)
// ============================================================
export interface VentaPago {
  idventa_pago:  number;
  monto:         number;
  es_anticipo:   boolean;
  observacion:   string | null;
  fecha:         string;
  metodo_pago:   string;
  idmetodo_pago: number;
}

// ============================================================
// VENTA COMPLETA (con pagos)
// ============================================================
export interface Venta {
  idventas:       number;
  solicitud_idsolicitud: number;
  subtotal:       number;
  iva:            number;
  total:          number;
  anticipo:       number;
  saldo:          number;
  abono:          number;
  fecha_creacion: string;
  estado_id:      number;
  estado_nombre:  string;
  no_pedido:      number;
  no_cotizacion:  number | null;
  fecha_pedido:   string;
  cliente:        string;
  empresa:        string;
  telefono:       string;
  correo:         string;
  pagos:          VentaPago[];
}

// ============================================================
// PRODUCTO EN DISEÑO
// ============================================================
export interface DisenoProducto {
  iddiseno_producto:    number;
  idsolicitud_producto: number;
  nombre:               string;
  estado_id:            number;
  estado:               string;
  observaciones:        string | null;
  fecha:                string;
}

// ============================================================
// DISEÑO COMPLETO DE UN PEDIDO
// ============================================================
export interface Diseno {
  iddiseno:            number;
  solicitud_idsolicitud: number;
  estado_id:           number;
  estado_nombre:       string;
  estado_diseno:       string;
  fecha:               string;
  no_pedido:           number;
  no_cotizacion:       number | null;
  productos:           DisenoProducto[];
  total_productos:     number;
  aprobados:           number;
  rechazados:          number;
  pendientes:          number;
  diseno_completado:   boolean;
  tiene_rechazados:    boolean;
}

// ============================================================
// CONDICIONES DE PRODUCCIÓN
// ============================================================
export interface CondicionesProduccion {
  no_pedido:       number;
  puede_produccion: boolean;
  condiciones: {
    anticipo_cubierto:   boolean;
    anticipo_requerido:  number;
    anticipo_pagado:     number;
    diseno_completado:   boolean;
    productos_total:     number;
    productos_aprobados: number;
  };
}